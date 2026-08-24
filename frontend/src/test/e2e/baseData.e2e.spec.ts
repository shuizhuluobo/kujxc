/**
 * 基础数据模块 E2E 流程测试（vitest + jsdom）
 *
 * 覆盖 usersApi / rolesApi / customersApi / regionsApi / serviceTypesApi
 * 经过真实 api client 的 CRUD 调度、CSRF 与认证头规则。
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    requests,
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

import { usersApi, rolesApi, customersApi, regionsApi, serviceTypesApi } from '@/api';

beforeEach(() => {
    resetSharedMocks();
    resetMockServer();
});

describe('用户 API 端到端流程', () => {
    it('分页列表：GET 透传分页参数', async () => {
        reply(200, { data: [{ id: 'u1' }], total: 1 });

        await usersApi.getAll({ page: 1, pageSize: 10 });
        expect(requests[0]).toMatchObject({ method: 'GET', url: '/users' });
        expect(requests[0].params).toEqual({ page: 1, pageSize: 10 });
    });

    it('创建用户：POST 携带密码字段与 CSRF 头', async () => {
        reply(201, { id: 'u2', username: 'engineer1' });

        await usersApi.create({ username: 'engineer1', password: 'Init@12345', name: '工程师一号' });

        const req = requests[0];
        expect(req).toMatchObject({ method: 'POST', url: '/users' });
        expect(req.data).toMatchObject({ username: 'engineer1', password: 'Init@12345' });
        expect(req.headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });

    it('修改密码：PATCH /users/profile 相关端点携带 CSRF', async () => {
        reply(200, {});

        await usersApi.changePassword({ oldPassword: 'Old@12345', newPassword: 'New@12345' });

        const req = requests[0];
        expect(req).toMatchObject({ method: 'PATCH', url: '/users/password' });
        expect(req.data).toEqual({ oldPassword: 'Old@12345', newPassword: 'New@12345' });
        expect(req.headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });

    it('头像上传：multipart/form-data 且 FormData 携带文件', async () => {
        reply(201, { url: 'https://cdn.example.com/a.png' });

        const file = new File(['fake'], 'avatar.png', { type: 'image/png' });
        await usersApi.uploadAvatar(file);

        const req = requests[0];
        expect(req).toMatchObject({ method: 'POST', url: '/uploads/avatar' });
        expect(req.headers['Content-Type']).toBe('multipart/form-data');
        expect(req.data).toBeInstanceOf(FormData);
        expect((req.data as unknown as FormData).get('file')).toBeInstanceOf(File);
    });
});

describe('角色 / 客户 / 区域 / 服务类型 端到端流程', () => {
    it('角色：全量读取不带 CSRF，更新带 CSRF', async () => {
        reply(200, [{ id: 'role1', code: 'admin' }]);
        await rolesApi.getAll();

        reply(200, { id: 'role1', name: '管理员' });
        await rolesApi.update('role1', { name: '超级管理员' });

        expect(requests[0]).toMatchObject({ method: 'GET', url: '/roles' });
        expect(requests[0].headers['X-CSRF-Token']).toBeUndefined();
        expect(requests[1]).toMatchObject({
            method: 'PATCH',
            url: '/roles/role1',
            data: { name: '超级管理员' },
        });
        expect(requests[1].headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });

    it('客户 CRUD：URL 正确拼接资源 id', async () => {
        reply(201, { id: 'c1', name: '客户A' });
        await customersApi.create({ name: '客户A' });

        reply(200, { id: 'c1', name: '客户A-改' });
        await customersApi.update('c1', { name: '客户A-改' });

        reply(200, [{ id: 'c1' }]);
        await customersApi.getAll();

        reply(204, undefined);
        await customersApi.delete('c1');

        expect(requests.map((r) => `${r.method} ${r.url}`)).toEqual([
            'POST /customers',
            'PATCH /customers/c1',
            'GET /customers',
            'DELETE /customers/c1',
        ]);
        // 写操作带 CSRF，读操作不带
        for (const r of requests) {
            if (r.method === 'GET') continue;
            expect(r.headers['X-CSRF-Token']).toBe('mock-csrf-token');
        }
    });

    it('区域与服务类型：写请求均带认证与 CSRF', async () => {
        reply(201, { id: 'rg1' });
        await regionsApi.create({ name: '华南' });

        reply(201, { id: 'st1' });
        await serviceTypesApi.create({ name: '现场服务' });

        expect(requests[0]).toMatchObject({ method: 'POST', url: '/regions' });
        expect(requests[1]).toMatchObject({ method: 'POST', url: '/service-types' });
        for (const r of requests) {
            expect(r.headers.Authorization).toBe('Bearer test-access-token');
            expect(r.headers['X-CSRF-Token']).toBe('mock-csrf-token');
        }
    });
});
