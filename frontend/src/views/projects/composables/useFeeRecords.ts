import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { performanceApi } from '@/api';
import type { FeeSetting, FeeRecord } from '@/api';

/**
 * 公物仓费用记录管理 composable
 * 统一桌面端与移动端共享的费用记录加载、保存、删除逻辑
 * 以及费用设置弹窗的分组展示逻辑
 */
export function useFeeRecords() {
  const feeRecords = ref<FeeRecord[]>([]);
  const allSettings = ref<FeeSetting[]>([]);
  const activeSettingsCategory = ref<string>('');
  const activeSettingsCategories = ref<string[]>([]);
  const collaboratorIds = ref<string[]>([]);

  // ============ 费用设置分组（按计算机/外设两个 tab，每个 tab 内分单项/组合两列） ============
  const settingsByGroup = computed(() => {
    const categoryMap = new Map<string, FeeSetting[]>();
    allSettings.value.forEach(setting => {
      const category = setting.category || '未分类';
      if (!categoryMap.has(category)) categoryMap.set(category, []);
      categoryMap.get(category)!.push(setting);
    });
    const categories = Array.from(categoryMap.entries()).map(([name, items]) => ({
      name,
      items: items.sort((a, b) => a.sortOrder - b.sortOrder),
    }));

    const isComputer = (name: string) => name.includes('计算机') || name === '脱密入库';
    const isCombo = (name: string) => name.includes('组合') || name.includes('全流程');

    const buildGroup = (name: string, groupCategories: typeof categories) => ({
      name,
      single: groupCategories.filter(c => !isCombo(c.name)),
      combo: groupCategories.filter(c => isCombo(c.name)),
    });

    const computerCategories = categories.filter(c => isComputer(c.name));
    const peripheralCategories = categories.filter(c => !isComputer(c.name));

    const groups: { name: string; single: typeof categories; combo: typeof categories }[] = [];
    if (computerCategories.length > 0) groups.push(buildGroup('计算机服务', computerCategories));
    if (peripheralCategories.length > 0) groups.push(buildGroup('外设服务', peripheralCategories));
    return groups;
  });

  // ============ 费用设置分组（按类别平铺，用于桌面端 collapse 折叠面板） ============
  const settingsByCategory = computed(() => {
    const categoryMap = new Map<string, FeeSetting[]>();
    allSettings.value.forEach(setting => {
      const category = setting.category || '未分类';
      if (!categoryMap.has(category)) categoryMap.set(category, []);
      categoryMap.get(category)!.push(setting);
    });
    return Array.from(categoryMap.entries()).map(([name, items]) => ({
      name,
      items: items.sort((a, b) => a.sortOrder - b.sortOrder),
    }));
  });

  // ============ 数据加载 ============
  const loadProjectFeeRecords = async (projectId: string) => {
    try {
      const res = await performanceApi.getFeeRecords(projectId);
      feeRecords.value = Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      console.error('Failed to load fee records:', e);
      feeRecords.value = [];
    }
  };

  const loadGlobalFeeRecords = async () => {
    try {
      const res = await performanceApi.getWarehouseFeeRecords();
      feeRecords.value = Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      console.error('Failed to load warehouse records:', e);
      feeRecords.value = [];
    }
  };

  // ============ 费用记录保存 ============
  const saveProjectFeeRecord = async (
    projectId: string,
    payload: {
      items: Array<{ category: string; item: string; quantity: number; unitPrice: number; total: number }>;
      subtotal: number;
      discount: number;
      actualAmount: number;
      remark?: string;
      customerId: string;
    },
  ) => {
    try {
      await performanceApi.saveFeeRecord(projectId, {
        ...payload,
        collaboratorIds: collaboratorIds.value,
      });
      ElMessage.success('费用记录已保存');
      await loadProjectFeeRecords(projectId);
      return true;
    } catch (e) {
      console.error('Failed to save fee record:', e);
      ElMessage.error('保存失败');
      return false;
    }
  };

  const saveGlobalFeeRecord = async (
    payload: {
      items: Array<{ category: string; item: string; quantity: number; unitPrice: number; total: number }>;
      subtotal: number;
      discount: number;
      actualAmount: number;
      remark?: string;
      customerId: string;
    },
  ) => {
    try {
      await performanceApi.saveWarehouseFeeRecord({
        ...payload,
        collaboratorIds: collaboratorIds.value,
      });
      ElMessage.success('费用记录已保存');
      await loadGlobalFeeRecords();
      return true;
    } catch (e) {
      console.error('Failed to save fee record:', e);
      ElMessage.error('保存失败');
      return false;
    }
  };

  // ============ 费用记录删除 ============
  const deleteProjectFeeRecord = async (projectId: string, recordId: string) => {
    try {
      await ElMessageBox.confirm('确定要删除这条费用记录吗？', '提示', { type: 'warning' });
      await performanceApi.deleteFeeRecord(projectId, recordId);
      ElMessage.success('记录已删除');
      await loadProjectFeeRecords(projectId);
    } catch {
      // 用户取消
    }
  };

  const deleteGlobalFeeRecord = async (recordId: string) => {
    try {
      await performanceApi.deleteWarehouseFeeRecord(recordId);
      ElMessage.success('记录已删除');
      await loadGlobalFeeRecords();
    } catch (e) {
      console.error('Failed to delete fee record:', e);
      ElMessage.error('删除失败');
    }
  };

  // ============ 工具 ============
  const formatFeeDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  return {
    // 状态
    feeRecords,
    allSettings,
    activeSettingsCategory,
    activeSettingsCategories,
    collaboratorIds,
    // 计算属性
    settingsByGroup,
    settingsByCategory,
    // 数据加载
    loadProjectFeeRecords,
    loadGlobalFeeRecords,
    // CRUD
    saveProjectFeeRecord,
    saveGlobalFeeRecord,
    deleteProjectFeeRecord,
    deleteGlobalFeeRecord,
    // 工具
    formatFeeDate,
  };
}
