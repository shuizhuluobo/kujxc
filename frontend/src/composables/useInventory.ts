import { ref, reactive, computed } from 'vue';
import { usePermission } from '@/composables/usePermission';
import type { PaginatedResponse } from '@/types';

/**
 * 分页/搜索/权限 共享包装
 * 抽离 ProductsView/CustomersView 重复的分页、搜索、hasPermission 逻辑
 * 复用示例：StockQueryView / InventoryBatchView / SuppliersView
 */
export interface UsePaginatedListOptions<T, P extends { page?: number; pageSize?: number; keyword?: string }> {
    fetchFn: (params: P) => Promise<{ data: PaginatedResponse<T> } | { data: { data: T[]; total: number; page: number; pageSize: number } }>;
    defaultPageSize?: number;
    defaultParams?: Partial<P>;
}

export function usePaginatedList<T, P extends { page?: number; pageSize?: number; keyword?: string }>(
    opts: UsePaginatedListOptions<T, P>,
) {
    const loading = ref(false);
    const data = ref<T[]>([]) as import('vue').Ref<T[]>;
    const total = ref(0);
    const keyword = ref('');
    const pagination = reactive({ page: 1, pageSize: opts.defaultPageSize ?? 20 });
    const extraParams = reactive<Partial<P>>(opts.defaultParams ?? {} as Partial<P>);

    let seq = 0;

    async function fetchData() {
        const cur = ++seq;
        loading.value = true;
        try {
            const params = {
                ...extraParams,
                page: pagination.page,
                pageSize: pagination.pageSize,
                keyword: (keyword.value || undefined) as string | undefined,
            } as P;
            const res = await opts.fetchFn(params);
            // 兼容 axios 包装 { data: PaginatedResponse } 或直接 { data, total }
            const payload = (res as { data: PaginatedResponse<T> }).data;
            // axios: res.data 是 PaginatedResponse
            // 若 payload 有 data 数组，则为 PaginatedResponse
            if (payload && Array.isArray((payload as unknown as { data: unknown }).data)) {
                const p = payload as PaginatedResponse<T>;
                if (cur !== seq) return;
                data.value = p.data;
                total.value = p.total;
                // 同步服务端返回的分页（后端可能纠正）
                pagination.page = p.page;
                pagination.pageSize = p.pageSize;
            } else {
                // fallback: 假设 res.data 本身是数组
                const alt = res as unknown as { data: T[]; total: number };
                if (cur !== seq) return;
                data.value = alt.data;
                total.value = alt.total;
            }
        } finally {
            if (cur === seq) loading.value = false;
        }
    }

    function handleSearch() {
        pagination.page = 1;
        void fetchData();
    }

    function handlePageChange(page: number) {
        pagination.page = page;
        void fetchData();
    }

    function handleSizeChange(size: number) {
        pagination.pageSize = size;
        pagination.page = 1;
        void fetchData();
    }

    const hasData = computed(() => data.value.length > 0);

    return {
        loading,
        data,
        total,
        keyword,
        pagination,
        extraParams,
        hasData,
        fetchData,
        handleSearch,
        handlePageChange,
        handleSizeChange,
    };
}

/**
 * 进销存权限包装：在组件中直接 has('inventory:view') / has('supplier:manage') 等
 * 复用 hasPermission 逻辑，避免每个视图重复引入 useAuthStore
 */
export function useInventoryPermission() {
    const { has, hasAny, hasAll } = usePermission();

    const canViewInventory = computed(() => has('inventory:view'));
    const canCreateInventory = computed(() => has('inventory:create'));
    const canManageSupplier = computed(() => hasAny(['supplier:manage', 'supplier:*', 'supplier:list', 'supplier:view']));
    const canManageWarehouse = computed(() => hasAny(['warehouse:manage', 'warehouse:*']));
    const canManageBorrow = computed(() => hasAny(['borrow:manage', 'borrow:*']));

    return {
        has,
        hasAny,
        hasAll,
        canViewInventory,
        canCreateInventory,
        canManageSupplier,
        canManageWarehouse,
        canManageBorrow,
    };
}
