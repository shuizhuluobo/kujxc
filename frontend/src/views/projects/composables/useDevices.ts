import { ref, reactive, computed } from 'vue';
import type { Ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { performanceApi, customersApi } from '@/api';
import type { Project, Customer, CustomerDevice, ProjectStage } from '@/types';
import { StageTrackingMode } from '@/types';

/**
 * 设备管理 composable
 * 统一桌面端与移动端共享的设备清单 CRUD、阶段记录、Excel 导入逻辑
 * 阶段记录基于项目动态配置的 ProjectStage（仅 DEVICE 跟踪模式阶段在设备清单记录）
 */
export function useDevices(project?: Ref<Project | null>) {
  const devices = ref<CustomerDevice[]>([]);
  const loading = ref(false);

  // ============ 项目阶段（仅 DEVICE 模式阶段在设备清单记录） ============
  const stages = computed<ProjectStage[]>(() => project?.value?.stages || []);
  const deviceStages = computed(() => stages.value.filter(s => s.trackingMode === StageTrackingMode.DEVICE));

  // 设备在某阶段的已记录数量
  const getStageProgress = (device: CustomerDevice, stageId: string): number => {
    return device.stageProgress?.find(p => p.stageId === stageId)?.quantity || 0;
  };

  // 设备在某阶段是否达标
  const isDeviceStageComplete = (device: CustomerDevice, stageId: string): boolean => {
    return getStageProgress(device, stageId) >= device.expectedQuantity;
  };

  // 设备是否全部 DEVICE 阶段达标（视为完成）
  const isDeviceCompleted = (device: CustomerDevice): boolean => {
    if (deviceStages.value.length === 0) return false;
    return deviceStages.value.every(s => isDeviceStageComplete(device, s.id));
  };

  // ============ 设备表单 ============
  const deviceForm = reactive({
    customerId: '',
    deviceName: '',
    expectedQuantity: 1,
    remark: '',
  });

  const editingDevice = ref<CustomerDevice | null>(null);
  const showCreateDeviceModal = ref(false);
  const showEditDeviceModal = ref(false);

  const resetDeviceForm = () => {
    deviceForm.customerId = '';
    deviceForm.deviceName = '';
    deviceForm.expectedQuantity = 1;
    deviceForm.remark = '';
  };

  const fillDeviceFormForEdit = (device: CustomerDevice) => {
    editingDevice.value = device;
    deviceForm.customerId = device.customerId;
    deviceForm.deviceName = device.deviceName;
    deviceForm.expectedQuantity = device.expectedQuantity;
    deviceForm.remark = device.remark || '';
  };

  // ============ 阶段记录表单 ============
  const currentStageId = ref('');
  const currentStage = computed<ProjectStage | undefined>(() =>
    stages.value.find(s => s.id === currentStageId.value),
  );
  const stageModalTitle = computed(() =>
    currentStage.value ? `记录${currentStage.value.name}` : '记录阶段',
  );

  // 桌面端表单
  const stageForm = reactive({
    date: '',
    quantity: 1,
    collaboratorIds: [] as string[],
    includeRecorder: true,
    remark: '',
  });

  // 移动端表单（含额外字段）
  const mobileStageForm = reactive({
    deviceId: '',
    stageId: '',
    maxQty: 0,
    unit: '台',
    quantity: 1,
    date: new Date().toISOString().slice(0, 10),
    collaboratorIds: [] as string[],
    includeRecorder: true,
    remark: '',
  });

  const stageMaxQuantity = computed(() => {
    if (!editingDevice.value || !currentStageId.value) return 9999;
    const d = editingDevice.value;
    const done = getStageProgress(d, currentStageId.value);
    return Math.max(0, d.expectedQuantity - done);
  });

  const resetStageForm = () => {
    stageForm.date = '';
    stageForm.quantity = 1;
    stageForm.collaboratorIds = [];
    stageForm.includeRecorder = true;
    stageForm.remark = '';
  };

  const prepareStageModal = (device: CustomerDevice, stageId: string) => {
    editingDevice.value = device;
    currentStageId.value = stageId;
    stageForm.date = new Date().toISOString().slice(0, 10);
    stageForm.quantity = 1;
    stageForm.collaboratorIds = [];
    stageForm.includeRecorder = true;
    stageForm.remark = '';
  };

  const prepareMobileStageModal = (device: CustomerDevice, stageId: string) => {
    const done = getStageProgress(device, stageId);
    const maxQty = Math.max(0, device.expectedQuantity - done);
    mobileStageForm.deviceId = device.id;
    mobileStageForm.stageId = stageId;
    mobileStageForm.maxQty = maxQty;
    mobileStageForm.quantity = Math.min(1, maxQty) || 1;
    mobileStageForm.date = new Date().toISOString().slice(0, 10);
    mobileStageForm.collaboratorIds = [];
    mobileStageForm.includeRecorder = true;
    mobileStageForm.remark = '';
  };

  // ============ 数据加载 ============
  const loadDevices = async (projectId: string) => {
    try {
      const response = await performanceApi.getDevices(projectId);
      devices.value = Array.isArray(response.data) ? response.data : [];
    } catch (e) {
      console.error('Failed to load devices:', e);
      devices.value = [];
    }
  };

  // ============ 排序与样式 ============
  const sortedDevices = computed(() => {
    return [...devices.value].sort((a, b) => a.customer?.name?.localeCompare(b.customer?.name || '') ?? 0);
  });

  const getDeviceRowClass = ({ row }: { row: CustomerDevice }) => {
    return isDeviceCompleted(row) ? 'completed-row' : '';
  };

  // ============ 设备 CRUD ============
  const createDevice = async (projectId: string) => {
    if (!deviceForm.customerId || !deviceForm.deviceName) return false;
    try {
      await performanceApi.createDevice(projectId, {
        customerId: deviceForm.customerId,
        deviceName: deviceForm.deviceName,
        expectedQuantity: deviceForm.expectedQuantity,
        remark: deviceForm.remark || undefined,
      });
      ElMessage.success('设备已新增');
      await loadDevices(projectId);
      return true;
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.message || '新增失败');
      return false;
    }
  };

  const updateDevice = async (projectId: string) => {
    if (!editingDevice.value) return false;
    try {
      await performanceApi.updateDevice(editingDevice.value.id, {
        deviceName: deviceForm.deviceName,
        expectedQuantity: deviceForm.expectedQuantity,
        remark: deviceForm.remark || undefined,
      });
      ElMessage.success('更新成功');
      await loadDevices(projectId);
      return true;
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.message || '更新失败');
      return false;
    }
  };

  const deleteDevice = async (projectId: string, device: CustomerDevice) => {
    try {
      await ElMessageBox.confirm(`确定要删除设备"${device.deviceName}"吗？`, '提示', { type: 'warning' });
      await performanceApi.deleteDevice(device.id);
      ElMessage.success('删除成功');
      await loadDevices(projectId);
    } catch {
      // 用户取消
    }
  };

  // ============ 阶段记录提交（统一走 createRecord） ============
  const submitStage = async (projectId: string) => {
    if (!editingDevice.value || !stageForm.date || !currentStageId.value) return false;
    try {
      await performanceApi.createRecord(projectId, {
        stageId: currentStageId.value,
        deviceId: editingDevice.value.id,
        quantity: stageForm.quantity,
        date: stageForm.date,
        collaboratorIds: stageForm.collaboratorIds,
        includeRecorder: stageForm.includeRecorder,
        remark: stageForm.remark || undefined,
      });
      ElMessage.success('记录成功');
      await loadDevices(projectId);
      return true;
    } catch (e: any) {
      console.error('Failed to record stage:', e);
      return false;
    }
  };

  const submitMobileStage = async (projectId: string) => {
    if (!mobileStageForm.deviceId || !mobileStageForm.stageId) return false;
    if (mobileStageForm.maxQty <= 0) {
      ElMessage.warning('该阶段已达上限');
      return false;
    }
    if (mobileStageForm.quantity <= 0 || mobileStageForm.quantity > mobileStageForm.maxQty) {
      ElMessage.warning(`数量无效，最多 ${mobileStageForm.maxQty} ${mobileStageForm.unit}`);
      return false;
    }
    try {
      await performanceApi.createRecord(projectId, {
        stageId: mobileStageForm.stageId,
        deviceId: mobileStageForm.deviceId,
        quantity: mobileStageForm.quantity,
        date: mobileStageForm.date,
        collaboratorIds: mobileStageForm.collaboratorIds,
        includeRecorder: mobileStageForm.includeRecorder,
        remark: mobileStageForm.remark || undefined,
      });
      ElMessage.success('记录成功');
      await loadDevices(projectId);
      return true;
    } catch (e: any) {
      const msg = e?.response?.data?.message || '记录失败';
      if (e?.response?.status === 400) {
        ElMessageBox.alert(msg, '无法记录', { type: 'warning', confirmButtonText: '知道了' });
      } else {
        ElMessage.error(msg);
      }
      return false;
    }
  };

  // ============ Excel 导入 ============
  const importData = ref<Array<{ customerName: string; deviceName: string; expectedQuantity: number; remark?: string }>>([]);
  const uploadRef = ref();

  // 导入客户匹配分析：customerName -> { matchedId: string | null, suggestions: Customer[] }
  const importCustomerMap = ref<Record<string, { matchedId: string | null; suggestions: Customer[] }>>({});

  // 模糊匹配：计算两个字符串的相似度（基于包含关系 + 编辑距离简化版）
  const findSimilarCustomers = (name: string, customers: Customer[], limit = 3): Customer[] => {
    const target = name.trim().toLowerCase();
    if (!target) return [];
    const scored = customers
      .map(c => {
        const source = (c.name || '').trim().toLowerCase();
        let score = 0;
        // 完全包含
        if (source.includes(target) || target.includes(source)) score += 50;
        // 首字符匹配
        if (source[0] === target[0]) score += 10;
        // 共同字符数
        let common = 0;
        for (const ch of target) {
          if (source.includes(ch)) common++;
        }
        score += Math.min(common, source.length) * 2;
        return { customer: c, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(item => item.customer);
  };

  const analyzeImportCustomers = (customers: Customer[]) => {
    const uniqueNames = [...new Set(importData.value.map(item => item.customerName))];
    const map: Record<string, { matchedId: string | null; suggestions: Customer[] }> = {};
    for (const name of uniqueNames) {
      const exact = customers.find(c => c.name === name);
      map[name] = {
        matchedId: exact ? exact.id : null,
        suggestions: exact ? [] : findSimilarCustomers(name, customers),
      };
    }
    importCustomerMap.value = map;
  };

  const getUnmatchedCount = computed(() => {
    return Object.values(importCustomerMap.value).filter(item => !item.matchedId).length;
  });

  const downloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const data = [
      { '客户名称': '示例客户A', '设备名称': '示例设备型号', '数量': 10, '备注': '可留空' },
      { '客户名称': '示例客户B', '设备名称': '另一型号', '数量': 5, '备注': '' },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 8 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '设备清单');
    XLSX.writeFile(wb, '设备导入模板.xlsx');
  };

  const handleFileChange = (file: any, customers?: Customer[]) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(e.target?.result, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<Record<string, unknown>>;

        importData.value = jsonData.map((row: Record<string, unknown>) => ({
          customerName: String(row['客户名称'] || row['customerName'] || ''),
          deviceName: String(row['设备名称'] || row['deviceName'] || ''),
          expectedQuantity: Number(row['数量'] || row['expectedQuantity'] || 0),
          remark: String(row['备注'] || row['remark'] || ''),
        })).filter(item => item.customerName && item.deviceName && item.expectedQuantity > 0);

        // 解析完成后分析客户匹配情况
        if (customers && importData.value.length > 0) {
          analyzeImportCustomers(customers);
        }
      } catch (error) {
        console.error('Failed to parse file:', error);
        ElMessage.error('文件解析失败，请检查格式');
      }
    };
    reader.readAsArrayBuffer(file.raw);
  };

  // 全部新建未匹配客户
  const createAllUnmatched = async (customers: Customer[]) => {
    const unmatched = Object.entries(importCustomerMap.value).filter(([, v]) => !v.matchedId);
    for (const [name] of unmatched) {
      try {
        const res = await customersApi.create({ name });
        customers.push(res.data);
        importCustomerMap.value[name].matchedId = res.data.id;
      } catch (error) {
        console.error('Failed to create customer:', error);
      }
    }
  };

  // 全部更正：用每个未匹配客户的第一条建议自动填充
  const applyAllSuggestions = () => {
    for (const [name, info] of Object.entries(importCustomerMap.value)) {
      if (!info.matchedId && info.suggestions.length > 0) {
        importCustomerMap.value[name].matchedId = info.suggestions[0].id;
      }
    }
  };

  const handleImport = async (projectId: string) => {
    if (importData.value.length === 0) return false;

    // 确保所有客户都已匹配
    const hasUnmatched = Object.values(importCustomerMap.value).some(v => !v.matchedId);
    if (hasUnmatched) {
      ElMessage.warning('存在未匹配的客户，请先处理');
      return false;
    }

    let successCount = 0;
    for (const item of importData.value) {
      const match = importCustomerMap.value[item.customerName];
      if (!match?.matchedId) continue;

      try {
        await performanceApi.createDevice(projectId, {
          customerId: match.matchedId,
          deviceName: item.deviceName,
          expectedQuantity: item.expectedQuantity,
          remark: item.remark || undefined,
        });
        successCount++;
      } catch (error) {
        console.error('Failed to create device:', error);
      }
    }

    ElMessage.success(`导入完成，成功 ${successCount} 条`);
    importData.value = [];
    importCustomerMap.value = {};
    uploadRef.value?.clearFiles();
    await loadDevices(projectId);
    return true;
  };

  return {
    // 状态
    devices,
    loading,
    deviceForm,
    editingDevice,
    showCreateDeviceModal,
    showEditDeviceModal,
    // 阶段相关
    stages,
    deviceStages,
    currentStage,
    currentStageId,
    stageModalTitle,
    stageForm,
    mobileStageForm,
    stageMaxQuantity,
    getStageProgress,
    isDeviceStageComplete,
    isDeviceCompleted,
    // 数据
    sortedDevices,
    importData,
    importCustomerMap,
    getUnmatchedCount,
    uploadRef,
    // 数据加载
    loadDevices,
    // 表单操作
    resetDeviceForm,
    fillDeviceFormForEdit,
    resetStageForm,
    prepareStageModal,
    prepareMobileStageModal,
    // 设备 CRUD
    createDevice,
    updateDevice,
    deleteDevice,
    // 阶段记录
    submitStage,
    submitMobileStage,
    // Excel 导入
    downloadTemplate,
    handleFileChange,
    analyzeImportCustomers,
    createAllUnmatched,
    applyAllSuggestions,
    handleImport,
    // 工具
    getDeviceRowClass,
  };
}
