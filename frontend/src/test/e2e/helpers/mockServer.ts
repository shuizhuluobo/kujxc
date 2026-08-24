/**
 * E2E 套件共享的 axios mock 基础设施。
 *
 * 用法（在每个 e2e spec 文件中，静态导入须置于其它业务模块之前）：
 *
 *   import { refreshMock, logoutMock, setResponder, requests, resetMockServer, httpError } from './helpers/mockServer';
 *   vi.mock('axios', async () => { const m = await import('./helpers/mockServer'); return m.buildAxiosMock(); });
 *   vi.mock('@/stores/auth', async () => { const m = await import('./helpers/mockServer'); return m.buildAuthStoreMock(); });
 *   vi.mock('@/api/csrf', async () => { const m = await import('./helpers/mockServer'); return m.buildCsrfMock(); });
 *
 * 模拟真实 axios：请求配置经过 client.ts 注册的请求拦截器（注入 Authorization / X-CSRF-Token），
 * 响应经过响应拦截器（401 刷新重试、403 CSRF 刷新重试、错误透传）。
 *
 * 注意：本文件刻意模拟 axios 内部的动态行为（config 透传、拦截器链、错误对象挂载），
 * 因此在 dispatch/buildAxiosMock 局部放宽了类型安全的 lint 规则；对外导出的 API 保持强类型。
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { vi } from 'vitest';

export interface RecordedRequest {
    method: string;
    url: string;
    headers: Record<string, unknown>;
    data?: unknown;
    params?: unknown;
    responseType?: string;
}

export interface MockResponse {
    status?: number;
    data?: unknown;
    headers?: Record<string, unknown>;
}

type Responder = (req: RecordedRequest) => MockResponse | Promise<MockResponse>;

interface MockState {
    requestInterceptors: Array<(config: any) => Promise<any> | any>;
    responseOk: Array<(response: any) => Promise<any> | any>;
    responseErr: Array<(error: any) => Promise<any> | any>;
    instanceConfig: Record<string, unknown>;
    responder: Responder;
}

const state: MockState = {
    requestInterceptors: [],
    responseOk: [],
    responseErr: [],
    instanceConfig: {},
    responder: () => ({ status: 200, data: {}, headers: {} }),
};

/** 服务端视角的请求记录（经过请求拦截器之后，含重试产生的重复请求），供断言使用 */
export const requests: RecordedRequest[] = [];

/** 替换当前"服务端"响应逻辑 */
export function setResponder(responder: Responder): void {
    state.responder = responder;
}

/** 固定响应快捷方式 */
export function reply(status: number, data: unknown): void {
    setResponder(() => ({ status, data, headers: {} }));
}

/** 清空请求记录；注意不要清空拦截器数组——client.ts 仅在模块加载时注册一次 */
export function resetMockServer(): void {
    requests.length = 0;
    setResponder(() => ({ status: 200, data: {}, headers: {} }));
}

/** 构造与 axios 一致的错误对象（响应拦截器依赖 error.response；error.config 由 dispatch 统一挂载） */
export interface HttpError extends Error {
    response: { status: number; data: unknown; headers: Record<string, unknown> };
    config?: Record<string, unknown>;
}

export function httpError(status: number, data: unknown): HttpError {
    const err = new Error(`Request failed with status code ${status}`) as HttpError;
    err.response = { status, data, headers: {} };
    return err;
}

async function dispatch(url: string, cfg: Record<string, unknown> | undefined, method: string): Promise<any> {
    // 模拟 axios：请求配置始终带有 headers 对象（即使调用方未显式传）
    const config: Record<string, any> = {
        ...(cfg || {}),
        url,
        method: method.toLowerCase(),
        headers: { ...(cfg?.headers as Record<string, unknown> | undefined) },
    };
    let runConfig = config;
    for (const fn of state.requestInterceptors) {
        runConfig = (await fn(runConfig)) ?? runConfig;
    }

    const recorded: RecordedRequest = {
        method: method.toUpperCase(),
        url,
        headers: runConfig.headers,
        data: runConfig.data,
        params: runConfig.params,
        responseType: runConfig.responseType,
    };
    requests.push(recorded);

    try {
        const raw = await state.responder(recorded);
        // 模拟 axios 响应体结构（含 config，便于响应拦截器读取 response.config.url）
        const res = { status: 200, data: {}, headers: {}, ...raw, config: runConfig };
        let out = res;
        for (const fn of state.responseOk) {
            out = (await fn(out)) ?? out;
        }
        return out;
    } catch (err: any) {
        // 与 axios 一致：错误对象始终挂载真实请求配置（含 _retryCount 等重试状态），
        // 保证 401/403 重试逻辑在多次嵌套重试间正确传递状态。
        err.config = runConfig;
        let e = err;
        for (const fn of state.responseErr) {
            try {
                e = await fn(e);
                return e;
            } catch (e2) {
                e = e2;
            }
        }
        throw e;
    }
}

/** vi.mock('axios', ...) 的工厂 */
export function buildAxiosMock() {
    const create = (config: Record<string, unknown>) => {
        state.instanceConfig = config;
        const instance: Record<string, any> = {
            defaults: config,
            interceptors: {
                request: { use: (fn: any) => state.requestInterceptors.push(fn) },
                response: {
                    use: (ok: any, err: any) => {
                        state.responseOk.push(ok);
                        state.responseErr.push(err);
                    },
                },
            },
            get: (url: string, cfg?: Record<string, unknown>) => dispatch(url, cfg, 'GET'),
            post: (url: string, body?: unknown, cfg?: Record<string, unknown>) =>
                dispatch(url, { ...cfg, data: body }, 'POST'),
            patch: (url: string, body?: unknown, cfg?: Record<string, unknown>) =>
                dispatch(url, { ...cfg, data: body }, 'PATCH'),
            put: (url: string, body?: unknown, cfg?: Record<string, unknown>) =>
                dispatch(url, { ...cfg, data: body }, 'PUT'),
            delete: (url: string, cfg?: Record<string, unknown>) => dispatch(url, cfg, 'DELETE'),
            request: (cfg: { url?: string; method?: string }) =>
                dispatch(cfg.url as string, cfg, (cfg.method || 'GET').toUpperCase()),
        };
        return instance;
    };
    const axios = { create };
    return { default: axios, ...axios };
}

/** 认证 store 的 mock：固定 token + 可断言的 refreshToken/logout */
export const refreshMock = vi.fn();
export const logoutMock = vi.fn();

/** CSRF 模块 mock：固定 token，clearToken 可断言 */
export const clearCsrfTokenMock = vi.fn();

/** 每个 spec 的 beforeEach 调用：重置共享 mock 并恢复默认实现 */
export function resetSharedMocks(): void {
    for (const m of [refreshMock, logoutMock, clearCsrfTokenMock]) {
        m.mockReset();
    }
    // 默认：刷新 token 成功
    refreshMock.mockResolvedValue({ accessToken: 'refreshed-token' });
}

export function buildAuthStoreMock() {
    return {
        useAuthStore: () => ({
            token: 'test-access-token',
            refreshToken: refreshMock,
            logout: logoutMock,
        }),
    };
}

export function buildCsrfMock() {
    return {
        getCsrfToken: () => Promise.resolve('mock-csrf-token'),
        clearToken: clearCsrfTokenMock,
    };
}

/**
 * 用纯对象替换 window.location，避免 jsdom 的导航实现
 * （在拦截器异步链中触发会导致 worker 挂起/崩溃）。
 * 替换后可读取 window.location.href 断言跳转目标。
 */
let originalLocation: Location | undefined;

interface LocationStub {
    href: string;
    pathname: string;
    assign: (url: string) => void;
    replace: (url: string) => void;
}

export function stubWindowLocation(): LocationStub {
    if (!originalLocation) originalLocation = window.location;
    const stub: LocationStub = {
        href: 'http://localhost/',
        pathname: '/',
        assign: vi.fn(),
        replace: vi.fn(),
    };
    Object.defineProperty(window, 'location', { configurable: true, value: stub });
    return stub;
}

export function restoreWindowLocation(): void {
    if (originalLocation) {
        Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
        originalLocation = undefined;
    }
}
