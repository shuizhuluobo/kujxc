import { type FeeRecord } from '@/api';

/**
 * 打印数据结构 - 统一打印数据接口
 */
export interface PrintData {
  documentNo: string;
  date: string;
  clientName: string;
  contactPerson: string;
  contactPhone: string;
  items: PrintItem[];
  subtotal: number;
  discount: number;
  actualAmount: number;
  remark: string;
  creatorName: string;
}

export interface PrintItem {
  index: number;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export type PrintTemplateType = 'a4' | 'triplicate';

/**
 * 生成单据编号 FE-YYYYMMDD-XXX
 */
export function generateDocumentNo(): string {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `FE-${dateStr}-${seq}`;
}

/**
 * 格式化日期为中文格式
 */
export function formatPrintDate(dateStr?: string): string {
  const date = dateStr ? new Date(dateStr) : new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}年${m}月${d}日`;
}

/**
 * 金额转大写
 */
export function amountToChinese(num: number): string {
  if (num === 0) return '零元整';

  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟'];
  const bigUnits = ['', '万', '亿'];

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);

  let result = '';

  if (intPart > 0) {
    const intStr = String(intPart);
    const len = intStr.length;
    let zeroFlag = false;

    for (let i = 0; i < len; i++) {
      const char = intStr[i];
      if (char === undefined) continue;
      const digit = parseInt(char);
      const pos = len - 1 - i;
      const unitIdx = pos % 4;
      const bigUnitIdx = Math.floor(pos / 4);

      if (digit === 0) {
        zeroFlag = true;
        if (unitIdx === 0 && bigUnitIdx > 0) {
          const bigUnit = bigUnits[bigUnitIdx];
          if (bigUnit) {
            result += bigUnit;
          }
          zeroFlag = false;
        }
      } else {
        if (zeroFlag) {
          result += '零';
          zeroFlag = false;
        }
        const digitChar = digits[digit];
        const unit = units[unitIdx];
        if (digitChar && unit) {
          result += digitChar + unit;
        }
        if (unitIdx === 0 && bigUnitIdx > 0) {
          const bigUnit = bigUnits[bigUnitIdx];
          if (bigUnit) {
            result += bigUnit;
          }
        }
      }
    }
    result += '元';
  }

  if (decPart > 0) {
    const jiao = Math.floor(decPart / 10);
    const fen = decPart % 10;
    if (jiao > 0) result += digits[jiao] + '角';
    if (fen > 0) result += digits[fen] + '分';
  } else {
    result += '整';
  }

  return result;
}

/**
 * 将 FeeRecord 转换为 PrintData
 */
export function recordToPrintData(record: FeeRecord): PrintData {
  return {
    documentNo: generateDocumentNo(),
    date: formatPrintDate(record.createdAt),
    clientName: '',
    contactPerson: '',
    contactPhone: '',
    items: (record.items as any[]).map((item, idx) => ({
      index: idx + 1,
      name: item.item || item.name || '',
      quantity: item.quantity || 0,
      unit: item.unit || (item.quantity > 1 ? '台' : '次'),
      unitPrice: item.unitPrice || (item.quantity > 0 ? item.total / item.quantity : 0),
      total: item.total || 0,
    })),
    subtotal: record.subtotal,
    discount: record.discount,
    actualAmount: record.actualAmount,
    remark: record.remark || '',
    creatorName: record.creator?.name || record.creatorId || '',
  };
}

/**
 * 打印模板的通用 CSS 样式
 */
function getPrintBaseCss(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: SimSun, serif; color: #000; background: #fff; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #000; padding: 4px 8px; text-align: center; }
    th { background: #f0f0f0; font-weight: bold; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: bold; }
    .no-border { border: none; }
    .sign-line { display: inline-block; width: 80px; border-bottom: 1px solid #000; }
  `;
}

/**
 * A4 模板专用 CSS
 */
function getA4Css(): string {
  return `
    @page { size: A4; margin: 15mm; }
    ${getPrintBaseCss()}
    body { padding: 10mm; }
    .a4-template { width: 100%; }
    .a4-title { font-size: 22pt; font-weight: bold; text-align: center; margin: 20px 0 30px; letter-spacing: 4px; }
    .a4-info { font-size: 11pt; line-height: 2; margin-bottom: 20px; }
    .a4-info-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .a4-info-row .label { min-width: 80px; }
    .a4-info-row .value { flex: 1; border-bottom: 1px solid #333; }
    .a4-table { font-size: 11pt; margin-bottom: 20px; }
    .a4-table th { height: 32px; font-size: 11pt; }
    .a4-table td { height: 28px; font-size: 11pt; }
    .a4-table td.item-name { text-align: left; padding-left: 12px; }
    .a4-table td.amount { text-align: right; padding-right: 12px; font-family: 'Courier New', monospace; }
    .a4-summary { margin-bottom: 20px; }
    .a4-summary-row { display: flex; justify-content: flex-end; font-size: 11pt; line-height: 2; }
    .a4-summary-row .label { min-width: 80px; text-align: right; }
    .a4-summary-row .value { min-width: 100px; text-align: right; font-family: 'Courier New', monospace; border-bottom: 1px solid #999; }
    .a4-summary-total { font-size: 14pt; font-weight: bold; margin-top: 8px; padding-top: 8px; border-top: 2px solid #000; }
    .a4-summary-total .value { border-bottom: none; }
    .a4-chinese-amount { text-align: right; font-size: 10pt; color: #333; margin-top: 4px; }
    .a4-remark { font-size: 11pt; margin-bottom: 30px; line-height: 1.8; }
    .a4-remark .label { font-weight: bold; }
    .a4-sign { margin-top: 40px; font-size: 11pt; }
    .a4-sign-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .a4-sign-item { min-width: 200px; }
    .a4-sign-item .sign-line { width: 120px; }
    .a4-footer { margin-top: 15px; font-size: 11pt; line-height: 1.6; text-align: center; color: #555; }
    .a4-footer-text { display: inline; margin: 0 12px; }
  `;
}

/**
 * 三联纸模板专用 CSS
 * 三联纸尺寸: 241mm x 127.6mm (约 910px x 482px at 96dpi)
 * 边距约 3mm，标题区 25%，内容区 55%，签名区 20%
 */
function getTriplicateCss(): string {
  return `
    @page { size: 241mm 127.6mm; margin: 8mm; }
    ${getPrintBaseCss()}
    body { padding: 4mm; }
    .trip-template { width: 100%; }
    .trip-title { font-size: 14pt; font-weight: bold; text-align: center; margin: 3mm 0 5mm; letter-spacing: 2px; }
    .trip-info { font-size: 8pt; line-height: 1.8; margin-bottom: 4mm; }
    .trip-info-row { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px; }
    .trip-info-row-compact { display: flex; justify-content: flex-start; gap: 12px; flex-wrap: nowrap; }
    .trip-info-row-compact span { flex: 1; min-width: 120px; }
    .trip-info-row .label { font-weight: normal; }
    .trip-info-row .value { border-bottom: 1px solid #333; padding: 0 2px; min-width: 60px; display: inline-block; }
    .trip-info-row .value.wide { min-width: 80px; }
    .trip-table { font-size: 8pt; margin-bottom: 4mm; }
    .trip-table th { height: 20px; font-size: 8pt; padding: 2px 3px; white-space: nowrap; }
    .trip-table td { height: 18px; font-size: 8pt; padding: 1px 3px; }
    .trip-table td.item-name { text-align: left; padding-left: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .trip-table td.amount { text-align: right; padding-right: 4px; font-family: 'Courier New', monospace; white-space: nowrap; }
    .trip-table td.qty { text-align: center; font-family: 'Courier New', monospace; }
    .trip-table td.price { text-align: right; font-family: 'Courier New', monospace; }
    .trip-summary { font-size: 8pt; margin-bottom: 3mm; }
    .trip-summary-row { display: flex; justify-content: flex-end; line-height: 1.8; gap: 8px; }
    .trip-summary-row .label { min-width: 40px; text-align: right; }
    .trip-summary-row .value { min-width: 70px; text-align: right; font-family: 'Courier New', monospace; border-bottom: 1px solid #333; padding: 0 2px; }
    .trip-summary-total { font-weight: bold; font-size: 9pt; margin-top: 2mm; padding-top: 2mm; border-top: 1.5px solid #000; }
    .trip-summary-total .value { border-bottom: none; color: #000; }
    .trip-chinese { text-align: right; font-size: 7pt; color: #555; margin-top: 1mm; padding-right: 2px; }
    .trip-remark { font-size: 8pt; margin-bottom: 4mm; line-height: 1.6; }
    .trip-remark .label { font-weight: bold; }
    .trip-sign { font-size: 8pt; margin-top: 6mm; display: flex; justify-content: space-between; align-items: flex-end; }
    .trip-sign-item { min-width: 100px; }
    .trip-sign-item .sign-line { width: 70px; }
    .trip-sign-date { margin-top: 4px; }
    .trip-footer { margin-top: 4mm; font-size: 8pt; line-height: 1.6; text-align: center; color: #555; }
    .trip-footer-text { display: inline; margin: 0 8px; }
  `;
}

/**
 * 渲染 A4 模板 HTML
 */
export function renderA4Template(data: PrintData): string {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td>${item.index}</td>
      <td class="item-name">${item.name}</td>
      <td>${item.quantity}${item.unit}</td>
      <td class="amount">${item.unitPrice.toFixed(2)}</td>
      <td class="amount">${item.total.toFixed(2)}</td>
    </tr>
  `).join('');

  const chineseAmount = amountToChinese(data.actualAmount);

  return `
    <div class="a4-template">
      <div class="a4-title">服务费用结算单</div>
      <div class="a4-info">
        <div class="a4-info-row">
          <span style="min-width:280px"><span class="label">单据编号：</span>${data.documentNo}</span>
          <span><span class="label">日期：</span>${data.date}</span>
        </div>
        <div class="a4-info-row">
          <span style="min-width:280px"><span class="label">委托单位：</span><span class="value">${data.clientName}</span></span>
          <span><span class="label">操作人：</span>${data.creatorName}</span>
        </div>
        <div class="a4-info-row">
          <span style="min-width:280px"><span class="label">联 系 人：</span><span class="value">${data.contactPerson}</span></span>
          <span><span class="label">联系电话：</span><span class="value">${data.contactPhone}</span></span>
        </div>
      </div>
      <table class="a4-table">
        <thead>
          <tr>
            <th style="width:40px">序号</th>
            <th>服务项目</th>
            <th style="width:80px">数量</th>
            <th style="width:80px">单价</th>
            <th style="width:100px">金额</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <div class="a4-summary">
        <div class="a4-summary-row">
          <span class="label">小计：</span>
          <span class="value">¥${data.subtotal.toFixed(2)}</span>
        </div>
        <div class="a4-summary-row">
          <span class="label">优惠金额：</span>
          <span class="value">¥${data.discount.toFixed(2)}</span>
        </div>
        <div class="a4-summary-row a4-summary-total">
          <span class="label">实收金额：</span>
          <span class="value">¥${data.actualAmount.toFixed(2)}</span>
        </div>
        <div class="a4-chinese-amount">大写：${chineseAmount}</div>
      </div>
      <div class="a4-remark">
        <span class="label">备注：</span>${data.remark || '无'}
      </div>
      <div class="a4-sign">
        <div class="a4-sign-row">
          <div class="a4-sign-item">经办人：<span class="sign-line">${data.creatorName}</span></div>
          <div class="a4-sign-item">客户签收：<span class="sign-line"></span></div>
        </div>
      </div>
      <div class="a4-footer">
        <div class="a4-footer-text">请您仔细核对此单内容，并签字确认，谢谢您的合作！</div>
        <div class="a4-footer-text">联系电话：0631-5213686</div>
      </div>
    </div>
  `;
}

/**
 * 渲染三联纸模板 HTML（单份，复写纸自动产生三联）
 * 表格列分配策略（基于三联纸物理尺寸优化）：
 * - 序号: 6% (约 40px) - 只需显示1-2位数字
 * - 服务项目: 50% (约 325px) - 主要内容区，允许长名称换行显示
 * - 数量: 10% (约 65px) - 居中显示，紧凑布局
 * - 单价: 10% (约 65px) - 右对齐，金额类数据
 * - 金额: 24% (约 155px) - 右对齐显示，最宽列
 */
export function renderTriplicateTemplate(data: PrintData): string {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td>${item.index}</td>
      <td class="item-name">${item.name}</td>
      <td class="qty">${item.quantity}${item.unit}</td>
      <td class="price">${item.unitPrice.toFixed(2)}</td>
      <td class="amount">${item.total.toFixed(2)}</td>
    </tr>
  `).join('');

  const chineseAmount = amountToChinese(data.actualAmount);

  return `
    <div class="trip-template">
      <div class="trip-title">服务费用结算单</div>
      <div class="trip-info">
        <div class="trip-info-row">
          <span>No: ${data.documentNo}</span>
          <span>${data.date}</span>
        </div>
        <div class="trip-info-row trip-info-row-compact">
          <span><span class="label">委托单位:</span><span class="value wide">${data.clientName}</span></span>
          <span><span class="label">联系人:</span><span class="value">${data.contactPerson}</span></span>
          <span><span class="label">电话:</span><span class="value">${data.contactPhone}</span></span>
        </div>
      </div>
      <table class="trip-table">
        <thead>
          <tr>
            <th style="width:6%">序号</th>
            <th style="width:50%">服务项目</th>
            <th style="width:10%">数量</th>
            <th style="width:10%">单价</th>
            <th style="width:24%">金额</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <div class="trip-summary">
        <div class="trip-summary-row">
          <span class="label">小计：</span>
          <span class="value">¥${data.subtotal.toFixed(2)}</span>
        </div>
        ${data.discount > 0 ? `
        <div class="trip-summary-row">
          <span class="label">优惠金额：</span>
          <span class="value">¥${data.discount.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="trip-summary-row trip-summary-total">
          <span class="label">实收金额：</span>
          <span class="value">¥${data.actualAmount.toFixed(2)}</span>
        </div>
        <div class="trip-chinese">大写：${chineseAmount}</div>
      </div>
      <div class="trip-remark">
        <span class="label">备注：</span>${data.remark || '无'}
      </div>
      <div class="trip-sign">
        <div class="trip-sign-item">经办人:<span class="sign-line">${data.creatorName}</span></div>
        <div class="trip-sign-item">客户签收:<span class="sign-line"></span></div>
      </div>
      <div class="trip-footer">
        <div class="trip-footer-text">请您仔细核对此单内容，并签字确认，谢谢您的合作！</div>
        <div class="trip-footer-text">联系电话：0631-5213686</div>
      </div>
    </div>
  `;
}

/**
 * 创建 iframe 并执行打印
 */
export function doPrint(template: PrintTemplateType, data: PrintData): void {
  const css = template === 'a4' ? getA4Css() : getTriplicateCss();
  const html = template === 'a4' ? renderA4Template(data) : renderTriplicateTemplate(data);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 300);
}

/**
 * 打印 composable
 */
export function usePrint() {
  const print = (template: PrintTemplateType, data: PrintData) => {
    doPrint(template, data);
  };

  return {
    print,
    generateDocumentNo,
    formatPrintDate,
    amountToChinese,
    recordToPrintData,
  };
}
