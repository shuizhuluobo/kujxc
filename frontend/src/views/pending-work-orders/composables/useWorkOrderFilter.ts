import { reactive, ref, watch } from 'vue';
import { match } from 'pinyin-pro';
import { ElMessage } from 'element-plus';
import type { WorkOrder, WorkOrderStatus } from '@/types';
import { workOrdersApi } from '@/api';
import { useAuthStore } from '@/stores/auth';
import { useResponsive } from '@/composables';

export function useWorkOrderFilter() {
    const authStore = useAuthStore();
    const { isMobile } = useResponsive();

    const loading = ref(false);
    const allWorkOrders = ref<WorkOrder[]>([]); // Store all fetched data
    const workOrders = ref<WorkOrder[]>([]); // Displayed (paginated) data

    const filter = reactive({
        status: '' as WorkOrderStatus | '',
        regionId: authStore.roleCode === 'admin' ? '' : (authStore.user?.regionId || ''),
        serviceTypeId: '',
        keyword: '',
    });

    const stats = reactive({
        pending: 0,
        received: 0,
        total: 0,
    });

    // Pagination state
    const pagination = reactive({
        page: 1,
        pageSize: 20,
        total: 0,
    });

    // Client-side filtering and pagination
    function applyFiltersAndPagination() {
        let result = allWorkOrders.value;

        // 1. Filter by Region (double check)
        if (filter.regionId) {
            result = result.filter((wo: WorkOrder) => wo.regionId === filter.regionId);
        }

        // 2. Filter by Status
        if (filter.status) {
            result = result.filter((wo: WorkOrder) => wo.status === filter.status);
        }

        // 3. Filter by Service Type
        if (filter.serviceTypeId) {
            result = result.filter((wo: WorkOrder) => wo.serviceTypeId === filter.serviceTypeId);
        }

        // 4. Keyword Filter (Pinyin)
        if (filter.keyword) {
            const query = filter.keyword.toLowerCase();
            result = result.filter((wo: WorkOrder) => {
                // Match Customer Name or Short Name
                if (wo.customer?.name && (
                    wo.customer.name.toLowerCase().includes(query) ||
                    match(wo.customer.name, query, { precision: 'start' })
                )) return true;
                if (wo.customer?.shortName && (
                    wo.customer.shortName.toLowerCase().includes(query) ||
                    match(wo.customer.shortName, query, { precision: 'start' })
                )) return true;

                // Match Detail
                if (wo.detail.toLowerCase().includes(query)) return true;

                // Match Creator
                if (wo.creator?.name && (
                    wo.creator.name.toLowerCase().includes(query) ||
                    match(wo.creator.name, query, { precision: 'start' })
                )) return true;

                return false;
            });
        }

        pagination.total = result.length;

        // 5. Pagination
        const start = isMobile.value ? 0 : (pagination.page - 1) * pagination.pageSize;
        const end = isMobile.value ? pagination.page * pagination.pageSize : start + pagination.pageSize;
        workOrders.value = result.slice(start, end);
    }

    async function fetchStats() {
        try {
            const { data } = await workOrdersApi.getStats(filter.regionId);
            stats.pending = data.pending;
            stats.received = data.received;
            stats.total = data.total;
        } catch {
            // Silently fail or log
        }
    }

    async function fetchData(silent = false) {
        if (!silent) loading.value = true;
        try {
            // Use getPending to fetch ALL pending works for the region
            const { data } = await workOrdersApi.getPending(filter.regionId);

            allWorkOrders.value = data;
            applyFiltersAndPagination();
        } catch (error) {
            if (!silent) ElMessage.error('获取工单失败');
        } finally {
            if (!silent) loading.value = false;
        }
    }

    function handlePageChange(page: number) {
        pagination.page = page;
        applyFiltersAndPagination();
    }

    function handleSizeChange(size: number) {
        pagination.pageSize = size;
        pagination.page = 1;
        applyFiltersAndPagination();
    }

    function resetFilters() {
        filter.status = '';
        filter.serviceTypeId = '';
        filter.regionId = authStore.roleCode === 'admin' ? '' : (authStore.user?.regionId || '');
        filter.keyword = '';
    }

    watch(isMobile, () => {
        applyFiltersAndPagination();
    });

    // Watch filters to re-apply
    watch(() => ({ ...filter }), (newVal, oldVal) => {
        // If region changes, we need to re-fetch
        if (newVal.regionId !== oldVal.regionId) {
            fetchData();
            fetchStats();
        } else {
            pagination.page = 1; // Reset to first page on filter change
            applyFiltersAndPagination();
        }
    }, { deep: true });

    return {
        loading,
        allWorkOrders,
        workOrders,
        filter,
        stats,
        pagination,
        fetchData,
        fetchStats,
        handlePageChange,
        handleSizeChange,
        resetFilters,
    };
}
