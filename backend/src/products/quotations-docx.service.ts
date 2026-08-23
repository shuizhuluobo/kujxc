import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { readFile } from 'fs/promises';
import { join } from 'path';
import {
  Document,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  VerticalAlign,
  PageOrientation,
} from 'docx';
import { PrismaService } from '../prisma/prisma.service';
import { QuotationsService } from './quotations.service';

/** 安全格式化参数值：字符串/数值原样，对象序列化，空值置空 */
function formatParamValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return value.toString();
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  return '';
}

/** 已解析的待嵌入图片：原始字节 + docx 类型 + 像素尺寸 */
interface EmbeddedDocxImage {
  data: Buffer;
  type: 'png' | 'jpg' | 'gif' | 'bmp';
  width: number;
  height: number;
}

/** 媒体条目（产品图片/证书），label 为嵌图失败时的文本兜底展示名 */
interface MediaEntry {
  url: string;
  label: string;
}

/** 每个媒体单元格最多嵌入的缩略图数量 */
const MAX_MEDIA_PER_CELL = 4;
/** 缩略图适配盒（docx transformation 单位为 px @96dpi） */
const THUMB_MAX_W = 96;
const THUMB_MAX_H = 72;

/** 文档型证书（PDF 扫描件等）：无法按位图嵌入，保留名称文本 */
function isDocumentMedia(url: string): boolean {
  return /\.pdf([?#]|$)/i.test(String(url ?? ''));
}

/** 从 URL 提取文件名（去查询参数并解码），作为证书名称兜底 */
function fileNameOfUrl(url: string): string {
  const clean = String(url ?? '').split(/[?#]/)[0];
  const last = clean.substring(clean.lastIndexOf('/') + 1);
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

const toStrList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .map((x): string => {
          if (typeof x === 'string') return x;
          if (typeof x === 'object' && x !== null) {
            const rec = x as Record<string, unknown>;
            if (typeof rec.url === 'string') return rec.url;
            if (typeof rec.name === 'string') return rec.name;
          }
          return '';
        })
        .filter(Boolean)
    : [];

/**
 * 报价单 DOCX 生成（使用 docx 库直接构建，而非 docx-templates 套打）
 *
 * 采用与 Excel/PDF 导出一致的标准化排版：
 *  - 标题（深蓝、加粗、居中）
 *  - 客户/编号/日期/单位 信息行（右对齐）
 *  - 带框线明细表（浅蓝表头、加粗、序号列、数值右对齐、同名设备纵向合并）
 *  - 合计 / 税额 / 含税总额（含税总额浅黄高亮）
 *
 * 说明：早期版本用 docx-templates 注入 OOXML 字符串，但因 ||...|| 命令会把
 * 返回字符串当纯文本转义，表格边框与排版始终无法生效，故改为用 docx 库构建。
 */
@Injectable()
export class QuotationsDocxService {
  private readonly logger = new Logger(QuotationsDocxService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly quotationsService: QuotationsService,
  ) {}

  /** 根据字段 key 从明细行取值（带兜底空串），与 Excel/PDF 同语义 */
  private fieldValue(item: any, idx: number, field: string): string {
    switch (field) {
      case 'no':
      case 'index':
        return String(idx + 1);
      case 'code':
        return String(item?.productSnapshot?.code ?? '');
      case 'name':
        return String(item?.productSnapshot?.name ?? '');
      case 'model':
        return String(item?.productSnapshot?.model ?? '');
      case 'brand':
        return String(item?.productSnapshot?.brand ?? '');
      case 'category':
        return String(item?.productSnapshot?.category ?? '');
      case 'description':
      case 'params':
      case 'param': {
        const snap = item?.productSnapshot ?? {};
        const raw = snap.param ?? snap.spec;
        if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
          const entries = Object.entries(raw as Record<string, unknown>);
          if (entries.length) {
            return entries
              .map(([k, v]) => `${k}：${formatParamValue(v)}`)
              .join('\n');
          }
        }
        return String(snap.description ?? '');
      }
      case 'unit':
        return String(item?.productSnapshot?.unit ?? '');
      case 'quantity':
        return item?.quantity != null ? String(item.quantity) : '';
      case 'unitPrice':
        return item?.unitPrice != null ? Number(item.unitPrice).toFixed(2) : '';
      case 'discount':
        return item?.discount != null && item.discount > 0
          ? `${item.discount}%`
          : '';
      case 'subtotal':
        return item?.subtotal != null ? Number(item.subtotal).toFixed(2) : '';
      case 'warranty':
        return String(item?.productSnapshot?.warranty ?? '');
      case 'supplier':
        return String(item?.productSnapshot?.supplier ?? '');
      case 'remark':
        return String(item?.productSnapshot?.remark ?? '');
      case 'marketPrice':
        return item?.productSnapshot?.marketPrice != null
          ? String(item.productSnapshot.marketPrice)
          : '';
      case 'marketUrl':
        return String(item?.productSnapshot?.marketUrl ?? '');
      case 'images': {
        const list =
          Array.isArray(item?.selectedImages) && item.selectedImages.length
            ? item.selectedImages
            : item?.productSnapshot?.images;
        return Array.isArray(list)
          ? list.filter((u: any) => typeof u === 'string').join('\n')
          : '';
      }
      case 'certs':
      case 'certificates': {
        // 与前端 quotationImages.collectItemMediaEntries 同语义：尊重勾选子集，
        // 名称经 snap.certs ↔ snap.certNames 平行数组映射，缺失回退文件名
        // （修复旧逻辑恒显示全量 certNames、忽略 selectedCerts 的问题）
        const entries = this.itemMediaEntries(item, 'certs');
        if (entries.length) return entries.map((e) => e.label).join('\n');
        return '';
      }
      case 'cost':
      case 'unitCost':
        return item?.costPrice != null ? Number(item.costPrice).toFixed(2) : '';
      case 'moq':
        return item?.productSnapshot?.minOrderQty != null
          ? String(item.productSnapshot.minOrderQty)
          : '';
      case 'tags': {
        const tags = item?.productSnapshot?.tags;
        return Array.isArray(tags) ? tags.join('、') : '';
      }
      default:
        return String(item?.productSnapshot?.[field] ?? '');
    }
  }

  /** 解析单个列的显示值：field 列取字段，formula 组合列替换 {字段} 占位符 */
  private cellValue(item: any, idx: number, col: any): string {
    if (col?.type === 'formula' && col.formula) {
      return col.formula
        .replace(/\{(\w+)\}/g, (_, f: string) => this.fieldValue(item, idx, f))
        .replace(/\s+/g, ' ')
        .trim();
    }
    return this.fieldValue(item, idx, col?.field || col?.key || '');
  }

  /** 合并依据列：config.mergeKey 优先，其次第一个组合列，最后 name */
  private mergeKeyOf(config: any): string {
    if (config?.mergeKey) return config.mergeKey;
    const formula = (config?.columns || []).find(
      (c: any) => c.type === 'formula' && c.visible !== false,
    );
    return formula?.key || 'name';
  }

  /**
   * {{date}} 口径：与前端 quotationColumns.quotationDate 一致——
   * 优先报价单 createdAt，无则当天；格式 ISO YYYY-MM-DD（勿改回 toLocaleDateString）
   */
  private quotationDate(quotation?: { createdAt?: string | null }): string {
    const base = quotation?.createdAt
      ? new Date(quotation.createdAt)
      : new Date();
    return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`;
  }

  /** 统一占位符替换：客户占位符（{{customerName}}/{{date}}/{{code}}/{{company}}）+ 公司占位符（{{companyName}} 等） */
  private replacePlaceholders(
    text: string,
    quotation: any,
    company?: any,
  ): string {
    if (!text) return '';
    const iso = this.quotationDate(quotation);
    const c = company ?? {};
    return (text ?? '')
      .replace(/\{\{\s*companyName\s*\}\}/g, c.name ?? '')
      .replace(/\{\{\s*companyAddress\s*\}\}/g, c.address ?? '')
      .replace(/\{\{\s*companyPhone\s*\}\}/g, c.phone ?? '')
      .replace(/\{\{\s*customerName\s*\}\}/g, quotation?.customerName ?? '')
      .replace(/\{\{\s*date\s*\}\}/g, iso)
      .replace(/\{\{\s*code\s*\}\}/g, quotation?.code ?? '')
      .replace(/\{\{\s*company\s*\}\}/g, '报价单')
      .replace(/\{\{[^}]*\}\}/g, '');
  }

  /** 计算合并依据列（mergeKey）的连续分组，品牌仅在同组内一致时才合并 */
  private computeNameSpans(
    items: any[],
    columns: any[],
    nameKey: string,
    brandKey: string,
  ): { nameSpan: number; brandSpan: number }[] {
    const spans: { nameSpan: number; brandSpan: number }[] = [];
    const valueOf = (item: any, key: string) => {
      const col = columns.find((c) => c.key === key);
      return col ? this.cellValue(item, 0, col) : '';
    };
    let i = 0;
    while (i < items.length) {
      let nameSpan = 1;
      while (
        i + nameSpan < items.length &&
        valueOf(items[i + nameSpan], nameKey) === valueOf(items[i], nameKey) &&
        valueOf(items[i + nameSpan], nameKey) !== ''
      ) {
        nameSpan++;
      }
      // 品牌仅当该同名分组内品牌完全一致时才合并
      let brandSpan = 1;
      if (brandKey !== nameKey) {
        const sameBrand = (k: number) =>
          valueOf(items[i + k], brandKey) === valueOf(items[i], brandKey);
        while (
          brandSpan < nameSpan &&
          i + brandSpan < items.length &&
          sameBrand(brandSpan)
        ) {
          brandSpan++;
        }
      }
      spans.push({ nameSpan, brandSpan });
      i += nameSpan;
    }
    return spans;
  }

  /** 生成边框配置（细灰框线） */
  private borders() {
    const s = BorderStyle.SINGLE;
    const color = 'BFBFBF';
    const size = 4;
    return {
      top: { style: s, color, size },
      bottom: { style: s, color, size },
      left: { style: s, color, size },
      right: { style: s, color, size },
      insideHorizontal: { style: s, color, size },
      insideVertical: { style: s, color, size },
    };
  }

  // ============ 媒体列（产品图片/证书）取数与图片加载 ============

  private readonly imageCache = new Map<string, EmbeddedDocxImage | null>();

  /**
   * 明细行 → 指定媒体列的条目列表。取数口径与前端 quotationImages.collectItemMediaEntries 一致：
   * - images：selectedImages 优先，空则回退快照全量；
   * - certs：selectedCerts 优先，空则回退快照全量；名称经 snap.certs ↔ snap.certNames 平行数组映射。
   */
  private itemMediaEntries(item: any, field: string): MediaEntry[] {
    if (field !== 'images' && field !== 'certs') return [];
    const snap = (item?.productSnapshot ?? {}) as Record<string, unknown>;
    if (field === 'images') {
      const list =
        Array.isArray(item?.selectedImages) && item.selectedImages.length
          ? item.selectedImages
          : snap.images;
      return toStrList(list).map((url) => ({ url, label: '' }));
    }
    const certsRaw =
      Array.isArray(item?.selectedCerts) && item.selectedCerts.length
        ? item.selectedCerts
        : snap.certs;
    const allUrls = toStrList(snap.certs);
    const names = toStrList(snap.certNames);
    return toStrList(certsRaw).map((url) => {
      const idx = allUrls.indexOf(url);
      return {
        url,
        label: idx >= 0 && names[idx] ? names[idx] : fileNameOfUrl(url),
      };
    });
  }

  /** 加载并解析图片（本地 uploads 目录或 http 外链），失败返回 null；按 URL 缓存 */
  private async loadEmbeddedImage(
    rawUrl: string,
  ): Promise<EmbeddedDocxImage | null> {
    const url = String(rawUrl ?? '').trim();
    if (!url || url.startsWith('data:')) return null;
    const cached = this.imageCache.get(url);
    if (cached !== undefined) return cached;
    let result: EmbeddedDocxImage | null = null;
    try {
      const bytes = await this.fetchImageBytes(url);
      result = bytes ? this.parseImageBytes(bytes) : null;
    } catch (e) {
      this.logger.warn(
        `报价单导出嵌入图片失败（回退文本展示）: ${url} - ${e instanceof Error ? e.message : e}`,
      );
      result = null;
    }
    this.imageCache.set(url, result);
    return result;
  }

  private async fetchImageBytes(url: string): Promise<Buffer | null> {
    if (/^https?:\/\//i.test(url)) {
      const res = await axios.get<ArrayBuffer>(url, {
        responseType: 'arraybuffer',
        timeout: 10_000,
        maxContentLength: 20 * 1024 * 1024,
      });
      return Buffer.from(res.data);
    }
    // 本地上传文件：/uploads/xxx 由 ServeStatic 映射到 <cwd>/uploads/xxx
    const rel = url.replace(/^[/\\]+/, '');
    if (!/^uploads[/\\]/i.test(rel)) return null;
    return readFile(join(process.cwd(), rel));
  }

  /** 魔数识别 png/jpg/gif/bmp 并读取像素尺寸，其余类型（webp/svg/pdf）不支持嵌入返回 null */
  private parseImageBytes(buf: Buffer): EmbeddedDocxImage | null {
    if (!buf || buf.length < 24) return null;
    // PNG：\x89PNG + IHDR 宽高位于固定偏移（大端 uint32）
    if (
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47
    ) {
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      return width && height ? { data: buf, type: 'png', width, height } : null;
    }
    // JPEG：遍历段找 SOFn
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let off = 2;
      while (off + 9 < buf.length) {
        if (buf[off] !== 0xff) {
          off++;
          continue;
        }
        const marker = buf[off + 1];
        const isSof =
          marker >= 0xc0 &&
          marker <= 0xcf &&
          marker !== 0xc4 &&
          marker !== 0xc8 &&
          marker !== 0xcc;
        if (isSof) {
          const height = buf.readUInt16BE(off + 5);
          const width = buf.readUInt16BE(off + 7);
          return width && height
            ? { data: buf, type: 'jpg', width, height }
            : null;
        }
        off += 2 + buf.readUInt16BE(off + 2);
      }
      return null;
    }
    // GIF87a/GIF89a：小端 uint16 @6/@8
    if (buf.toString('ascii', 0, 3) === 'GIF') {
      const width = buf.readUInt16LE(6);
      const height = buf.readUInt16LE(8);
      return width && height ? { data: buf, type: 'gif', width, height } : null;
    }
    // BMP：BITMAPINFOHEADER 小端 int32 @18/@22
    if (buf[0] === 0x42 && buf[1] === 0x4d) {
      const width = Math.abs(buf.readInt32LE(18));
      const height = Math.abs(buf.readInt32LE(22));
      return width && height ? { data: buf, type: 'bmp', width, height } : null;
    }
    return null;
  }

  /** 媒体单元格内容：可嵌图时返回居中缩略图段落组；否则返回 null（由调用方走文本兜底） */
  private async buildMediaCellParagraphs(
    item: any,
    field: string,
  ): Promise<{ paragraphs: Paragraph[]; docLabels: string[] } | null> {
    const entries = this.itemMediaEntries(item, field);
    if (!entries.length) return null;

    const paragraphs: Paragraph[] = [];
    const docLabels: string[] = [];
    for (const entry of entries.slice(0, MAX_MEDIA_PER_CELL)) {
      if (isDocumentMedia(entry.url)) {
        docLabels.push(entry.label || entry.url);
        continue;
      }
      const img = await this.loadEmbeddedImage(entry.url);
      if (!img) {
        // 位图加载失败：证书回退名称、产品图片回退路径，避免静默丢失信息
        docLabels.push(entry.label || entry.url);
        continue;
      }
      const scale = Math.min(
        THUMB_MAX_W / img.width,
        THUMB_MAX_H / img.height,
        1,
      );
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
          children: [
            new ImageRun({
              type: img.type,
              data: img.data,
              transformation: {
                width: Math.max(1, Math.round(img.width * scale)),
                height: Math.max(1, Math.round(img.height * scale)),
              },
            }),
          ],
        }),
      );
    }
    if (docLabels.length) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: this.runs(docLabels.join('\n'), {
            size: 16,
            color: '595959',
          }),
        }),
      );
    }
    return paragraphs.length ? { paragraphs, docLabels } : null;
  }

  // ============ 通用字体/字号常量 ============
  private readonly FONT = '宋体';
  private readonly COLOR_TITLE = '000000'; // 标题黑色
  private readonly COLOR_HEADER_FILL = 'EAF1FB'; // 浅蓝表头
  private readonly COLOR_TAX_FILL = 'FCEFD6'; // 含税总额浅黄
  private readonly COLOR_TAX_TEXT = '9C5700';

  /** 合计区文案：与前端 quotationColumns.TOTAL_LABELS 镜像，改动需两端同步 */
  private readonly TOTAL_LABELS = {
    feeHeader: '费用项目',
    amountHeader: '金额（元）',
    subtotalNoTax: '合计（不含税）',
    finalTotal: '含税总额',
  } as const;

  // ============ 表格/合计构建（两种模板共用） ============

  private async buildPriceTable(quotation: any, template: any) {
    const items = (quotation.items ?? []) as any[];
    const columns: any[] = (template?.config?.columns ?? []).filter(
      (c: any) => c && c.visible !== false,
    );
    if (columns.length === 0) {
      throw new NotFoundException('报价模板未配置导出列');
    }

    /**
     * 列对齐镜像：与前端 quotationColumns.columnAlign 同语义（商务报价标准），
     * 居中=序号/编号/类型/单位/数量/品牌型号；右对齐=金额类；左对齐=名称/参数等长文本。两端需同步修改。
     */
    const DOCX_CENTER_KEYS = new Set([
      'no',
      'index',
      'code',
      'category',
      'unit',
      'quantity',
      'brandModel',
    ]);
    const DOCX_RIGHT_KEYS = new Set([
      'unitPrice',
      'discount',
      'subtotal',
      'cost',
      'unitCost',
    ]);

    const nameKey = this.mergeKeyOf(template?.config);
    const brandKey = 'brand';
    const nameIdx = columns.findIndex((c) => c.key === nameKey);
    const brandIdx = columns.findIndex((c) => c.key === brandKey);
    const spans = this.computeNameSpans(items, columns, nameKey, brandKey);

    const headerCells = columns.map((c) => {
      return new TableCell({
        shading: { type: ShadingType.CLEAR, fill: this.COLOR_HEADER_FILL },
        margins: { top: 60, bottom: 60, left: 80, right: 80 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: c.label ?? c.key ?? '',
                bold: true,
                size: 20, // 10pt
                color: this.COLOR_TITLE,
                font: this.FONT,
              }),
            ],
          }),
        ],
      });
    });
    const headerRow = new TableRow({
      tableHeader: true,
      children: headerCells,
    });

    const dataRows: TableRow[] = [];
    let spanCursor = 0;
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const span = spans[spanCursor];
      const isNameGroupStart =
        idx === spans.slice(0, spanCursor).reduce((a, s) => a + s.nameSpan, 0);
      const cells: TableCell[] = [];
      for (let ci = 0; ci < columns.length; ci++) {
        const c = columns[ci];
        if (
          !isNameGroupStart &&
          ((nameIdx >= 0 && ci === nameIdx) ||
            (brandIdx >= 0 && ci === brandIdx && span.brandSpan > 1))
        ) {
          continue;
        }
        const align = c?.align
          ? c.align === 'right'
            ? AlignmentType.RIGHT
            : c.align === 'center'
              ? AlignmentType.CENTER
              : AlignmentType.LEFT
          : DOCX_RIGHT_KEYS.has(c.key)
            ? AlignmentType.RIGHT
            : DOCX_CENTER_KEYS.has(c.key)
              ? AlignmentType.CENTER
              : AlignmentType.LEFT;
        const isNameCell = nameIdx >= 0 && ci === nameIdx;
        const isBrandCell = brandIdx >= 0 && ci === brandIdx;
        // 媒体列（产品图片/证书）嵌入真实缩略图；失败回退路径/名称文本
        const mediaCell =
          c.key === 'images' || c.key === 'certs'
            ? await this.buildMediaCellParagraphs(item, c.key)
            : null;
        const cellOpts: any = {
          margins: { top: 40, bottom: 40, left: 80, right: 80 },
          verticalAlign: VerticalAlign.CENTER,
          children: mediaCell
            ? mediaCell.paragraphs
            : [
                new Paragraph({
                  alignment: align,
                  children: this.runs(this.cellValue(item, idx, c), {
                    size: 19,
                    font: this.FONT,
                  }),
                }),
              ],
        };
        if (isNameCell && span.nameSpan > 1) cellOpts.rowSpan = span.nameSpan;
        if (isBrandCell && span.brandSpan > 1)
          cellOpts.rowSpan = span.brandSpan;
        cells.push(new TableCell(cellOpts));
      }
      dataRows.push(new TableRow({ children: cells }));
      const groupEnd = spans
        .slice(0, spanCursor + 1)
        .reduce((a, s) => a + s.nameSpan, 0);
      if (idx + 1 === groupEnd) spanCursor++;
    }

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: this.borders(),
      rows: [headerRow, ...dataRows],
    });
  }

  private buildTotalTable(quotation: any, config: any) {
    // 与预览/Excel/PDF 一致：开启「显示税额」且税率 > 0 时展示 合计/税额/含税总额，
    // 否则仅展示含税总额（避免未选税率时出现 0% 税额行）
    const showBreakdown = !!config?.showTax && (quotation.taxRate ?? 0) > 0;

    const headerCell = (text: string) =>
      new TableCell({
        shading: { type: ShadingType.CLEAR, fill: this.COLOR_HEADER_FILL },
        margins: { top: 40, bottom: 40, left: 80, right: 80 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text,
                bold: true,
                size: 20,
                color: this.COLOR_TITLE,
                font: this.FONT,
              }),
            ],
          }),
        ],
      });

    const rowCell = (
      text: string,
      opts: {
        bold?: boolean;
        fill?: string;
        color?: string;
        align?: (typeof AlignmentType)[keyof typeof AlignmentType];
      } = {},
    ) =>
      new TableCell({
        ...(opts.fill
          ? { shading: { type: ShadingType.CLEAR, fill: opts.fill } }
          : {}),
        margins: { top: 40, bottom: 40, left: 80, right: 80 },
        children: [
          new Paragraph({
            alignment: opts.align ?? AlignmentType.RIGHT,
            children: [
              new TextRun({
                text,
                bold: !!opts.bold,
                size: 22,
                color: opts.color ?? '000000',
                font: this.FONT,
              }),
            ],
          }),
        ],
      });

    const rows: TableRow[] = [
      new TableRow({
        children: [
          headerCell(this.TOTAL_LABELS.feeHeader),
          headerCell(this.TOTAL_LABELS.amountHeader),
        ],
      }),
    ];
    if (showBreakdown) {
      rows.push(
        new TableRow({
          children: [
            rowCell(this.TOTAL_LABELS.subtotalNoTax, {
              align: AlignmentType.CENTER,
            }),
            rowCell((quotation.totalAmount ?? 0).toFixed(2)),
          ],
        }),
        new TableRow({
          children: [
            rowCell(`税额（税率 ${quotation.taxRate ?? 0}%）`, {
              align: AlignmentType.CENTER,
            }), // 文案同前端 taxRowLabel
            rowCell((quotation.taxAmount ?? 0).toFixed(2)),
          ],
        }),
      );
    }
    rows.push(
      new TableRow({
        children: [
          rowCell(this.TOTAL_LABELS.finalTotal, {
            align: AlignmentType.CENTER,
            bold: true,
            fill: this.COLOR_TAX_FILL,
            color: this.COLOR_TAX_TEXT,
          }),
          rowCell((quotation.finalAmount ?? 0).toFixed(2), {
            bold: true,
            fill: this.COLOR_TAX_FILL,
            color: this.COLOR_TAX_TEXT,
          }),
        ],
      }),
    );

    return new Table({
      width: { size: 35, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.RIGHT,
      borders: this.borders(),
      rows,
    });
  }

  // ============ 排版辅助 ============

  /** 一级章节标题（带下划线分隔） */
  private sectionTitle(text: string): Paragraph {
    return new Paragraph({
      spacing: { before: 240, after: 120 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          color: 'BFBFBF',
          size: 6,
          space: 4,
        },
      },
      children: [
        new TextRun({
          text,
          bold: true,
          size: 24,
          color: this.COLOR_TITLE,
          font: this.FONT,
        }),
      ],
    });
  }

  /** 二级小标题 */
  private subTitle(text: string): Paragraph {
    return new Paragraph({
      spacing: { before: 140, after: 60 },
      children: [
        new TextRun({
          text,
          bold: true,
          size: 21,
          color: this.COLOR_TITLE,
          font: this.FONT,
        }),
      ],
    });
  }

  /** 正文段落（保留换行） */
  private body(text: string): Paragraph {
    return new Paragraph({
      spacing: { after: 60 },
      alignment: AlignmentType.JUSTIFIED,
      indent: { firstLine: 420 },
      children: this.runs(text, { size: 21, font: this.FONT }),
    });
  }

  /** 将文本按 \n 拆分为多个 TextRun，换行符放在后续内容 run 上（空文本 run 的 break 会被部分 Word/WPS 版本丢弃） */
  private runs(
    text: string,
    opts: {
      bold?: boolean;
      size?: number;
      color?: string;
      font?: string;
    } = {},
  ): TextRun[] {
    const parts = String(text ?? '')
      .replace(/\r\n/g, '\n')
      .split('\n');
    return parts.map((part, i) =>
      i > 0
        ? new TextRun({ ...opts, break: 1, text: part })
        : new TextRun({ ...opts, text: part }),
    );
  }

  /** 段落区块（固定套话）：支持 {{customerName}}/{{code}}/{{date}} 占位符 */
  private sectionBlocks(
    config: any,
    quotation: any,
  ): { before: Paragraph[]; after: Paragraph[] } {
    const sections: any[] = Array.isArray(config?.sections)
      ? config.sections
      : [];
    const company = config?.company ?? {};
    const fill = (text: string) =>
      this.replacePlaceholders(text, quotation, company);
    const build = (s: any): Paragraph[] => {
      const paras: Paragraph[] = [];
      if (s?.title) {
        paras.push(
          new Paragraph({
            spacing: { before: 120, after: 40 },
            children: this.runs(fill(s.title), {
              bold: true,
              size: 22,
              color: this.COLOR_TITLE,
              font: this.FONT,
            }),
          }),
        );
      }
      paras.push(this.body(fill(s?.content ?? '')));
      return paras;
    };
    const before: Paragraph[] = [];
    const after: Paragraph[] = [];
    for (const s of sections) {
      if ((s?.position ?? 'before') === 'after') after.push(...build(s));
      else before.push(...build(s));
    }
    return { before, after };
  }

  /** 解析标题文本：替换 {{customerName}} / {{date}} / {{code}} / {{companyName}} 等占位符 */
  private resolveTitle(config: any, quotation: any): string {
    const fallback = '报价单';
    // 优先使用带占位符的 titleFormat，其次 title，最后报价单自身标题
    const raw =
      config?.title || config?.titleFormat || quotation.title || fallback;
    return this.replacePlaceholders(raw, quotation, config?.company).trim();
  }

  /** 生成下载文件名：客户名称_日期.docx（去除非法字符） */
  private resolveFileName(quotation: any): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const iso = `${yyyy}-${mm}-${dd}`;
    const base = (quotation.customerName ?? '报价单').replace(
      /[\\/:*?"<>|]/g,
      '_',
    );
    return `${base}_${iso}.docx`;
  }

  /** 标题（居中大号加粗） */
  private docTitle(text: string): Paragraph {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text,
          bold: true,
          size: 32,
          color: this.COLOR_TITLE,
          font: this.FONT,
        }),
      ],
    });
  }

  /** 信息行（右对齐灰色） */
  private infoLine(text: string): Paragraph {
    return new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 160 },
      children: [
        new TextRun({ text, size: 18, color: '666666', font: this.FONT }),
      ],
    });
  }

  /** 信息行：按模板配置 infoFormat 渲染，空值段自动省略（默认：客户/联系人/地址/报价编号/日期/单位） */
  private infoText(quotation: any, config: any = {}): string {
    const format = config.infoFormat
      ? String(config.infoFormat)
      : '客户：{{customerName}}\u3000联系人：{{customerContact}}\u3000地址：{{customerAddress}}\u3000报价编号：{{code}}\u3000日期：{{date}}\u3000单位：元';
    const valueOf = (name: string): string => {
      switch (name) {
        case 'customerName':
          return quotation.customerName ?? '';
        case 'customerContact':
          return quotation.customerContact ?? '';
        case 'customerAddress':
          return quotation.customerAddress ?? '';
        case 'code':
          return quotation.code ?? '';
        case 'date':
          return this.quotationDate(quotation);
        default:
          return '';
      }
    };
    return format
      .split('\u3000')
      .map((segment: string) => {
        const keys = Array.from(
          segment.matchAll(/\{\{\s*(\w+)\s*\}\}/g),
          (m) => m[1],
        );
        if (keys.length && keys.every((k) => valueOf(k) === '')) return '';
        return segment.replace(/\{\{\s*(\w+)\s*\}\}/g, (_: string, k: string) =>
          valueOf(k),
        );
      })
      .filter(Boolean)
      .join('\u3000');
  }

  /**
   * 页脚：按行拆分为多个独立段落（硬回车），而非段内软换行——
   * 软换行在部分 Word/WPS 版本会显示为「↓」箭头标记或被忽略。
   */
  private footerParagraph(
    footer?: string,
    quotation?: any,
    company?: any,
  ): Paragraph[] {
    if (!footer) return [];
    const text = this.replacePlaceholders(footer, quotation ?? {}, company);
    const lines = String(text)
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((l) => l.trimEnd())
      .filter((l) => l.length > 0);
    return lines.map(
      (line, i) =>
        new Paragraph({
          spacing: { before: i === 0 ? 200 : 40 },
          ...(i === 0
            ? {
                border: {
                  top: {
                    style: BorderStyle.SINGLE,
                    color: 'BFBFBF',
                    size: 4,
                    space: 4,
                  },
                },
              }
            : {}),
          children: [
            new TextRun({
              text: line,
              size: 18,
              color: '888888',
              font: this.FONT,
            }),
          ],
        }),
    );
  }

  // ============ 模板一：标准报价单（标题 + 页眉 + 表格 + 页脚） ============
  private async renderQuotation(
    quotation: any,
    template: any,
  ): Promise<Buffer> {
    const config = template?.config ?? {};
    const company = config.company ?? {};
    const headerRaw = config.header as string | undefined;
    const footer = config.footer as string | undefined;
    const header = headerRaw
      ? this.replacePlaceholders(headerRaw, quotation, company)
      : undefined;
    const titleText = this.resolveTitle(config, quotation);

    const children: any[] = [];
    // 页眉（细线分隔的灰色信息行）
    if (header) {
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          border: {
            bottom: {
              style: BorderStyle.SINGLE,
              color: 'BFBFBF',
              size: 4,
              space: 4,
            },
          },
          children: this.runs(header, {
            size: 18,
            color: '666666',
            font: this.FONT,
          }),
        }),
      );
    }
    children.push(this.docTitle(titleText));
    children.push(this.infoLine(this.infoText(quotation, config)));

    const sectionBlocks = this.sectionBlocks(config, quotation);
    children.push(...sectionBlocks.before);

    const tableTitle = config.tableTitle as string | undefined;
    if (tableTitle) {
      children.push(
        new Paragraph({
          spacing: { before: 200, after: 80 },
          children: this.runs(
            this.replacePlaceholders(tableTitle, quotation, company),
            { size: 22, bold: true, color: this.COLOR_TITLE, font: this.FONT },
          ),
        }),
      );
    }

    children.push(await this.buildPriceTable(quotation, template));
    children.push(
      new Paragraph({
        spacing: { before: 160 },
        children: [new TextRun({ text: '' })],
      }),
    );
    children.push(this.buildTotalTable(quotation, config));
    children.push(...sectionBlocks.after);
    children.push(...this.footerParagraph(footer, quotation, company));

    // 页面方向与前端 PDF/预览一致：模板配置 landscape 时用 A4 横向（宽 16838 × 高 11906 twips）
    const isLandscape = config?.pageOrientation === 'landscape';
    const doc = new Document({
      styles: { default: { document: { run: { font: this.FONT, size: 19 } } } },
      sections: [
        {
          properties: {
            page: {
              size: {
                orientation: isLandscape
                  ? PageOrientation.LANDSCAPE
                  : PageOrientation.PORTRAIT,
                width: isLandscape ? 16838 : 11906,
                height: isLandscape ? 11906 : 16838,
              },
              margin: { top: 720, bottom: 720, left: 720, right: 720 },
            },
          },
          children,
        },
      ],
    });
    return Packer.toBuffer(doc);
  }

  // ============ 标准方案（proposal）已移除，统一按报价单渲染 ============

  async render(
    quotationId: string,
    options: { templateId?: string; config?: Record<string, unknown> } = {},
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const quotation: any = await this.quotationsService.findOne(quotationId);
    if (!quotation) {
      throw new NotFoundException('报价单不存在');
    }
    // 若指定模板则优先使用指定模板，否则用报价单关联的模板
    let template: any = quotation.template;
    if (options.templateId) {
      const t = await this.prisma.quotationTemplate.findUnique({
        where: { id: options.templateId },
      });
      if (t) template = t;
    }
    // 导出时传入的自定义配置（列/标题/页眉页脚等）优先于模板配置
    const effectiveTemplate = options.config
      ? { ...template, config: options.config }
      : template;
    const buffer = await this.renderQuotation(quotation, effectiveTemplate);
    return { buffer, fileName: this.resolveFileName(quotation) };
  }
}
