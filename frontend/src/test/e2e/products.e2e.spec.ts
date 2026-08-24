/**
 * 前端产品库 E2E 流程测试（vitest + jsdom）
 *
 * 不依赖真实后端：通过 mock axios 实例模拟服务端响应，
 * 重点验证 api client 拦截器（认证头、CSRF 头、401 刷新重试、错误透传）
 * 与产品库各 API 封装函数的端到端调度是否正确。
 *
 * 运行：pnpm --filter frontend test:e2e
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    requests,
    setResponder,
    reply,
    resetMockServer,
    resetSharedMocks,
    httpError,
    refreshMock,
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

import type { ProductFilterParams } from '@/types';
import {
    productsApi,
    brandsApi,
    categoriesApi,
    productTagsApi,
    productUploadsApi,
    settingsApi,
} from '@/api/products';

beforeEach(() => {
    resetSharedMocks();
    resetMockServer();
});

describe('产品库 API 端到端流程', () => {
    it('创建产品：写请求携带 Authorization 与 X-CSRF-Token', async () => {
        setResponder(() => ({ status: 201, data: { id: 'p1', name: '测试产品', code: 'LX0001' }, headers: {} }));

        const res = await productsApi.create({ name: '测试产品', unit: '台', brandId: 'b1', categoryId: 'c1' });
        expect(res.data.id).toBe('p1');
        expect(requests).toHaveLength(1);
        expect(requests[0].method).toBe('POST');
        expect(requests[0].url).toBe('/products');
        expect(requests[0].headers.Authorization).toBe('Bearer test-access-token');
        expect(requests[0].headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });

    it('列表产品：GET 不携带 CSRF，仅携带 Authorization', async () => {
        reply(200, { data: [{ id: 'p1' }], total: 1 });

        const res = await productsApi.getAll({ page: 1, pageSize: 10 });
        expect(res.data.data.length).toBe(1);
        expect(requests[0].headers.Authorization).toBe('Bearer test-access-token');
        expect(requests[0].headers['X-CSRF-Token']).toBeUndefined();
        expect(requests[0].params).toEqual({ page: 1, pageSize: 10 });
    });

    it('401 触发 token 刷新并重试一次', async () => {
        let call = 0;
        setResponder(() => {
            call += 1;
            if (call === 1) throw httpError(401, { message: 'Unauthorized' });
            return { status: 200, data: { data: [{ id: 'p1' }] }, headers: {} };
        });

        const res = await productsApi.getAll();
        expect(res.data.data.length).toBe(1);
        expect(call).toBe(2);
        expect(refreshMock).toHaveBeenCalledTimes(1);
    });

    it('400 校验错误：错误信息透传抛出', async () => {
        setResponder(() => {
            throw httpError(400, { message: '名称不能为空', error: 'Bad Request' });
        });
        // 缺少必填字段 brandId/categoryId，由服务端校验返回 400
        await expect(
            productsApi.create({ name: '缺品牌产品', unit: '台' } as unknown as Parameters<typeof productsApi.create>[0]),
        ).rejects.toThrow();
    });

    it('品牌/分类/标签 写请求均携带 CSRF', async () => {
        reply(201, { id: 'x' });
        await brandsApi.create({ name: '联想' });
        await categoriesApi.create({ name: '服务器' });
        await productTagsApi.create({ name: '热销' });
        expect(requests.map((r) => r.url)).toEqual(['/brands', '/categories', '/product-tags']);
        for (const r of requests) {
            expect(r.headers['X-CSRF-Token']).toBe('mock-csrf-token');
            expect(r.headers.Authorization).toBe('Bearer test-access-token');
        }
    });

    it('删除请求使用 DELETE 方法且携带 CSRF', async () => {
        reply(204, undefined);
        await productsApi.remove('p1');
        expect(requests[0]).toMatchObject({ method: 'DELETE', url: '/products/p1' });
        expect(requests[0].headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });
});

describe('产品库其余端点', () => {
    beforeEach(() => {
        resetSharedMocks();
        resetMockServer();
    });

    it('详情/更新：URL 拼接资源 id，PATCH 携带 CSRF', async () => {
        reply(200, { id: 'p1', name: '测试产品' });
        await productsApi.getOne('p1');

        reply(200, { id: 'p1', salePrice: 999 });
        await productsApi.update('p1', { salePrice: 999 });

        expect(requests[0]).toMatchObject({ method: 'GET', url: '/products/p1' });
        expect(requests[1]).toMatchObject({
            method: 'PATCH',
            url: '/products/p1',
            data: { salePrice: 999 },
        });
        expect(requests[1].headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });

    it('批量操作：batchStatus / batchDelete 走 PATCH 且请求体携带 ids', async () => {
        reply(200, { updated: 2 });
        await productsApi.batchStatus({ ids: ['p1', 'p2'], status: 'INACTIVE' });

        reply(200, { deleted: 1 });
        await productsApi.batchDelete({ ids: ['p3'] });

        expect(requests.map((r) => `${r.method} ${r.url}`)).toEqual([
            'PATCH /products/batch/status',
            'PATCH /products/batch/delete',
        ]);
        expect(requests[0].data).toEqual({ ids: ['p1', 'p2'], status: 'INACTIVE' });
        expect(requests[1].data).toEqual({ ids: ['p3'] });
    });

    it('收藏与浏览记录：POST 子资源端点且带 CSRF', async () => {
        reply(200, { isFavorite: true });
        const fav = await productsApi.toggleFavorite('p1');
        reply(200, {});
        await productsApi.recordView('p2');

        expect(fav.data.isFavorite).toBe(true);
        expect(requests.map((r) => `${r.method} ${r.url}`)).toEqual([
            'POST /products/p1/favorite',
            'POST /products/p2/view',
        ]);
        for (const r of requests) expect(r.headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });

    it('变更历史：GET 不带 CSRF', async () => {
        reply(200, [{ id: 'log1' }]);
        await productsApi.getChangeLogs('p1');
        expect(requests[0]).toMatchObject({
            method: 'GET',
            url: '/products/p1/change-logs',
        });
        expect(requests[0].headers['X-CSRF-Token']).toBeUndefined();
    });

    it('导出列表：responseType 为 blob 且沿用筛选参数', async () => {
        setResponder(() => ({ status: 200, data: new Blob(['xlsx']), headers: {} }));

        await productsApi.exportList({ keyword: '服务器' } as ProductFilterParams);

        expect(requests[0]).toMatchObject({
            method: 'GET',
            url: '/products/export',
            responseType: 'blob',
        });
        expect(requests[0].params).toEqual({ keyword: '服务器' });
    });

    it('图片/证书上传：multipart/form-data 且 FormData 携带文件', async () => {
        reply(201, { url: 'https://cdn.example.com/p.png' });
        const file = new File(['img'], 'p.png', { type: 'image/png' });
        await productUploadsApi.uploadProductImage(file);

        reply(201, { filename: 'cert.pdf', url: 'https://cdn.example.com/c.pdf', size: 3, mimeType: 'application/pdf' });
        await productUploadsApi.uploadProductCertificate(file);

        for (const req of requests) {
            expect(req.method).toBe('POST');
            expect(req.headers['Content-Type']).toBe('multipart/form-data');
            expect(req.data).toBeInstanceOf(FormData);
        }
        expect(requests.map((r) => r.url)).toEqual([
            '/uploads/product/image',
            '/uploads/product/certificate',
        ]);
    });

    it('系统设置：GET 返回配置，PATCH 更新携带 CSRF', async () => {
        reply(200, { staleThresholdDays: 30 });
        await settingsApi.get('staleThresholdDays');

        reply(200, { staleThresholdDays: 60 });
        await settingsApi.update('staleThresholdDays', 60);

        expect(requests[0]).toMatchObject({
            method: 'GET',
            url: '/settings/staleThresholdDays',
        });
        expect(requests[1]).toMatchObject({
            method: 'PATCH',
            url: '/settings/staleThresholdDays',
            data: { value: 60 },
        });
        expect(requests[1].headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });
});
