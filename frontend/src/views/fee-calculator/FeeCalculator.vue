<template>
  <div class="fee-calculator" :class="{ 'is-mobile': isMobile }">
    <div class="calculator-card">
      <div class="card-header">
        <div class="header-title">
          <h2>{{ activeTab === 'fee' ? '公务仓项目' : '常规项目' }}</h2>
          <p class="header-subtitle">
            {{ activeTab === 'fee' ? '快速计算公务仓各项服务费用' : '记录项目的工作量' }}
          </p>
        </div>
        <div class="header-actions">
          <el-button v-if="activeTab === 'fee' && canSettings && !isMobile" type="primary" :icon="Setting" @click="showSettings = true">费用设置</el-button>
        </div>
      </div>

      <div class="tabs-wrapper">
        <el-tabs v-model="activeTab" type="card" class="tabs">
          <el-tab-pane label="公务仓项目" name="fee">
            <template v-if="!isMobile">
              <div class="calculator-layout">
                <div class="service-section">
                  <ComputerServices
                    :computer-count="computerCount"
                    :computer-service-map="computerServiceMap"
                    :additional-fee-enabled="additionalFeeEnabled"
                    :additional-fee-amount="additionalFeeAmount"
                    :additional-fee-remark="additionalFeeRemark"
                    @update:computer-count="computerCount = $event"
                    @update:additional-fee-enabled="additionalFeeEnabled = $event"
                    @update:additional-fee-amount="additionalFeeAmount = $event"
                    @update:additional-fee-remark="additionalFeeRemark = $event"
                    @computer-service-change="onComputerServiceChange"
                    @item-change="onItemChange"
                  />

                  <PeripheralServices
                    :peripheral-install-services="peripheralInstallServices"
                    :peripheral-recycle-services="peripheralRecycleServices"
                    :peripheral-delivery-services="peripheralDeliveryServices"
                    :max-peripheral-rows="maxPeripheralRows"
                    @peripheral-change="onPeripheralChange"
                    @item-change="onItemChange"
                  />

                  <ServiceOptions
                    :response-services="responseServices"
                    :time-slot-services="timeSlotServices"
                    :transport-services="transportServices"
                    :selected-response="selectedResponse"
                    :selected-time-slot="selectedTimeSlot"
                    @select-response="selectResponse"
                    @select-time-slot="selectTimeSlot"
                    @item-change="onItemChange"
                  />
                </div>

                <FeeResult
                  :selected-items="selectedItems"
                  :subtotal="subtotal"
                  :discount="discount"
                  :actual-amount="actualAmount"
                  :remark="remark"
                  :can-save="canSaveRecords"
                  @update:discount="discount = $event"
                  @update:actual-amount="actualAmount = $event"
                  @update:remark="remark = $event"
                  @save="saveRecord"
                  @print="handlePrintCurrent"
                  @reset="resetCalculator"
                />
              </div>
            </template>

            <template v-else>
              <MobilePanel />
            </template>

            <div class="history-section">
              <h3>历史记录</h3>
              <el-table :data="records" stripe size="small" :max-height="isMobile ? 200 : 300" empty-text="暂无费用记录">
                <el-table-column :label="isMobile ? '时间' : '时间'" :width="isMobile ? 100 : 160">
                  <template #default="{ row }">
                    {{ formatDate(row.createdAt) }}
                  </template>
                </el-table-column>
                <el-table-column :label="isMobile ? '项目' : '项目'" :min-width="isMobile ? 100 : 250">
                  <template #default="{ row }">
                    <span v-for="(item, idx) in row.items" :key="idx">
                      {{ item.item }}×{{ item.quantity }};
                    </span>
                  </template>
                </el-table-column>
                <el-table-column :label="isMobile ? '实收' : '实收'" :width="isMobile ? 60 : 100">
                  <template #default="{ row }">
                    {{ row.actualAmount }}元
                  </template>
                </el-table-column>
                <el-table-column v-if="!isMobile" prop="remark" label="备注" min-width="150" />
                <el-table-column v-if="!isMobile" label="操作人" width="100">
                  <template #default="{ row }">
                    {{ row.creator?.name || row.creatorId || '无' }}
                  </template>
                </el-table-column>
                <el-table-column v-if="!isMobile" label="操作" :width="canDeleteRecords ? 120 : 70">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" link @click="handlePrintRecord(row)">打印</el-button>
                    <el-button v-if="canDeleteRecords" type="danger" size="small" link @click="handleDeleteRecord(row.id)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="常规项目" name="performance">
            <PerformanceStats />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <el-drawer v-model="showSettings" :title="isMobile ? '费用设置' : '费用设置'" :size="isMobile ? '80%' : '800px'" :direction="isMobile ? 'btt' : 'rtl'">
      <div class="settings-panel">
        <h4>单价设置（每次修改后自动保存）</h4>
        <div class="settings-categories">
          <el-collapse v-model="activeSettingsCategories" accordion>
            <el-collapse-item v-for="category in settingsByCategory" :key="category.name" :title="category.name" :name="category.name">
              <el-table :data="category.items" stripe size="small" empty-text="暂无项目">
                <el-table-column prop="item" label="项目" />
                <el-table-column prop="unit" label="单位" width="60" />
                <el-table-column label="价格" width="120">
                  <template #default="{ row }">
                    <el-input-number v-model="row.price" :min="0" :precision="2" size="small" @change="updateSetting(row)" />
                  </template>
                </el-table-column>
                <el-table-column label="启用" width="70">
                  <template #default="{ row }">
                    <el-switch v-model="row.isActive" @change="updateSetting(row)" />
                  </template>
                </el-table-column>
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-drawer>

    <PrintPreview ref="printPreviewRef" :data="currentPrintData" />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, computed, ref, onMounted } from 'vue';
import { Setting, Delete } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import { useResponsive } from '@/composables';
import { useAuthStore } from '@/stores/auth';
import { hasPermission } from '@/config/permissions';
import ComputerServices from './components/ComputerServices.vue';
import PeripheralServices from './components/PeripheralServices.vue';
import ServiceOptions from './components/ServiceOptions.vue';
import FeeResult from './components/FeeResult.vue';
import PrintPreview from './components/PrintPreview.vue';
import PerformanceStats from './PerformanceStats.vue';
import { useFeeCalculator } from './composables/useFeeCalculator';
import { generateDocumentNo, formatPrintDate, recordToPrintData, type PrintData } from './composables/usePrint';
import type { FeeRecord, FeeSetting } from '@/api';
import type { ServiceItem } from './composables/useFeeCalculator';

const MobilePanel = defineAsyncComponent(() => import('./mobile/MobilePanel.vue'));

const { isMobile } = useResponsive();
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);

const userPermissions = computed(() => authStore.user?.role?.permissions || []);
const canViewRecords = computed(() => hasPermission(userPermissions.value, 'fee:view_records') || isAdmin.value);
const canSaveRecords = computed(() => hasPermission(userPermissions.value, 'fee:save_records') || isAdmin.value);
const canSettings = computed(() => hasPermission(userPermissions.value, 'fee:settings') || isAdmin.value);
const canDeleteRecords = computed(() => hasPermission(userPermissions.value, 'fee:delete_records') || isAdmin.value);

const activeTab = ref('fee');

const {
  computerCount,
  discount,
  actualAmount,
  remark,
  records,
  allSettings,
  showSettings,
  selectedResponse,
  selectedTimeSlot,
  additionalFeeEnabled,
  additionalFeeAmount,
  additionalFeeRemark,
  computerServices,
  peripheralInstallServices,
  peripheralRecycleServices,
  peripheralDeliveryServices,
  responseServices,
  timeSlotServices,
  transportServices,
  maxPeripheralRows,
  computerServiceMap,
  selectedItems,
  subtotal,
  onItemChange,
  onComputerServiceChange,
  onPeripheralChange,
  selectResponse,
  selectTimeSlot,
  updateSetting,
  saveRecord,
  deleteRecord,
  resetCalculator,
  loadRecords,
  formatDate,
  init,
} = useFeeCalculator();

onMounted(() => {
  init();
});

const printPreviewRef = ref<InstanceType<typeof PrintPreview>>();
const currentPrintData = ref<PrintData | null>(null);

const activeSettingsCategories = ref<string>('');

const settingsByCategory = computed(() => {
  const categoryMap = new Map<string, FeeSetting[]>();
  allSettings.value.forEach(setting => {
    const category = setting.category || '未分类';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(setting);
  });
  return Array.from(categoryMap.entries()).map(([name, items]) => ({
    name,
    items: items.sort((a, b) => a.sortOrder - b.sortOrder),
  }));
});

const buildPrintDataFromItems = (): PrintData => {
  const authStore = useAuthStore();
  return {
    documentNo: generateDocumentNo(),
    date: formatPrintDate(),
    clientName: '',
    contactPerson: '',
    contactPhone: '',
    items: selectedItems.value.map((s, idx) => ({
      index: idx + 1,
      name: s.displayText,
      quantity: s.quantity,
      unit: s.quantity > 1 ? '台' : '次',
      unitPrice: s.quantity > 0 ? s.total / s.quantity : s.total,
      total: s.total,
    })),
    subtotal: subtotal.value,
    discount: discount.value,
    actualAmount: actualAmount.value,
    remark: remark.value,
    creatorName: authStore.user?.name || '',
  };
};

const handlePrintCurrent = () => {
  currentPrintData.value = buildPrintDataFromItems();
  printPreviewRef.value?.open();
};

const handlePrintRecord = (record: FeeRecord) => {
  currentPrintData.value = recordToPrintData(record);
  printPreviewRef.value?.open();
};

const handleDeleteRecord = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      type: 'warning',
    });
    deleteRecord(id);
  } catch {}
};
</script>

<style scoped>
.fee-calculator {
  padding: 20px;
  background: var(--bg-color);
  min-height: 100vh;
}

.calculator-card {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color-lighter);
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--text-primary);
}

.header-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.tabs-wrapper {
  width: 100%;
}

.tabs {
  margin-bottom: 0;
}

:deep(.el-tabs__header) {
  margin-bottom: 16px;
}

:deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
}

.calculator-layout {
  display: flex;
  gap: 20px;
}

.service-section {
  flex: 1;
}

.history-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color-lighter);
}

.history-section h3 {
  font-size: 16px;
  margin: 0 0 16px;
  color: var(--text-primary);
}

.settings-panel h4 {
  margin: 0 0 16px;
  color: var(--text-primary);
}

.settings-categories {
  padding: 0 4px;
}

.settings-categories :deep(.el-collapse-item__header) {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--bg-color-page);
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.settings-categories :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

.settings-categories :deep(.el-collapse-item__content) {
  padding-bottom: 8px;
}

.fee-calculator.is-mobile {
  padding: 12px;
}

.fee-calculator.is-mobile .calculator-card {
  padding: 12px;
}

.fee-calculator.is-mobile .card-header {
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
}

.fee-calculator.is-mobile .card-header h2 {
  font-size: 18px;
}

.fee-calculator.is-mobile .calculator-layout {
  flex-direction: column;
  gap: 12px;
}
</style>