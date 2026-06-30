<template>
  <div class="warehouse-project-panel">
    <!-- 主内容区：直接显示费用计算器 + 历史记录 -->
    <main class="main-content">
      <!-- 费用计算 -->
      <section class="panel">
        <div class="panel-header">
          <h3>公物仓费用计算</h3>
          <el-button v-if="canManageProject" size="small" @click="$emit('showFeeSettings')">费用设置</el-button>
        </div>
        <div class="panel-body">
          <div class="calculator-layout">
            <div class="service-section">
              <div class="fee-customer-bar">
                <span class="fee-customer-label">客户<em>*</em></span>
                <el-select
                  :model-value="feeSelectedCustomerId"
                  placeholder="选择客户"
                  filterable
                  clearable
                  size="default"
                  style="width: 260px"
                  @update:model-value="$emit('update:feeSelectedCustomerId', $event)"
                >
                  <el-option v-for="c in customers.filter(c => c?.id)" :key="c.id" :label="c.name || '未知'" :value="c.id" />
                </el-select>
              </div>
              <ComputerServices
                :computer-count="feeComputerCount"
                :computer-service-map="feeComputerServiceMap"
                :additional-fee-enabled="feeAdditionalFeeEnabled"
                :additional-fee-amount="feeAdditionalFeeAmount"
                :additional-fee-remark="feeAdditionalFeeRemark"
                @update:computer-count="$emit('update:feeComputerCount', $event)"
                @update:additional-fee-enabled="$emit('update:feeAdditionalFeeEnabled', $event)"
                @update:additional-fee-amount="$emit('update:feeAdditionalFeeAmount', $event)"
                @update:additional-fee-remark="$emit('update:feeAdditionalFeeRemark', $event)"
                @computer-service-change="$emit('computerServiceChange', $event)"
                @item-change="$emit('itemChange')"
              />
              <PeripheralServices
                :peripheral-install-services="feePeripheralInstallServices"
                :peripheral-recycle-services="feePeripheralRecycleServices"
                :peripheral-delivery-services="feePeripheralDeliveryServices"
                :max-peripheral-rows="feeMaxPeripheralRows"
                @peripheral-change="$emit('peripheralChange', $event)"
                @item-change="$emit('itemChange')"
              />
              <ServiceOptions
                :response-services="feeResponseServices"
                :time-slot-services="feeTimeSlotServices"
                :transport-services="feeTransportServices"
                :selected-response="feeSelectedResponse"
                :selected-time-slot="feeSelectedTimeSlot"
                @select-response="$emit('selectResponse', $event)"
                @select-time-slot="$emit('selectTimeSlot', $event)"
                @item-change="$emit('itemChange')"
              />
            </div>
            <FeeResult
              v-if="canViewAmount"
              :selected-items="feeSelectedItems"
              :subtotal="feeSubtotal"
              :discount="feeDiscount"
              :actual-amount="feeActualAmount"
              :remark="feeRemark"
              :can-save="canManageProject"
              @update:discount="$emit('update:feeDiscount', $event)"
              @update:actual-amount="$emit('update:feeActualAmount', $event)"
              @update:remark="$emit('update:feeRemark', $event)"
              @save="$emit('saveFeeRecord')"
              @print="handlePrint"
              @reset="$emit('resetCalculator')"
            >
              <template #extra-actions>
                <div class="collaborator-bar">
                  <span class="collab-label">协作人</span>
                  <el-select
                    :model-value="feeCollaboratorIds"
                    multiple
                    collapse-tags
                    collapse-tags-tooltip
                    placeholder="选择协作人"
                    size="small"
                    style="flex: 1"
                    @update:model-value="$emit('update:feeCollaboratorIds', $event)"
                  >
                    <el-option v-for="user in users.filter(u => u?.id)" :key="user.id" :label="user.name || '未知'" :value="user.id" />
                  </el-select>
                </div>
              </template>
            </FeeResult>
          </div>
        </div>
      </section>

      <!-- 费用记录 -->
      <section class="panel">
        <div class="panel-header">
          <h3>费用记录</h3>
        </div>
        <div class="panel-body">
          <el-table v-if="feeRecords.length > 0" :data="feeRecords" stripe size="small">
            <el-table-column label="时间" width="160">
              <template #default="{ row }">{{ formatFeeDate(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="客户" width="120">
              <template #default="{ row }">{{ row.customer?.name || '-' }}</template>
            </el-table-column>
            <el-table-column label="项目" min-width="250">
              <template #default="{ row }">
                <span v-for="(item, idx) in row.items" :key="idx">
                  {{ item.item }}×{{ item.quantity }};
                </span>
              </template>
            </el-table-column>
            <el-table-column v-if="canViewAmount" label="实收" width="100">
              <template #default="{ row }">{{ row.actualAmount }}元</template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="150" />
            <el-table-column label="操作人" width="100">
              <template #default="{ row }">{{ row.creator?.name || '无' }}</template>
            </el-table-column>
            <el-table-column label="操作" width="70" v-if="canManageProject">
              <template #default="{ row }">
                <el-popconfirm title="确定删除？" @confirm="$emit('deleteFeeRecord', row.id)">
                  <template #reference>
                    <el-button type="danger" size="small" link>删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
          <div v-else class="empty-tip">
            <p>暂无费用记录</p>
          </div>
        </div>
      </section>

      <!-- 费用设置弹窗 -->
      <el-dialog :model-value="showFeeSettings" title="费用设置" width="900px" top="5vh" destroy-on-close @update:model-value="$emit('update:showFeeSettings', $event)">
        <div class="settings-panel">
          <p class="settings-tip">单价修改后自动保存，关闭弹窗即生效。</p>
          <el-tabs v-model="activeSettingsCategoryLocal" type="border-card">
            <el-tab-pane
              v-for="group in settingsByGroup"
              :key="group.name"
              :label="group.name"
              :name="group.name"
            >
              <div class="settings-columns">
                <div class="settings-column">
                  <h5 class="settings-column-title">单项服务</h5>
                  <div v-for="category in group.single" :key="category.name" class="settings-group">
                    <div class="settings-group-title">{{ category.name }}</div>
                    <el-table :data="category.items" stripe size="small" empty-text="暂无项目">
                      <el-table-column prop="item" label="项目" min-width="140" />
                      <el-table-column prop="unit" label="单位" width="55" />
                      <el-table-column v-if="canViewAmount" label="价格" width="120">
                        <template #default="{ row }">
                          <el-input-number v-model="row.price" :min="0" :precision="2" size="small" @change="$emit('updateSetting', row)" />
                        </template>
                      </el-table-column>
                      <el-table-column label="启用" width="65" align="center">
                        <template #default="{ row }">
                          <el-switch v-model="row.isActive" @change="$emit('updateSetting', row)" />
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </div>
                <div class="settings-column">
                  <h5 class="settings-column-title">组合 / 全流程</h5>
                  <div v-for="category in group.combo" :key="category.name" class="settings-group">
                    <div class="settings-group-title">{{ category.name }}</div>
                    <el-table :data="category.items" stripe size="small" empty-text="暂无项目">
                      <el-table-column prop="item" label="项目" min-width="140" />
                      <el-table-column prop="unit" label="单位" width="55" />
                      <el-table-column v-if="canViewAmount" label="价格" width="120">
                        <template #default="{ row }">
                          <el-input-number v-model="row.price" :min="0" :precision="2" size="small" @change="$emit('updateSetting', row)" />
                        </template>
                      </el-table-column>
                      <el-table-column label="启用" width="65" align="center">
                        <template #default="{ row }">
                          <el-switch v-model="row.isActive" @change="$emit('updateSetting', row)" />
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                  <div v-if="group.combo.length === 0" class="settings-empty">暂无组合服务</div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-dialog>

      <!-- 打印预览 -->
      <PrintPreview ref="printPreviewRef" :data="printData" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import ComputerServices from './ComputerServices.vue';
import PeripheralServices from './PeripheralServices.vue';
import ServiceOptions from './ServiceOptions.vue';
import FeeResult from './FeeResult.vue';
import PrintPreview from './PrintPreview.vue';
import { generateDocumentNo, formatPrintDate, type PrintData } from '../composables/usePrint';
import type { User, Customer } from '@/types';
import type { FeeSetting, FeeRecord, FeeItem } from '@/api';

const props = defineProps<{
  feeRecords: FeeRecord[];
  users: User[];
  customers: Customer[];
  canManageProject: boolean;
  canViewAmount: boolean;
  feeComputerCount: number;
  feeComputerServiceMap: Record<string, any>;
  feeAdditionalFeeEnabled: boolean;
  feeAdditionalFeeAmount: number;
  feeAdditionalFeeRemark: string;
  feePeripheralInstallServices: any[];
  feePeripheralRecycleServices: any[];
  feePeripheralDeliveryServices: any[];
  feeMaxPeripheralRows: number;
  feeResponseServices: any[];
  feeTimeSlotServices: any[];
  feeTransportServices: any[];
  feeSelectedResponse: string;
  feeSelectedTimeSlot: string;
  feeSelectedItems: FeeItem[];
  feeSubtotal: number;
  feeDiscount: number;
  feeActualAmount: number;
  feeRemark: string;
  feeSelectedCustomerId: string;
  feeCollaboratorIds: string[];
  showFeeSettings: boolean;
  settingsByCategory: Array<{ name: string; items: FeeSetting[] }>;
  activeSettingsCategories: string[];
}>();

defineEmits<{
  'update:feeComputerCount': [value: number];
  'update:feeAdditionalFeeEnabled': [value: boolean];
  'update:feeAdditionalFeeAmount': [value: number];
  'update:feeAdditionalFeeRemark': [value: string];
  computerServiceChange: [value: any];
  peripheralChange: [value: any];
  itemChange: [];
  selectResponse: [value: string];
  selectTimeSlot: [value: string];
  'update:feeDiscount': [value: number];
  'update:feeActualAmount': [value: number];
  'update:feeRemark': [value: string];
  'update:feeCollaboratorIds': [value: string[]];
  saveFeeRecord: [];
  resetCalculator: [];
  deleteFeeRecord: [recordId: string];
  updateSetting: [setting: FeeSetting];
  showFeeSettings: [];
  'update:showFeeSettings': [value: boolean];
  'update:feeSelectedCustomerId': [value: string];
}>();

const activeSettingsCategoryLocal = ref('');

const printPreviewRef = ref<{ open: () => void } | null>(null);

// 打印数据
const printData = computed<PrintData | null>(() => {
  if (props.feeSelectedItems.length === 0) return null;
  const customer = props.customers.find(c => c.id === props.feeSelectedCustomerId);
  return {
    documentNo: generateDocumentNo(),
    date: formatPrintDate(),
    clientName: customer?.name || '',
    contactPerson: '',
    contactPhone: '',
    items: props.feeSelectedItems.map((s, idx) => ({
      index: idx + 1,
      name: s.item,
      quantity: s.quantity,
      unit: s.quantity > 1 ? '台' : '次',
      unitPrice: s.quantity > 0 ? s.total / s.quantity : s.total,
      total: s.total,
    })),
    subtotal: props.feeSubtotal,
    discount: props.feeDiscount,
    actualAmount: props.feeActualAmount,
    remark: props.feeRemark || '',
    creatorName: '',
  };
});

const handlePrint = () => {
  if (props.feeSelectedItems.length === 0) {
    ElMessage.warning('请先选择服务项目');
    return;
  }
  printPreviewRef.value?.open();
};

const settingsByGroup = computed(() => {
  const categoryMap = new Map<string, FeeSetting[]>();
  // 使用 settingsByCategory prop 而不是 allSettings
  props.settingsByCategory.forEach(category => {
    categoryMap.set(category.name, category.items);
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

watch(settingsByGroup, (groups) => {
  if (!activeSettingsCategoryLocal.value && groups.length > 0) {
    activeSettingsCategoryLocal.value = groups[0].name;
  }
}, { immediate: true });

const formatFeeDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN');
};
</script>

<style scoped>
.warehouse-project-panel {
  background: #f5f7fa;
}

.main-content { padding: 24px 28px; background: #f5f7fa; }

.panel { background: #fff; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); overflow: hidden; }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; background: #fafbfc; }
.panel-header h3 { margin: 0; font-size: 15px; font-weight: 600; color: #1e293b; }
.panel-body { padding: 16px 20px; }
.empty-tip { text-align: center; padding: 32px 20px; color: #94a3b8; font-size: 13px; }

.calculator-layout { display: flex; gap: 20px; }
.calculator-layout .service-section { flex: 1; }

.fee-customer-bar {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; margin-bottom: 12px;
  background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 8px;
}

.fee-customer-label { font-size: 14px; font-weight: 600; color: #1e293b; white-space: nowrap; }
.fee-customer-label em { color: #ef4444; font-style: normal; margin-left: 2px; }

.collaborator-bar {
  display: flex; align-items: center; gap: 8px;
  margin-top: 12px; padding: 8px 10px;
  background: #f5f7fa; border-radius: 6px;
}

.collaborator-bar .collab-label { font-size: 13px; color: #64748b; white-space: nowrap; }

.settings-panel h4 { margin: 0 0 12px 0; font-size: 14px; }
.settings-tip { margin: 0 0 12px 0; color: var(--el-text-color-secondary); font-size: 13px; }
.settings-group { margin-bottom: 16px; }
.settings-group:last-child { margin-bottom: 0; }
.settings-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
.settings-column-title { margin: 0 0 12px 0; padding-bottom: 6px; border-bottom: 2px solid var(--el-color-primary); font-size: 14px; font-weight: 600; color: var(--el-color-primary); }
.settings-group-title { margin: 0 0 8px 0; padding-left: 8px; border-left: 3px solid var(--el-color-primary-light-5); font-size: 13px; font-weight: 600; color: var(--el-text-color-primary); }
.settings-empty { padding: 24px 0; text-align: center; color: var(--el-text-color-secondary); font-size: 13px; }
</style>
