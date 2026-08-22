import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ElementPlus from 'element-plus';
import QuotationExportDialog from '@/views/products/QuotationExportDialog.vue';
import type { Quotation } from '@/types';

const quotation = {
    id: 'q1',
    code: 'QD-2026-001',
    customerName: '张三',
    finalAmount: 180,
    template: null,
    items: [
        {
            quantity: 2,
            unitPrice: 100,
            discount: 90,
            subtotal: 180,
            productSnapshot: { code: 'P-001', name: '指纹锁', brand: '小米', model: 'X1', unit: '个' },
        },
    ],
} as unknown as Quotation;

vi.mock('@/api', () => ({
    quotationTemplatesApi: {
        getAll: vi.fn().mockResolvedValue({
            data: [
                {
                    id: 'tpl-1',
                    name: '标准模板',
                    isDefault: true,
                    config: {
                        columns: [
                            { key: 'name', label: '产品名称', visible: true },
                            { key: 'quantity', label: '数量', visible: true },
                        ],
                        titleFormat: '{{customerName}} 报价单',
                    },
                },
            ],
        }),
        update: vi.fn().mockResolvedValue({ data: {} }),
        create: vi.fn().mockResolvedValue({ data: { id: 'new', config: {} } }),
    },
    quotationsApi: { exportDocx: vi.fn().mockResolvedValue({ data: new Blob(), headers: {} }) },
}));

describe('QuotationExportDialog', () => {
    it('renders, loads templates and populates columns without throwing (structuredClone-free)', async () => {
        const wrapper = mount(QuotationExportDialog, {
            props: { modelValue: true, quotation },
            global: {
                plugins: [ElementPlus],
                stubs: { teleport: true },
            },
            attachTo: document.body,
        });
        const vm = wrapper.vm as unknown as {
            onOpen: () => Promise<void>;
            templateId: string;
            workingColumns: unknown[];
        };
        await vm.onOpen();
        expect(vm.templateId).toBe('tpl-1');
        expect(vm.workingColumns.length).toBe(2);
        wrapper.unmount();
    });

    it('falls back to Excel preset when template loading fails', async () => {
        const { quotationTemplatesApi } = await import('@/api');
        (quotationTemplatesApi.getAll as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
            new Error('network'),
        );
        const wrapper = mount(QuotationExportDialog, {
            props: { modelValue: true, quotation },
            global: {
                plugins: [ElementPlus],
                stubs: { teleport: true },
            },
            attachTo: document.body,
        });
        const vm = wrapper.vm as unknown as {
            onOpen: () => Promise<void>;
            templateId: string;
            workingColumns: unknown[];
        };
        await vm.onOpen();
        expect(vm.templateId).toBe('');
        expect(vm.workingColumns.length).toBeGreaterThanOrEqual(8);
        wrapper.unmount();
    });
});