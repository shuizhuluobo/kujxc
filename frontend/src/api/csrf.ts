import { ref } from 'vue';
import api from './client';

const CSRF_TOKEN_TTL = 23 * 60 * 60 * 1000;

const csrfToken = ref<string | null>(null);
let tokenTimestamp: number = 0;
let fetchPromise: Promise<string> | null = null;

function isTokenExpired(): boolean {
    if (!csrfToken.value) return true;
    return Date.now() - tokenTimestamp > CSRF_TOKEN_TTL;
}

export function useCsrf() {
    async function fetchCsrfToken(): Promise<string> {
        if (fetchPromise) {
            return fetchPromise;
        }

        fetchPromise = (async () => {
            try {
                const response = await api.get('/security/csrf-token');
                const token: string = response.data.token;
                csrfToken.value = token;
                tokenTimestamp = Date.now();
                return token;
            } catch (error) {
                console.error('[CSRF] Failed to fetch token:', error);
                csrfToken.value = null;
                tokenTimestamp = 0;
                throw error;
            } finally {
                fetchPromise = null;
            }
        })();

        return fetchPromise;
    }

    function getToken(): string | null {
        return csrfToken.value;
    }

    function clearToken(): void {
        csrfToken.value = null;
        tokenTimestamp = 0;
    }

    return {
        fetchCsrfToken,
        getToken,
        clearToken,
    };
}

const { fetchCsrfToken, getToken, clearToken } = useCsrf();

export async function getCsrfToken(): Promise<string> {
    if (getToken() && !isTokenExpired()) {
        return getToken()!;
    }
    return fetchCsrfToken();
}

export { clearToken };
