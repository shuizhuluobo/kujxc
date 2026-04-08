import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth';
import { Capacitor } from '@capacitor/core';
import { getCsrfToken } from './csrf';

// 获取 API 基础地址
export function getBaseURL(): string {
    const isNative = Capacitor.isNativePlatform();
    const isDev = import.meta.env.DEV;

    // Capacitor App：使用完整的服务器地址
    if (isNative) {
        // 优先使用环境变量
        if (import.meta.env.VITE_API_URL) {
            if (isDev) console.log('[API] Using VITE_API_URL:', import.meta.env.VITE_API_URL);
            return import.meta.env.VITE_API_URL;
        }
        // 默认使用生产地址
        if (isDev) console.log('[API] Using default production URL');
        return 'https://your-api-domain.com/api';
    }

    // Web 环境：使用相对路径
    if (isDev) console.log('[API] Using relative path /api');
    return '/api';
}

// 获取文件基础地址（从 API 基础地址推导）
export function getFileBaseURL(): string {
    const apiBase = getBaseURL();
    if (apiBase.startsWith('http')) {
        return apiBase.replace(/\/api$/, '');
    }
    // Web 环境下如果是相对路径 /api，文件路径也应该是相对的（即空字符串）
    return '';
}

const baseURL = getBaseURL();
if (import.meta.env.DEV) {
    console.log('[API] Client Base URL:', baseURL, 'File Base URL:', getFileBaseURL(), 'Mode:', import.meta.env.MODE, 'Platform:', Capacitor.getPlatform());
}

const api: AxiosInstance = axios.create({
    baseURL,
    timeout: 30000, // 增加超时时间到 30 秒
    headers: {
        'Content-Type': 'application/json',
    },
    paramsSerializer: {
        serialize: (params) => {
            const searchParams = new URLSearchParams();
            for (const key in params) {
                const val = params[key];
                if (Array.isArray(val)) {
                    val.forEach(v => searchParams.append(key, v));
                } else if (val !== undefined && val !== null) {
                    searchParams.append(key, String(val));
                }
            }
            return searchParams.toString();
        }
    },
});

// 不需要 CSRF 保护的接口
const CSRF_EXCLUDED_PATHS = [
    '/auth/login',
    '/auth/refresh',
    '/security/csrf-token',
    '/fee/',
];

function shouldAddCsrf(config: InternalAxiosRequestConfig): boolean {
    const method = config.method?.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
        return false;
    }
    const url = config.url || '';
    return !CSRF_EXCLUDED_PATHS.some(path => url.includes(path));
}

// 请求拦截器 - 添加 token 和 CSRF token
api.interceptors.request.use(
    async (config) => {
        const authStore = useAuthStore();
        if (authStore.token) {
            config.headers.Authorization = `Bearer ${authStore.token}`;
        }

        // 为需要 CSRF 保护的请求添加 CSRF token
        if (shouldAddCsrf(config)) {
            try {
                const token = await getCsrfToken();
                config.headers['X-CSRF-Token'] = token;
            } catch (error) {
                console.warn('[API] Failed to get CSRF token:', error);
            }
        }

        // 开发环境调试日志
        if (import.meta.env.DEV) {
            console.log('[API Request]', config.method?.toUpperCase(), config.url);
        }

        return config;
    },
    (error) => {
        if (import.meta.env.DEV) {
            console.error('[API Request Error]', error);
        }
        return Promise.reject(error);
    }
);

// 响应拦截器 - 处理 token 过期
api.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV) {
            console.log('[API Response]', response.config.url, response.status);
        }
        return response;
    },
    async (error: AxiosError) => {
        // 开发环境详细错误日志
        if (import.meta.env.DEV) {
            console.error('[API Response Error] URL:', error.config?.url);
            console.error('[API Response Error] Status:', error.response?.status);
            console.error('[API Response Error] Data:', error.response?.data);
        }

        const authStore = useAuthStore();
        const config = error.config;

        // 如果是 401 错误，且不是登录或刷新 Token 接口
        if (error.response?.status === 401 && config && !config.url?.includes('/auth/login') && !config.url?.includes('/auth/refresh')) {
            // 尝试刷新 token
            try {
                await authStore.refreshToken();
                // 刷新成功后重试原请求
                return api.request(config);
            } catch (err) {
                // 刷新失败，强制退出
                authStore.logout();
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(err);
            }
        }

        // 如果刷新接口本身返回 401，立即登出，避免循环
        if (error.response?.status === 401 && config?.url?.includes('/auth/refresh')) {
            authStore.logout();
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
