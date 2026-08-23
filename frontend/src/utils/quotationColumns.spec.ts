import { describe, it, expect } from 'vitest';
import {
    fieldValue,
    columnValue,
    visibleColumns,
    resolveMergeKey,
    resolveTitle,
    showTaxBreakdown,
    templateText,
    infoLineText,
} from '@/utils/quotationColumns';
import type { QuotationItem, QuotationTemplateColumn } from '@/types';

const item = {
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
        category: '智能门锁',
    },
} as unknown as QuotationItem;

describe('fieldValue', () => {
    it('取快照字段与行级金额字段', () => {
        expect(fieldValue(item, 'code')).toBe('P-001');
        expect(fieldValue(item, 'brand')).toBe('小米');
        expect(fieldValue(item, 'model')).toBe('X1');
        expect(fieldValue(item, 'quantity')).toBe('2');
        expect(fieldValue(item, 'unitPrice')).toBe('100.00');
        expect(fieldValue(item, 'discount')).toBe('90%');
        expect(fieldValue(item, 'subtotal')).toBe('180.00');
    });

    it('缺失字段返回空串', () => {
        expect(fieldValue(item, 'unknownField')).toBe('');
    });
});

describe('columnValue', () => {
    it('formula 组合列按占位符拼接并压缩空白', () => {
        const col: QuotationTemplateColumn = {
            key: 'brandModel',
            label: '品牌型号',
            visible: true,
            type: 'formula',
            formula: '{brand} {model}',
        };
        expect(columnValue(item, col)).toBe('小米 X1');
    });

    it('field 列取 field 字段', () => {
        const col: QuotationTemplateColumn = {
            key: 'model',
            label: '型号',
            visible: true,
            type: 'field',
            field: 'model',
        };
        expect(columnValue(item, col)).toBe('X1');
    });
});

describe('visibleColumns', () => {
    it('过滤隐藏列', () => {
        const cols: QuotationTemplateColumn[] = [
            { key: 'a', label: 'A', visible: true },
            { key: 'b', label: 'B', visible: false },
        ];
        expect(visibleColumns(cols).map((c) => c.key)).toEqual(['a']);
    });
});

describe('resolveMergeKey', () => {
    it('优先 config.mergeKey', () => {
        expect(
            resolveMergeKey({ mergeKey: 'brand', columns: [] }),
        ).toBe('brand');
    });

    it('无 mergeKey 时取第一个 formula 列', () => {
        const cols: QuotationTemplateColumn[] = [
            { key: 'brandModel', label: '品牌型号', visible: true, type: 'formula', formula: '{brand} {model}' },
        ];
        expect(resolveMergeKey({ columns: cols })).toBe('brandModel');
    });

    it('兜底 name', () => {
        expect(resolveMergeKey()).toBe('name');
    });
});

describe('resolveTitle', () => {
    it('支持双花括号与 ${} 两种占位符', () => {
        const q = { code: 'QD-001', customerName: '张三' } as const;
        expect(resolveTitle(q, { titleFormat: '{{customerName}} 报价单' })).toBe('张三 报价单');
        expect(resolveTitle(q, { titleFormat: '${code} 报价单' })).toBe('QD-001 报价单');
    });

    it('无格式时返回默认标题', () => {
        expect(resolveTitle({ code: 'QD-001', customerName: '张三' } as const)).toBe('报价单');
    });
});

describe('showTaxBreakdown', () => {
    it('开启显示税额且税率 > 0 时展示税额明细', () => {
        expect(showTaxBreakdown({ showTax: true }, { taxRate: 13 })).toBe(true);
    });

    it('未开启显示税额时不展示', () => {
        expect(showTaxBreakdown({ showTax: false }, { taxRate: 13 })).toBe(false);
    });

    it('未选择税率（0/空）时即使开启显示税额也不展示', () => {
        expect(showTaxBreakdown({ showTax: true }, { taxRate: 0 })).toBe(false);
        expect(showTaxBreakdown({ showTax: true }, { taxRate: null })).toBe(false);
        expect(showTaxBreakdown(undefined, { taxRate: 13 })).toBe(false);
    });
});

describe('templateText', () => {
    it('替换客户与公司占位符', () => {
        const q = { code: 'QD-001', customerName: '张三' } as const;
        const company = { name: '示例科技', address: '北京', phone: '400' };
        expect(
            templateText(
                '{{customerName}}/{{code}}/{{companyName}}/{{companyAddress}}/{{companyPhone}}',
                q,
                company,
            ),
        ).toBe('张三/QD-001/示例科技/北京/400');
    });

    it('未识别占位符清空', () => {
        const q = { code: 'QD-001', customerName: '张三' } as const;
        expect(templateText('a{{unknown}}b', q)).toBe('ab');
    });
});

describe('infoLineText', () => {
    const q = {
        customerName: '张三',
        customerContact: '李四',
        customerAddress: '深圳',
        code: 'QD-001',
    } as const;

    it('默认格式含客户/联系人/地址/编号/日期/单位', () => {
        const text = infoLineText(q, {});
        expect(text).toContain('客户：张三');
        expect(text).toContain('联系人：李四');
        expect(text).toContain('地址：深圳');
        expect(text).toContain('报价编号：QD-001');
        expect(text).toContain('单位：元');
        expect(text).toMatch(/日期：\d{4}-\d{2}-\d{2}/);
    });

    it('无联系人/地址时空值段自动省略', () => {
        const text = infoLineText({ customerName: '张三', code: 'QD-001' } as const, {});
        expect(text).not.toContain('联系人：');
        expect(text).not.toContain('地址：');
    });

    it('按自定义 infoFormat 渲染', () => {
        const text = infoLineText(q, { infoFormat: '客户：{{customerName}}\u3000编号：{{code}}' });
        expect(text).toBe('客户：张三\u3000编号：QD-001');
    });

    it('自定义格式整段空值时省略该段', () => {
        const text = infoLineText(
            { customerName: '张三', code: 'QD-001' } as const,
            { infoFormat: '{{customerContact}} 联系人\u3000客户：{{customerName}}' },
        );
        expect(text).toBe('客户：张三');
    });
});