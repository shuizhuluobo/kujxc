import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import type { WorkOrder, WorkOrderFilterParams, User as UserType } from '@/types';
import { WorkOrderStatus, STATUS_LABELS, SCORE_VALUES } from '@/types';
import { workOrdersApi } from '@/api';
import { useBaseDataStore } from '@/stores/baseData';
import { useAuthStore } from '@/stores/auth';
import { match } from 'pinyin-pro';

export function useHistoryFilter() {
    const baseDataStore = useBaseDataStore();
    const authStore = useAuthStore();

    const loading = ref(false);
    const loadingMore = ref(false);
    const exporting = ref(false);
    const workOrders = ref<WorkOrder[]>([]);
    const total = ref(0);
    const showFilterDrawer = ref(false);

    const dateRange = ref<[string, string] | null>(null);

    const filter = reactive<WorkOrderFilterParams>({
        statuses: [WorkOrderStatus.COMPLETED],
        regionId: undefined,
        serviceTypeId: undefined,
        completerId: undefined,
        keyword: undefined,
        page: 1,
        pageSize: 20,
    });

    const DEFAULT_STATUSES = [WorkOrderStatus.COMPLETED];

    const hasActiveFilters = computed(() => {
        const statusChanged = JSON.stringify(filter.statuses?.sort()) !== JSON.stringify([...DEFAULT_STATUSES].sort());
        return statusChanged ||
            filter.regionId !== undefined ||
            filter.serviceTypeId !== undefined ||
            filter.completerId !== undefined ||
            filter.keyword !== undefined ||
            dateRange.value !== null;
    });

    const isMyOrders = computed(() => {
        return authStore.user?.id && filter.completerId === authStore.user.id;
    });

    const hasMore = computed(() => workOrders.value.length < total.value);

    function toggleMyOrders() {
        if (isMyOrders.value) {
            filter.completerId = undefined;
        } else {
            filter.completerId = authStore.user?.id;
        }
    }

    function resetFilters() {
        filter.statuses = [...DEFAULT_STATUSES];
        filter.regionId = undefined;
        filter.serviceTypeId = undefined;
        filter.completerId = undefined;
        filter.keyword = undefined;
        dateRange.value = null;
    }

    // 完成人筛选 - 过滤已禁用用户
    const allCompleters = computed(() =>
        baseDataStore.users.filter(u => u.isActive && (u.role?.code === 'engineer' || u.role?.code === 'admin'))
    );
    const filteredCompleters = ref<UserType[]>([]);

    watch(allCompleters, (val) => {
        filteredCompleters.value = val;
    }, { immediate: true });

    const completerFilterMethod = (query: string) => {
        if (!query) {
            filteredCompleters.value = allCompleters.value;
            return;
        }
        filteredCompleters.value = allCompleters.value.filter(user => {
            if (user.name.includes(query)) return true;
            const pinyinMatch = match(user.name, query, { precision: 'start' });
            if (pinyinMatch) return true;
            return false;
        });
    };

    const handleCompleterVisibleChange = (visible: boolean) => {
        if (visible) {
            filteredCompleters.value = allCompleters.value;
        }
    };

    function getStatusClass(status: WorkOrderStatus) {
        return {
            pending: status === WorkOrderStatus.PENDING,
            received: status === WorkOrderStatus.RECEIVED,
            completed: status === WorkOrderStatus.COMPLETED,
        };
    }

    function formatDate(date: string) {
        return dayjs(date).format('YYYY-MM-DD HH:mm');
    }

    function buildParams(): WorkOrderFilterParams {
        const params: WorkOrderFilterParams = { ...filter };
        if (dateRange.value) {
            params.startDate = dateRange.value[0];
            params.endDate = dateRange.value[1];
        }
        Object.keys(params).forEach(key => {
            // @ts-expect-error 索引访问需要类型收窄
            if (params[key] === '' || params[key] === null || params[key] === undefined) {
                // @ts-expect-error 删除空值字段
                delete params[key];
            }
        });
        return params;
    }

    async function fetchData() {
        loading.value = true;
        try {
            const params = buildParams();
            const response = await workOrdersApi.getAll(params);
            workOrders.value = response.data.data;
            total.value = response.data.total;
        } catch {
            ElMessage.error('获取工单失败');
        } finally {
            loading.value = false;
        }
    }

    async function loadMore() {
        loadingMore.value = true;
        filter.page = (filter.page || 1) + 1;
        try {
            const params = buildParams();
            const response = await workOrdersApi.getAll(params);
            workOrders.value.push(...response.data.data);
        } catch {
            ElMessage.error('加载失败');
            filter.page = (filter.page || 1) - 1;
        } finally {
            loadingMore.value = false;
        }
    }

    async function handleExport() {
        exporting.value = true;
        try {
            const params = buildParams();
            const response = await workOrdersApi.export(params);
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            let fileName = '历史工单.xlsx';
            const parts = [];

            if (filter.completerId) {
                const u = baseDataStore.users.find(u => u.id === filter.completerId);
                if (u) parts.push(`${u.name}完成`);
            }

            if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
                const start = dayjs(dateRange.value[0]).format('YYYYMMDD');
                const end = dayjs(dateRange.value[1]).format('YYYYMMDD');
                parts.push(`${start}-${end}`);
            }

            if (parts.length > 0) {
                fileName = `${parts.join('_')}_历史工单.xlsx`;
            } else {
                fileName = `历史工单_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.click();
            window.URL.revokeObjectURL(url);
            ElMessage.success('导出成功');
        } catch {
            ElMessage.error('导出失败');
        } finally {
            exporting.value = false;
        }
    }

    watch([
        () => filter.statuses,
        () => filter.regionId,
        () => filter.serviceTypeId,
        () => filter.completerId,
        () => filter.keyword,
        dateRange,
    ], () => {
        filter.page = 1;
        void fetchData();
    }, { deep: true });

    return {
        // State
        loading,
        loadingMore,
        exporting,
        workOrders,
        total,
        filter,
        dateRange,
        showFilterDrawer,
        hasActiveFilters,
        isMyOrders,
        hasMore,
        allCompleters,
        filteredCompleters,
        baseDataStore,
        // Methods
        toggleMyOrders,
        resetFilters,
        completerFilterMethod,
        handleCompleterVisibleChange,
        getStatusClass,
        formatDate,
        fetchData,
        loadMore,
        handleExport,
        // Constants
        STATUS_LABELS,
        SCORE_VALUES,
        WorkOrderStatus,
    };
}
