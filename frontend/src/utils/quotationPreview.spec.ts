import { describe, it, expect } from 'vitest';
import { renderQuotationHtml } from '@/utils/quotationPreview';
import type { Quotation } from '@/types';

const quotation = {
    id: 'q1',
    code: 'QD-2026-001',
    customerName: '张三',
    customerContact: '13800000000',
    customerAddress: '杭州市',
    finalAmount: 180,
    items: [
        {
            id: 'i1',
            quantity: 2,
            unitPrice: 100,
            discount: 90,
            subtotal: 180,
            productSnapshot: {
                code: 'P-001',
                name: '指纹锁',
                brand: '小米',
                model: 'X1',
                unit: '个',
            },
        },
        {
            id: 'i2',
            quantity: 1,
            unitPrice: 200,
            discount: 0,
            subtotal: 200,
            productSnapshot: {
                code: 'P-002',
                name: '摄像头',
                brand: '海康',
                model: 'C2',
                unit: '台',
            },
        },
    ],
} as unknown as Quotation;

describe('diagnose: renderQuotationHtml does not throw with realistic data', () => {
    it('preset-style basic config', () => {
        const html = renderQuotationHtml(quotation, {
            columns: [
                { key: 'no', label: '序号', visible: true, type: 'field', field: 'no' },
                { key: 'code', label: '产品编号', visible: true, type: 'field', field: 'code' },
                { key: 'brandModel', label: '品牌型号', visible: true, type: 'formula', formula: '{brand} {model}' },
                { key: 'unit', label: '单位', visible: true, type: 'field', field: 'unit' },
                { key: 'quantity', label: '数量', visible: true, type: 'field', field: 'quantity' },
                { key: 'unitPrice', label: '单价', visible: true, type: 'field', field: 'unitPrice' },
                { key: 'discount', label: '折扣', visible: true, type: 'field', field: 'discount' },
                { key: 'subtotal', label: '小计', visible: true, type: 'field', field: 'subtotal' },
            ],
            titleFormat: '{{customerName}} 报价单',
            mergeKey: 'brandModel',
        });
        expect(html).toContain('张三 报价单');
        expect(html).toContain('小米 X1');
    });

    it('template from DB with name mergeKey and mixed keys', () => {
        const html = renderQuotationHtml(quotation, {
            columns: [
                { key: 'name', label: '产品名称', visible: true },
                { key: 'description', label: '参数', visible: true },
                { key: 'quantity', label: '数量', visible: true },
            ],
            titleFormat: '报价单',
            mergeKey: 'name',
        });
        expect(html).toContain('指纹锁');
    });

    it('empty items does not throw', () => {
        const empty = { ...quotation, items: [] } as unknown as Quotation;
        const html = renderQuotationHtml(empty, {
            columns: [{ key: 'name', label: '名称', visible: true }],
        });
        expect(html).toContain('<tbody></tbody>');
    });

    it('未选择税率时不展示税额明细行', () => {
        const q = { ...quotation, taxRate: 0, totalAmount: 180, finalAmount: 180 } as unknown as Quotation;
        const html = renderQuotationHtml(q, {
            columns: [{ key: 'name', label: '名称', visible: true }],
            showTax: true,
        });
        expect(html).toContain('<tr class="total-row"><td>含税总额</td>');
        expect(html).not.toContain('税额（税率');
        expect(html).not.toContain('合计（不含税）');
    });

    it('模板关闭显示税额时不展示税额明细行', () => {
        const q = { ...quotation, taxRate: 13, totalAmount: 180, taxAmount: 23.4, finalAmount: 203.4 } as unknown as Quotation;
        const html = renderQuotationHtml(q, {
            columns: [{ key: 'name', label: '名称', visible: true }],
            showTax: false,
        });
        expect(html).not.toContain('税额（税率');
    });

    it('开启显示税额且税率 > 0 时展示合计/税额/含税总额三行', () => {
        const q = { ...quotation, taxRate: 13, totalAmount: 180, taxAmount: 23.4, finalAmount: 203.4 } as unknown as Quotation;
        const html = renderQuotationHtml(q, {
            columns: [{ key: 'name', label: '名称', visible: true }],
            showTax: true,
        });
        expect(html).toContain('合计（不含税）');
        expect(html).toContain('税额（税率 13%）');
        expect(html).toContain('含税总额');
        expect(html).toContain('180.00');
        expect(html).toContain('203.40');
    });
});