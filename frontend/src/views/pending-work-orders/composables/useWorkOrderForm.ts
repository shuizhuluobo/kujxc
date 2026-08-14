import { ref, reactive, computed, watch } from 'vue';
import { ElMessage, type FormRules } from 'element-plus';
import { match } from 'pinyin-pro';
import { useBaseDataStore } from '@/stores/baseData';
import { workOrdersApi } from '@/api';
import type { CreateWorkOrderDto, WorkOrder } from '@/types';
import { ScoreLevel } from '@/types';

export function useWorkOrderForm(onSuccess?: () => void) {
    const baseDataStore = useBaseDataStore();

    // Dialog state is still useful here to coordinate reset
    const showDialog = ref(false);
    const submitting = ref(false);
    const editingWorkOrder = ref<WorkOrder | null>(null);

    const form = reactive<CreateWorkOrderDto>({
        customerId: '',
        regionId: '',
        serviceTypeId: '',
        scoreLevel: ScoreLevel.NORMAL,
        detail: '',
    });

    const formRules: FormRules = {
        customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
        regionId: [{ required: true, message: '请选择区域', trigger: 'change' }],
        serviceTypeId: [{ required: true, message: '请选择服务类型', trigger: 'change' }],
        detail: [{ required: true, message: '请输入工单详情', trigger: 'blur' }],
    };

    // Customer Filtering Logic
    const customerFilterKeyword = ref('');
    const filteredCustomers = computed(() => {
        // 1. If there is a search keyword, perform search
        if (customerFilterKeyword.value) {
            const query = customerFilterKeyword.value.toLowerCase();
            const results = baseDataStore.customers.filter(c => {
                // Match abbreviation (exact or contains)
                if (c.shortName && c.shortName.toLowerCase().includes(query)) return true;
                // Match name
                if (c.name.includes(query)) return true;
                // Match phone
                if (c.phone && c.phone.includes(query)) return true;
                // Pinyin match
                return match(c.name, query, { precision: 'start' });
            });

            // Sort by relevance
            results.sort((a, b) => {
                const aShortExact = a.shortName?.toLowerCase() === query;
                const bShortExact = b.shortName?.toLowerCase() === query;
                if (aShortExact && !bShortExact) return -1;
                if (!aShortExact && bShortExact) return 1;

                const aShortContains = a.shortName?.toLowerCase().includes(query);
                const bShortContains = b.shortName?.toLowerCase().includes(query);
                if (aShortContains && !bShortContains) return -1;
                if (!aShortContains && bShortContains) return 1;

                return 0;
            });

            // Limit results
            return results.slice(0, 50);
        }

        // 2. If no search keyword
        const selected = baseDataStore.customers.find(c => c.id === form.customerId);
        return selected ? [selected] : [];
    });

    const customerFilterMethod = (query: string) => {
        customerFilterKeyword.value = query;
        if (!query) return;

        // Auto-select if exact match found
        const exactMatch = baseDataStore.customers.find(c =>
            c.name === query ||
            (c.shortName && c.shortName.toLowerCase() === query.toLowerCase())
        );

        if (exactMatch) {
            form.customerId = exactMatch.id;
        }
    };

    // 选择客户后，若该客户设置了默认区域，自动带出（新建场景），用户仍可手动更改
    watch(
        () => form.customerId,
        (newCustomerId) => {
            // 编辑模式不自动覆盖已保存的区域
            if (editingWorkOrder.value?.customerId === newCustomerId) return;
            if (!newCustomerId) return;

            const customer = baseDataStore.customers.find(c => c.id === newCustomerId);
            if (customer?.defaultRegionId) {
                form.regionId = customer.defaultRegionId;
            }
        },
    );

    function resetForm() {
        editingWorkOrder.value = null;

        // Find default service type "一般"
        const defaultServiceType = baseDataStore.serviceTypes.find(st => st.name === '一般');

        Object.assign(form, {
            customerId: '',
            regionId: '',
            serviceTypeId: defaultServiceType?.id || '',
            scoreLevel: ScoreLevel.NORMAL,
            detail: '',
        });
    }

    function openCreate() {
        resetForm();
        showDialog.value = true;
    }

    function openEdit(wo: WorkOrder) {
        editingWorkOrder.value = wo;
        Object.assign(form, {
            customerId: wo.customerId,
            regionId: wo.regionId,
            serviceTypeId: wo.serviceTypeId,
            scoreLevel: wo.scoreLevel,
            detail: wo.detail,
        });
        showDialog.value = true;
    }

    async function submit() {
        submitting.value = true;
        try {
            if (editingWorkOrder.value) {
                await workOrdersApi.update(editingWorkOrder.value.id, form);
                ElMessage.success('更新成功');
            } else {
                await workOrdersApi.create(form);
                ElMessage.success('创建成功');
            }
            showDialog.value = false;
            resetForm();
            onSuccess?.();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            ElMessage.error(err.response?.data?.message || '操作失败');
        } finally {
            submitting.value = false;
        }
    }

    watch(showDialog, (val) => {
        if (!val) {
            resetForm();
            customerFilterKeyword.value = '';
        } else {
            customerFilterKeyword.value = '';
        }
    });

    return {
        form,
        formRules,
        showDialog,
        submitting,
        editingWorkOrder,
        filteredCustomers,
        customerFilterMethod,
        submit,
        resetForm,
        openCreate,
        openEdit,
    };
}
