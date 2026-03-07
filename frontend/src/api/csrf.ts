import { ref } from 'vue';
import api from './client';

const csrfToken = ref<string | null>(null);
let fetchPromise: Promise<string> | null = null;

export function useCsrf() {
    async function fetchCsrfToken(): Promise<string> {
        if (fetchPromise) {
            return fetchPromise;
        }

        fetchPromise = (async () => {
            try {
                const response = await api.get('/security/csrf-token');
                csrfToken.value = response.data.token;
                return csrfToken.value;
            } catch (error) {
                console.error('[CSRF] Failed to fetch token:', error);
                csrfToken.value = null;
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
    }

    return {
        fetchCsrfToken,
        getToken,
        clearToken,
    };
}

const { fetchCsrfToken, getToken, clearToken } = useCsrf();

export async function getCsrfToken(): Promise<string> {
    if (getToken()) {
        return getToken()!;
    }
    return fetchCsrfToken();
}

export { clearToken };
