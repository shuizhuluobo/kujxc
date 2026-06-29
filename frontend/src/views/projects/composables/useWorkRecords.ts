import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { performanceApi } from '@/api';
import type { Project, WorkRecord, PerformanceResult, MyPerformanceStats, ProjectStage } from '@/types';
import {
  CalculationType,
  StageTrackingMode,
  WorkUnit,
  HOURS_PER_DAY,
  formatWorkHours,
} from '@/types';

/**
 * 工作记录管理 composable
 * 统一桌面端与移动端共享的工作记录 CRUD、表单状态、统计加载逻辑
 * 按量项目记录统一通过 stageId 关联动态阶段；DEVICE 模式阶段需关联设备
 */
export function useWorkRecords() {
  const records = ref<WorkRecord[]>([]);
  const stats = ref<PerformanceResult[]>([]);
  const myStats = ref<MyPerformanceStats | null>(null);
  const loading = ref(false);

  // ============ 工作记录表单 ============
  const recordForm = reactive({
    date: '',
    stageId: '' as string,
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
    recordForm.stageId = '';
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
    recordForm.stageId = record.stageId || '';
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

  // ============ 阶段选项（按项目动态阶段生成） ============
  const stageOptions = (project: Project | null): ProjectStage[] => {
    if (!project || project.calculationType !== CalculationType.QUANTITY) return [];
    return (project.stages || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
  };

  // 当前所选阶段对象
  const selectedStage = (project: Project | null): ProjectStage | undefined => {
    if (!recordForm.stageId) return undefined;
    return (project?.stages || []).find(s => s.id === recordForm.stageId);
  };

  // ============ 校验 ============
  const canSaveRecord = computed(() => {
    return !!recordForm.date;
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

    const isQuantity = project.calculationType === CalculationType.QUANTITY;
    // 按量项目必须选择阶段
    if (isQuantity && !recordForm.stageId) {
      ElMessage.warning('请选择阶段');
      return;
    }
    // DEVICE 模式阶段必须关联设备
    if (isQuantity) {
      const stage = (project.stages || []).find(s => s.id === recordForm.stageId);
      if (stage?.trackingMode === StageTrackingMode.DEVICE && !recordForm.deviceId) {
        ElMessage.warning('该阶段需关联设备');
        return;
      }
    }

    try {
      let workHours: number | undefined;
      if (project.calculationType === CalculationType.DAILY) {
        workHours = recordForm.workUnit === WorkUnit.DAY
          ? recordForm.workDuration * HOURS_PER_DAY
          : recordForm.workDuration;
      }

      const data = {
        date: recordForm.date,
        stageId: isQuantity ? recordForm.stageId : undefined,
        quantity: isQuantity ? recordForm.quantity : undefined,
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
  // 获取记录的阶段名称（优先用 stage.name，回退到历史 recordType）
  const getRecordStageName = (record: WorkRecord, project: Project | null): string => {
    if (record.stage?.name) return record.stage.name;
    if (record.stageId && project?.stages) {
      const s = project.stages.find(sg => sg.id === record.stageId);
      if (s) return s.name;
    }
    return '';
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
    stageOptions,
    selectedStage,
    // CRUD
    saveRecord,
    deleteRecord,
    // 工具
    getRecordStageName,
    formatDate,
    formatWorkHours,
    // 常量
    HOURS_PER_DAY,
  };
}
