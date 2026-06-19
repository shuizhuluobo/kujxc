import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { performanceApi } from '@/api';
import type { Project, WorkRecord, PerformanceResult, MyPerformanceStats, CustomerDevice } from '@/types';
import {
  CalculationType,
  RecordType,
  RECORD_TYPE_LABELS,
  WorkUnit,
  HOURS_PER_DAY,
  formatWorkHours,
} from '@/types';

/**
 * 工作记录管理 composable
 * 统一桌面端与移动端共享的工作记录 CRUD、表单状态、统计加载逻辑
 */
export function useWorkRecords() {
  const records = ref<WorkRecord[]>([]);
  const stats = ref<PerformanceResult[]>([]);
  const myStats = ref<MyPerformanceStats | null>(null);
  const loading = ref(false);

  // ============ 工作记录表单 ============
  const recordForm = reactive({
    date: '',
    // 桌面端使用 recordTypes 数组（多选），移动端使用 recordType 单选
    recordTypes: [] as RecordType[],
    recordType: undefined as RecordType | undefined,
    quantity: 1,
    customerId: '',
    deviceId: '',
    workDuration: 1,
    workUnit: WorkUnit.DAY as WorkUnit,
    description: '',
    collaboratorIds: [] as string[],
    includeRecorder: true,
    remark: '',
  });

  const editingRecord = ref<WorkRecord | null>(null);

  const resetRecordForm = () => {
    recordForm.date = '';
    recordForm.recordTypes = [];
    recordForm.recordType = undefined;
    recordForm.quantity = 1;
    recordForm.customerId = '';
    recordForm.deviceId = '';
    recordForm.workDuration = 1;
    recordForm.workUnit = WorkUnit.DAY;
    recordForm.description = '';
    recordForm.collaboratorIds = [];
    recordForm.includeRecorder = true;
    recordForm.remark = '';
  };

  const fillRecordFormForEdit = (record: WorkRecord) => {
    editingRecord.value = record;
    recordForm.date = record.date;
    recordForm.recordTypes = record.recordType ? [record.recordType] : [];
    recordForm.recordType = record.recordType || undefined;
    recordForm.quantity = record.quantity || 1;
    recordForm.customerId = record.customerId || '';
    recordForm.deviceId = record.deviceId || '';
    if (record.workHours) {
      if (record.workHours % HOURS_PER_DAY === 0) {
        recordForm.workDuration = record.workHours / HOURS_PER_DAY;
        recordForm.workUnit = WorkUnit.DAY;
      } else {
        recordForm.workDuration = record.workHours;
        recordForm.workUnit = WorkUnit.HOUR;
      }
    } else {
      recordForm.workDuration = 1;
      recordForm.workUnit = WorkUnit.DAY;
    }
    recordForm.description = record.description || '';
    recordForm.collaboratorIds = (record.collaborators || []).map(c => c.id);
    recordForm.includeRecorder = record.includeRecorder;
    recordForm.remark = record.remark || '';
  };

  const prepareNewRecord = () => {
    editingRecord.value = null;
    resetRecordForm();
    const today = new Date();
    recordForm.date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  // ============ 记录类型选项（移动端用） ============
  const recordTypeOptions = (project: Project | null) => {
    const isQty = project?.calculationType === CalculationType.QUANTITY;
    return [
      { value: RecordType.DELIVERY, label: '送货', disabled: !isQty },
      { value: RecordType.INSTALL, label: '安装', disabled: !isQty },
      { value: RecordType.DEBUG, label: '调试', disabled: !isQty },
      { value: RecordType.CONSTRUCTION, label: '施工', disabled: isQty },
    ];
  };

  // ============ 校验 ============
  const canSaveRecord = computed(() => {
    return !!(recordForm.date && (recordForm.recordType || recordForm.recordTypes.length > 0));
  });

  // ============ 数据加载 ============
  const loadRecords = async (projectId: string) => {
    try {
      const response = await performanceApi.getRecords(projectId);
      records.value = response.data;
    } catch (e) {
      console.error('Failed to load records:', e);
    }
  };

  const loadStats = async (projectId: string) => {
    try {
      const response = await performanceApi.getStats(projectId);
      stats.value = response.data;
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  };

  const loadMyStats = async (projectId: string) => {
    try {
      const response = await performanceApi.getMyStats(projectId);
      myStats.value = response.data;
    } catch (e) {
      console.error('Failed to load my stats:', e);
    }
  };

  // ============ 记录 CRUD ============
  const saveRecord = async (project: Project) => {
    if (!recordForm.date) return;
    // 兼容桌面端（recordTypes 数组）与移动端（recordType 单选）
    const recordType = recordForm.recordType || recordForm.recordTypes[0];
    if (!recordType) return;

    try {
      let workHours: number | undefined;
      if (project.calculationType === CalculationType.DAILY) {
        workHours = recordForm.workUnit === WorkUnit.DAY
          ? recordForm.workDuration * HOURS_PER_DAY
          : recordForm.workDuration;
      }

      const data = {
        date: recordForm.date,
        recordType,
        quantity: project.calculationType === CalculationType.QUANTITY ? recordForm.quantity : undefined,
        workHours,
        customerId: recordForm.customerId || undefined,
        deviceId: recordForm.deviceId || undefined,
        description: recordForm.description || undefined,
        collaboratorIds: recordForm.collaboratorIds,
        includeRecorder: recordForm.includeRecorder,
        remark: recordForm.remark || undefined,
      };

      if (editingRecord.value) {
        await performanceApi.updateRecord(project.id, editingRecord.value.id, data);
        ElMessage.success('更新成功');
      } else {
        await performanceApi.createRecord(project.id, data);
        ElMessage.success('添加成功');
      }
      return true;
    } catch (e: any) {
      const msg = e?.response?.data?.message || '保存失败';
      if (e?.response?.status === 400) {
        ElMessageBox.alert(msg, '无法保存', { type: 'warning', confirmButtonText: '知道了' });
      } else {
        ElMessage.error(msg);
      }
      return false;
    }
  };

  const deleteRecord = async (project: Project, record: WorkRecord) => {
    try {
      await ElMessageBox.confirm('确定要删除这条工作记录吗？', '提示', { type: 'warning' });
      await performanceApi.deleteRecord(project.id, record.id);
      ElMessage.success('删除成功');
      return true;
    } catch {
      return false;
    }
  };

  // ============ 工具方法 ============
  const getRecordTypeTag = (type?: RecordType): '' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
    const map: Record<string, '' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
      DELIVERY: 'primary',
      INSTALL: 'success',
      DEBUG: 'warning',
      CONSTRUCTION: 'info',
    };
    return map[type || ''] || '';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return {
    // 状态
    records,
    stats,
    myStats,
    loading,
    recordForm,
    editingRecord,
    canSaveRecord,
    // 数据加载
    loadRecords,
    loadStats,
    loadMyStats,
    // 表单操作
    resetRecordForm,
    fillRecordFormForEdit,
    prepareNewRecord,
    recordTypeOptions,
    // CRUD
    saveRecord,
    deleteRecord,
    // 工具
    getRecordTypeTag,
    formatDate,
    formatWorkHours,
    // 常量
    RECORD_TYPE_LABELS,
    HOURS_PER_DAY,
  };
}
