import type { Quotation, QuotationTemplateColumn, QuotationTemplateSection, QuotationTemplateCompany } from '@/types';
import { columnAlign, columnValue, computeMergeGroups, formatAmount, infoLineText, resolveMergeKey, resolveTitle, showTaxBreakdown, taxRowLabel, templateText, TOTAL_LABELS, visibleColumns } from '@/utils/quotationColumns';

export interface PreviewConfig {
    columns?: QuotationTemplateColumn[];
    title?: string;
    /** 兼容历史模板字段 titleFormat（优先于 title） */
    titleFormat?: string;
    header?: string;
    footer?: string;
    showTax?: boolean;
    type?: string;
    mergeKey?: string;
    sections?: QuotationTemplateSection[];
    /** 公司信息（名称/地址/电话），可在页眉页脚用 {{companyName}} 等占位符调用 */
    company?: QuotationTemplateCompany;
    companyName?: string;
    /** 表格正上方标题 */
    tableTitle?: string;
    /** 信息行格式（客户/联系人/地址/报价编号/日期/单位） */
    infoFormat?: string;
    /** 页面方向：portrait（默认）/ landscape */
    pageOrientation?: 'portrait' | 'landscape';
}

function esc(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function alignClass(col: QuotationTemplateColumn): string {
    return `a-${col.align ?? columnAlign(col.key)}`;
}

/**
 * 生成报价单 HTML（同时用于模态框实时预览与打印导出）
 * 页面按 A4 纵向排布，打印时通过 @media print 收敛边距
 */
export function renderQuotationHtml(quotation: Quotation, config: PreviewConfig): string {
    const columns = config.columns?.length ? visibleColumns(config.columns) : [];
    if (!columns.length) {
        return '<div style="padding:20px;color:#999;text-align:center;">暂无可显示列，请在左侧勾选列</div>';
    }

    const mergeKey = resolveMergeKey(config as { mergeKey?: string; columns?: QuotationTemplateColumn[] });
    const nameIdx = columns.findIndex((c) => c.key === mergeKey);
    const mergeIdx = nameIdx >= 0 ? nameIdx : columns.findIndex((c) => c.key === 'name');
    const brandIdx = columns.findIndex((c) => c.key === 'brand');
    // 分组算法与 Excel/PDF/DOCX 同源（quotationColumns.computeMergeGroups）
    const groups = computeMergeGroups(quotation.items, columns, columns[mergeIdx >= 0 ? mergeIdx : 0]?.key ?? '');
    const startOfRow: number[] = [];
    const groupOfRow: Array<(typeof groups)[number]> = [];
    for (const g of groups) {
        for (let k = 0; k < g.span; k++) {
            startOfRow[g.start + k] = g.start;
            groupOfRow[g.start + k] = g;
        }
    }

    const title = resolveTitle(quotation, { title: config.title, titleFormat: config.titleFormat }, config.company);
    const info = infoLineText(quotation, config);

    const thead = `<tr>${columns.map((c) => `<th>${esc(c.label)}</th>`).join('')}</tr>`;

    const tbody: string[] = [];
    for (let i = 0; i < quotation.items.length; i++) {
        const item = quotation.items[i];
        const rowStart = mergeIdx >= 0 ? startOfRow[i] : i;
        const isRowStart = mergeIdx < 0 || i === rowStart;
        const group = mergeIdx >= 0 ? groupOfRow[i] : undefined;
        const groupSpan = group?.span ?? 1;
        const offsetInGroup = i - rowStart;

        const cells: string[] = [];
        for (let ci = 0; ci < columns.length; ci++) {
            const c = columns[ci];
            const text = c.key === 'no' || c.key === 'index' ? String(i + 1) : columnValue(item, c);
            if (ci === mergeIdx) {
                if (isRowStart) {
                    cells.push(`<td class="${alignClass(c)}" rowspan="${groupSpan}">${esc(text)}</td>`);
                }
                continue;
            }
            if (ci === brandIdx && group && group.brandSpan > 1 && brandIdx !== mergeIdx) {
                // 品牌列部分合并：组内前缀 brandSpan 行一致时合并，其余行照常显示
                if (offsetInGroup === 0) {
                    cells.push(`<td class="${alignClass(c)}" rowspan="${group.brandSpan}">${esc(text)}</td>`);
                } else if (offsetInGroup < group.brandSpan) {
                    // 已被上方 rowspan 覆盖
                } else {
                    cells.push(`<td class="${alignClass(c)}">${esc(text)}</td>`);
                }
                continue;
            }
            cells.push(`<td class="${alignClass(c)}">${esc(text)}</td>`);
        }
        tbody.push(`<tr>${cells.join('')}</tr>`);
    }

    const breakdown = showTaxBreakdown(config, quotation);
    const totalHtml = `<div class="total-block">
        <table class="total-table">
            <tr><th>${TOTAL_LABELS.feeHeader}</th><th>${TOTAL_LABELS.amountHeader}</th></tr>
            ${breakdown ? `
            <tr><td>${TOTAL_LABELS.subtotalNoTax}</td><td class="a-right">${formatAmount(quotation.totalAmount)}</td></tr>
            <tr><td>${taxRowLabel(Number(quotation.taxRate ?? 0))}</td><td class="a-right">${formatAmount(quotation.taxAmount)}</td></tr>` : ''}
            <tr class="total-row"><td>${TOTAL_LABELS.finalTotal}</td><td class="a-right">${formatAmount(quotation.finalAmount)}</td></tr>
        </table>
    </div>`;

    const sections = config.sections ?? [];
    const renderSection = (s: QuotationTemplateSection): string => {
        const content = templateText(s.content ?? '', quotation, config.company);
        const titleHtml = s.title
            ? `<div class="section-title">${esc(templateText(s.title, quotation, config.company))}</div>`
            : '';
        return `<div class="section">${titleHtml}<div class="section-body">${esc(content).replace(/\n/g, '<br/>')}</div></div>`;
    };
    const beforeSections = sections.filter((s) => (s.position ?? 'before') === 'before').map(renderSection).join('');
    const afterSections = sections.filter((s) => (s.position ?? 'before') === 'after').map(renderSection).join('');

    // 页面方向：模板配置 landscape 时用 A4 横向（打印 @page 与画布宽度联动）
    const isLandscape = config.pageOrientation === 'landscape';

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4 ${isLandscape ? 'landscape' : 'portrait'}; margin: 10mm; }
  * { box-sizing: border-box; }
  body { font-family: '宋体', SimSun, serif; margin: 0; background: #e9ecef; color: #000; }
  .page { width: ${isLandscape ? '297mm' : '210mm'}; min-height: ${isLandscape ? '210mm' : '297mm'}; background: #fff; margin: 16px auto; padding: 12mm 14mm; box-shadow: 0 2px 12px rgba(0,0,0,0.12); }
  .header { font-size: 11px; color: #888; border-bottom: 1px solid #bfbfbf; padding-bottom: 4px; margin-bottom: 8px; white-space: pre-line; }
  .title { text-align: center; font-size: 26px; font-weight: bold; color: #000000; margin-bottom: 10px; letter-spacing: 2px; }
  .info { text-align: right; font-size: 11px; color: #666; margin-bottom: 14px; line-height: 1.6; white-space: pre-line; }
  table.items { width: 100%; border-collapse: collapse; }
  table.items th, table.items td { border: 1px solid #9db2d6; padding: 7px 8px; font-size: 11px; vertical-align: middle; line-height: 1.4; white-space: pre-line; }
  table.items th { background: #eaf1fb; color: #000000; font-weight: bold; text-align: center; }
  .a-right { text-align: right; }
  .a-center { text-align: center; }
  .a-left { text-align: left; }
  .total-block { margin-top: 14px; display: flex; justify-content: flex-end; }
  .total-table { border-collapse: collapse; width: 240px; }
  .total-table th, .total-table td { border: 1px solid #9db2d6; padding: 7px 10px; font-size: 12px; }
  .total-table th { background: #eaf1fb; color: #000000; text-align: center; }
  /* 标签列居中、金额列右对齐（与 Excel/PDF/Word 合计区一致） */
  .total-table td:first-child { text-align: center; }
  .total-row td { font-weight: bold; color: #9c5700; background: #fcefd6; font-size: 14px; }
  .footer { font-size: 11px; color: #888; margin-top: 14px; border-top: 1px solid #bfbfbf; padding-top: 5px; line-height: 1.5; white-space: pre-line; }
  .logo-row { text-align: center; margin-bottom: 6px; }
  .logo-img { max-height: 54px; max-width: 240px; object-fit: contain; }
  .logo-text { display: inline-block; font-size: 18px; font-weight: bold; color: #000000; letter-spacing: 1px; }
  .section { margin-top: 14px; }
  .section-title { font-size: 14px; font-weight: bold; color: #000000; margin-bottom: 4px; white-space: pre-line; }
  .section-body { font-size: 12px; color: #000; line-height: 1.7; white-space: normal; }
  .table-title { font-size: 13px; font-weight: bold; color: #000000; text-align: left; margin: 16px 0 8px; }
  @media print {
    body { background: #fff; }
    .page { margin: 0; box-shadow: none; width: auto; min-height: auto; padding: 0; }
  }
</style>
</head>
<body>
<div class="page">
  ${config.header ? `<div class="header">${esc(templateText(config.header, quotation, config.company))}</div>` : ''}
  <div class="title">${esc(title)}</div>
  <div class="info">${esc(info)}</div>
  ${beforeSections}
  ${templateText(config.tableTitle, quotation, config.company) ? `<div class="table-title">${esc(templateText(config.tableTitle, quotation, config.company))}</div>` : ''}
  <table class="items">
    <thead>${thead}</thead>
    <tbody>${tbody.join('')}</tbody>
  </table>
  ${totalHtml}
  ${afterSections}
  ${config.footer ? `<div class="footer">${esc(templateText(config.footer, quotation, config.company))}</div>` : ''}
</div>
</body>
</html>`;
}

/** 打开打印窗口：写入报价单 HTML 并触发打印 */
export function printQuotationHtml(quotation: Quotation, config: PreviewConfig): void {
    const html = renderQuotationHtml(quotation, config);
    const win = window.open('', '_blank', 'width=1200,height=800');
    if (!win) {
        return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    // 等待字体/布局就绪后打印
    setTimeout(() => {
        win.focus();
        win.print();
    }, 300);
}