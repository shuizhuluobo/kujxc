/**
 * 报价管理 E2E 流程测试（vitest + jsdom）
 *
 * 通过真实 api client（拦截器）覆盖 quotationsApi 与 quotationTemplatesApi：
 * 报价 CRUD、版本组、状态流转、docx 导出（blob）、模板管理，
 * 以及写请求 CSRF / 读请求匿名头的端到端规则。
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    requests,
    setResponder,
    reply,
    resetMockServer,
    resetSharedMocks,
} from './helpers/mockServer';

vi.mock('axios', async () => {
    const m = await import('./helpers/mockServer');
    return m.buildAxiosMock();
});
vi.mock('@/stores/auth', async () => {
    const m = await import('./helpers/mockServer');
    return m.buildAuthStoreMock();
});
vi.mock('@/api/csrf', async () => {
    const m = await import('./helpers/mockServer');
    return m.buildCsrfMock();
});

import { quotationsApi, quotationTemplatesApi } from '@/api/products';
import type { CreateQuotationDto } from '@/types';

const quotationPayload: CreateQuotationDto = {
    customerName: '测试客户有限公司',
    customerContact: '王经理',
    taxRate: 13,
    items: [
        {
            productSnapshot: { name: '联想 ThinkStation P620', model: 'P620', brandName: '联想' },
            quantity: 2,
            unitPrice: 25000,
            discount: 95,
        },
    ],
};

beforeEach(() => {
    resetSharedMocks();
    resetMockServer();
});

describe('报价单 API 端到端流程', () => {
    it('创建报价：POST 携带认证与 CSRF，明细快照透传', async () => {
        reply(201, { id: 'q1', code: 'BJ-2026-0001', totalAmount: 56500 });

        const res = await quotationsApi.create(quotationPayload);

        expect(res.data.code).toMatch(/^BJ/);
        const req = requests[0];
        expect(req).toMatchObject({ method: 'POST', url: '/quotations' });
        expect(req.data).toMatchObject({ customerName: '测试客户有限公司', taxRate: 13 });
        expect((req.data as CreateQuotationDto).items[0].productSnapshot).toMatchObject({ model: 'P620' });
        expect(req.headers.Authorization).toBe('Bearer test-access-token');
        expect(req.headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });

    it('列表筛选：status/customerName 以查询参数传递，GET 不带 CSRF', async () => {
        reply(200, { data: [{ id: 'q1' }], total: 1 });

        await quotationsApi.getAll({ page: 1, pageSize: 10, status: 'SENT', customerName: '测试客户' });

        expect(requests[0]).toMatchObject({ method: 'GET', url: '/quotations' });
        expect(requests[0].params).toEqual({
            page: 1,
            pageSize: 10,
            status: 'SENT',
            customerName: '测试客户',
        });
        expect(requests[0].headers['X-CSRF-Token']).toBeUndefined();
    });

    it('详情：GET /quotations/:id 不带 CSRF', async () => {
        reply(200, { id: 'q1', items: [{ productSnapshot: {} }] });
        await quotationsApi.getOne('q1');
        expect(requests[0]).toMatchObject({ method: 'GET', url: '/quotations/q1' });
        expect(requests[0].headers['X-CSRF-Token']).toBeUndefined();
    });

    it('新版本与版本组：创建走子资源，查询返回同组全部版本', async () => {
        reply(201, { id: 'q2', versionGroupId: 'vg1', version: 2 });
        await quotationsApi.createVersion('q1', { ...quotationPayload, remark: '调价 v2' });

        reply(200, [
            { id: 'q1', version: 1 },
            { id: 'q2', version: 2 },
        ]);
        const versions = await quotationsApi.getVersions('q1');

        expect(requests.map((r) => `${r.method} ${r.url}`)).toEqual([
            'POST /quotations/q1/versions',
            'GET /quotations/q1/versions',
        ]);
        expect(versions.data).toHaveLength(2);
        // 新版本的请求体携带更新后的备注
        expect(requests[0].data).toMatchObject({ remark: '调价 v2' });
    });

    it('状态流转：PATCH status 携带 CSRF 且请求体为 { status }', async () => {
        reply(200, { id: 'q1', status: 'SENT' });
        const res = await quotationsApi.updateStatus('q1', 'SENT');

        expect(res.data.status).toBe('SENT');
        expect(requests[0]).toMatchObject({
            method: 'PATCH',
            url: '/quotations/q1/status',
            data: { status: 'SENT' },
        });
        expect(requests[0].headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });

    it('删除：DELETE 携带 CSRF', async () => {
        reply(200, {});
        await quotationsApi.remove('q1');
        expect(requests[0]).toMatchObject({ method: 'DELETE', url: '/quotations/q1' });
        expect(requests[0].headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });

    it('导出 docx：POST + responseType blob + CSRF，可指定模板', async () => {
        setResponder(() => ({
            status: 200,
            data: new Blob(['docx-bytes']),
            headers: {},
        }));

        await quotationsApi.exportDocx('q1', { templateId: 'tpl1' });

        const req = requests[0];
        expect(req).toMatchObject({
            method: 'POST',
            url: '/quotations/q1/export-docx',
            responseType: 'blob',
        });
        expect(req.data).toEqual({ templateId: 'tpl1' });
        expect(req.headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });
});

describe('报价模板 API 端到端流程', () => {
    const columns = [
        { key: 'name', label: '产品名称', type: 'field', field: 'name', visible: true },
        { key: 'brandModel', label: '品牌型号', type: 'formula', formula: '{brand} {model}', visible: true },
    ];

    it('创建模板：config 列配置整体透传', async () => {
        reply(201, { id: 'tpl1', name: '标准模板' });
        const res = await quotationTemplatesApi.create({
            name: '标准模板',
            description: '默认导出列',
            config: { columns, title: '报价单' },
        } as Parameters<typeof quotationTemplatesApi.create>[0]);

        expect(res.data.id).toBe('tpl1');
        expect(requests[0]).toMatchObject({ method: 'POST', url: '/quotation-templates' });
        expect((requests[0].data as { config: { columns: unknown[] } }).config.columns).toHaveLength(2);
        expect(requests[0].headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });

    it('列表/默认模板/详情：均为 GET 且不带 CSRF', async () => {
        reply(200, [{ id: 'tpl1' }]);
        await quotationTemplatesApi.getAll();

        reply(200, { id: 'tpl9', isDefault: true });
        await quotationTemplatesApi.getDefault();

        reply(200, { id: 'tpl1' });
        await quotationTemplatesApi.getOne('tpl1');

        expect(requests.map((r) => r.url)).toEqual([
            '/quotation-templates',
            '/quotation-templates/default',
            '/quotation-templates/tpl1',
        ]);
        for (const r of requests) expect(r.headers['X-CSRF-Token']).toBeUndefined();
    });

    it('更新与删除：写请求携带 CSRF', async () => {
        reply(200, { id: 'tpl1', name: '改名模板' });
        await quotationTemplatesApi.update('tpl1', { name: '改名模板' });

        reply(200, {});
        await quotationTemplatesApi.remove('tpl1');

        expect(requests.map((r) => `${r.method} ${r.url}`)).toEqual([
            'PATCH /quotation-templates/tpl1',
            'DELETE /quotation-templates/tpl1',
        ]);
        for (const r of requests) expect(r.headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });
});
