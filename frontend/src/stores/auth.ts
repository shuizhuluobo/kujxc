import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, LoginDto, LoginResponse } from '@/types';
import { authApi, usersApi } from '@/api';
import { getCsrfToken } from '@/api/csrf';

// 安全地从localStorage解析JSON
function safeJSONParse<T>(value: string | null, defaultValue: T): T {
    if (!value) return defaultValue;
    try {
        return JSON.parse(value) as T;
    } catch {
        return defaultValue;
    }
}

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref<User | null>(safeJSONParse<User | null>(localStorage.getItem('user'), null));
    const token = ref<string | null>(localStorage.getItem('token'));
    const refreshTokenValue = ref<string | null>(localStorage.getItem('refreshToken'));
    const mustChangePassword = ref(false);
    const loading = ref(false);

    // Getters
    const isAuthenticated = computed(() => !!token.value && !!user.value);
    const isAdmin = computed(() => user.value?.role?.code === 'admin');
    const isEngineer = computed(() => user.value?.role?.code === 'engineer');
    const roleCode = computed(() => user.value?.role?.code);

    // Actions
    async function login(credentials: LoginDto) {
        loading.value = true;
        try {
            const response = await authApi.login(credentials);
            const { accessToken, refreshToken: newRefreshToken, user: userData, mustChangePassword: forceChange } = response.data as LoginResponse;

            token.value = accessToken;
            refreshTokenValue.value = newRefreshToken;
            user.value = userData;
            mustChangePassword.value = !!forceChange;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // 登录成功后立即获取 CSRF token
            await getCsrfToken();

            return true;
        } catch (error) {
            throw error;
        } finally {
            loading.value = false;
        }
    }

    let refreshPromise: Promise<void> | null = null;

    async function refreshToken() {
        if (!refreshTokenValue.value) {
            throw new Error('No refresh token');
        }

        if (refreshPromise) {
            return refreshPromise;
        }

        refreshPromise = (async () => {
            try {
                const response = await authApi.refresh(refreshTokenValue.value!);
                const { accessToken, refreshToken: newRefreshToken } = response.data;

                token.value = accessToken;
                refreshTokenValue.value = newRefreshToken;

                localStorage.setItem('token', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                // 刷新token后重新获取 CSRF token
                await getCsrfToken();
            } finally {
                refreshPromise = null;
            }
        })();

        return refreshPromise;
    }

    async function fetchProfile() {
        if (!token.value) return;

        try {
            const response = await usersApi.getProfile();
            user.value = response.data;
            localStorage.setItem('user', JSON.stringify(response.data));
        } catch {
            logout();
        }
    }

    function logout() {
        user.value = null;
        token.value = null;
        refreshTokenValue.value = null;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }

    // 初始化时获取用户信息和CSRF token
    if (token.value) {
        fetchProfile();
        getCsrfToken().catch(console.error);
    }

    return {
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isEngineer,
        roleCode,
        mustChangePassword,
        login,
        refreshToken,
        fetchProfile,
        logout,
    };
});
