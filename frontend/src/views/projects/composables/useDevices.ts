import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { performanceApi, customersApi } from '@/api';
import type { Project, Customer, CustomerDevice } from '@/types';

/**
 * 设备管理 composable
 * 统一桌面端与移动端共享的设备清单 CRUD、阶段记录、Excel 导入逻辑
 */
export function useDevices() {
  const devices = ref<CustomerDevice[]>([]);
  const loading = ref(false);

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
  const currentStage = ref<'delivery' | 'install' | 'debug'>('delivery');
  const stageModalTitle = computed(() => {
    const stageMap = { delivery: '记录送货', install: '记录安装', debug: '记录调试' };
    return stageMap[currentStage.value];
  });

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
    stage: 'delivery' as 'delivery' | 'install' | 'debug',
    quantity: 1,
    maxQty: 0,
    unit: '台',
    date: new Date().toISOString().slice(0, 10),
    collaboratorIds: [] as string[],
    includeRecorder: true,
    remark: '',
  });

  const stageMaxQuantity = computed(() => {
    if (!editingDevice.value) return 9999;
    const d = editingDevice.value;
    if (currentStage.value === 'delivery') return d.expectedQuantity - d.deliveryQuantity;
    if (currentStage.value === 'install') return d.deliveryQuantity - d.installQuantity;
    return d.installQuantity - d.debugQuantity;
  });

  const resetStageForm = () => {
    stageForm.date = '';
    stageForm.quantity = 1;
    stageForm.collaboratorIds = [];
    stageForm.includeRecorder = true;
    stageForm.remark = '';
  };

  const prepareStageModal = (device: CustomerDevice, stage: 'delivery' | 'install' | 'debug') => {
    editingDevice.value = device;
    currentStage.value = stage;
    stageForm.date = new Date().toISOString().slice(0, 10);
    stageForm.quantity = 1;
    stageForm.collaboratorIds = [];
    stageForm.includeRecorder = true;
    stageForm.remark = '';
  };

  const prepareMobileStageModal = (device: CustomerDevice, stage: 'delivery' | 'install' | 'debug') => {
    const maxQty = stage === 'delivery'
      ? device.expectedQuantity - device.deliveryQuantity
      : stage === 'install'
      ? device.deliveryQuantity - device.installQuantity
      : device.installQuantity - device.debugQuantity;
    mobileStageForm.deviceId = device.id;
    mobileStageForm.stage = stage;
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
    return row.isCompleted ? 'completed-row' : '';
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

  // ============ 阶段记录提交 ============
  const submitStage = async (projectId: string) => {
    if (!editingDevice.value || !stageForm.date) return false;
    try {
      const apiMethodMap = {
        delivery: 'recordDelivery' as const,
        install: 'recordInstall' as const,
        debug: 'recordDebug' as const,
      };
      const methodName = apiMethodMap[currentStage.value];
      await performanceApi[methodName](editingDevice.value.id, {
        date: stageForm.date,
        quantity: stageForm.quantity,
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
    if (!mobileStageForm.deviceId) return false;
    if (mobileStageForm.maxQty <= 0) {
      ElMessage.warning('该阶段已达上限');
      return false;
    }
    if (mobileStageForm.quantity <= 0 || mobileStageForm.quantity > mobileStageForm.maxQty) {
      ElMessage.warning(`数量无效，最多 ${mobileStageForm.maxQty} ${mobileStageForm.unit}`);
      return false;
    }
    try {
      const apiMethod = mobileStageForm.stage === 'delivery'
        ? 'recordDelivery'
        : mobileStageForm.stage === 'install'
        ? 'recordInstall'
        : 'recordDebug';
      await performanceApi[apiMethod](mobileStageForm.deviceId, {
        date: mobileStageForm.date,
        quantity: mobileStageForm.quantity,
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

  const handleFileChange = (file: any) => {
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
      } catch (error) {
        console.error('Failed to parse file:', error);
        ElMessage.error('文件解析失败，请检查格式');
      }
    };
    reader.readAsArrayBuffer(file.raw);
  };

  const handleImport = async (projectId: string, customers: Customer[]) => {
    if (importData.value.length === 0) return false;

    for (const item of importData.value) {
      let customer = customers.find(c => c.name === item.customerName);

      if (!customer) {
        try {
          const res = await customersApi.create({ name: item.customerName });
          customer = res.data;
          customers.push(customer);
        } catch (error) {
          console.error('Failed to create customer:', error);
          continue;
        }
      }

      try {
        await performanceApi.createDevice(projectId, {
          customerId: customer.id,
          deviceName: item.deviceName,
          expectedQuantity: item.expectedQuantity,
          remark: item.remark || undefined,
        });
      } catch (error) {
        console.error('Failed to create device:', error);
      }
    }

    ElMessage.success('导入完成');
    importData.value = [];
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
    currentStage,
    stageModalTitle,
    stageForm,
    mobileStageForm,
    stageMaxQuantity,
    sortedDevices,
    importData,
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
    handleImport,
    // 工具
    getDeviceRowClass,
  };
}
