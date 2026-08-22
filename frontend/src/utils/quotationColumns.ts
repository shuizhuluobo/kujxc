import type { Quotation, QuotationItem, QuotationTemplateColumn, Product, ProductSnapshot } from '@/types';

export type ColumnDef = QuotationTemplateColumn;

/** 安全深拷贝：模板列等纯 JSON 配置对象，避免依赖 structuredClone（部分环境不支持） */
export function deepClone<T>(value: T): T {
    if (value === undefined) return undefined as T;
    return JSON.parse(JSON.stringify(value)) as T;
}

function str(value: unknown): string {
    return value == null ? '' : String(value);
}

/**
 * 产品 → 报价快照的唯一构建点（键清单见 ProductSnapshot）。
 * 此前生成器漏装 warranty/supplier/minOrderQty/tags/param，相关导出列恒为空。
 */
export function buildProductSnapshot(p: Product): ProductSnapshot {
    return {
        id: p.id,
        code: p.code,
        name: p.name,
        model: p.model || '',
        brand: p.brand?.name || '',
        category: p.category?.name || '',
        unit: p.unit,
        isMarketProduct: p.isMarketProduct,
        marketPrice: p.marketPrice,
        salePrice: p.salePrice,
        costPrice: p.costPrice,
        marketUrl: p.marketUrl || '',
        description: p.description || '',
        warranty: p.warranty || '',
        supplier: p.supplier || '',
        minOrderQty: p.minOrderQty,
        tags: (p.tags || []).map((t) => t.name),
        remark: p.remark || '',
        images: (p.images || []).map((img) => img.url),
        certs: (p.certificates || []).map((c) => c.url),
        certNames: (p.certificates || []).map((c) => c.name || c.url),
    };
}

/** 把快照里的结构化参数（productSnapshot.param / spec）格式化为可读字符串，每项一行 */
export function formatParams(snapshot?: Record<string, unknown> | null): string {    if (!snapshot) return '';
    const raw = snapshot.param ?? snapshot.spec;
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        const entries = Object.entries(raw as Record<string, unknown>);
        if (entries.length) {
            return entries
                .map(([k, v]) => `${k}：${v == null ? '' : String(v)}`)
                .join('\n');
        }
    }
    const desc = snapshot.description;
    return desc == null ? '' : String(desc);
}

/** 按字段 key 取报价明细行的值（与 Excel/PDF/DOCX 三渲染器同语义） */
export function fieldValue(item: QuotationItem, field: string): string {
    const snap = (item.productSnapshot ?? {}) as Record<string, unknown>;
    switch (field) {
        case 'no':
        case 'index':
            return '';
        case 'code':
            return str(snap.code);
        case 'name':
            return str(snap.name);
        case 'model':
            return str(snap.model);
        case 'brand':
            return str(snap.brand);
        case 'category':
            return str(snap.category);
        case 'unit':
            return str(snap.unit);
        case 'quantity':
            return item.quantity != null ? String(item.quantity) : '';
        case 'unitPrice':
            return item.unitPrice != null ? Number(item.unitPrice).toFixed(2) : '';
        case 'discount':
            return item.discount != null && item.discount > 0 ? `${item.discount}%` : '';
        case 'subtotal':
            return item.subtotal != null ? Number(item.subtotal).toFixed(2) : '';
        case 'cost':
        case 'unitCost':
            return item.costPrice != null ? Number(item.costPrice).toFixed(2) : '';
        case 'warranty':
            return str(snap.warranty);
        case 'supplier':
            return str(snap.supplier);
        case 'remark':
            return str(snap.remark);
        case 'marketPrice':
            return snap.marketPrice != null ? String(snap.marketPrice) : '';
        case 'marketUrl':
            return str(snap.marketUrl);
        case 'images': {
            const list = item.selectedImages?.length ? item.selectedImages : snap.images;
            return Array.isArray(list) ? (list as unknown[]).join('\n') : '';
        }
        case 'certs':
        case 'certificates': {
            const names = snap.certNames;
            if (Array.isArray(names)) return (names as unknown[]).join('\n');
            const list = item.selectedCerts?.length ? item.selectedCerts : snap.certs;
            if (Array.isArray(list)) {
                return (list as unknown[])
                    .map((c) => (typeof c === 'object' && c !== null ? String((c as { name?: unknown }).name ?? (c as { url?: unknown }).url ?? '') : String(c)))
                    .filter(Boolean)
                    .join('\n');
            }
            return '';
        }
        case 'description':
        case 'params':
        case 'param':
            return formatParams(snap);
        case 'moq':
            return snap.minOrderQty != null ? String(snap.minOrderQty) : '';
        case 'tags': {
            const tags = snap.tags;
            return Array.isArray(tags) ? (tags as unknown[]).join('、') : '';
        }
        default:
            return str(snap[field]);
    }
}

/** 解析单个列的显示值：field 列取字段，formula 列替换 {字段} 占位符 */
export function columnValue(item: QuotationItem, col: ColumnDef): string {
    if (col.type === 'formula' && col.formula) {
        const value = col.formula.replace(/\{(\w+)\}/g, (_, f: string) => fieldValue(item, f));
        return value.replace(/\s+/g, ' ').trim();
    }
    return fieldValue(item, col.field || col.key);
}

// ==================== 渲染语义（Excel/PDF/HTML 预览/DOCX 唯一来源） ====================

export type ColumnAlign = 'left' | 'center' | 'right';

/**
 * 商务报价对齐标准（四端唯一来源）：
 * 居中=序号/编号/类型/单位/数量/品牌型号等短标识；右对齐=金额类（会计惯例，便于位数比对）；左对齐=名称/参数等长文本。
 * Excel/PDF/HTML 预览直接引用本函数；DOCX 服务端维护同语义镜像（见 quotations-docx.service.ts docxColumnAlign）。
 */
const CENTER_KEYS = new Set(['no', 'index', 'code', 'category', 'unit', 'quantity', 'brandModel']);
const RIGHT_KEYS = new Set(['unitPrice', 'discount', 'subtotal', 'cost', 'unitCost']);

export function columnAlign(key: string): ColumnAlign {
    if (RIGHT_KEYS.has(key)) return 'right';
    if (CENTER_KEYS.has(key)) return 'center';
    return 'left';
}

export interface MergeGroup {
    /** 组起始行号（0 起） */
    start: number;
    /** 合并依据列的连续行数（≥1） */
    span: number;
    /** 品牌列在组内的连续一致行数（≤span，≥1；无品牌列时 =1） */
    brandSpan: number;
}

/**
 * 同名合并分组：相邻且合并依据列值相同的行归入同组；
 * 空值永不合并；品牌列仅取组内前缀连续一致的长度（部分合并）。
 * Excel(mergeCells)/PDF(rowSpan)/HTML(rowspan)/DOCX(vMerge) 共用同一分组结果。
 */
export function computeMergeGroups(
    items: QuotationItem[],
    columns: ColumnDef[],
    mergeKey: string,
): MergeGroup[] {
    const groups: MergeGroup[] = [];
    const nameIdx = columns.findIndex((c) => c.key === mergeKey);
    const brandIdx = columns.findIndex((c) => c.key === 'brand');
    const valueOf = (i: number): string =>
        nameIdx >= 0 ? columnValue(items[i], columns[nameIdx]) : '';
    const brandOf = (i: number): string =>
        brandIdx >= 0 && brandIdx !== nameIdx ? columnValue(items[i], columns[brandIdx]) : '';

    let start = 0;
    while (start < items.length) {
        let span = 1;
        // 空值不参与合并
        while (
            start + span < items.length &&
            valueOf(start) !== '' &&
            valueOf(start + span) === valueOf(start)
        ) {
            span++;
        }
        let brandSpan = 1;
        if (brandIdx >= 0 && brandIdx !== nameIdx) {
            while (
                brandSpan < span &&
                brandOf(start) !== '' &&
                brandOf(start + brandSpan) === brandOf(start)
            ) {
                brandSpan++;
            }
        }
        groups.push({ start, span, brandSpan });
        start += span;
    }
    return groups;
}

/** 金额格式化：两位小数，空值为 0.00（合计区展示口径） */
export function formatAmount(value?: number | null): string {
    return (value ?? 0).toFixed(2);
}

// ==================== 合计区文案（预览 / Excel / PDF / DOCX 共用） ====================

export const TOTAL_LABELS = {
    feeHeader: '费用项目',
    amountHeader: '金额（元）',
    subtotalNoTax: '合计（不含税）',
    finalTotal: '含税总额',
} as const;

export function taxRowLabel(taxRate: number): string {
    return `税额（税率 ${Number(taxRate ?? 0)}%）`;
}

export function visibleColumns(columns?: ColumnDef[]): ColumnDef[] {
    if (!columns?.length) return [];
    return columns.filter((c) => c.visible !== false);
}

/** 合并依据列：优先 config.mergeKey，其次第一个可见的 formula 组合列，最后 'name' */
export function resolveMergeKey(config?: { mergeKey?: string; columns?: ColumnDef[] }): string {
    if (config?.mergeKey) return config.mergeKey;
    const formula = (config?.columns || []).find((c) => c.type === 'formula' && c.visible !== false);
    if (formula) return formula.key;
    return 'name';
}

/** 解析标题：支持 {{customerName}}/{{code}}/{{date}}/{{company}} 与 ${...} 两种占位符写法 */
export function resolveTitle(
    quotation: Pick<Quotation, 'code' | 'customerName'>,
    config?: { title?: string; titleFormat?: string },
    company?: { name?: string },
): string {
    const format = config?.title || config?.titleFormat;
    if (!format) return '报价单';
    return replaceCompanyVars(
        replaceVars(format, quotation),
        company,
    );
}

/** {{date}} 统一口径：优先报价单创建日期（同一天内多次导出结果稳定），无则用当天；格式 ISO YYYY-MM-DD */
export function quotationDate(quotation?: { createdAt?: string | null }): string {
    const base = quotation?.createdAt ? new Date(quotation.createdAt) : new Date();
    return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`;
}

/** 通用占位符替换：{{customerName}}/{{code}}/{{date}}/{{company}} 与 ${...} 两种写法 */
export function replaceVars(
    text: string,
    quotation: Pick<Quotation, 'code' | 'customerName'> & { createdAt?: string },
): string {
    if (!text) return '';
    const iso = quotationDate(quotation);
    return text
        .replace(/\{\{\s*company\s*\}\}|\$\{company\}/g, '报价单')
        .replace(/\{\{\s*code\s*\}\}|\$\{code\}/g, quotation.code)
        .replace(/\{\{\s*customerName\s*\}\}|\$\{customer\}/g, quotation.customerName)
        .replace(/\{\{\s*date\s*\}\}|\$\{date\}/g, iso)
        .replace(/\$\{[^}]*\}/g, '');
}

/** 公司信息占位符替换：{{companyName}}/{{companyAddress}}/{{companyPhone}}，可直接放入页眉/页脚/标题 */
export function replaceCompanyVars(
    text: string,
    company?: { name?: string; address?: string; phone?: string },
): string {
    if (!text) return '';
    return text
        .replace(/\{\{\s*companyName\s*\}\}/g, company?.name || '')
        .replace(/\{\{\s*companyAddress\s*\}\}/g, company?.address || '')
        .replace(/\{\{\s*companyPhone\s*\}\}/g, company?.phone || '')
        .replace(/\{\{[^}]*\}\}/g, '');
}

/**
 * 对模板文案（页眉/页脚/表格标题/段落区块）统一做占位符替换：
 * 客户（{{customerName}}/{{code}}/{{date}}）+ 公司（{{companyName}} 等）。
 * 预览 / Excel / PDF / DOCX 四端共用，保证所见即所得。
 */
export function templateText(
    text: string | undefined,
    quotation: Pick<Quotation, 'code' | 'customerName'>,
    company?: { name?: string; address?: string; phone?: string },
): string {
    return replaceCompanyVars(replaceVars(text ?? '', quotation), company);
}

/**
 * 是否展示税额明细：模板开启「显示税额」且报价单税率 > 0 时，
 * 合计区展示 合计（不含税）/ 税额 / 含税总额 三行；否则仅展示含税总额。
 * 预览 / Excel / PDF / DOCX 四端共用，保证所见即所得。
 */
export function showTaxBreakdown(
    config: { showTax?: boolean } | undefined | null,
    quotation: { taxRate?: number | null },
): boolean {
    return !!config?.showTax && (quotation.taxRate ?? 0) > 0;
}

// ==================== 模板编辑器 / 导出对话框 共用常量 ====================

export interface QuotationFieldDef {
    key: string;
    label: string;
    type: 'field' | 'formula';
    field?: string;
    formula?: string;
}

/** 可选字段池：模板设置与导出对话框共用，保证两处可添加字段一致 */
export const QUOTATION_FIELD_POOL: QuotationFieldDef[] = [
    { key: 'index', label: '序号', type: 'field', field: 'index' },
    { key: 'code', label: '产品编号', type: 'field', field: 'code' },
    { key: 'name', label: '产品名称', type: 'field', field: 'name' },
    { key: 'brand', label: '品牌', type: 'field', field: 'brand' },
    { key: 'model', label: '型号', type: 'field', field: 'model' },
    { key: 'category', label: '类型', type: 'field', field: 'category' },
    { key: 'description', label: '产品参数', type: 'field', field: 'description' },
    { key: 'unit', label: '单位', type: 'field', field: 'unit' },
    { key: 'quantity', label: '数量', type: 'field', field: 'quantity' },
    { key: 'unitPrice', label: '单价', type: 'field', field: 'unitPrice' },
    { key: 'discount', label: '折扣', type: 'field', field: 'discount' },
    { key: 'subtotal', label: '小计', type: 'field', field: 'subtotal' },
    { key: 'unitCost', label: '成本', type: 'field', field: 'unitCost' },
    { key: 'marketUrl', label: '商城链接', type: 'field', field: 'marketUrl' },
    { key: 'images', label: '产品图片', type: 'field', field: 'images' },
    { key: 'certs', label: '产品证书', type: 'field', field: 'certs' },
    { key: 'warranty', label: '质保', type: 'field', field: 'warranty' },
    { key: 'supplier', label: '供应商', type: 'field', field: 'supplier' },
    { key: 'tags', label: '标签', type: 'field', field: 'tags' },
    { key: 'moq', label: '起订量', type: 'field', field: 'moq' },
    { key: 'remark', label: '备注', type: 'field', field: 'remark' },
];

/** 组合列池：模板设置与导出对话框共用 */
export const QUOTATION_FORMULA_POOL: QuotationFieldDef[] = [
    { key: 'brandModel', label: '品牌型号', type: 'formula', formula: '{brand} {model}' },
    { key: 'brandModelName', label: '品牌+型号+名称', type: 'formula', formula: '{brand} {model} {name}' },
    { key: 'brandName', label: '品牌+名称', type: 'formula', formula: '{brand} {name}' },
];

/** 字段定义 → 模板列对象（唯一构造点，禁止各处手拼同构对象） */
export function fieldDefToColumn(def: QuotationFieldDef, visible = true): QuotationTemplateColumn {
    return {
        key: def.key,
        label: def.label,
        visible,
        type: def.type,
        ...(def.type === 'formula' ? { formula: def.formula } : { field: def.field }),
    };
}

/**
 * 默认模板列：按字段池顺序取常用子集，折扣默认隐藏。
 * 模板编辑器「新建默认」与导出对话框「空模板兜底」共用，保证两处默认列一致。
 */
export function defaultTemplateColumns(): QuotationTemplateColumn[] {
    const keys = [
        'index', 'code', 'name', 'brandModel', 'brand', 'model', 'category',
        'description', 'unit', 'quantity', 'unitPrice', 'discount', 'subtotal',
    ];
    return keys
        .map((k) => [...QUOTATION_FIELD_POOL, ...QUOTATION_FORMULA_POOL].find((f) => f.key === k))
        .filter((f): f is QuotationFieldDef => !!f)
        .map((f) => fieldDefToColumn(f, f.key !== 'discount'));
}

/** 合并依据列选项 */
export const QUOTATION_MERGE_KEY_OPTIONS = [
    { value: 'brandModel', label: '品牌型号' },
    { value: 'brand', label: '品牌' },
    { value: 'category', label: '类型' },
    { value: 'name', label: '产品名称' },
];

/** 列对齐选项 */
export const QUOTATION_ALIGNMENT_OPTIONS = [
    { value: 'left', label: '左对齐' },
    { value: 'center', label: '居中' },
    { value: 'right', label: '右对齐' },
];

/** 信息行默认格式：客户/联系人/地址/报价编号/日期/单位，段间用全角空格分隔 */
export const DEFAULT_INFO_FORMAT =
    '客户：{{customerName}}\u3000联系人：{{customerContact}}\u3000地址：{{customerAddress}}\u3000报价编号：{{code}}\u3000日期：{{date}}\u3000单位：元';

/**
 * 信息行文本：按模板配置 infoFormat 渲染（占位符：customerName/customerContact/customerAddress/code/date），
 * 空值段自动省略（如无联系人则不显示「联系人：」）。
 * 预览 / Excel / PDF / DOCX 四端共用，保证所见即所得。
 */
export function infoLineText(
    quotation: Pick<Quotation, 'customerName' | 'customerContact' | 'customerAddress' | 'code'> & { createdAt?: string },
    config?: { infoFormat?: string },
): string {
    const iso = quotationDate(quotation);
    const format = config?.infoFormat || DEFAULT_INFO_FORMAT;
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
                return iso;
            default:
                return '';
        }
    };
    return format
        .split(/\u3000/)
        .map((segment) => {
            const keys = Array.from(segment.matchAll(/\{\{\s*(\w+)\s*\}\}/g), (m) => m[1]);
            if (keys.length && keys.every((k) => valueOf(k) === '')) return '';
            return segment.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) => valueOf(k));
        })
        .filter(Boolean)
        .join('\u3000');
}