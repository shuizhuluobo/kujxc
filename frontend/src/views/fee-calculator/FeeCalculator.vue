<template>
  <div class="fee-calculator" :class="{ 'is-mobile': isMobile }">
    <div class="calculator-card">
      <div class="card-header">
        <div class="header-title">
          <h2>公务仓费用计算器</h2>
          <p class="header-subtitle">快速计算公务仓各项服务费用</p>
        </div>
        <div class="header-actions">
          <el-button v-if="canSettings" type="primary" :icon="Setting" @click="showSettings = true">费用设置</el-button>
        </div>
      </div>

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
            @reset="resetCalculator"
          />
        </div>
      </template>

      <template v-else>
        <MobilePanel />
      </template>

      <div class="history-section">
        <h3>历史记录</h3>
        <el-table :data="records" stripe size="small" :max-height="isMobile ? 200 : 300">
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
          <el-table-column v-if="canDeleteRecords && !isMobile" label="操作" width="80">
            <template #default="{ row }">
              <el-button type="danger" size="small" link @click="handleDeleteRecord(row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-drawer v-model="showSettings" :title="isMobile ? '费用设置' : '费用设置'" :size="isMobile ? '80%' : '600px'" :direction="isMobile ? 'btt' : 'rtl'">
      <div class="settings-panel">
        <h4>单价设置（每次修改后点击保存）</h4>
        <el-table :data="allSettings" stripe size="small" :max-height="isMobile ? '60vh' : 'auto'">
          <el-table-column prop="category" :label="isMobile ? '类别' : '类别'" :width="isMobile ? 70 : 120" />
          <el-table-column prop="item" label="项目" />
          <el-table-column prop="unit" label="单位" width="60" />
          <el-table-column label="价格" width="100">
            <template #default="{ row }">
              <el-input-number v-model="row.price" :min="0" :precision="2" size="small" @change="updateSetting(row)" />
            </template>
          </el-table-column>
          <el-table-column label="启用" width="60">
            <template #default="{ row }">
              <el-switch v-model="row.isActive" @change="updateSetting(row)" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, computed } from 'vue';
import { Setting, Delete } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import { useResponsive } from '@/composables';
import { useAuthStore } from '@/stores/auth';
import { hasPermission } from '@/config/permissions';
import ComputerServices from './components/ComputerServices.vue';
import PeripheralServices from './components/PeripheralServices.vue';
import ServiceOptions from './components/ServiceOptions.vue';
import FeeResult from './components/FeeResult.vue';
import { useFeeCalculator } from './composables/useFeeCalculator';
import type { ServiceItem, FeeSetting } from './composables/useFeeCalculator';

const MobilePanel = defineAsyncComponent(() => import('./mobile/MobilePanel.vue'));

const { isMobile } = useResponsive();
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);

const userPermissions = computed(() => authStore.user?.role?.permissions || []);
const canViewRecords = computed(() => hasPermission(userPermissions.value, 'fee:view_records') || isAdmin.value);
const canSaveRecords = computed(() => hasPermission(userPermissions.value, 'fee:save_records') || isAdmin.value);
const canSettings = computed(() => hasPermission(userPermissions.value, 'fee:settings') || isAdmin.value);
const canDeleteRecords = computed(() => hasPermission(userPermissions.value, 'fee:delete_records') || isAdmin.value);

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

init();

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
  background: #fff;
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

/* Mobile Styles */
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