import { describe, it, expect } from 'vitest';
import { computeItemSubtotal, computeTotals } from '@/utils/quotationMath';

describe('computeItemSubtotal', () => {
    it('无折扣时小计 = 数量 × 单价', () => {
        expect(computeItemSubtotal(2, 100)).toBe(200);
        expect(computeItemSubtotal(1, 99.5)).toBe(99.5);
    });

    it('折扣为 90 时按 9 折计算', () => {
        expect(computeItemSubtotal(2, 100, 90)).toBe(180);
    });

    it('折扣为 0 或空时不打折', () => {
        expect(computeItemSubtotal(3, 10, 0)).toBe(30);
        expect(computeItemSubtotal(3, 10, null)).toBe(30);
    });

    it('保留两位小数', () => {
        expect(computeItemSubtotal(3, 100, 50)).toBe(150);
        expect(computeItemSubtotal(7, 3.33, 100)).toBe(23.31);
    });
});

describe('computeTotals', () => {
    it('汇总小计与毛利', () => {
        const totals = computeTotals(
            [
                { subtotal: 100, profit: 30 },
                { subtotal: 250, profit: -10 },
            ],
            null,
        );
        expect(totals.totalAmount).toBe(350);
        expect(totals.taxAmount).toBe(0);
        expect(totals.finalAmount).toBe(350);
        expect(totals.estimatedProfit).toBe(20);
    });

    it('税率计算税额与含税总额', () => {
        const totals = computeTotals([{ subtotal: 1000 }], 13);
        expect(totals.taxAmount).toBe(130);
        expect(totals.finalAmount).toBe(1130);
    });

    it('空明细时为 0', () => {
        expect(computeTotals([])).toEqual({
            totalAmount: 0,
            taxAmount: 0,
            finalAmount: 0,
            estimatedProfit: 0,
        });
    });
});