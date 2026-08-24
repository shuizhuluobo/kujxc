/**
 * 项目费用与绩效模块 E2E 流程测试（vitest + jsdom）
 *
 * 覆盖 feeApi（收费标准/计算/记录/统计）与 performanceApi
 * （项目、工时记录批量录入、设备、全局统计、导出、公物仓记录）
 * 经过真实 api client 的端到端调度与安全头规则。
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

import { CalculationType } from '@/types';
import { feeApi, performanceApi } from '@/api';

beforeEach(() => {
    resetSharedMocks();
    resetMockServer();
});

describe('费用计算 API 端到端流程', () => {
    it('收费标准：按分类过滤读取，更新走 PUT 且带 CSRF', async () => {
        reply(200, [{ id: 'fs1', item: '硬盘更换', price: 300 }]);
        await feeApi.getSettings('hardware', true);

        reply(200, { id: 'fs1', price: 350 });
        await feeApi.updateSetting('fs1', { price: 350 });

        expect(requests[0]).toMatchObject({ method: 'GET', url: '/fee/settings' });
        expect(requests[0].params).toEqual({ category: 'hardware', isActive: true });
        expect(requests[1]).toMatchObject({
            method: 'PUT',
            url: '/fee/settings/fs1',
            data: { price: 350 },
        });
        expect(requests[1].headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });

    it('费用试算：POST 请求体携带明细行', async () => {
        reply(200, {
            items: [{ category: 'hardware', item: '硬盘更换', quantity: 2, unitPrice: 350, total: 700 }],
            subtotal: 700,
            discount: 0,
            actualAmount: 700,
        });

        const res = await feeApi.calculate([
            { category: 'hardware', item: '硬盘更换', quantity: 2 },
        ]);

        expect(res.data.actualAmount).toBe(700);
        expect(requests[0]).toMatchObject({ method: 'POST', url: '/fee/calculate' });
        expect(requests[0].data).toEqual({
            items: [{ category: 'hardware', item: '硬盘更换', quantity: 2 }],
        });
    });

    it('保存与查询记录：写入带 CSRF，查询透传时间范围', async () => {
        reply(201, { id: 'fr1', actualAmount: 700 });
        await feeApi.saveRecord({
            items: [{ category: 'hardware', item: '硬盘更换', quantity: 2, unitPrice: 350, total: 700 }],
            subtotal: 700,
            discount: 0,
            actualAmount: 700,
            customerId: 'c1',
        });

        reply(200, { data: [{ id: 'fr1' }], total: 1 });
        await feeApi.getRecords({ startDate: '2026-01-01', endDate: '2026-08-23' });

        expect(requests[0].headers['X-CSRF-Token']).toBe('mock-csrf-token');
        expect(requests[1]).toMatchObject({ method: 'GET', url: '/fee/records' });
        expect(requests[1].params).toEqual({ startDate: '2026-01-01', endDate: '2026-08-23' });
    });

    it('统计与初始化：GET 统计不带 CSRF，POST 初始化带 CSRF', async () => {
        reply(200, { totalRecords: 3, totalAmount: 2100, totalDiscount: 0, totalActual: 2100, byCategory: {} });
        await feeApi.getStats({ startDate: '2026-08-01' });

        reply(200, {});
        await feeApi.initSettings();

        expect(requests[0]).toMatchObject({ method: 'GET', url: '/fee/stats' });
        expect(requests[0].headers['X-CSRF-Token']).toBeUndefined();
        expect(requests[1]).toMatchObject({ method: 'POST', url: '/fee/settings/init' });
        expect(requests[1].headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });
});

describe('绩效 API 端到端流程', () => {
    it('项目生命周期：创建 → 更新 → 查询 → 导出 blob', async () => {
        reply(201, { id: 'p1', projectName: 'A项目巡检' });
        await performanceApi.createProject({ projectName: 'A项目巡检', calculationType: CalculationType.QUANTITY, dailyPrice: 800 });

        reply(200, { id: 'p1', projectName: 'A项目巡检 v2' });
        await performanceApi.updateProject('p1', { projectName: 'A项目巡检 v2', dailyPrice: 900 });

        reply(200, [{ id: 'p1' }]);
        await performanceApi.getProjects();

        setResponder(() => ({ status: 200, data: new Blob(['xlsx']), headers: {} }));
        await performanceApi.exportProject('p1');

        expect(requests.map((r) => `${r.method} ${r.url}`)).toEqual([
            'POST /performance/projects',
            'PATCH /performance/projects/p1',
            'GET /performance/projects',
            'GET /performance/projects/p1/export',
        ]);
        expect(requests[3].responseType).toBe('blob');
    });

    it('批量工时录入：POST batch 并返回 applied/skipped 汇总', async () => {
        reply(200, {
            created: [{ id: 'wr1' }],
            summary: { recorded: 3, applied: 2, skipped: 1 },
        });

        const res = await performanceApi.createRecords('p1', {
            deviceId: 'd1',
            entries: [{ stageId: 'st1', quantity: 2 }],
            date: '2026-08-20',
            collaboratorIds: [],
            includeRecorder: true,
        });

        expect(res.data.summary.applied).toBe(2);
        expect(requests[0]).toMatchObject({
            method: 'POST',
            url: '/performance/projects/p1/records/batch',
        });
        expect(requests[0].headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });

    it('设备管理：项目下创建走子资源，修改/删除走 devices 根路径', async () => {
        reply(201, { id: 'd1', deviceName: '核心交换机' });
        await performanceApi.createDevice('p1', { customerId: 'c1', deviceName: '核心交换机', expectedQuantity: 4 });

        reply(200, { id: 'd1', expectedQuantity: 6 });
        await performanceApi.updateDevice('d1', { expectedQuantity: 6 });

        reply(204, undefined);
        await performanceApi.deleteDevice('d1');

        expect(requests.map((r) => `${r.method} ${r.url}`)).toEqual([
            'POST /performance/projects/p1/devices',
            'PATCH /performance/devices/d1',
            'DELETE /performance/devices/d1',
        ]);
    });

    it('全局统计与多项目导出：ids 以逗号拼接传参', async () => {
        reply(200, [{ userId: 'u1', total: 12 }]);
        await performanceApi.getGlobalStats({ startDate: '2026-08-01', userId: 'u1' });

        setResponder(() => ({ status: 200, data: new Blob(['zip']), headers: {} }));
        await performanceApi.exportProjects(['p1', 'p2']);

        expect(requests[0].params).toEqual({ startDate: '2026-08-01', userId: 'u1' });
        expect(requests[1]).toMatchObject({
            method: 'GET',
            url: '/performance/projects/export',
            responseType: 'blob',
        });
        expect(requests[1].params).toEqual({ ids: 'p1,p2' });
    });

    it('公物仓费用记录：独立于项目的读写删除', async () => {
        reply(200, [{ id: 'wf1' }]);
        await performanceApi.getWarehouseFeeRecords();

        reply(201, { id: 'wf1', actualAmount: 120 });
        await performanceApi.saveWarehouseFeeRecord({
            items: [], subtotal: 120, discount: 0, actualAmount: 120,
        });

        reply(204, undefined);
        await performanceApi.deleteWarehouseFeeRecord('wf1');

        expect(requests.map((r) => `${r.method} ${r.url}`)).toEqual([
            'GET /performance/warehouse/fee-records',
            'POST /performance/warehouse/fee-records',
            'DELETE /performance/warehouse/fee-records/wf1',
        ]);
    });
});
