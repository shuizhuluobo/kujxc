/**
 * 工单模块 E2E 流程测试（vitest + jsdom）
 *
 * 通过真实 api client（拦截器）+ workOrdersApi 覆盖工单全生命周期：
 * 创建 → 列表筛选 → 接单 → 取消接单 → 完成 → 统计/导出，
 * 以及写请求 CSRF 头、403 CSRF 失效自动刷新重试。
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    requests,
    setResponder,
    reply,
    resetMockServer,
    resetSharedMocks,
    httpError,
    clearCsrfTokenMock,
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

import { WorkOrderStatus } from '@/types';
import { workOrdersApi } from '@/api';

beforeEach(() => {
    resetSharedMocks();
    resetMockServer();
});

describe('工单 API 端到端流程', () => {
    it('创建工单：POST 携带认证与 CSRF，请求体透传', async () => {
        reply(201, { id: 'wo1', status: 'PENDING' });

        const res = await workOrdersApi.create({
            detail: '服务器硬盘告警',
            customerId: 'c1',
            regionId: 'r1',
            serviceTypeId: 's1',
        });

        expect(res.data.id).toBe('wo1');
        const req = requests[0];
        expect(req).toMatchObject({ method: 'POST', url: '/work-orders' });
        expect(req.data).toMatchObject({ detail: '服务器硬盘告警', customerId: 'c1' });
        expect(req.headers.Authorization).toBe('Bearer test-access-token');
        expect(req.headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });

    it('列表筛选：查询参数透传且 GET 不携带 CSRF', async () => {
        reply(200, { data: [{ id: 'wo1' }], total: 1, page: 2, pageSize: 20 });

        await workOrdersApi.getAll({ page: 2, pageSize: 20, status: WorkOrderStatus.RECEIVED });

        const req = requests[0];
        expect(req).toMatchObject({ method: 'GET', url: '/work-orders' });
        expect(req.params).toEqual({ page: 2, pageSize: 20, status: WorkOrderStatus.RECEIVED });
        expect(req.headers['X-CSRF-Token']).toBeUndefined();
    });

    it('待办工单：regionId 以查询参数传递', async () => {
        reply(200, [{ id: 'wo9' }]);

        await workOrdersApi.getPending('r1');

        expect(requests[0]).toMatchObject({ method: 'GET', url: '/work-orders/pending' });
        expect(requests[0].params).toEqual({ regionId: 'r1' });
    });

    it('完整生命周期：接单 → 取消 → 完成，写操作均带 CSRF', async () => {
        reply(200, { id: 'wo1', status: 'RECEIVED' });

        await workOrdersApi.receive('wo1');
        await workOrdersApi.cancelReceive('wo1');
        await workOrdersApi.complete('wo1', { repairFee: 300 });

        expect(requests.map((r) => `${r.method} ${r.url}`)).toEqual([
            'POST /work-orders/wo1/receive',
            'PATCH /work-orders/wo1/cancel-receive',
            'POST /work-orders/wo1/complete',
        ]);
        for (const r of requests) {
            expect(r.headers['X-CSRF-Token']).toBe('mock-csrf-token');
            expect(r.headers.Authorization).toBe('Bearer test-access-token');
        }
        // complete 的请求体透传
        expect(requests[2].data).toEqual({ repairFee: 300 });
    });

    it('删除与统计：DELETE 带 CSRF，GET 不带', async () => {
        reply(200, { pending: 1, received: 2, total: 3 });
        await workOrdersApi.getStats('r1');

        reply(204, undefined);
        await workOrdersApi.delete('wo1');

        expect(requests[0]).toMatchObject({ method: 'GET', url: '/work-orders/stats' });
        expect(requests[0].headers['X-CSRF-Token']).toBeUndefined();
        expect(requests[1]).toMatchObject({ method: 'DELETE', url: '/work-orders/wo1' });
        expect(requests[1].headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });

    it('导出：responseType 为 blob 且沿用筛选参数', async () => {
        setResponder(() => ({ status: 200, data: new Blob(['csv']), headers: {} }));

        await workOrdersApi.export({ status: WorkOrderStatus.COMPLETED });

        const req = requests[0];
        expect(req).toMatchObject({ method: 'GET', url: '/work-orders/export', responseType: 'blob' });
        expect(req.params).toEqual({ status: WorkOrderStatus.COMPLETED });
    });

    it('403 CSRF 失效：清除缓存并刷新 token 重试一次后成功', async () => {
        let call = 0;
        setResponder(() => {
            call += 1;
            if (call === 1) throw httpError(403, { message: 'CSRF token invalid' });
            return { status: 200, data: { id: 'wo1', status: 'RECEIVED' }, headers: {} };
        });

        const res = await workOrdersApi.receive('wo1');

        expect(res.data.status).toBe('RECEIVED');
        expect(call).toBe(2);
        expect(clearCsrfTokenMock).toHaveBeenCalledTimes(1);
        // 两次请求均携带 X-CSRF-Token（重试时使用刷新后的 token）
        expect(requests).toHaveLength(2);
        for (const r of requests) {
            expect(r.headers['X-CSRF-Token']).toBe('mock-csrf-token');
        }
    });

    it('403 非 CSRF 错误：直接抛出不重试', async () => {
        let call = 0;
        setResponder(() => {
            call += 1;
            throw httpError(403, { message: '没有权限执行该操作' });
        });

        await expect(workOrdersApi.complete('wo1')).rejects.toThrow();
        expect(call).toBe(1);
        expect(clearCsrfTokenMock).not.toHaveBeenCalled();
        expect(requests).toHaveLength(1);
    });
});
