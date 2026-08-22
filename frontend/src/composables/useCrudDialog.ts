import { computed, ref } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import { getApiErrorMessage } from '@/utils/format';

export interface CrudDialogOptions<F extends object, T extends { id: string }> {
    /** 实体中文名：确认框/成功提示文案用（如「品牌」） */
    entityName: string;
    fetchList: () => Promise<T[]>;
    create: (payload: F) => Promise<unknown>;
    update: (id: string, payload: F) => Promise<unknown>;
    remove: (id: string) => Promise<unknown>;
    /** 新增时的空表单 */
    emptyForm: () => F;
    /** 编辑时从行数据回填表单 */
    toForm: (row: T) => F;
    /** 表单 → 提交 payload（缺省原样提交） */
    toPayload?: (form: F) => F;
}

/**
 * 基础资料 CRUD 弹窗的共享骨架（品牌/类型/标签等页面共用）：
 * 列表加载 + 新增/编辑弹窗 + 校验提交 + 确认删除，错误提示统一走 getApiErrorMessage。
 */
export function useCrudDialog<F extends object, T extends { id: string }>(opts: CrudDialogOptions<F, T>) {
    const loading = ref(false);
    const submitting = ref(false);
    const dialogVisible = ref(false);
    const editingRow = ref<T | null>(null);
    const formRef = ref<FormInstance>();
    const form = ref<F>(opts.emptyForm());
    const list = ref<T[]>([]);

    /** 模板标题用：true=编辑态 */
    const isEditing = computed(() => editingRow.value != null);

    async function fetchData() {
        loading.value = true;
        try {
            list.value = await opts.fetchList();
        } finally {
            loading.value = false;
        }
    }

    function handleCreate(prefill?: Partial<F>) {
        editingRow.value = null;
        form.value = { ...opts.emptyForm(), ...prefill };
        dialogVisible.value = true;
    }

    function handleEdit(row: T) {
        editingRow.value = row;
        form.value = opts.toForm(row);
        dialogVisible.value = true;
    }

    async function handleDelete(row: T & { name?: string }) {
        await ElMessageBox.confirm(`确定删除${opts.entityName}「${row.name ?? ''}」吗？`, '提示', { type: 'warning' });
        try {
            await opts.remove(row.id);
            ElMessage.success('删除成功');
            void fetchData();
        } catch (e: unknown) {
            ElMessage.error(getApiErrorMessage(e, '删除失败'));
        }
    }

    async function handleSubmit() {
        if (!formRef.value) return;
        const valid = await formRef.value.validate().catch(() => false);
        if (!valid) return;
        submitting.value = true;
        try {
            const payload = opts.toPayload ? opts.toPayload(form.value) : form.value;
            if (editingRow.value) {
                await opts.update(editingRow.value.id, payload);
            } else {
                await opts.create(payload);
            }
            ElMessage.success(isEditing.value ? '更新成功' : '创建成功');
            dialogVisible.value = false;
            void fetchData();
        } catch (e: unknown) {
            ElMessage.error(getApiErrorMessage(e, '操作失败'));
        } finally {
            submitting.value = false;
        }
    }

    return {
        loading,
        submitting,
        dialogVisible,
        form,
        formRef,
        list,
        isEditing,
        fetchData,
        handleCreate,
        handleEdit,
        handleDelete,
        handleSubmit,
    };
}
