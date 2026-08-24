/**
 * 认证流程 E2E 测试（vitest + jsdom）
 *
 * 覆盖 authApi（登录/刷新/资料）经过真实 api client 的端到端调度：
 * - 匿名接口（login/refresh）不得携带 Authorization 与 CSRF 头
 * - 业务接口 401 时刷新 token 并重试一次，仍失败则登出
 * - 刷新接口自身 401 时立即登出，避免循环
 */
import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest';
import {
    requests,
    setResponder,
    reply,
    resetMockServer,
    resetSharedMocks,
    httpError,
    refreshMock,
    logoutMock,
    stubWindowLocation,
    restoreWindowLocation,
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

import { authApi } from '@/api';

beforeAll(() => {
    stubWindowLocation();
});

afterAll(() => {
    restoreWindowLocation();
});

beforeEach(() => {
    resetSharedMocks();
    resetMockServer();
});

describe('认证 API 端到端流程', () => {
    it('登录：匿名请求，不携带 Authorization 与 CSRF', async () => {
        reply(200, {
            accessToken: 'access-1',
            refreshToken: 'refresh-1',
            user: { id: 'u1', username: 'admin' },
        });

        const res = await authApi.login({ username: 'admin', password: 'Admin@123' });
        expect(res.data.accessToken).toBe('access-1');

        expect(requests).toHaveLength(1);
        const req = requests[0];
        expect(req).toMatchObject({ method: 'POST', url: '/auth/login' });
        expect(req.data).toEqual({ username: 'admin', password: 'Admin@123' });
        expect(req.headers.Authorization).toBeUndefined();
        expect(req.headers['X-CSRF-Token']).toBeUndefined();
    });

    it('刷新 token：匿名请求且携带 refreshToken 请求体', async () => {
        reply(200, { accessToken: 'access-2', refreshToken: 'refresh-2' });

        await authApi.refresh('refresh-old');
        expect(requests[0]).toMatchObject({ method: 'POST', url: '/auth/refresh' });
        expect(requests[0].data).toEqual({ refreshToken: 'refresh-old' });
        expect(requests[0].headers.Authorization).toBeUndefined();
        expect(requests[0].headers['X-CSRF-Token']).toBeUndefined();
    });

    it('获取资料：携带 Authorization 但不携带 CSRF', async () => {
        reply(200, { id: 'u1', username: 'admin' });

        await authApi.getProfile();
        expect(requests[0]).toMatchObject({ method: 'GET', url: '/auth/profile' });
        expect(requests[0].headers.Authorization).toBe('Bearer test-access-token');
        expect(requests[0].headers['X-CSRF-Token']).toBeUndefined();
    });

    it('业务接口 401 且刷新失败：登出并抛错，不再重试', async () => {
        setResponder(() => {
            throw httpError(401, { message: 'Unauthorized' });
        });
        refreshMock.mockRejectedValue(new Error('refresh failed'));

        await expect(authApi.getProfile()).rejects.toThrow('refresh failed');
        expect(logoutMock).toHaveBeenCalledTimes(1);
        // 仅一次请求：刷新失败后不再重试
        expect(requests.filter((r) => r.url === '/auth/profile')).toHaveLength(1);
    });

    it('业务接口连续两次 401：重试一次后放弃并登出', async () => {
        const loc = stubWindowLocation();
        loc.href = 'http://localhost/dashboard';
        setResponder(() => {
            throw httpError(401, { message: 'Unauthorized' });
        });

        await expect(authApi.getProfile()).rejects.toThrow();
        expect(refreshMock).toHaveBeenCalledTimes(1);
        expect(logoutMock).toHaveBeenCalledTimes(1);
        expect(requests.filter((r) => r.url === '/auth/profile')).toHaveLength(2);
        // 重试仍失败后跳转登录页
        expect(loc.href).toBe('/login');
    });

    it('登录接口返回 401：不触发刷新与重试', async () => {
        setResponder(() => {
            throw httpError(401, { message: '用户名或密码错误' });
        });

        await expect(authApi.login({ username: 'admin', password: 'wrong' })).rejects.toThrow();
        expect(refreshMock).not.toHaveBeenCalled();
        expect(logoutMock).not.toHaveBeenCalled();
        expect(requests).toHaveLength(1);
    });

    it('刷新接口自身返回 401：立即登出且不进入刷新重试循环', async () => {
        setResponder(() => {
            throw httpError(401, { message: 'Invalid refresh token' });
        });

        await expect(authApi.refresh('bad-token')).rejects.toThrow();
        expect(logoutMock).toHaveBeenCalledTimes(1);
        expect(refreshMock).not.toHaveBeenCalled();
        expect(requests).toHaveLength(1);
    });
});
