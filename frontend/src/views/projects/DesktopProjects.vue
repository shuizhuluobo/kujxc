<template>
  <div class="desktop-projects">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <div class="header-left">
        <h2>项目</h2>
      </div>
    </div>

    <el-tabs v-model="activeTab" type="card" class="tabs">
      <!-- 常规项目 -->
      <el-tab-pane label="常规项目" name="performance">
        <RegularProjectPanel
          :projects="filteredProjects"
          :selected-project="selectedProject"
          :records="records"
          :stats="stats"
          :my-stats="myStats"
          :devices="sortedDevices"
          :users="users"
          :customers="customers"
          :can-create-project="canCreateProject"
          :can-manage-project="canManageProject"
          :can-create-record="canCreateRecord"
          :can-view-performance="canViewPerformance"
          :loading="loading"
          :current-page="currentPage"
          :page-size="pageSize"
          :project-form="projectForm"
          :record-form="recordForm"
          :editing-record="editingRecord"
          :device-form="deviceForm"
          :editing-device="editingDevice"
          :current-stage="currentStage"
          :stage-form="stageForm"
          :stage-max-quantity="stageMaxQuantity"
          :stage-modal-title="stageModalTitle"
          :import-data="importData"
          :import-customer-map="importCustomerMap"
          :unmatched-count="getUnmatchedCount"
          :show-create-project-modal="showCreateProjectModal"
          :show-edit-project-modal="showEditProjectModal"
          :show-record-modal="showRecordModal"
          :show-create-device-modal="showCreateDeviceModal"
          :show-edit-device-modal="showEditDeviceModal"
          :show-stage-modal="showStageModal"
          :show-import-modal="showImportModal"
          @select-project="handleSelectProject"
          @create-project="openCreateProjectModal"
          @edit-project="openEditProjectModal"
          @delete-project="handleDeleteProject"
          @export-all="exportAllProjects"
          @export-current="exportProject"
          @create-record="openCreateRecordModal"
          @edit-record="openEditRecordModal"
          @save-record="handleSaveRecord"
          @delete-record="handleDeleteRecord"
          @refresh-stats="handleRefreshStats"
          @create-device="openCreateDeviceModal"
          @edit-device="openEditDeviceModal"
          @save-device="handleSaveDevice"
          @delete-device="handleDeleteDevice"
          @record-stage="openStageModal"
          @submit-stage="handleSubmitStage"
          @import-device="openImportModal"
          @download-template="downloadTemplate"
          @file-change="(file: any) => handleFileChange(file, customers)"
          @confirm-import="handleConfirmImport"
          @create-all-unmatched="() => createAllUnmatched(customers)"
          @apply-all-suggestions="applyAllSuggestions"
          @page-change="currentPage = $event"
          @create-project-submit="handleCreateProjectSubmit"
          @update-project-submit="handleUpdateProjectSubmit"
          @update-show-create-project-modal="showCreateProjectModal = $event"
          @update-show-edit-project-modal="showEditProjectModal = $event"
          @update-show-record-modal="showRecordModal = $event"
          @update-show-create-device-modal="showCreateDeviceModal = $event"
          @update-show-edit-device-modal="showEditDeviceModal = $event"
          @update-show-stage-modal="showStageModal = $event"
          @update-show-import-modal="showImportModal = $event"
        />
      </el-tab-pane>

      <!-- 公物仓项目 -->
      <el-tab-pane label="公物仓" name="warehouse">
        <WarehouseProjectPanel
          :fee-records="feeRecords"
          :users="users"
          :customers="customers"
          :can-manage-project="canManageProject"
          :fee-computer-count="feeComputerCount"
          :fee-computer-service-map="feeComputerServiceMap"
          :fee-additional-fee-enabled="feeAdditionalFeeEnabled"
          :fee-additional-fee-amount="feeAdditionalFeeAmount"
          :fee-additional-fee-remark="feeAdditionalFeeRemark"
          :fee-peripheral-install-services="feePeripheralInstallServices"
          :fee-peripheral-recycle-services="feePeripheralRecycleServices"
          :fee-peripheral-delivery-services="feePeripheralDeliveryServices"
          :fee-max-peripheral-rows="feeMaxPeripheralRows"
          :fee-response-services="feeResponseServices"
          :fee-time-slot-services="feeTimeSlotServices"
          :fee-transport-services="feeTransportServices"
          :fee-selected-response="feeSelectedResponse"
          :fee-selected-time-slot="feeSelectedTimeSlot"
          :fee-selected-items="feeSelectedItems"
          :fee-subtotal="feeSubtotal"
          :fee-discount="feeDiscount"
          :fee-actual-amount="feeActualAmount"
          :fee-remark="feeRemark"
          :fee-selected-customer-id="feeSelectedCustomerId"
          :fee-collaborator-ids="feeCollaboratorIds"
          :show-fee-settings="showFeeSettings"
          :settings-by-category="settingsByCategory"
          :active-settings-categories="activeSettingsCategories"
          @update:fee-computer-count="feeComputerCount = $event"
          @update:fee-additional-fee-enabled="feeAdditionalFeeEnabled = $event"
          @update:fee-additional-fee-amount="feeAdditionalFeeAmount = $event"
          @update:fee-additional-fee-remark="feeAdditionalFeeRemark = $event"
          @computer-service-change="feeOnComputerServiceChange"
          @peripheral-change="feeOnPeripheralChange"
          @item-change="feeOnItemChange"
          @select-response="feeSelectResponse"
          @select-time-slot="feeSelectTimeSlot"
          @update:fee-discount="feeDiscount = $event"
          @update:fee-actual-amount="feeActualAmount = $event"
          @update:fee-remark="feeRemark = $event"
          @update:fee-collaborator-ids="feeCollaboratorIds = $event"
          @update:fee-selected-customer-id="feeSelectedCustomerId = $event"
          @save-fee-record="handleSaveFeeRecord"
          @reset-calculator="handleFeeReset"
          @delete-fee-record="handleDeleteFeeRecord"
          @update-setting="feeUpdateSetting"
          @show-fee-settings="showFeeSettings = true"
          @update:show-fee-settings="showFeeSettings = $event"
        />
      </el-tab-pane>

      <!-- 绩效总览 -->
      <el-tab-pane label="绩效总览" name="global-stats" v-if="canViewPerformance">
        <GlobalPerformanceOverview />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useProjects } from './composables/useProjects';
import { useWorkRecords } from './composables/useWorkRecords';
import { useDevices } from './composables/useDevices';
import { useFeeCalculator } from './composables/useFeeCalculator';
import { useFeeRecords } from './composables/useFeeRecords';
import { CalculationType } from '@/types';
import type { Project, WorkRecord, CustomerDevice } from '@/types';
import RegularProjectPanel from './components/RegularProjectPanel.vue';
import WarehouseProjectPanel from './components/WarehouseProjectPanel.vue';
import GlobalPerformanceOverview from './components/GlobalPerformanceOverview.vue';

const activeTab = ref('performance');
const currentPage = ref(1);
const pageSize = 15;

// ============ Composables ============
const {
  projects,
  selectedProject,
  users,
  customers,
  loading,
  projectForm,
  canCreateProject,
  canManageProject,
  canCreateRecord,
  canViewPerformance,
  loadProjects,
  selectProject,
  deselectProject,
  createProject,
  updateProject,
  deleteProject,
  resetProjectForm,
  fillProjectFormForEdit,
  loadUsersAndCustomers,
  exportAllProjects,
  exportProject,
} = useProjects();

const {
  records,
  stats,
  myStats,
  recordForm,
  editingRecord,
  canSaveRecord,
  loadRecords,
  loadStats,
  loadMyStats,
  resetRecordForm,
  fillRecordFormForEdit,
  prepareNewRecord,
  saveRecord,
  deleteRecord,
} = useWorkRecords();

const {
  devices,
  deviceForm,
  editingDevice,
  showCreateDeviceModal,
  showEditDeviceModal,
  currentStage,
  stageModalTitle,
  stageForm,
  stageMaxQuantity,
  sortedDevices,
  importData,
  uploadRef,
  loadDevices,
  resetDeviceForm,
  fillDeviceFormForEdit,
  resetStageForm,
  prepareStageModal,
  createDevice,
  updateDevice,
  deleteDevice,
  submitStage,
  downloadTemplate,
  handleFileChange,
  handleImport,
  importCustomerMap,
  getUnmatchedCount,
  createAllUnmatched,
  applyAllSuggestions,
} = useDevices();

const {
  computerCount: feeComputerCount,
  discount: feeDiscount,
  actualAmount: feeActualAmount,
  remark: feeRemark,
  allSettings: feeAllSettings,
  showSettings: showFeeSettings,
  selectedResponse: feeSelectedResponse,
  selectedTimeSlot: feeSelectedTimeSlot,
  additionalFeeEnabled: feeAdditionalFeeEnabled,
  additionalFeeAmount: feeAdditionalFeeAmount,
  additionalFeeRemark: feeAdditionalFeeRemark,
  selectedCustomerId: feeSelectedCustomerId,
  peripheralInstallServices: feePeripheralInstallServices,
  peripheralRecycleServices: feePeripheralRecycleServices,
  peripheralDeliveryServices: feePeripheralDeliveryServices,
  responseServices: feeResponseServices,
  timeSlotServices: feeTimeSlotServices,
  transportServices: feeTransportServices,
  maxPeripheralRows: feeMaxPeripheralRows,
  computerServiceMap: feeComputerServiceMap,
  selectedItems: feeSelectedItems,
  subtotal: feeSubtotal,
  onItemChange: feeOnItemChange,
  onComputerServiceChange: feeOnComputerServiceChange,
  onPeripheralChange: feeOnPeripheralChange,
  selectResponse: feeSelectResponse,
  selectTimeSlot: feeSelectTimeSlot,
  updateSetting: feeUpdateSetting,
  resetCalculator: feeResetCalculator,
  loadSettings: feeLoadSettings,
  init: feeInit,
} = useFeeCalculator();

const {
  feeRecords,
  collaboratorIds: feeCollaboratorIds,
  settingsByCategory,
  activeSettingsCategories,
  loadGlobalFeeRecords,
  saveGlobalFeeRecord,
  deleteGlobalFeeRecord,
  formatFeeDate,
} = useFeeRecords();

// ============ 弹窗状态 ============
const showCreateProjectModal = ref(false);
const showEditProjectModal = ref(false);
const showRecordModal = ref(false);
const showStageModal = ref(false);
const showImportModal = ref(false);

// ============ 项目过滤 ============
const filteredProjects = computed(() =>
  projects.value.filter(p => p.calculationType !== CalculationType.WAREHOUSE),
);

// ============ 项目操作 ============
const handleSelectProject = async (project: Project) => {
  selectProject(project);
  currentPage.value = 1;
  await Promise.all([
    loadRecords(project.id),
    loadStats(project.id),
    loadMyStats(project.id),
    loadDevices(project.id),
  ]);
};

const openCreateProjectModal = () => {
  resetProjectForm();
  showCreateProjectModal.value = true;
};

const openEditProjectModal = (project: Project) => {
  fillProjectFormForEdit(project);
  showEditProjectModal.value = true;
};

const handleDeleteProject = async (project: Project) => {
  await deleteProject(project);
};

// ============ 项目表单提交 ============
const handleCreateProjectSubmit = async () => {
  try {
    await createProject(projectForm);
    showCreateProjectModal.value = false;
  } catch {
    // 错误已在 composable 中处理
  }
};

const handleUpdateProjectSubmit = async () => {
  try {
    await updateProject(projectForm);
    showEditProjectModal.value = false;
  } catch {
    // 错误已在 composable 中处理
  }
};

// ============ 工作记录操作 ============
const openCreateRecordModal = () => {
  prepareNewRecord();
  showRecordModal.value = true;
};

const openEditRecordModal = (record: WorkRecord) => {
  fillRecordFormForEdit(record);
  showRecordModal.value = true;
};

const handleSaveRecord = async () => {
  if (!selectedProject.value || !canSaveRecord.value) return;
  const ok = await saveRecord(selectedProject.value);
  if (ok) {
    showRecordModal.value = false;
    await Promise.all([
      loadRecords(selectedProject.value.id),
      loadMyStats(selectedProject.value.id),
      loadStats(selectedProject.value.id),
    ]);
  }
};

const handleDeleteRecord = async (record: WorkRecord) => {
  if (!selectedProject.value) return;
  const ok = await deleteRecord(selectedProject.value, record);
  if (ok) {
    await Promise.all([
      loadRecords(selectedProject.value.id),
      loadMyStats(selectedProject.value.id),
      loadStats(selectedProject.value.id),
    ]);
  }
};

const handleRefreshStats = async () => {
  if (!selectedProject.value) return;
  await Promise.all([
    loadStats(selectedProject.value.id),
    loadMyStats(selectedProject.value.id),
  ]);
};

// ============ 设备操作 ============
const openCreateDeviceModal = () => {
  resetDeviceForm();
  showCreateDeviceModal.value = true;
};

const openEditDeviceModal = (device: CustomerDevice) => {
  fillDeviceFormForEdit(device);
  showEditDeviceModal.value = true;
};

const handleSaveDevice = async () => {
  if (!selectedProject.value) return;
  let ok: boolean;
  if (showEditDeviceModal.value) {
    ok = await updateDevice(selectedProject.value.id);
  } else {
    ok = await createDevice(selectedProject.value.id);
  }
  if (ok) {
    showCreateDeviceModal.value = false;
    showEditDeviceModal.value = false;
  }
};

const handleDeleteDevice = async (device: CustomerDevice) => {
  if (!selectedProject.value) return;
  await deleteDevice(selectedProject.value.id, device);
};

const openStageModal = (device: CustomerDevice, stage: 'delivery' | 'install' | 'debug') => {
  prepareStageModal(device, stage);
  showStageModal.value = true;
};

const handleSubmitStage = async () => {
  if (!selectedProject.value) return;
  const ok = await submitStage(selectedProject.value.id);
  if (ok) {
    showStageModal.value = false;
    await loadMyStats(selectedProject.value.id);
  }
};

const openImportModal = () => {
  importData.value = [];
  importCustomerMap.value = {};
  uploadRef.value?.clearFiles();
  showImportModal.value = true;
};

const handleConfirmImport = async () => {
  if (!selectedProject.value) return;
  const ok = await handleImport(selectedProject.value.id);
  if (ok) showImportModal.value = false;
};

// ============ 公物仓费用记录操作（全局，不依赖项目） ============
const handleSaveFeeRecord = async () => {
  if (feeSelectedItems.value.length === 0) return;
  if (!feeSelectedCustomerId.value) return;
  const items = feeSelectedItems.value.map(s => ({
    category: '',
    item: s.item,
    quantity: s.quantity,
    unitPrice: s.quantity > 0 ? s.total / s.quantity : s.total,
    total: s.total,
  }));
  const ok = await saveGlobalFeeRecord({
    items,
    subtotal: feeSubtotal.value,
    discount: feeDiscount.value,
    actualAmount: feeActualAmount.value,
    remark: feeRemark.value || undefined,
    customerId: feeSelectedCustomerId.value,
  });
  if (ok) {
    feeResetCalculator();
    feeCollaboratorIds.value = [];
  }
};

const handleDeleteFeeRecord = async (recordId: string) => {
  await deleteGlobalFeeRecord(recordId);
};

const handleFeeReset = () => {
  feeResetCalculator();
  feeCollaboratorIds.value = [];
};

// ============ 项目表单提交（由子组件触发） ============
// 通过 v-model 双向绑定 projectForm，子组件直接修改后触发提交

// ============ 生命周期 ============
onMounted(async () => {
  await Promise.all([loadProjects(), loadUsersAndCustomers(), feeInit(), loadGlobalFeeRecords()]);
});

// 切换 tab 时如果切回项目页且没有数据，重新加载
watch(activeTab, async (val) => {
  if (val === 'performance' && projects.value.length === 0) {
    await loadProjects();
  }
  if (val === 'warehouse' && feeRecords.value.length === 0) {
    await loadGlobalFeeRecords();
  }
});
</script>

<style scoped>
.desktop-projects {
  max-width: 1600px;
  margin: 0 auto;
}

.tabs :deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
}
</style>
