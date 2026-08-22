/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { exportQuotationToPdf, exportQuotationToExcel } from './quotationExport';
import type { Quotation, QuotationTemplateColumn } from '@/types';

const fontDir = `${process.cwd()}/public/fonts`;

let captured: Blob | null = null;

beforeAll(() => {
    const files: Record<string, string> = {
        '/fonts/simsun-subset.ttf': 'simsun-subset.ttf',
        '/fonts/notosans-bold-subset.ttf': 'notosans-bold-subset.ttf',
    };
    vi.stubGlobal('fetch', ((url: string) => {
        const name = files[url];
        if (!name) return { ok: false } as Response;
        const bytes = readFileSync(`${fontDir}/${name.split('/').pop()}`);
        return {
            ok: true,
            arrayBuffer: () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
        } as unknown as Response;
    }) as typeof fetch);

    Object.defineProperty(URL, 'createObjectURL', {
        value: (b: Blob) => {
            captured = b;
            return 'blob:x';
        },
        configurable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', { value: () => {}, configurable: true });
});

const mkItem = (over: Record<string, unknown>) => ({
    productSnapshot: {
        code: 'LX-2608-21410',
        name: '航天润普保密文件柜/HT-903',
        unit: '台',
        brand: '航天润普',
        model: 'HT-903',
        category: '办公设备',
        description: '整体钢制结构，五层隔板，电子密码锁，符合国家保密标准B级，通过ISO9001认证',
    },
    quantity: 2,
    unitPrice: 1250,
    subtotal: 2500,
    ...over,
}) as unknown as Quotation['items'][number];

function mkQuotation(items: Quotation['items']): Quotation {
    return {
        code: 'BJ-2608-00010',
        customerName: '测试客户名称比较长的一家公司有限公司',
        customerContact: '张三',
        customerAddress: '北京市海淀区某某路某某号某某大厦 12 层 1201 室',
        taxRate: 13,
        totalAmount: 5000,
        taxAmount: 650,
        finalAmount: 5650,
        items,
    } as unknown as Quotation;
}

const col = (key: string, label: string, extra: Partial<QuotationTemplateColumn> = {}): QuotationTemplateColumn =>
    ({ key, label, visible: true, ...extra }) as QuotationTemplateColumn;

const baseCols = (): QuotationTemplateColumn[] => [
    col('index', '序号'),
    col('code', '产品编号'),
    col('brandModel', '品牌型号', { type: 'formula', formula: '{brand} {model}' }),
    col('description', '参数'),
    col('unit', '单位'),
    col('quantity', '数量'),
    col('unitPrice', '单价'),
    col('discount', '折扣'),
    col('subtotal', '小计'),
];

interface Scenario {
    name: string;
    config: Record<string, unknown>;
}

const scenarios: Scenario[] = [
    { name: '默认9列 纵向', config: { columns: baseCols(), titleFormat: '{{customerName}} 报价单', showTax: true, mergeKey: 'brandModel' } },
    {
        name: '默认9列 横向',
        config: { columns: baseCols(), titleFormat: '{{customerName}} 报价单', showTax: true, mergeKey: 'brandModel', pageOrientation: 'landscape' },
    },
    {
        name: '模板显式列宽(每列120px)',
        config: { columns: baseCols().map((c) => ({ ...c, width: 120 })), titleFormat: '报价单', showTax: true, mergeKey: 'brandModel' },
    },
    {
        name: '18列全字段 纵向',
        config: {
            columns: [
                col('index', '序号'), col('code', '产品编号'), col('name', '产品名称'), col('brand', '品牌'), col('model', '型号'),
                col('category', '类型'), col('description', '产品参数'), col('unit', '单位'), col('quantity', '数量'),
                col('unitPrice', '单价'), col('discount', '折扣'), col('subtotal', '小计'), col('warranty', '质保'),
                col('supplier', '供应商'), col('tags', '标签'), col('moq', '起订量'), col('remark', '备注'), col('unitCost', '成本'),
            ],
            titleFormat: '报价单', showTax: true, mergeKey: 'name',
        },
    },
    {
        name: '超长无空格文本',
        config: {
            columns: [col('code', '产品编号'), col('brandModel', '品牌型号', { type: 'formula', formula: '{brand} {model}' }), col('unitPrice', '单价'), col('subtotal', '小计')],
            titleFormat: '报价单', showTax: true, mergeKey: 'brandModel',
        },
    },
];

const longTextItem = mkItem({
    productSnapshot: {
        code: 'VERY-LONG-PRODUCT-CODE-2025-08-22-001-ABCDEF',
        name: '超长名称产品',
        brand: '某品牌某品牌某品牌',
        model: 'XYZ-8888-SUPER-LONG-MODEL-NUMBER-2025',
        unit: '台',
        description: 'A'.repeat(80),
    },
});

describe('PDF 导出横向不溢出页面（回归）', () => {
    for (const s of scenarios) {
        it(`场景：${s.name}`, async () => {
            const long = s.name.includes('超长');
            const quotation = mkQuotation(
                long ? [longTextItem] : [mkItem({}), mkItem({ productSnapshot: { code: 'XX-2', name: '另一个产品', brand: '品牌B', model: 'M-2000', unit: '个', description: '参数说明文字' }, quantity: 3, unitPrice: 99.5, subtotal: 298.5 })],
            );
            const ok = await exportQuotationToPdf(quotation, 'download', { config: s.config as never });
            expect(ok).toBe(true);
            expect(captured).toBeTruthy();
            const bytes = new Uint8Array(await captured!.arrayBuffer());
            expect(bytes.length).toBeGreaterThan(1000);

            const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
            const doc = await pdfjs.getDocument({ data: bytes, useSystemFonts: false }).promise;

            const results: string[] = [`PAGES: ${doc.numPages}`];
            for (let p = 1; p <= doc.numPages; p++) {
                const page = await doc.getPage(p);
                const viewport = page.getViewport({ scale: 1 });
                // 页边距 28pt；允许 1pt 舍入误差
                const limit = viewport.width - 28 + 1;
                const content = await page.getTextContent();
                let maxX = 0;
                let maxStr = '';
                for (const item of content.items as Array<{ str?: string; transform: number[]; width: number }>) {
                    if (!item.str?.trim()) continue;
                    const x1 = item.transform[4] + item.width;
                    if (x1 > maxX) { maxX = x1; maxStr = item.str; }
                }
                results.push(`page${p}: W=${viewport.width} maxX=${maxX.toFixed(2)} limit=${limit} item=${JSON.stringify(maxStr.slice(0, 30))}`);
                expect(maxX).toBeLessThanOrEqual(limit);
            }
            expect(results.length).toBeGreaterThan(0);
        });
    }
});

describe('Excel 导出公式（回归）', () => {
    it('小计=数量*单价(含折扣 IF)，合计=SUM，含税总额引用单元格', async () => {
        const cfg = {
            columns: [
                { key: 'code', label: '产品编号', visible: true },
                { key: 'quantity', label: '数量', visible: true },
                { key: 'unitPrice', label: '单价', visible: true },
                { key: 'discount', label: '折扣', visible: true },
                { key: 'subtotal', label: '小计', visible: true },
            ],
            titleFormat: '报价单',
            showTax: true,
            mergeKey: 'code',
        };
        const quotation = mkQuotation([
            mkItem({ quantity: 2, unitPrice: 1250, discount: 85, subtotal: 2125 }),
            mkItem({
                productSnapshot: { code: 'XX-2', name: '另一个产品', brand: '品牌B', model: 'M-2000', unit: '个' },
                quantity: 3, unitPrice: 99.5, discount: null, subtotal: 298.5,
            }),
        ]) as Quotation & { taxRate: number; totalAmount: number; taxAmount: number; finalAmount: number };
        quotation.taxRate = 13;
        quotation.totalAmount = 2423.5;
        quotation.taxAmount = 315.06;
        quotation.finalAmount = 2738.56;

        await exportQuotationToExcel(quotation, { config: cfg } as never);
        expect(captured).toBeTruthy();
        const bytes = new Uint8Array(await captured!.arrayBuffer());

        // ExcelJS interop：Node/ESM 下真实构造器在 .default
        const ExcelJSNS = await import('exceljs');
        const ExcelJS = (ExcelJSNS as unknown as { default?: typeof ExcelJSNS }).default ?? ExcelJSNS;
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(bytes);
        const ws = wb.getWorksheet(1)!;

        // 行号：标题1 / 信息2 / 表头3 / 数据4-5 / 合计6-8
        const sub4 = ws.getCell('E4') as unknown as { formula?: string; result?: number };
        expect(sub4.formula).toBe('B4*C4*IF(N(D4)=0,1,N(D4)/100)');
        expect(sub4.result).toBe(2125);
        const sub5 = ws.getCell('E5') as unknown as { formula?: string; result?: number };
        expect(sub5.formula).toBe('B5*C5*IF(N(D5)=0,1,N(D5)/100)');

        expect(ws.getCell('E6').formula).toBe('SUM(E4:E5)');
        expect(ws.getCell('E7').formula).toBe('ROUND(E6*13/100,2)');
        expect(ws.getCell('E8').formula).toBe('E6+E7');
    });
});
