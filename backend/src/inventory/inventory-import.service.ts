import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import { extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';

interface InventoryFieldAliases {
  productId: string[];
  warehouseId: string[];
  quantityIn: string[];
  unitPrice: string[];
  receivedAt: string[];
  supplierId: string[];
  purchasePrice: string[];
  storeName: string[];
}

const FIELD_ALIASES: InventoryFieldAliases = {
  productId: ['cpid', '产品id', '产品ID', 'productId', '产品编码', 'code'],
  warehouseId: ['warehouseId', '仓库id', '仓库ID', '仓库', 'warehouse'],
  quantityIn: ['quantityIn', '入库数量', '数量', 'quantity', 'qty', '入库量'],
  unitPrice: ['unitPrice', '单价', '价格', '单价金额', 'price'],
  receivedAt: ['receivedAt', '入库时间', '入库日期', '时间', 'received', '日期'],
  supplierId: ['supplierId', '供应商', '供应商ID', 'supplier'],
  purchasePrice: ['purchasePrice', '采购价', '进价', '成本价'],
  storeName: ['storeName', '库位', '门店', 'store', '仓位'],
};

const SUPPORTED_FIELDS = Object.keys(FIELD_ALIASES) as (keyof InventoryFieldAliases)[];

function cellToStr(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint')
    return String(value);
  if (typeof value === 'object') {
    const obj = value as { result?: unknown; text?: unknown };
    const inner = obj.result ?? obj.text;
    return cellToStr(inner);
  }
  return '';
}

type ParsedFile = { headers: string[]; rows: Record<string, unknown>[] };

@Injectable()
export class InventoryImportService {
  private readonly logger = new Logger(InventoryImportService.name);
  constructor(private readonly prisma: PrismaService) {}

  async parseFile(file: Express.Multer.File): Promise<ParsedFile> {
    const ext = extname(file.originalname).toLowerCase();
    let headers: string[] = [];
    let rows: Record<string, unknown>[] = [];
    try {
      const buffer = fs.readFileSync(file.path);
      if (ext === '.xlsx' || ext === '.xls') {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(buffer as unknown as Parameters<typeof wb.xlsx.load>[0]);
        const ws = wb.worksheets[0];
        if (!ws) throw new BadRequestException('Excel 文件没有工作表');
        const allRows = ws.getSheetValues();
        let headerIndex = -1;
        for (let i = 1; i <= Math.min(allRows.length, 5); i++) {
          const row = allRows[i] as unknown[];
          if (row && row.some((c) => cellToStr(c).trim() !== '')) {
            headerIndex = i;
            break;
          }
        }
        if (headerIndex < 0) throw new BadRequestException('未找到表头行');
        headers = (allRows[headerIndex] as unknown[]).slice(1).map((h) => cellToStr(h).trim());
        for (let i = headerIndex + 1; i <= allRows.length; i++) {
          const row = allRows[i] as unknown[];
          if (!row || !row.some((c) => cellToStr(c).trim() !== '')) continue;
          const obj: Record<string, unknown> = {};
          headers.forEach((h, idx) => {
            obj[h] = cellToStr(row[idx + 1]).trim();
          });
          rows.push(obj);
        }
      } else if (ext === '.csv') {
        const text = buffer.toString('utf-8').replace(/^\uFEFF/, '');
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
        if (lines.length > 0) {
          headers = lines[0].split(',').map((h) => h.trim());
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            const obj: Record<string, unknown> = {};
            headers.forEach((h, idx) => (obj[h] = (cols[idx] ?? '').trim()));
            rows.push(obj);
          }
        }
      } else {
        throw new BadRequestException('仅支持 xlsx / xls / csv 格式');
      }
    } finally {
      if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
    headers = headers.filter((h) => h !== '');
    if (headers.length === 0) throw new BadRequestException('文件没有可识别的列');
    return { headers, rows };
  }

  suggestMapping(headers: string[]): Record<string, string> {
    const result: Record<string, string> = {};
    for (const header of headers) {
      const normalized = header.toLowerCase().replace(/[\s_\-（）()]/g, '');
      let best: { field: string; score: number } | null = null;
      for (const field of SUPPORTED_FIELDS) {
        let score = 0;
        const aliases = FIELD_ALIASES[field];
        for (const alias of aliases) {
          const a = alias.toLowerCase().replace(/[\s_\-（）()]/g, '');
          if (normalized === a) score = Math.max(score, 100);
          else if (normalized.includes(a) || a.includes(normalized)) score = Math.max(score, 80);
        }
        if (score > 0 && (!best || score > best.score)) best = { field, score };
      }
      if (best && best.score >= 40) result[best.field] = header;
    }
    return result;
  }

  private mapRow(
    mapping: Record<string, string>,
    row: Record<string, unknown>,
  ): Record<string, string> {
    const mapped: Record<string, string> = {};
    for (const [field, sourceCol] of Object.entries(mapping)) {
      if (!SUPPORTED_FIELDS.includes(field as keyof InventoryFieldAliases)) continue;
      const v = row[sourceCol];
      mapped[field] = v == null ? '' : cellToStr(v);
    }
    return mapped;
  }

  async preview(dto: { mappingConfig: Record<string, string>; rows: Record<string, unknown>[] }) {
    const issues: Array<{ rowNumber: number; field?: string; message: string }> = [];
    const rows: Array<{ rowNumber: number; mapped: Record<string, string>; status: string; issues: unknown[] }> = [];
    let errorRows = 0;
    let okRows = 0;
    // 批量预取产品/仓库存在性校验所需集合
    const preMapped = dto.rows.map((row, i) => ({
      rowNumber: i + 2,
      mapped: this.mapRow(dto.mappingConfig, row),
      raw: row,
    }));
    const productIds = [...new Set(preMapped.map((r) => r.mapped.productId).filter(Boolean))];
    const warehouseIds = [...new Set(preMapped.map((r) => r.mapped.warehouseId).filter(Boolean))];
    const existingProducts = productIds.length
      ? await this.prisma.product.findMany({
          where: { id: { in: productIds }, deletedAt: null },
          select: { id: true },
        })
      : [];
    const existingWarehouses = warehouseIds.length
      ? await this.prisma.warehouse.findMany({
          where: { id: { in: warehouseIds } },
          select: { id: true },
        })
      : [];
    const productSet = new Set(existingProducts.map((p) => p.id));
    const warehouseSet = new Set(existingWarehouses.map((w) => w.id));

    for (const { rowNumber, mapped } of preMapped) {
      const rowIssues: Array<{ rowNumber: number; field?: string; message: string }> = [];
      if (!mapped.productId) rowIssues.push({ rowNumber, field: 'productId', message: 'cpid/产品ID 不能为空' });
      else if (!productSet.has(mapped.productId))
        rowIssues.push({ rowNumber, field: 'productId', message: `产品 ${mapped.productId} 不存在` });
      if (mapped.warehouseId && !warehouseSet.has(mapped.warehouseId))
        rowIssues.push({ rowNumber, field: 'warehouseId', message: `仓库 ${mapped.warehouseId} 不存在` });
      if (!mapped.quantityIn || isNaN(Number(mapped.quantityIn)) || Number(mapped.quantityIn) <= 0)
        rowIssues.push({ rowNumber, field: 'quantityIn', message: 'quantityIn 必须为正数' });
      if (!mapped.unitPrice || isNaN(Number(mapped.unitPrice)) || Number(mapped.unitPrice) < 0)
        rowIssues.push({ rowNumber, field: 'unitPrice', message: 'unitPrice 必须为有效数字' });
      if (!mapped.receivedAt || isNaN(Date.parse(mapped.receivedAt)))
        rowIssues.push({ rowNumber, field: 'receivedAt', message: 'receivedAt 必须为有效日期 (YYYY-MM-DD)' });
      const hasError = rowIssues.length > 0;
      if (hasError) errorRows++;
      else okRows++;
      issues.push(...rowIssues);
      rows.push({ rowNumber, mapped, status: hasError ? 'error' : 'ok', issues: rowIssues });
    }
    return { totalRows: dto.rows.length, errorRows, okRows, rows, issues };
  }

  async execute(dto: {
    mappingConfig: Record<string, string>;
    rows: Record<string, unknown>[];
  }) {
    const preview = await this.preview(dto);
    if (preview.errorRows > 0) {
      return { successRows: 0, failedRows: preview.errorRows, errors: preview.issues.slice(0, 50), message: '存在校验错误，请先修正' };
    }
    let successRows = 0;
    const errors: unknown[] = [];
    for (const r of preview.rows) {
      if (r.status === 'error') continue;
      try {
        const m = r.mapped;
        const id = `${m.receivedAt.replace(/[-/]/g, '').slice(0, 8)}${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, '0')}`;
        await this.prisma.inventoryBatch.create({
          data: {
            id,
            productId: m.productId,
            warehouseId: m.warehouseId || undefined,
            storeName: m.storeName || undefined,
            quantityIn: Number(m.quantityIn),
            quantityRem: Number(m.quantityIn),
            unitPrice: Number(m.unitPrice),
            purchasePrice: m.purchasePrice ? Number(m.purchasePrice) : undefined,
            receivedAt: new Date(m.receivedAt),
            supplierId: m.supplierId || undefined,
          },
        });
        successRows++;
      } catch (e) {
        errors.push({ rowNumber: r.rowNumber, message: (e as Error).message });
      }
    }
    return { successRows, failedRows: errors.length, totalRows: dto.rows.length, errors: errors.slice(0, 50) };
  }
}
