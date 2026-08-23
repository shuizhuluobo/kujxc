import * as ExcelJSNS from 'exceljs';
import type { Cell } from 'exceljs';
// 兼容 Vite 与 Node(ESM) 对 exceljs(CJS) 的默认导出 interop：Node 下真实构造器在 .default
const ExcelJS: typeof ExcelJSNS = (ExcelJSNS as unknown as { default?: typeof ExcelJSNS }).default ?? ExcelJSNS;
import pdfMake from 'pdfmake/build/pdfmake';
import type { Quotation, QuotationTemplate, QuotationTemplateColumn, QuotationTemplateConfig } from '@/types';
import { columnAlign, columnValue, computeMergeGroups, formatAmount, infoLineText, resolveMergeKey, resolveTitle, showTaxBreakdown, taxRowLabel, templateText, TOTAL_LABELS, visibleColumns } from '@/utils/quotationColumns';
import { collectItemMediaEntries, isDocumentMedia, isMediaColumnKey, loadImageThumb } from '@/utils/quotationImages';
import type { LoadedThumb } from '@/utils/quotationImages';

/** 每个媒体单元格最多嵌入的缩略图数量（超出部分丢弃，防止行高爆炸） */
const MAX_MEDIA_PER_CELL = 4;
/** PDF 中单张缩略图的适配盒（pt） */
const PDF_THUMB_FIT: [number, number] = [64, 48];

export type EffectiveTemplate = Pick<QuotationTemplate, 'config'> | null | undefined;

/** 空模板配置兜底：与 undefined 语义一致（templateText/showTaxBreakdown 对 ''/false/undefined 同判） */
const EMPTY_TEMPLATE_CONFIG: QuotationTemplateConfig = {
    columns: [],
    title: '',
    showTax: false,
    header: '',
    footer: '',
};

function defaultColumns(): QuotationTemplateColumn[] {
    return [
        { key: 'code', label: '产品编号', visible: true, type: 'field', field: 'code' },
        { key: 'brandModel', label: '品牌型号', visible: true, type: 'formula', formula: '{brand} {model}' },
        { key: 'brand', label: '品牌', visible: true, type: 'field', field: 'brand' },
        { key: 'category', label: '类型', visible: true, type: 'field', field: 'category' },
        { key: 'unit', label: '单位', visible: true, type: 'field', field: 'unit' },
        { key: 'quantity', label: '数量', visible: true, type: 'field', field: 'quantity' },
        { key: 'unitPrice', label: '单价', visible: true, type: 'field', field: 'unitPrice' },
        { key: 'discount', label: '折扣', visible: true, type: 'field', field: 'discount' },
        { key: 'subtotal', label: '小计', visible: true, type: 'field', field: 'subtotal' },
    ];
}

function resolveTemplate(quotation: Quotation, templateOverride?: EffectiveTemplate) {
    return templateOverride ?? (quotation.template as EffectiveTemplate);
}

function resolveColumns(template: EffectiveTemplate): QuotationTemplateColumn[] {
    const cols = template?.config?.columns;
    if (cols?.length) return visibleColumns(cols);
    return defaultColumns();
}

// PDF 字体：正文宋体（与 Word 版观感一致）+ 标题思源黑体粗体（中文商务文档惯例：黑体标题/宋体正文）
// 均已按 GB2312 常用字 + ASCII 子集化。注意：此前误用 Thin(100) 极细字重导致 PDF 整体发浅，勿回退。
const FONT_NORMAL_URL = '/fonts/simsun-subset.ttf';
const FONT_BOLD_URL = '/fonts/notosans-bold-subset.ttf';
const FONT_VFS_NORMAL = 'simsun-subset.ttf';
const FONT_VFS_BOLD = 'notosans-bold-subset.ttf';

let fontReady: Promise<boolean> | null = null;

async function fetchToBase64(url: string): Promise<string | null> {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const bytes = new Uint8Array(await res.arrayBuffer());
        let binary = '';
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
            binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
        }
        return btoa(binary);
    } catch {
        return null;
    }
}

function ensureCjkFont(): Promise<boolean> {
    if (!fontReady) {
        fontReady = (async () => {
            const [normal, bold] = await Promise.all([
                fetchToBase64(FONT_NORMAL_URL),
                fetchToBase64(FONT_BOLD_URL),
            ]);
            if (!normal) {
                console.error('[PDF] 中文字体加载失败：无法获取字体文件', FONT_NORMAL_URL);
                return false;
            }
            const pm = pdfMake as unknown as {
                virtualfs?: {
                    writeFileSync: (name: string, content: string, encoding?: string) => void;
                    existsSync: (name: string) => boolean;
                };
                addVirtualFileSystem?: (vfs: Record<string, string>) => void;
                fonts: Record<string, unknown>;
            };
            const writeFont = (name: string, base64: string) => {
                if (pm.virtualfs?.writeFileSync) {
                    pm.virtualfs.writeFileSync(name, base64, 'base64');
                } else if (pm.addVirtualFileSystem) {
                    pm.addVirtualFileSystem({ [name]: base64 });
                } else {
                    throw new Error('pdfMake 无可用虚拟文件系统接口');
                }
            };
            writeFont(FONT_VFS_NORMAL, normal);
            if (bold) writeFont(FONT_VFS_BOLD, bold);
            if (!pm.virtualfs?.existsSync(FONT_VFS_NORMAL)) {
                console.error('[PDF] 字体写入虚拟文件系统失败', FONT_VFS_NORMAL);
                return false;
            }
            pm.fonts = {
                'Source Han Sans': {
                    normal: FONT_VFS_NORMAL,
                    bold: bold ? FONT_VFS_BOLD : FONT_VFS_NORMAL,
                    italics: FONT_VFS_NORMAL,
                    bolditalics: bold ? FONT_VFS_BOLD : FONT_VFS_NORMAL,
                },
            };
            return true;
        })();
    }
    return fontReady;
}

function fmtCurrency(value?: number | null): string {
    return formatAmount(value);
}

/** 在超长连续无空格片段（如 URL）中插入零宽空格，便于 pdfMake 自动断词，避免横向溢出页面 */
function softBreak(text: string, max = 28): string {
    if (!text) return text;
    return text.replace(/\S{28,}/g, (m) => m.replace(new RegExp(`(.{${max}})`, 'g'), `$1\u200b`));
}

function applyBorder(cell: Cell) {
    cell.border = {
        top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
        left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
        bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
        right: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    };
}

function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadFilename(quotation: Quotation, ext: string): string {
    const date = new Date();
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const base = (quotation.customerName || '报价单').replace(/[\\/:*?"<>|]/g, '_');
    return `${base}_${iso}.${ext}`;
}

// ==================== Excel 导出 ====================

export async function exportQuotationToExcel(
    quotation: Quotation,
    templateOverride?: EffectiveTemplate,
): Promise<void> {
    const template = resolveTemplate(quotation, templateOverride);
    // 兜底：列配置异常为空时回退默认列，避免导出完全空白且无框线的文件
    const columns = resolveColumns(template).length ? resolveColumns(template) : defaultColumns();
    const mergeKey = resolveMergeKey(template?.config);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('报价单');

    // A4 纵向，页边距收敛，打印更舒适
    sheet.pageSetup = {
        paperSize: 9, // A4
        orientation: 'portrait',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: { left: 0.5, right: 0.5, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 },
    };

    // 列宽：以列语义为基准，再按内容自适应（CJK 按 2 单位计宽）
    const COL_WIDTH: Record<string, number> = {
        no: 6,
        code: 14,
        name: 20,
        brand: 14,
        category: 12,
        unit: 8,
        quantity: 9,
        unitPrice: 12,
        discount: 9,
        subtotal: 13,
        unitCost: 12,
        link: 22,
        images: 14,
        certs: 14,
        certsNames: 12,
        warranty: 12,
        supplier: 14,
        tags: 16,
        moq: 8,
        params: 28,
        description: 32,
        remark: 20,
    };
    const WIDE_KEYS = new Set(['description', 'params', 'remark', 'link']);
    const cjkLen = (text: string): number => {
        let n = 0;
        for (const ch of text) {
            n += ch.charCodeAt(0) > 0xff ? 2 : 1;
        }
        return n;
    };

    // 数值列在 Excel 中写为数字（可求和/透视）；discount 形如 "85%"，去掉 % 号
    const NUMERIC_COLUMN_KEYS = new Set(['quantity', 'unitPrice', 'subtotal', 'unitCost', 'cost']);
    const toCellNumber = (key: string, raw: string): string | number => {
        if (!NUMERIC_COLUMN_KEYS.has(key) && key !== 'discount') return raw;
        const n = Number(key === 'discount' ? String(raw).replace(/%$/, '') : raw);
        return Number.isFinite(n) ? n : raw;
    };

    // 数据行先于列宽计算：用真实内容决定每列宽度（媒体列嵌图，路径文本不参与测宽）
    const bodyRows = quotation.items.map((item, idx) => {
        const row: Record<string, string | number> = {};
        for (const c of columns) {
            const isSeq = c.key === 'no' || c.key === 'index';
            row[c.key] = isSeq ? idx + 1 : toCellNumber(c.key, columnValue(item, c));
        }
        return row;
    });

    sheet.columns = columns.map((c) => {
        const base = c.width ?? COL_WIDTH[c.key] ?? 12;
        let maxContent = 0;
        if (!isMediaColumnKey(c.key)) {
            for (const row of bodyRows) {
                const v = row[c.key];
                if (v != null) maxContent = Math.max(maxContent, cjkLen(String(v)));
            }
        }
        const natural = Math.max(base, cjkLen(c.label) + 2, maxContent + 2);
        const cap = WIDE_KEYS.has(c.key) ? 60 : 42;
        return {
            header: c.label,
            key: c.key,
            width: Math.min(Math.max(natural, base), cap),
        };
    });

    const config = template?.config ?? EMPTY_TEMPLATE_CONFIG;
    const company = config.company;
    const breakdown = showTaxBreakdown(config, quotation);
    const headerText = templateText(config.header, quotation, company);
    const footerText = templateText(config.footer, quotation, company);
    const tableTitleText = templateText(config.tableTitle, quotation, company);
    const sections = config.sections ?? [];

    // 行号按内容递增：页眉 → 标题 → 客户信息 → 表前段落 → 表格标题 → 表头 → 明细 → 合计 → 表后段落 → 页脚
    let rowCursor = 1;
    const addMergedTextRow = (
        text: string,
        opts: {
            font?: Record<string, unknown>;
            alignment?: Record<string, unknown>;
            height?: number;
        } = {},
    ): number => {
        const rowNumber = rowCursor++;
        sheet.mergeCells(rowNumber, 1, rowNumber, columns.length);
        const cell = sheet.getCell(rowNumber, 1);
        cell.value = text;
        cell.font = { name: '宋体', size: 10, ...(opts.font ?? {}) };
        cell.alignment = { vertical: 'middle', wrapText: true, ...(opts.alignment ?? {}) };
        if (opts.height) sheet.getRow(rowNumber).height = opts.height;
        return rowNumber;
    };
    // 按可用列宽粗略估算换行后的行高（CJK 按 2 单位计宽）
    const estimateLines = (text: string, width: number): number => {
        const perLine = Math.max(1, Math.floor(width * 0.9));
        let total = 0;
        for (const line of String(text ?? '').split('\n')) {
            let n = 0;
            for (const ch of line) n += ch.charCodeAt(0) > 0xff ? 2 : 1;
            total += Math.max(1, Math.ceil(n / perLine));
        }
        return total;
    };
    const estimateHeight = (text: string): number => {
        const totalWidth = sheet.columns.reduce((a, col) => a + (col.width ?? 10), 0);
        const lines = Math.max(1, estimateLines(text, totalWidth));
        return Math.min(220, Math.max(22, lines * 15 + 8));
    };

    // 页眉（模板配置，支持 {{companyName}} 等占位符）
    if (headerText) {
        addMergedTextRow(headerText, {
            font: { size: 10, color: { argb: 'FF888888' } },
            alignment: { horizontal: 'left' },
            height: 20,
        });
    }

    // 标题
    const titleRowNumber = rowCursor++;
    sheet.mergeCells(titleRowNumber, 1, titleRowNumber, columns.length);
    const titleCell = sheet.getCell(titleRowNumber, 1);
    titleCell.value = resolveTitle(quotation, config, company);
    titleCell.font = { size: 20, bold: true, name: '宋体', color: { argb: 'FF000000' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(titleRowNumber).height = 36;

    // 单位 + 客户信息行（右对齐）
    const infoRowNumber = rowCursor++;
    sheet.mergeCells(infoRowNumber, 1, infoRowNumber, columns.length);
    const infoCell = sheet.getCell(infoRowNumber, 1);
    infoCell.value = infoLineText(quotation, config);
    infoCell.font = { size: 10, name: '宋体', color: { argb: 'FF666666' } };
    infoCell.alignment = { horizontal: 'right', vertical: 'middle' };
    sheet.getRow(infoRowNumber).height = 22;

    // 表前段落（模板配置）
    for (const s of sections) {
        if ((s.position ?? 'before') !== 'before') continue;
        if (s.title) {
            addMergedTextRow(templateText(s.title, quotation, company), {
                font: { size: 11, bold: true, color: { argb: 'FF000000' } },
                height: 24,
            });
        }
        const content = templateText(s.content, quotation, company);
        if (content) {
            addMergedTextRow(content, {
                font: { size: 10, color: { argb: 'FF333333' } },
                alignment: { horizontal: 'left' },
                height: estimateHeight(content),
            });
        }
    }

    // 表格标题（模板配置）
    if (tableTitleText) {
        addMergedTextRow(tableTitleText, {
            font: { size: 12, bold: true, color: { argb: 'FF000000' } },
            alignment: { horizontal: 'left' },
            height: 24,
        });
    }

    // 表头行
    const headerRowNumber = rowCursor++;
    for (let c = 1; c <= columns.length; c++) {
        const cell = sheet.getCell(headerRowNumber, c);
        cell.value = columns[c - 1].label;
        cell.font = { bold: true, size: 11, name: '宋体', color: { argb: 'FF000000' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAF1FB' } };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FF9DB2D6' } },
            left: { style: 'thin', color: { argb: 'FF9DB2D6' } },
            bottom: { style: 'medium', color: { argb: 'FF5B7FBF' } },
            right: { style: 'thin', color: { argb: 'FF9DB2D6' } },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    }
    sheet.getRow(headerRowNumber).height = 30;

    // 多页打印时重复表头；冻结到表头行便于长表滚动
    sheet.pageSetup.printTitlesRow = `${headerRowNumber}:${headerRowNumber}`;
    sheet.views = [{ state: 'frozen', ySplit: headerRowNumber }];

    // 逐行写入并估算行高：按各列实际宽度与换行计算，保证多行参数不被截断
    // 公式支持：小计 = 数量*单价（有折扣列时乘 IF(N(折)=0,1,折/100)，空值/0 自动视为不打折），
    // 用户导出后手动改单价/数量/折扣，小计与合计自动重算。
    const colLetter = (idx1: number): string => {
        let n = idx1;
        let s = '';
        while (n > 0) {
            const m = (n - 1) % 26;
            s = String.fromCharCode(65 + m) + s;
            n = Math.floor((n - 1) / 26);
        }
        return s;
    };
    const colIndexOf = (key: string): number => columns.findIndex((c) => c.key === key) + 1; // 0=列不存在
    const qtyColIdx = colIndexOf('quantity');
    const priceColIdx = colIndexOf('unitPrice');
    const discColIdx = colIndexOf('discount');
    const subtotalColIdx = colIndexOf('subtotal');
    const canFormulaSubtotal = subtotalColIdx > 0 && qtyColIdx > 0 && priceColIdx > 0 && bodyRows.length > 0;

    for (let i = 0; i < bodyRows.length; i++) {
        const row = bodyRows[i];
        let maxLines = 1;
        for (let c = 0; c < columns.length; c++) {
            const v = row[columns[c].key];
            if (v != null) {
                maxLines = Math.max(maxLines, estimateLines(String(v), sheet.getColumn(c + 1).width ?? 10));
            }
        }
        let written: Record<string, string | number | { formula: string; result?: number | string }> = row;
        if (canFormulaSubtotal) {
            const r = headerRowNumber + 1 + i;
            let f = `${colLetter(qtyColIdx)}${r}*${colLetter(priceColIdx)}${r}`;
            if (discColIdx > 0) {
                f += `*IF(N(${colLetter(discColIdx)}${r})=0,1,N(${colLetter(discColIdx)}${r})/100)`;
            }
            written = { ...row, [columns[subtotalColIdx - 1].key]: { formula: f, result: Number(row.subtotal) || 0 } };
        }
        const rowNum = sheet.addRow(written).number;
        sheet.getRow(rowNum).height = Math.min(220, Math.max(22, maxLines * 15 + 8));
    }

    const firstDataRow = headerRowNumber + 1;
    const lastDataRowNumber = headerRowNumber + bodyRows.length;
    // 关键：sheet.addRow() 由 ExcelJS 自动追加，不会推进手动维护的 rowCursor，
    // 必须在此同步，否则后续的合计/表后段落/页脚会用旧游标覆盖已写入的数据行。
    rowCursor = lastDataRowNumber + 1;

    // 逐单元格样式：细边框 + 垂直居中 + 长文本自动换行
    // 对齐策略：列配置 align 优先，其次 columnAlign 统一语义（与其他渲染端一致）
    for (let r = firstDataRow; r <= lastDataRowNumber; r++) {
        for (let c = 1; c <= columns.length; c++) {
            const cell = sheet.getCell(r, c);
            const col = columns[c - 1];
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFD6DCE5' } },
                left: { style: 'thin', color: { argb: 'FFD6DCE5' } },
                bottom: { style: 'thin', color: { argb: 'FFD6DCE5' } },
                right: { style: 'thin', color: { argb: 'FFD6DCE5' } },
            };
            cell.font = { size: 10.5, name: '宋体' };
            const horizontal: 'left' | 'center' | 'right' = col.align ?? columnAlign(col.key);
            cell.alignment = {
                horizontal,
                vertical: 'middle',
                wrapText: true,
            };
        }
    }

    // ===== 嵌入产品图片/证书缩略图（加载失败时保留原路径文本兜底，绝不中断导出） =====
    const mediaCols = columns.map((c, i) => ({ c, i })).filter(({ c }) => isMediaColumnKey(c.key));
    for (const { c, i } of mediaCols) {
        const colIdx1 = i + 1;
        const colWidthPx = Math.round((sheet.getColumn(colIdx1).width ?? 10) * 7) + 5;
        for (let r = 0; r < bodyRows.length; r++) {
            const rawEntries = collectItemMediaEntries(quotation.items[r], c.key);
            if (!rawEntries.length) continue;
            const entries = rawEntries.filter((e) => !isDocumentMedia(e.url));
            // 全有或全无：单元格混有文档型证书（PDF）时整格回退文本，避免浮动图压住文字
            if (!entries.length || entries.length !== rawEntries.length) continue;
            const thumbs = (
                await Promise.all(entries.slice(0, MAX_MEDIA_PER_CELL).map((e) => loadImageThumb(e.url)))
            ).filter((t): t is LoadedThumb => !!t);
            if (!thumbs.length) continue;

            const rowNumber = firstDataRow + r;
            // 清掉路径文本，仅保留嵌图
            sheet.getCell(rowNumber, colIdx1).value = '';
            // 纵向堆叠：行高按缩略图总高度扩展（px→pt），上限 409.5pt
            const GAP_PX = 4;
            const stackHeight = thumbs.reduce((a, t) => a + t.height + GAP_PX, -GAP_PX) + 8;
            const row = sheet.getRow(rowNumber);
            row.height = Math.min(409.5, Math.max(row.height ?? 22, Math.ceil((stackHeight * 72) / 96)));

            let yOffPx = 4;
            for (const thumb of thumbs) {
                const imgId = workbook.addImage({
                    base64: thumb.dataUrl.replace(/^data:image\/png;base64,/, ''),
                    extension: 'png',
                });
                // ExcelJS 锚点支持小数 col/row（相对列宽/行高的比例偏移）
                const xFrac = Math.min(0.95, 4 / colWidthPx);
                const yFrac = Math.min(0.95, yOffPx / ((row.height ?? 22) * (96 / 72)));
                sheet.addImage(imgId, {
                    tl: { col: i + xFrac, row: rowNumber - 1 + yFrac },
                    ext: { width: thumb.width, height: thumb.height },
                });
                yOffPx += thumb.height + GAP_PX;
            }
        }
    }

    // 同值合并：分组算法来自 computeMergeGroups（四端共用），
    // 空值不合并；品牌列仅在组内前缀连续一致时部分合并（修复组内 A/A/B 被 A 吞掉的错合并）。
    {
        const nameCol = columns.findIndex((c) => c.key === mergeKey) + 1;
        const brandCol = columns.findIndex((c) => c.key === 'brand') + 1;
        for (const g of computeMergeGroups(quotation.items, columns, mergeKey)) {
            if (g.span > 1 && nameCol >= 1) {
                sheet.mergeCells(firstDataRow + g.start, nameCol, firstDataRow + g.start + g.span - 1, nameCol);
            }
            if (g.brandSpan > 1 && brandCol >= 1 && brandCol !== nameCol) {
                sheet.mergeCells(firstDataRow + g.start, brandCol, firstDataRow + g.start + g.brandSpan - 1, brandCol);
            }
        }
    }

    // 合计区：开启显示税额且税率 > 0 时展示 合计/税额/含税总额，否则仅展示含税总额（与预览一致）
    // 有小计列时合计用 SUM 公式、税额与含税总额引用上方单元格，改明细后自动重算
    const sumRange =
        canFormulaSubtotal && subtotalColIdx > 0
            ? `${colLetter(subtotalColIdx)}${firstDataRow}:${colLetter(subtotalColIdx)}${lastDataRowNumber}`
            : null;
    const totalColLetter = colLetter(columns.length);
    const addTotalRow = (
        label: string,
        value: number,
        opts: { bold?: boolean; fill?: string; color?: string; formula?: string } = {},
    ): number => {
        const rowNumber = rowCursor++;
        sheet.mergeCells(rowNumber, 1, rowNumber, columns.length - 1);
        const labelCell = sheet.getCell(rowNumber, 1);
        labelCell.value = label;
        labelCell.font = { bold: !!opts.bold, size: 12, name: '宋体', color: { argb: opts.color ?? 'FF000000' } };
        labelCell.alignment = { horizontal: 'center', vertical: 'middle' };
        const valCell = sheet.getCell(rowNumber, columns.length);
        // 金额写为数字并套两位小数格式：用户拿到 xlsx 可直接求和/透视
        valCell.value = opts.formula ? { formula: opts.formula, result: Number(value ?? 0) } : Number(value ?? 0);
        valCell.numFmt = '0.00';
        valCell.font = { bold: !!opts.bold, size: 12, name: '宋体', color: { argb: opts.color ?? 'FF000000' } };
        valCell.alignment = { horizontal: 'right', vertical: 'middle' };
        if (opts.fill) {
            const fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: opts.fill } };
            labelCell.fill = fill;
            valCell.fill = fill;
        }
        applyBorder(labelCell);
        applyBorder(valCell);
        return rowNumber;
    };
    if (breakdown) {
        const taxRate = Number(quotation.taxRate ?? 0);
        const rSubtotal = addTotalRow(TOTAL_LABELS.subtotalNoTax, Number(quotation.totalAmount ?? 0), {
            formula: sumRange ? `SUM(${sumRange})` : undefined,
        });
        const rTax = addTotalRow(taxRowLabel(taxRate), Number(quotation.taxAmount ?? 0), {
            formula: `ROUND(${totalColLetter}${rSubtotal}*${taxRate}/100,2)`,
        });
        addTotalRow(TOTAL_LABELS.finalTotal, Number(quotation.finalAmount ?? 0), {
            bold: true,
            fill: 'FFFCEFD6',
            color: 'FF9C5700',
            formula: `${totalColLetter}${rSubtotal}+${totalColLetter}${rTax}`,
        });
    } else {
        addTotalRow(TOTAL_LABELS.finalTotal, Number(quotation.finalAmount ?? 0), {
            bold: true,
            fill: 'FFFCEFD6',
            color: 'FF9C5700',
            formula: sumRange ? `SUM(${sumRange})` : undefined,
        });
    }

    // 表后段落（模板配置）
    for (const s of sections) {
        if ((s.position ?? 'before') !== 'after') continue;
        if (s.title) {
            addMergedTextRow(templateText(s.title, quotation, company), {
                font: { size: 11, bold: true, color: { argb: 'FF000000' } },
                height: 24,
            });
        }
        const content = templateText(s.content, quotation, company);
        if (content) {
            addMergedTextRow(content, {
                font: { size: 10, color: { argb: 'FF333333' } },
                alignment: { horizontal: 'left' },
                height: estimateHeight(content),
            });
        }
    }

    // 页脚说明（模板配置，支持占位符）
    if (footerText) {
        addMergedTextRow(footerText, {
            font: { size: 10, color: { argb: 'FF888888' } },
            alignment: { horizontal: 'left' },
            height: estimateHeight(footerText),
        });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    triggerDownload(blob, downloadFilename(quotation, 'xlsx'));
}

// ==================== PDF 导出 ====================

export async function exportQuotationToPdf(
    quotation: Quotation,
    action: 'download' | 'print' = 'download',
    templateOverride?: EffectiveTemplate,
): Promise<boolean> {
    const hasCjk = await ensureCjkFont();
    if (!hasCjk) {
        return false;
    }

    const template = resolveTemplate(quotation, templateOverride);
    const columns = resolveColumns(template);
    const mergeKey = resolveMergeKey(template?.config);

    // 明细行：对齐来自 columnAlign（四端统一）；rowSpan 分组来自 computeMergeGroups（与 Excel/预览/DOCX 一致）
    // 媒体列（产品图片/证书）加载缩略图以 stack of image 节点嵌入；全部失败回退文本
    const bodyRows: Record<string, unknown>[][] = [];
    for (let idx = 0; idx < quotation.items.length; idx++) {
        const item = quotation.items[idx];
        const row: Record<string, unknown>[] = [];
        for (let ci = 0; ci < columns.length; ci++) {
            const c = columns[ci];
            if (isMediaColumnKey(c.key)) {
                const rawEntries = collectItemMediaEntries(item, c.key);
                const entries = rawEntries.filter((e) => !isDocumentMedia(e.url));
                // 全有或全无：混有文档型证书（PDF）时整格回退文本，与 Excel 端语义一致
                const thumbs =
                    entries.length && entries.length === rawEntries.length
                        ? (
                              await Promise.all(
                                  entries.slice(0, MAX_MEDIA_PER_CELL).map((e) => loadImageThumb(e.url)),
                              )
                          ).filter((t): t is LoadedThumb => !!t)
                        : [];
                if (thumbs.length === entries.length && thumbs.length > 0) {
                    row.push({
                        stack: thumbs.map((t) => ({
                            image: t.dataUrl,
                            fit: PDF_THUMB_FIT,
                            alignment: 'center',
                            margin: [2, 2, 2, 2],
                        })),
                        style: 'cell',
                        alignment: 'center',
                        valign: 'center',
                    });
                    continue;
                }
                // 嵌图失败/含文档型证书：走文本兜底（certs 现返回名称而非路径）
            }
            const cell: Record<string, unknown> = {
                text: c.key === 'no' || c.key === 'index' ? String(idx + 1) : softBreak(columnValue(item, c)),
                style: 'cell',
                alignment: c.align ?? columnAlign(c.key),
            };
            row.push(cell);
        }
        bodyRows.push(row);
    }

    {
        const groups = computeMergeGroups(quotation.items, columns, mergeKey);
        const nameIdx = columns.findIndex((c) => c.key === mergeKey);
        const brandIdx = columns.findIndex((c) => c.key === 'brand');
        for (const g of groups) {
            if (g.span > 1 && nameIdx >= 0) {
                (bodyRows[g.start][nameIdx] as Record<string, unknown>).rowSpan = g.span;
                for (let k = 1; k < g.span; k++) {
                    bodyRows[g.start + k][nameIdx] = { text: '', style: 'cell' };
                }
            }
            if (g.brandSpan > 1 && brandIdx >= 0 && brandIdx !== nameIdx) {
                (bodyRows[g.start][brandIdx] as Record<string, unknown>).rowSpan = g.brandSpan;
                for (let k = 1; k < g.brandSpan; k++) {
                    bodyRows[g.start + k][brandIdx] = { text: '', style: 'cell' };
                }
            }
        }
    }

    // 自适应列宽：按内容估算自然宽度，超出 A4 可用宽度时等比收缩（保证多列不溢出页面）
    // pdfmake 的数字列宽不含单元格内边距与竖线：实际表宽 = Σ列宽 + 各列 padding/边框开销。
    // 预算需先扣除该开销（与下方 layout 的 paddingLeft/Right=6、vLineWidth=0.5 保持一致），
    // 否则表格会比页面可用宽度宽出 ~12.5pt×列数，右侧列（单价之后）被裁切在页面外。
    const CELL_PAD_X = 6;
    const V_LINE = 0.5;
    const layoutOverhead = (n: number) => n * (CELL_PAD_X * 2 + V_LINE) + V_LINE;
    const FLOOR_WIDTH = 26; // 单列保底内容宽度（pt）
    const PAGE_CONTENT_WIDTH = { portrait: 539, landscape: 786 } as const; // A4 纵向 595pt / 横向 842pt - 左右页边距 28+28
    const budgetOf = (o: 'portrait' | 'landscape') => PAGE_CONTENT_WIDTH[o] - layoutOverhead(columns.length);
    let orientation: 'portrait' | 'landscape' = template?.config?.pageOrientation === 'landscape' ? 'landscape' : 'portrait';
    // 列较多时纵向可能连保底宽度都放不下：未显式指定横向时自动转横向，避免右侧列被裁切在页面外
    if (orientation === 'portrait' && columns.length * FLOOR_WIDTH > budgetOf('portrait')) {
        orientation = 'landscape';
    }
    const WIDTH_BUDGET = budgetOf(orientation);
    // 保底宽度自适应：极端多列时按预算均摊，保证「Σ列宽 ≤ 预算」恒有解，表格永不超出页面
    const floorWidth = Math.min(FLOOR_WIDTH, Math.floor(WIDTH_BUDGET / Math.max(1, columns.length)));
    const measure = (text: string): number => {
        let n = 0;
        for (const ch of text) {
            n += ch.charCodeAt(0) > 0xff ? 2 : 1;
        }
        return n;
    };
    const naturals = columns.map((c) => {
        if (c.key === 'no' || c.key === 'index') return 22;
        // 媒体列嵌缩略图，固定窄列；路径文本不参与测宽
        if (isMediaColumnKey(c.key)) return Math.max(40, Math.min(90, c.width ?? 64));
        if (c.width) return Math.max(32, c.width);
        const labelW = measure(c.label);
        let contentW = 0;
        for (const item of quotation.items) {
            const text = c.key === 'no' || c.key === 'index' ? '' : columnValue(item, c);
            contentW = Math.max(contentW, measure(text));
        }
        // 10.5pt 字体下 CJK 字符约 8.2pt 宽
        return Math.min(160, Math.max(36, (Math.max(labelW, contentW) + 2) * 8.2));
    });
    const totalNatural = naturals.reduce((a, b) => a + b, 0);
    const widths: number[] =
        totalNatural <= WIDTH_BUDGET
            ? naturals.slice()
            : naturals.map((w) => Math.max(floorWidth, Math.round((w * WIDTH_BUDGET) / totalNatural)));
    // 收缩取整后宽度总和可能略超预算，pdfMake 不会自动收缩，超出的右侧列会被裁切/隐藏；
    // 因此强制把超出量从最宽的列扣除，保证「Σ列宽 + 布局开销」不超过页面可用宽度（右侧列可见）。
    let widthSum = widths.reduce((a, b) => a + b, 0);
    while (widthSum > WIDTH_BUDGET) {
        let maxIdx = 0;
        for (let i = 1; i < widths.length; i++) if (widths[i] > widths[maxIdx]) maxIdx = i;
        if (widths[maxIdx] <= floorWidth) break; // 所有列都已到保底宽度，无法再缩
        widths[maxIdx] -= 1;
        widthSum -= 1;
    }

    const config = template?.config ?? EMPTY_TEMPLATE_CONFIG;
    const company = config.company;
    const breakdown = showTaxBreakdown(config, quotation);
    const headerText = templateText(config.header, quotation, company);
    const footerText = templateText(config.footer, quotation, company);
    const tableTitleText = templateText(config.tableTitle, quotation, company);
    const sections = config.sections ?? [];

    // 与预览一致：表前段落 → 表格标题 → 明细表 → 合计区 → 表后段落
    const beforeSections = sections
        .filter((s) => (s.position ?? 'before') === 'before')
        .flatMap((s) => [
            ...(s.title
                ? [{ text: softBreak(templateText(s.title, quotation, company)), fontSize: 13, bold: true, color: '#000000', margin: [0, 6, 0, 2] }]
                : []),
            ...(templateText(s.content, quotation, company)
                ? [{ text: softBreak(templateText(s.content, quotation, company)), fontSize: 11, color: '#000000', margin: [0, 0, 0, 8] }]
                : []),
        ]);
    const afterSections = sections
        .filter((s) => (s.position ?? 'before') === 'after')
        .flatMap((s) => [
            ...(s.title
                ? [{ text: softBreak(templateText(s.title, quotation, company)), fontSize: 13, bold: true, color: '#000000', margin: [0, 8, 0, 2] }]
                : []),
            ...(templateText(s.content, quotation, company)
                ? [{ text: softBreak(templateText(s.content, quotation, company)), fontSize: 11, color: '#000000', margin: [0, 0, 0, 8] }]
                : []),
        ]);

    const totalTableBody = [
        [
            { text: TOTAL_LABELS.feeHeader, bold: true, alignment: 'center', fillColor: '#EAF1FB' },
            { text: TOTAL_LABELS.amountHeader, bold: true, alignment: 'center', fillColor: '#EAF1FB' },
        ],
        ...(breakdown
            ? [
                  [
                      { text: TOTAL_LABELS.subtotalNoTax, alignment: 'center' },
                      { text: fmtCurrency(quotation.totalAmount), alignment: 'right' },
                  ],
                  [
                      { text: taxRowLabel(Number(quotation.taxRate ?? 0)), alignment: 'center' },
                      { text: fmtCurrency(quotation.taxAmount), alignment: 'right' },
                  ],
              ]
            : []),
        [
            { text: TOTAL_LABELS.finalTotal, bold: true, fontSize: 13, color: '#9C5700', alignment: 'center' },
            { text: fmtCurrency(quotation.finalAmount), alignment: 'right', bold: true, fontSize: 13, color: '#9C5700', fillColor: '#FCEFD6' },
        ],
    ];

    const docDefinition: unknown = {
        pageSize: 'A4',
        pageOrientation: orientation,
        pageMargins: [28, 32, 28, 28],
        content: [
            ...(headerText ? [{ text: softBreak(headerText), fontSize: 10, color: '#888888', margin: [0, 0, 0, 6] }] : []),
            {
                text: resolveTitle(quotation, config, company),
                fontSize: 20,
                bold: true,
                color: '#000000',
                alignment: 'center',
                margin: [0, 0, 0, 6],
            },
            {
                text: softBreak(infoLineText(quotation, config)),
                fontSize: 10,
                color: '#666666',
                alignment: 'right',
                margin: [0, 0, 0, 12],
            },
            ...(beforeSections as unknown[]),
            ...(tableTitleText ? [{ text: softBreak(tableTitleText), fontSize: 12, bold: true, color: '#000000', margin: [0, 10, 0, 6] }] : []),
            {
                table: {
                    headerRows: 1,
                    widths,
                    body: [
                        columns.map((c) => ({
                            text: c.label,
                            style: 'header',
                            bold: true,
                            alignment: 'center',
                            fillColor: '#EAF1FB',
                        })),
                        ...(bodyRows as unknown[]),
                    ],
                },
                layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#9DB2D6',
                    vLineColor: () => '#9DB2D6',
                    paddingTop: () => 6,
                    paddingBottom: () => 6,
                    paddingLeft: () => 6,
                    paddingRight: () => 6,
                },
            },
            { text: '', margin: [0, 6, 0, 0] },
            {
                columns: [
                    { text: '', width: '*', style: 'cell' },
                    {
                        width: 240,
                        table: {
                            // pdfmake 数字列宽不含单元格 padding/竖线（左右各 6pt + 3 条 0.5pt 竖线），
                            // 内容宽需控制在 240 - 25.5 以内，避免合计表超出右侧页边距
                            widths: [107, 107],
                            body: totalTableBody,
                        },
                        layout: {
                            hLineWidth: () => 0.5,
                            vLineWidth: () => 0.5,
                            hLineColor: () => '#9DB2D6',
                            vLineColor: () => '#9DB2D6',
                            paddingTop: () => 4,
                            paddingBottom: () => 4,
                            paddingLeft: () => 6,
                            paddingRight: () => 6,
                        },
                    },
                ],
                columnGap: 8,
            },
            ...(afterSections as unknown[]),
            ...(footerText ? [{ text: softBreak(footerText), fontSize: 10, color: '#888888', margin: [0, 14, 0, 0] }] : []),
        ],
        defaultStyle: { font: 'Source Han Sans', fontSize: 10.5, color: '#000000' },
        styles: {
            header: { fontSize: 11, bold: true, color: '#000000' },
            cell: { fontSize: 10.5 },
        },
        footer: (currentPage: number, pageCount: number) => ({
            text: `第 ${currentPage} 页 / 共 ${pageCount} 页`,
            alignment: 'center',
            fontSize: 9,
            color: '#999999',
            margin: [0, 8, 0, 0],
        }),
    };

    const pdf = pdfMake.createPdf(docDefinition as Record<string, unknown>);
    if (action === 'print') {
        pdf.print();
    } else {
        // pdfmake 0.3.x 的 getBlob 为 async 函数，返回 Promise<Blob>，非回调式
        const blob = await pdf.getBlob();
        triggerDownload(blob, downloadFilename(quotation, 'pdf'));
    }
    return true;
}