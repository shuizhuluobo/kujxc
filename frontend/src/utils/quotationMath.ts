export interface TotalsInput {
    subtotal: number;
    profit?: number | null;
}

export interface TotalsResult {
    totalAmount: number;
    taxAmount: number;
    finalAmount: number;
    estimatedProfit: number;
}

export function computeItemSubtotal(quantity: number, unitPrice: number, discount?: number | null): number {
    const rate = discount != null && discount > 0 ? discount / 100 : 1;
    return Math.round(quantity * unitPrice * rate * 100) / 100;
}

export function computeTotals(items: TotalsInput[], taxRate?: number | null): TotalsResult {
    const totalAmount = Math.round(items.reduce((sum, item) => sum + (item.subtotal || 0), 0) * 100) / 100;
    const taxAmount = Math.round(totalAmount * (taxRate || 0) * 100) / 10000;
    return {
        totalAmount,
        taxAmount,
        finalAmount: Math.round((totalAmount + taxAmount) * 100) / 100,
        estimatedProfit: Math.round(items.reduce((sum, item) => sum + (item.profit || 0), 0) * 100) / 100,
    };
}
