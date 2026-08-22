import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { parse as parseCsv } from 'csv-parse';
import * as fs from 'fs';
import { extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { toPinyinFields } from './pinyin.util';
import { CodeGeneratorService } from '../common/services/code-generator.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { BrandsService } from './brands.service';
import { CategoriesService } from './categories.service';
import { ProductTagsService } from './product-tags.service';
import { ImportExecuteDto, ImportPreviewDto } from './dto';

interface ImportFieldAliases {
  name: string[];
  model: string[];
  brandName: string[];
  categoryPath: string[];
  description: string[];
  unit: string[];
  isMarketProduct: string[];
  marketPrice: string[];
  costPrice: string[];
  marketUrl: string[];
  warranty: string[];
  supplier: string[];
  tags: string[];
  minOrderQty: string[];
  imageUrls: string[];
}

const FIELD_ALIASES: ImportFieldAliases = {
  name: ['品牌型号', '产品名称', '名称', 'product name', 'name'],
  model: ['型号', '产品型号', 'model', '型号规格'],
  brandName: ['品牌', '品牌名称', '厂商', 'brand', 'vendor'],
  categoryPath: ['类型', '分类', '产品类型', '品类', 'category', 'class'],
  description: [
    '参数',
    '详细参数',
    '规格',
    '配置',
    'specification',
    'spec',
    '描述',
    'description',
  ],
  unit: ['单位', '计量单位', 'unit'],
  isMarketProduct: [
    '是否商城产品',
    '商城产品',
    '商城',
    'isMarketProduct',
    'ismarketproduct',
  ],
  marketPrice: ['价格', '商城价格', '市场价', '售价', '单价', 'price'],
  costPrice: ['成本', '成本价', '成本单价', '进价', 'cost'],
  marketUrl: ['链接', '商城链接', '网址', 'url'],
  warranty: ['保修', '保修期', 'warranty'],
  supplier: ['供应商', '厂家', '来源', 'supplier'],
  tags: ['标签', 'tags'],
  minOrderQty: ['起订量', '最小起订量', '最小订购量', 'moq'],
  imageUrls: ['图片', '图片链接', '图片url', 'image', 'images'],
};

const SUPPORTED_FIELDS = Object.keys(
  FIELD_ALIASES,
) as (keyof ImportFieldAliases)[];

/** 安全转换单元格值：对象（exceljs 公式单元格等）取 result/text */
function cellToStr(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }
  if (typeof value === 'object') {
    const obj = value as { result?: unknown; text?: unknown };
    const inner = obj.result ?? obj.text;
    return cellToStr(inner);
  }
  return '';
}

/** 归一化比较键：去首尾空格、压缩内部连续空白、统一大写，用于型号/名称的相似比较 */
function normalizeKey(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toUpperCase();
}

/** 归一化品牌名：去首尾空格、压缩内部连续空白（保留显示大小写） */
function normalizeBrandName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/** 文件内去重键：型号优先（品牌+型号），型号为空回退（品牌+名称） */
function fileKey(brandId: string, name: string, model?: string): string {
  const modelKey = model ? normalizeKey(model) : '';
  return modelKey
    ? `m:${brandId}:${modelKey}`
    : `n:${brandId}:${normalizeKey(name)}`;
}

type ParsedFile = {
  headers: string[];
  rows: Record<string, unknown>[];
};

export interface RowIssue {
  rowNumber: number;
  field?: string;
  level?: 'error' | 'warning';
  message: string;
  /** 原始行数据，便于前端定位失败行的具体内容 */
  rawData?: Record<string, unknown>;
}

@Injectable()
export class ProductImportService {
  private readonly logger = new Logger(ProductImportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly codeGenerator: CodeGeneratorService,
    private readonly auditLog: AuditLogService,
    private readonly brands: BrandsService,
    private readonly categories: CategoriesService,
    private readonly tags: ProductTagsService,
  ) {}

  // ==================== 解析 ====================

  async parseFile(file: Express.Multer.File): Promise<ParsedFile> {
    const ext = extname(file.originalname).toLowerCase();
    let headers: string[] = [];
    let rows: Record<string, unknown>[] = [];

    try {
      const buffer = fs.readFileSync(file.path);
      if (ext === '.csv') {
        const text = buffer.toString('utf-8').replace(/^\uFEFF/, '');
        const parsed = await new Promise<string[][]>((resolve, reject) => {
          parseCsv(text, { bom: true }, (err, records) =>
            err ? reject(err) : resolve(records),
          );
        });
        if (parsed.length > 0) {
          headers = parsed[0].map((h) => h.trim());
          rows = parsed.slice(1).map((r) => {
            const obj: Record<string, unknown> = {};
            headers.forEach((h, i) => {
              obj[h] = (r[i] ?? '').trim();
            });
            return obj;
          });
        }
      } else if (ext === '.xlsx' || ext === '.xls') {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(
          buffer as unknown as Parameters<typeof workbook.xlsx.load>[0],
        );
        const ws = workbook.worksheets[0];
        if (!ws) {
          throw new BadRequestException('Excel 文件没有工作表');
        }
        const allRows = ws.getSheetValues();
        // 找到第一行非空行作为表头
        let headerIndex = -1;
        for (let i = 1; i <= Math.min(allRows.length, 5); i++) {
          const row = allRows[i] as unknown[];
          if (row && row.some((c) => cellToStr(c).trim() !== '')) {
            headerIndex = i;
            break;
          }
        }
        if (headerIndex < 0) {
          throw new BadRequestException('未找到表头行');
        }
        headers = (allRows[headerIndex] as unknown[])
          .slice(1)
          .map((h) => cellToStr(h).trim());
        for (let i = headerIndex + 1; i <= allRows.length; i++) {
          const row = allRows[i] as unknown[];
          if (!row || !row.some((c) => cellToStr(c).trim() !== '')) {
            continue;
          }
          const obj: Record<string, unknown> = {};
          headers.forEach((h, idx) => {
            const cell = row[idx + 1];
            obj[h] = cellToStr(cell).trim();
          });
          rows.push(obj);
        }
      } else {
        throw new BadRequestException('仅支持 xlsx / xls / csv 格式');
      }
    } finally {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    headers = headers.filter((h) => h !== '');
    if (headers.length === 0) {
      throw new BadRequestException('文件没有可识别的列');
    }
    return { headers, rows };
  }

  // ==================== 智能列匹配 ====================

  /** 根据源列名推荐目标字段 */
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
          if (normalized === a) {
            score = Math.max(score, 100);
          } else if (normalized.includes(a) || a.includes(normalized)) {
            score = Math.max(score, 80);
          }
        }
        const pinyinScore = this.pinyinMatch(normalized, field);
        score = Math.max(score, pinyinScore);
        const levenshteinScore = this.levenshteinMatch(normalized, aliases);
        score = Math.max(score, levenshteinScore);
        if (score > 0 && (!best || score > best.score)) {
          best = { field, score };
        }
      }
      if (best && best.score >= 40) {
        result[best.field] = header;
      }
    }
    return result;
  }

  /**
   * 表头拼音首字母匹配：用 pinyin-pro 实时计算各中文别名的首字母串
   * （如「品牌名称」-> ppmc），替代此前硬编码表，覆盖所有别名且不受错字/增删影响。
   */
  private pinyinMatch(normalized: string, field: string): number {
    const aliases = FIELD_ALIASES[field as keyof typeof FIELD_ALIASES] ?? [];
    for (const alias of aliases) {
      if (!/[\u4e00-\u9fa5]/.test(alias)) continue; // 仅中文别名参与拼音匹配
      const { initials } = toPinyinFields(alias);
      if (
        initials &&
        (normalized === initials || normalized.startsWith(initials))
      ) {
        return normalized === initials ? 60 : 40;
      }
    }
    return 0;
  }

  private levenshteinMatch(normalized: string, aliases: string[]): number {
    let best = 0;
    for (const alias of aliases) {
      const a = alias.toLowerCase().replace(/[\s_\-（）()]/g, '');
      const dist = this.levenshtein(normalized, a);
      if (dist === 0) return 100;
      if (dist < 3) {
        best = Math.max(best, 40 - dist * 10);
      }
    }
    return best;
  }

  private levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp: number[][] = Array.from({ length: m + 1 }, () =>
      new Array<number>(n + 1).fill(0),
    );
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
        );
      }
    }
    return dp[m][n];
  }

  // ==================== 预览校验 ====================

  /** 按映射提取一行字段值 */
  private mapRow(
    mapping: Record<string, string>,
    row: Record<string, unknown>,
  ): Record<string, string> {
    const mapped: Record<string, string> = {};
    for (const [field, sourceCol] of Object.entries(mapping)) {
      if (!SUPPORTED_FIELDS.includes(field as keyof ImportFieldAliases))
        continue;
      const value = row[sourceCol];
      mapped[field] = value == null ? '' : cellToStr(value);
    }
    return mapped;
  }

  /**
   * 拼接名称：优先「品牌型号」列；缺失时用「品牌 + 型号」自动组合，
   * 兼容只填品牌/型号列的导入文件。
   */
  private composeName(mapped: Record<string, string>): string {
    const name = mapped.name?.trim();
    if (name) return name;
    const brand = normalizeBrandName(mapped.brandName?.trim() || '');
    const model = mapped.model?.trim() || '';
    if (brand && model) return `${brand} ${model}`;
    return '';
  }

  async preview(dto: ImportPreviewDto) {
    const mapping = dto.mappingConfig;
    const options = dto.options || {};
    const createMissingBrand = options.createMissingBrand !== false;
    const createMissingCategory = options.createMissingCategory !== false;
    const createMissingTags = options.createMissingTags !== false;
    const duplicateStrategy = options.duplicateStrategy ?? 'skip';

    const issues: RowIssue[] = [];
    const rows: Array<{
      rowNumber: number;
      mapped: Record<string, string>;
      status: 'error' | 'warning' | 'ok';
      issues: RowIssue[];
    }> = [];

    // 文件内/库内去重索引（与 execute 保持一致，保证预览所见即所得）
    const fileSeen = new Map<string, number>();
    const productSeen = new Map<string, number>();

    // 批量预取品牌/类型/标签/重复候选，消除逐行查询
    const preMapped = dto.rows.map((row, index) => {
      const mapped = this.mapRow(mapping, row);
      const name = this.composeName(mapped);
      if (name) mapped.name = name;
      return { rowNumber: index + 2, mapped };
    });
    const ctx = await this.prefetchImportContext(
      preMapped.map(({ mapped }) => ({
        brandName: mapped.brandName?.trim() || undefined,
        categoryRoot: mapped.categoryPath?.split(/[/,、>]/)[0].trim(),
        tagsCsv: mapped.tags,
        name: this.composeName(mapped) || undefined,
        model: mapped.model || undefined,
      })),
    );

    for (const { rowNumber, mapped } of preMapped) {
      const rowIssues: RowIssue[] = [];
      const name = this.composeName(mapped);

      if (!name) {
        rowIssues.push({
          rowNumber,
          field: 'name',
          level: 'error',
          message: '品牌/型号为空（必填），或缺少「品牌型号」列',
        });
      }
      if (mapped.marketPrice && !this.isPriceValid(mapped.marketPrice)) {
        rowIssues.push({
          rowNumber,
          field: 'marketPrice',
          level: 'error',
          message: '价格格式错误（无法解析为数字）',
        });
      }
      if (mapped.costPrice && !this.isPriceValid(mapped.costPrice)) {
        rowIssues.push({
          rowNumber,
          field: 'costPrice',
          level: 'error',
          message: '成本价格式错误（无法解析为数字）',
        });
      }
      if (mapped.minOrderQty && !/^\d+$/.test(mapped.minOrderQty)) {
        rowIssues.push({
          rowNumber,
          field: 'minOrderQty',
          level: 'warning',
          message: '起订量格式错误，将忽略',
        });
      }

      // 品牌存在性（只读解析，不创建）
      let brandId: string | undefined;
      const brandName = normalizeBrandName(mapped.brandName?.trim() || '');
      if (brandName) {
        brandId = ctx.brandIdByLower.get(brandName.toLowerCase());
        if (!brandId && !createMissingBrand) {
          rowIssues.push({
            rowNumber,
            field: 'brandName',
            level: 'error',
            message: `品牌「${brandName}」不存在`,
          });
        }
      }

      // 类型存在性
      if (mapped.categoryPath && !createMissingCategory) {
        const root = mapped.categoryPath.split(/[/,、>]/)[0].trim();
        if (!ctx.categoryIdByRoot.has(root)) {
          rowIssues.push({
            rowNumber,
            field: 'categoryPath',
            level: 'error',
            message: `类型「${mapped.categoryPath}」不存在`,
          });
        }
      }

      // 标签存在性
      if (mapped.tags && !createMissingTags) {
        const missing: string[] = [];
        for (const t of this.splitList(mapped.tags)) {
          if (!ctx.tagIdByName.has(t)) missing.push(t);
        }
        if (missing.length > 0) {
          rowIssues.push({
            rowNumber,
            field: 'tags',
            level: 'error',
            message: `标签「${missing.join('、')}」不存在`,
          });
        }
      }

      // 重复检测：文件内重复优先，其次库内已存在
      if (brandId && name) {
        const fKey = fileKey(brandId, name, mapped.model || undefined);
        const seenRow = fileSeen.get(fKey);
        const dbDup = ctx.resolveDuplicate(
          brandId,
          name,
          mapped.model || undefined,
        );
        const sharedRow =
          dbDup === undefined ? undefined : productSeen.get(dbDup.id);

        if (seenRow !== undefined) {
          rowIssues.push({
            rowNumber,
            field: 'duplicate',
            level: 'warning',
            message: `与文件内第 ${seenRow} 行重复（品牌+型号相同），${this.strategyActionText(duplicateStrategy)}`,
          });
        } else if (sharedRow !== undefined) {
          rowIssues.push({
            rowNumber,
            field: 'duplicate',
            level: 'warning',
            message: `与文件内第 ${sharedRow} 行重复（${this.dupReasonText(dbDup!.reason)}），${this.strategyActionText(duplicateStrategy)}`,
          });
        } else if (dbDup) {
          rowIssues.push({
            rowNumber,
            field: 'duplicate',
            level: 'warning',
            message: `与库中已存在产品重复（${this.dupReasonText(dbDup.reason)}），${this.strategyActionText(duplicateStrategy)}`,
          });
          productSeen.set(dbDup.id, rowNumber);
          fileSeen.set(fKey, rowNumber);
        } else {
          fileSeen.set(fKey, rowNumber);
        }
      }

      const hasError = rowIssues.some((i) => i.level === 'error');
      rows.push({
        rowNumber,
        mapped,
        status: hasError ? 'error' : rowIssues.length > 0 ? 'warning' : 'ok',
        issues: rowIssues,
      });
      issues.push(...rowIssues);
    }

    return {
      totalRows: rows.length,
      errorRows: rows.filter((r) => r.status === 'error').length,
      warningRows: rows.filter((r) => r.status === 'warning').length,
      okRows: rows.filter((r) => r.status === 'ok').length,
      rows,
      issues,
    };
  }

  private isPriceValid(value: string): boolean {
    const cleaned = value.replace(/[¥￥,，\s元]/g, '');
    return !Number.isNaN(Number(cleaned));
  }

  private parsePrice(value: string): number | undefined {
    if (!value) return undefined;
    const cleaned = value.replace(/[¥￥,，\s元]/g, '');
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : undefined;
  }

  /** 解析布尔值：是/否/true/false/1/0（大小写不敏感），无法识别返回 undefined */
  private parseBool(value: string | undefined): boolean | undefined {
    if (value == null) return undefined;
    const v = value.trim().toLowerCase();
    if (['是', 'y', 'yes', 'true', '1', '商城'].includes(v)) return true;
    if (['否', 'n', 'no', 'false', '0', ''].includes(v)) return false;
    return undefined;
  }

  private splitList(value: string): string[] {
    return value
      .split(/[,，;；|]/)
      .map((v) => v.trim())
      .filter(Boolean);
  }

  // ==================== 执行导入 ====================

  async execute(userId: string, dto: ImportExecuteDto) {
    const mapping = dto.mappingConfig;
    const options = dto.options || {};
    const createMissingBrand = options.createMissingBrand !== false;
    const createMissingCategory = options.createMissingCategory !== false;
    const createMissingTags = options.createMissingTags !== false;
    const defaultStatus = options.defaultStatus ?? ProductStatus.INACTIVE;
    const duplicateStrategy = options.duplicateStrategy ?? 'skip';

    const brandNameMap = new Map<string, string>();
    const tagNameMap = new Map<string, string>();
    const createdBrands = new Set<string>();
    const createdTags = new Set<string>();
    const errors: RowIssue[] = [];
    const generatedRows: Array<{
      rowNumber: number;
      data: {
        name: string;
        model?: string;
        brandId: string;
        categoryId: string;
        description?: string;
        unit?: string;
        isMarketProduct?: boolean;
        marketPrice?: number;
        costPrice?: number;
        marketUrl?: string;
        warranty?: string;
        supplier?: string;
        minOrderQty?: number;
        tagIds?: string[];
        imageUrls?: string[];
      };
      duplicateAction?: 'skip' | 'overwrite';
      duplicateTargetId?: string;
    }> = [];

    // 文件内/库内去重索引：保证同一文件内重复行不会被重复新建
    const fileSeen = new Map<string, number>();
    const productSeen = new Map<string, number>();

    // 批量预取品牌/类型根/标签/重复候选，消除逐行查询；
    // 缺失实体仍在循环内按原逻辑惰性创建，行为不变。
    const preMapped = dto.rows.map((row, index) => ({
      row,
      rowNumber: index + 2,
      mapped: this.mapRow(mapping, row),
    }));
    const ctx = await this.prefetchImportContext(
      preMapped.map(({ mapped }) => ({
        brandName:
          normalizeBrandName(mapped.brandName?.trim() || '') || undefined,
        categoryRoot: mapped.categoryPath?.split(/[/,、>]/)[0].trim(),
        tagsCsv: mapped.tags,
        name: this.composeName(mapped) || undefined,
        model: mapped.model || undefined,
      })),
    );
    // 同一类型路径只解析一次（原 findOrCreateByPath 每行执行多段查询）
    const categoryPathCache = new Map<string, Promise<string>>();

    // ---- 预处理：解析每行，宽容度处理品牌/类型/标签 ----
    for (const { row, rowNumber, mapped } of preMapped) {
      try {
        const name = this.composeName(mapped);
        if (!name) {
          errors.push({
            rowNumber,
            field: 'name',
            message: '品牌/型号为空（必填），或缺少「品牌型号」列',
            rawData: row,
          });
          continue;
        }

        // 品牌（大小写/空白变体复用，避免重复建品牌）
        let brandId: string;
        const brandName = normalizeBrandName(mapped.brandName?.trim() || '');
        if (brandName) {
          let id =
            brandNameMap.get(brandName) ??
            ctx.brandIdByLower.get(brandName.toLowerCase());
          if (!id) {
            const existed = await this.prisma.brand.findFirst({
              where: {
                name: { equals: brandName, mode: 'insensitive' as const },
              },
            });
            if (!existed && createMissingBrand) {
              createdBrands.add(brandName);
            }
            id = await this.findBrandId(brandName, createMissingBrand);
            if (!id) {
              errors.push({
                rowNumber,
                field: 'brandName',
                message: `品牌「${brandName}」不存在`,
                rawData: row,
              });
              continue;
            }
            brandNameMap.set(brandName, id);
          }
          brandId = id;
        } else {
          errors.push({
            rowNumber,
            field: 'brandName',
            message: '缺少品牌列映射或品牌为空',
            rawData: row,
          });
          continue;
        }

        // 类型
        let categoryId: string;
        const categoryPath = mapped.categoryPath?.trim();
        if (categoryPath) {
          if (createMissingCategory) {
            let pending = categoryPathCache.get(categoryPath);
            if (!pending) {
              pending = this.categories.findOrCreateByPath(categoryPath);
              categoryPathCache.set(categoryPath, pending);
            }
            categoryId = await pending;
          } else {
            const root = categoryPath.split(/[/,、>]/)[0].trim();
            const foundId = ctx.categoryIdByRoot.get(root);
            if (!foundId) {
              errors.push({
                rowNumber,
                message: `类型「${categoryPath}」不存在`,
                rawData: row,
              });
              continue;
            }
            categoryId = foundId;
          }
        } else {
          errors.push({
            rowNumber,
            message: '缺少类型列映射或类型为空',
            rawData: row,
          });
          continue;
        }

        // 标签
        let tagIds: string[] | undefined;
        if (mapped.tags?.trim()) {
          const tagNames = this.splitList(mapped.tags);
          const ids: string[] = [];
          const missing: string[] = [];
          for (const t of tagNames) {
            let id = tagNameMap.get(t) ?? ctx.tagIdByName.get(t);
            if (!id) {
              id = (await this.findTagId(t)) ?? undefined;
              if (!id) {
                if (createMissingTags) {
                  const created = await this.tags.findOrCreateMany([t]);
                  id = created.get(t);
                  if (id) createdTags.add(t);
                } else {
                  missing.push(t);
                }
              }
              if (id) tagNameMap.set(t, id);
            }
            if (id) ids.push(id);
          }
          if (missing.length > 0) {
            errors.push({
              rowNumber,
              message: `标签「${missing.join('、')}」不存在`,
              rawData: row,
            });
            continue;
          }
          tagIds = ids;
        }

        // 重复检测：品牌+型号优先，型号为空回退品牌+名称；文件内重复一并处理
        let duplicateAction: 'skip' | 'overwrite' | undefined;
        let duplicateTargetId: string | undefined;
        if (duplicateStrategy !== 'create') {
          const model = mapped.model?.trim() || undefined;
          const fKey = fileKey(brandId, name, model);
          const dbDup = ctx.resolveDuplicate(brandId, name, model);
          const seenRow = fileSeen.get(fKey);
          const sharedRow =
            dbDup === undefined ? undefined : productSeen.get(dbDup.id);

          if (seenRow !== undefined) {
            // 文件内重复：若本行对应库中真实产品且策略为覆盖，则覆盖它；否则跳过（首行将新建/覆盖）
            if (
              dbDup &&
              sharedRow !== undefined &&
              duplicateStrategy === 'overwrite'
            ) {
              duplicateAction = 'overwrite';
              duplicateTargetId = dbDup.id;
            } else {
              duplicateAction = 'skip';
            }
          } else if (dbDup) {
            duplicateAction = duplicateStrategy;
            if (duplicateStrategy === 'overwrite') {
              duplicateTargetId = dbDup.id;
            }
            productSeen.set(dbDup.id, rowNumber);
            fileSeen.set(fKey, rowNumber);
          } else {
            fileSeen.set(fKey, rowNumber);
          }
        }

        generatedRows.push({
          rowNumber,
          data: {
            name,
            model: mapped.model || undefined,
            brandId,
            categoryId,
            description: mapped.description || undefined,
            unit: mapped.unit || '台',
            isMarketProduct: this.parseBool(mapped.isMarketProduct || ''),
            marketPrice: this.parsePrice(mapped.marketPrice || ''),
            costPrice: this.parsePrice(mapped.costPrice || ''),
            marketUrl: mapped.marketUrl || undefined,
            warranty: mapped.warranty || undefined,
            supplier: mapped.supplier || undefined,
            minOrderQty: mapped.minOrderQty
              ? parseInt(mapped.minOrderQty, 10) || undefined
              : undefined,
            tagIds,
            imageUrls: mapped.imageUrls
              ? this.splitList(mapped.imageUrls)
              : undefined,
          },
          duplicateAction,
          duplicateTargetId,
        });
      } catch (e) {
        this.logger.error(`导入行 ${rowNumber} 处理失败`, e as Error);
        errors.push({
          rowNumber,
          message: `处理失败：${(e as Error).message}`,
          rawData: row,
        });
      }
    }

    // ---- 批量写入 ----
    let successRows = 0;
    let skippedRows = 0;
    let overwrittenRows = 0;
    const needCreate = generatedRows.filter(
      (r) => !r.duplicateAction || r.duplicateAction === 'overwrite',
    );
    const codes =
      needCreate.length > 0
        ? await this.codeGenerator.generateBatchCodes(
            'product',
            needCreate.length,
          )
        : [];

    const BATCH = 100;
    for (let i = 0; i < needCreate.length; i += BATCH) {
      const batch = needCreate.slice(i, i + BATCH);
      await Promise.all(
        batch.map(async (row, j) => {
          const code = codes[i + j];
          const { tagIds, imageUrls, ...data } = row.data;
          if (row.duplicateAction === 'overwrite' && row.duplicateTargetId) {
            // 预处理与写入之间库可能变化，重新校验目标仍存在
            const existing = await this.prisma.product.findFirst({
              where: { id: row.duplicateTargetId, deletedAt: null },
            });
            if (existing) {
              await this.prisma.product.update({
                where: { id: existing.id },
                data: {
                  description: data.description,
                  model: data.model,
                  unit: data.unit,
                  isMarketProduct: data.isMarketProduct,
                  marketPrice: data.marketPrice,
                  costPrice: data.costPrice,
                  marketUrl: data.marketUrl,
                  warranty: data.warranty,
                  supplier: data.supplier,
                  minOrderQty: data.minOrderQty,
                  status: defaultStatus,
                  lastPriceUpdateAt: data.marketPrice
                    ? new Date()
                    : existing.lastPriceUpdateAt,
                  updatedBy: userId,
                },
              });
              overwrittenRows++;
              successRows++;
              return;
            }
          }
          const product = await this.prisma.product.create({
            data: {
              code,
              ...data,
              status: defaultStatus,
              createdBy: userId,
              updatedBy: userId,
              tags: tagIds?.length
                ? { create: tagIds.map((tagId) => ({ tagId })) }
                : undefined,
            },
          });
          // 注册为重复候选：同批后续相同行与原实时查询行为一致
          ctx.registerCreated(row.data.brandId, product);
          if (imageUrls?.length) {
            await this.prisma.productImage.createMany({
              data: imageUrls.map((url, idx) => ({
                productId: product.id,
                url,
                displayOrder: idx,
              })),
            });
          }
          successRows++;
        }),
      );
    }

    const skippedCount = generatedRows.filter(
      (r) => r.duplicateAction === 'skip',
    ).length;
    skippedRows = skippedCount;
    const failedRows = errors.length;

    const log = await this.prisma.productImportLog.create({
      data: {
        fileName: `导入-${new Date().toISOString().slice(0, 10)}`,
        totalRows: dto.rows.length,
        successRows,
        failedRows,
        skippedRows,
        errorReport: errors as unknown as Prisma.InputJsonValue,
        mappingConfig: mapping,
        status: 'completed',
        createdBy: userId,
      },
    });

    await this.auditLog.log(userId, 'import', 'product', undefined, {
      fileName: log.fileName,
      totalRows: dto.rows.length,
      successRows,
      failedRows,
      skippedRows,
      createdBrands: [...createdBrands],
      createdTags: [...createdTags],
    });

    return {
      logId: log.id,
      totalRows: dto.rows.length,
      successRows,
      overwrittenRows,
      failedRows,
      skippedRows,
      createdBrands: [...createdBrands],
      createdTags: [...createdTags],
      errors: errors.slice(0, 50),
    };
  }

  private async findBrandId(
    name: string,
    create: boolean,
  ): Promise<string | undefined> {
    const normalized = normalizeBrandName(name);
    const exact = await this.prisma.brand.findUnique({
      where: { name: normalized },
    });
    if (exact) return exact.id;
    // 大小写/空白变体：复用已存在的品牌，避免重复建品牌（如「小米」与「MI」的大小写变体）
    const insensitive = await this.prisma.brand.findFirst({
      where: { name: { equals: normalized, mode: 'insensitive' as const } },
    });
    if (insensitive) return insensitive.id;
    if (!create) return undefined;
    const created = await this.brands.findOrCreateMany([normalized]);
    return created.get(normalized);
  }

  /**
   * 库内重复判定：品牌+型号 为唯一键，型号为空时回退 品牌+名称。
   * 匹配忽略大小写与多余空格；型号存在时不做名称回退，避免误判不同型号的产品。
   */

  // ==================== 批量预取上下文（消除逐行 N+1） ====================

  private async prefetchImportContext(
    mappedRows: Array<{
      brandName?: string;
      categoryRoot?: string;
      tagsCsv?: string;
      name?: string;
      model?: string;
    }>,
  ) {
    // ---- 品牌：一次 findMany 替代逐名 findUnique/findFirst ----
    const brandNames = [
      ...new Set(
        mappedRows
          .map((r) => r.brandName)
          .filter((v): v is string => Boolean(v)),
      ),
    ];
    const brandIdByLower = new Map<string, string>();
    if (brandNames.length > 0) {
      const brands =
        (await this.prisma.brand.findMany({
          where: { name: { in: brandNames, mode: 'insensitive' as const } },
          select: { id: true, name: true },
        })) ?? [];
      for (const b of brands) {
        brandIdByLower.set(
          b.name.trim().replace(/\s+/g, ' ').toLowerCase(),
          b.id,
        );
      }
    }

    // ---- 类型根节点存在性：一次 findMany（保持原大小写敏感精确匹配语义）----
    const categoryRoots = [
      ...new Set(mappedRows.map((r) => r.categoryRoot).filter(Boolean)),
    ] as string[];
    const categoryIdByRoot = new Map<string, string>();
    if (categoryRoots.length > 0) {
      const cats =
        (await this.prisma.category.findMany({
          where: { name: { in: categoryRoots } },
          select: { id: true, name: true },
        })) ?? [];
      for (const c of cats) categoryIdByRoot.set(c.name, c.id);
    }

    // ---- 标签：一次 findMany 精确匹配 ----
    const tagNames = [
      ...new Set(
        mappedRows.flatMap((r) => (r.tagsCsv ? this.splitList(r.tagsCsv) : [])),
      ),
    ];
    const tagIdByName = new Map<string, string>();
    if (tagNames.length > 0) {
      const tags =
        (await this.prisma.productTag.findMany({
          where: { name: { in: tagNames } },
          select: { id: true, name: true },
        })) ?? [];
      for (const t of tags) tagIdByName.set(t.name, t.id);
    }

    // ---- 重复候选：按品牌 + 名称/模型集合一次拉取，内存复现判定逻辑 ----
    const brandIdsForDup = new Set<string>(
      mappedRows
        .map((r) => {
          if (!r.brandName || !r.name) return undefined;
          return brandIdByLower.get(
            normalizeBrandName(r.brandName).toLowerCase(),
          );
        })
        .filter(Boolean) as string[],
    );
    const namesSet = new Set(
      mappedRows.filter((r) => r.name).map((r) => r.name!),
    );
    const modelsSet = new Set(
      mappedRows.filter((r) => r.model).map((r) => r.model!),
    );
    type DupCandidate = { id: string; name: string; model: string | null };
    const dupCandidatesByBrand = new Map<string, DupCandidate[]>();
    if (brandIdsForDup.size > 0 && (namesSet.size > 0 || modelsSet.size > 0)) {
      const candidates = await this.prisma.product.findMany({
        where: {
          deletedAt: null,
          brandId: { in: [...brandIdsForDup] },
          OR: [
            ...(namesSet.size > 0
              ? [{ name: { in: [...namesSet], mode: 'insensitive' as const } }]
              : []),
            ...(modelsSet.size > 0
              ? [
                  {
                    model: { in: [...modelsSet], mode: 'insensitive' as const },
                  },
                ]
              : []),
          ],
        },
        select: { id: true, brandId: true, name: true, model: true },
      });
      for (const c of candidates) {
        const list = dupCandidatesByBrand.get(c.brandId) ?? [];
        list.push(c);
        dupCandidatesByBrand.set(c.brandId, list);
      }
    }

    return {
      brandIdByLower,
      /** 类型根节点名 → id（精确匹配，与原逐行 findFirst 同语义） */
      categoryIdByRoot,
      tagIdByName,
      /** 与 findDuplicateProduct 同语义的同步解析器；导入过程中新建的产品需 registerCreated 注册 */
      resolveDuplicate(
        brandId: string,
        name: string,
        model?: string,
      ): { id: string; reason: 'model' | 'name' } | undefined {
        const candidates = dupCandidatesByBrand.get(brandId);
        if (!candidates || candidates.length === 0) return undefined;
        const normalizedModel = model ? normalizeKey(model) : '';
        if (normalizedModel) {
          const byModel = candidates.find(
            (c) => c.model && normalizeKey(c.model) === normalizedModel,
          );
          return byModel ? { id: byModel.id, reason: 'model' } : undefined;
        }
        const normalizedName = normalizeKey(name);
        const byName = candidates.find(
          (c) => normalizeKey(c.name) === normalizedName,
        );
        return byName ? { id: byName.id, reason: 'name' } : undefined;
      },
      /** 导入写入阶段新建产品后注册为重复候选（与原先实时查询行为一致） */
      registerCreated(
        brandId: string,
        p: { id: string; name: string; model?: string | null },
      ) {
        const list = dupCandidatesByBrand.get(brandId) ?? [];
        list.push({ id: p.id, name: p.name, model: p.model ?? null });
        dupCandidatesByBrand.set(brandId, list);
      },
    };
  }

  private async findDuplicateProduct(params: {
    brandId: string;
    name: string;
    model?: string;
  }): Promise<{ id: string; reason: 'model' | 'name' } | undefined> {
    const { brandId, name, model } = params;
    const normalizedName = normalizeKey(name);
    const normalizedModel = model ? normalizeKey(model) : '';

    const candidates = await this.prisma.product.findMany({
      where: {
        brandId,
        deletedAt: null,
        OR: [
          ...(normalizedModel
            ? [{ model: { equals: model, mode: 'insensitive' as const } }]
            : []),
          { name: { equals: name, mode: 'insensitive' as const } },
        ],
      },
      select: { id: true, name: true, model: true },
    });
    if (candidates.length === 0) return undefined;

    if (normalizedModel) {
      const byModel = candidates.find(
        (c) => c.model && normalizeKey(c.model) === normalizedModel,
      );
      return byModel ? { id: byModel.id, reason: 'model' } : undefined;
    }
    const byName = candidates.find(
      (c) => normalizeKey(c.name) === normalizedName,
    );
    return byName ? { id: byName.id, reason: 'name' } : undefined;
  }

  /** 型号为空时回退名称判定；型号存在但未命中，视为不同产品 */
  private dupReasonText(reason: 'model' | 'name'): string {
    return reason === 'model' ? '品牌+型号相同' : '品牌+名称相同';
  }

  private strategyActionText(strategy: string): string {
    if (strategy === 'overwrite') return '将覆盖已有产品';
    if (strategy === 'create') return '将新建（允许重复）';
    return '将跳过';
  }

  private async findTagId(name: string): Promise<string | undefined> {
    const tag = await this.prisma.productTag.findUnique({ where: { name } });
    return tag?.id;
  }

  // ==================== 导入记录 ====================

  async getLogs(query: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 20 } = query;
    const [data, total] = await Promise.all([
      this.prisma.productImportLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.productImportLog.count(),
    ]);
    return { data, total, page, pageSize };
  }
}
