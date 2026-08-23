<template>
  <div class="mobile-calculator">
    <!-- 客户选择（公物仓项目场景必填） -->
    <div class="section-card customer-card" v-if="currentProjectId">
      <div class="customer-row">
        <span class="customer-label">客户<em>*</em></span>
        <el-select
          v-model="selectedCustomerId"
          placeholder="选择客户"
          filterable
          :filter-method="filterByPinyin"
          clearable
          size="default"
          class="customer-select"
        >
          <el-option
            v-for="c in (customers || [])"
            :key="c.id"
            :label="c.name"
            :value="c.id"
          />
        </el-select>
      </div>
    </div>

    <!-- 计算机数量 -->
    <div class="section-card">
      <div class="section-title-row collapsible" @click="toggleSection('computer')">
        <span class="section-title">计算机</span>
        <div class="section-right">
          <span v-if="computerCount > 0" class="section-badge">{{ computerCount }}台</span>
          <el-icon class="expand-icon" :class="{ expanded: expandedSections.computer }"><ArrowRight /></el-icon>
        </div>
      </div>
      <template v-if="expandedSections.computer">
        <div class="count-row">
          <el-button :icon="Minus" circle size="small" @click="computerCount = Math.max(0, computerCount - 1)" />
          <span class="count-val">{{ computerCount }}</span>
          <el-button :icon="Plus" circle size="small" @click="computerCount++" />
          <span class="count-unit">台</span>
        </div>
        <div class="service-grid">
          <div
            v-for="name in computerServiceList"
            :key="name"
            class="service-chip"
            :class="{ active: computerServiceMap[name]?.selected, disabled: computerServiceMap[name]?.disabled }"
            @click="!computerServiceMap[name]?.disabled && toggleComputerService(name)"
          >
            <div class="chip-name">{{ name }}</div>
            <div class="chip-price">{{ getComputerPriceText(name) }}</div>
          </div>
        </div>
      </template>
    </div>

    <!-- 外设 - 卡片式布局 -->
    <div class="section-card">
      <div class="section-title-row collapsible" @click="toggleSection('peripheral')">
        <span class="section-title">外设</span>
        <div class="section-right">
          <span v-if="selectedPeripheralCount > 0" class="section-badge">{{ selectedPeripheralCount }}项</span>
          <el-icon class="expand-icon" :class="{ expanded: expandedSections.peripheral }"><ArrowRight /></el-icon>
        </div>
      </div>
      <template v-if="expandedSections.peripheral">
        <div class="peripheral-cards">
          <div v-for="group in peripheralGroups" :key="group.type" class="peripheral-card" :class="{ 'has-selected': group.selectedCount > 0 }">
            <div class="pcard-title">{{ group.type }}</div>
            <div class="pcard-options">
              <div v-if="group.installItem" class="pcard-option" :class="{ selected: group.installItem.selected, disabled: group.installItem.disabled }" @click="!group.installItem.disabled && togglePeripheral(group.installItem)">
                <span class="opt-name">安装</span>
                <span class="opt-price">{{ group.installItem.price }}元</span>
              </div>
              <div v-if="group.recycleItem" class="pcard-option" :class="{ selected: group.recycleItem.selected, disabled: group.recycleItem.disabled }" @click="!group.recycleItem.disabled && togglePeripheral(group.recycleItem)">
                <span class="opt-name">回收</span>
                <span class="opt-price">{{ group.recycleItem.price }}元</span>
              </div>
              <div v-if="group.comboItem" class="pcard-option" :class="{ selected: group.comboItem.selected, disabled: group.comboItem.disabled }" @click="!group.comboItem.disabled && togglePeripheral(group.comboItem)">
                <span class="opt-name">全流程</span>
                <span class="opt-price">{{ group.comboItem.price }}元</span>
              </div>
            </div>
            <!-- 已选数量调整 -->
            <div v-if="group.activeItem" class="pcard-qty">
              <span class="qty-label">{{ group.activeItem.item.includes('全流程') ? '全流程' : group.activeItem.item.includes('安装') ? '安装' : '回收' }}</span>
              <div class="qty-row">
                <el-button :icon="Minus" circle size="small" @click="group.activeItem.quantity = Math.max(1, group.activeItem.quantity - 1); onPeripheralChange(group.activeItem)" />
                <span class="qty-val">{{ group.activeItem.quantity }}</span>
                <el-button :icon="Plus" circle size="small" @click="group.activeItem.quantity++; onPeripheralChange(group.activeItem)" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 服务时段 -->
    <div class="section-card" v-if="timeSlotServices.length > 0">
      <div class="section-title-row collapsible" @click="toggleSection('timeSlot')">
        <span class="section-title">服务时段</span>
        <div class="section-right">
          <span v-if="selectedTimeSlotLabel" class="section-badge">{{ selectedTimeSlotLabel }}</span>
          <el-icon class="expand-icon" :class="{ expanded: expandedSections.timeSlot }"><ArrowRight /></el-icon>
        </div>
      </div>
      <template v-if="expandedSections.timeSlot">
        <div class="option-chips">
          <div
            v-for="item in timeSlotServices"
            :key="item.id"
            class="option-chip"
            :class="{ active: selectedTimeSlot === item.id }"
            @click="selectTimeSlot(item.id)"
          >
            <span class="option-name">{{ item.item }}</span>
            <span class="option-price">{{ item.price === 0 ? '免费' : '+' + item.price + '元' }}</span>
          </div>
        </div>
      </template>
    </div>

    <!-- 响应时效 -->
    <div class="section-card" v-if="responseServices.length > 0">
      <div class="section-title-row collapsible" @click="toggleSection('response')">
        <span class="section-title">响应时效</span>
        <div class="section-right">
          <span v-if="selectedResponseLabel" class="section-badge">{{ selectedResponseLabel }}</span>
          <el-icon class="expand-icon" :class="{ expanded: expandedSections.response }"><ArrowRight /></el-icon>
        </div>
      </div>
      <template v-if="expandedSections.response">
        <div class="option-chips">
          <div
            v-for="item in responseServices"
            :key="item.id"
            class="option-chip"
            :class="{ active: selectedResponse === item.id }"
            @click="selectResponse(item.id)"
          >
            <span class="option-name">{{ item.item }}</span>
            <span class="option-price">{{ item.price === 0 ? '免费' : item.price + '元' }}</span>
          </div>
        </div>
      </template>
    </div>

    <!-- 交通费 -->
    <div class="section-card" v-if="transportServices.length > 0">
      <div class="section-title-row collapsible" @click="toggleSection('transport')">
        <span class="section-title">交通费</span>
        <div class="section-right">
          <span v-if="transportServices.filter(s => s.selected).length > 0" class="section-badge">{{ transportServices.filter(s => s.selected).length }}项</span>
          <el-icon class="expand-icon" :class="{ expanded: expandedSections.transport }"><ArrowRight /></el-icon>
        </div>
      </div>
      <template v-if="expandedSections.transport">
        <div class="option-chips">
          <div
            v-for="item in transportServices"
            :key="item.id"
            class="option-chip"
            :class="{ active: item.selected }"
            @click="item.selected = !item.selected; onItemChange()"
          >
            <span class="option-name">{{ item.item }}</span>
            <span class="option-price">{{ item.price }}元</span>
          </div>
        </div>
      </template>
    </div>

    <!-- 附加费用 -->
    <div class="section-card">
      <div class="section-title-row" @click="toggleSection('additional')">
        <span class="section-title">附加费用</span>
        <div class="section-right">
          <el-switch v-model="additionalFeeEnabled" @change="onItemChange" size="small" @click.stop />
        </div>
      </div>
      <template v-if="additionalFeeEnabled && expandedSections.additional">
        <div class="additional-form">
          <div class="form-row">
            <span class="form-label">金额</span>
            <el-input-number v-model="additionalFeeAmount" :min="0" :precision="2" size="default" controls-position="right" />
            <span class="form-unit">元</span>
          </div>
          <el-input v-model="additionalFeeRemark" placeholder="说明（可选）" size="default" />
        </div>
      </template>
    </div>

    <!-- 已选项目摘要 -->
    <div class="section-card selected-summary" v-if="selectedItems.length > 0">
      <div class="section-title">已选项目 ({{ selectedItems.length }})</div>
      <div class="summary-items">
        <div v-for="item in selectedItems" :key="item.id" class="summary-item">
          <span class="item-text">{{ item.displayText }}</span>
          <span class="item-total">¥{{ item.total }}</span>
        </div>
      </div>
    </div>

    <!-- 底部结果栏 -->
    <div class="result-bar">
      <div class="result-left">
        <div class="result-row">
          <span class="result-label">小计</span>
          <span class="result-amount">¥{{ subtotal }}</span>
        </div>
        <div class="result-row main">
          <span class="result-label">实收</span>
          <span class="result-amount highlight">¥{{ actualAmount }}</span>
        </div>
      </div>
      <div class="result-right">
        <el-button size="default" @click="showDetailDrawer = true">明细</el-button>
        <el-button type="primary" size="default" @click="handleSave" :disabled="selectedItems.length === 0">保存</el-button>
      </div>
    </div>

    <!-- 明细抽屉 -->
    <el-drawer v-model="showDetailDrawer" title="费用明细" direction="btt" size="65%">
      <div class="detail-content">
        <div class="detail-items">
          <div v-for="item in selectedItems" :key="item.id" class="detail-item">
            <span class="detail-name">{{ item.displayText }}</span>
            <span class="detail-total">¥{{ item.total }}</span>
          </div>
        </div>
        <div class="detail-divider"></div>
        <div class="detail-calc">
          <div class="calc-row">
            <span>小计</span>
            <span>¥{{ subtotal }}</span>
          </div>
          <div class="calc-row">
            <span>折扣</span>
            <el-input-number v-model="discount" :min="0" :max="subtotal" size="small" controls-position="right" />
          </div>
          <div class="calc-row total">
            <span>实收</span>
            <span class="highlight">¥{{ actualAmount }}</span>
          </div>
        </div>
        <el-input v-model="remark" type="textarea" :rows="2" placeholder="备注（可选）" style="margin-top: 12px;" />
        <div class="detail-actions">
          <el-button @click="resetCalculator" style="flex: 1;">重置</el-button>
          <el-button type="primary" @click="handleSave" :disabled="selectedItems.length === 0" style="flex: 1;">保存记录</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import { Minus, Plus, ArrowRight } from '@element-plus/icons-vue';
import { useFeeCalculator } from '../composables/useFeeCalculator';
import type { ServiceItem } from '../composables/useFeeCalculator';
import type { Customer } from '@/types';
import { matchPinyin } from '@/utils/pinyinFilter';

// el-select filterable 拼音过滤：按选项渲染 label 匹配
function filterByPinyin(query: string, item: unknown) {
  const label = String((item as { label?: unknown })?.label ?? '');
  return matchPinyin(label, query);
}

const props = defineProps<{
  projectId?: string;
  customers?: Customer[];
}>();

const emit = defineEmits<{
  saved: [];
}>();

const showDetailDrawer = ref(false);

const computerServiceList = ['出库送货', '安装就位', '回收转运', '脱密入库', '出库到就位', '回收到入库', '全流程服务'];

const {
  computerCount,
  discount,
  actualAmount,
  remark,
  selectedResponse,
  selectedTimeSlot,
  additionalFeeEnabled,
  additionalFeeAmount,
  additionalFeeRemark,
  currentProjectId,
  selectedCustomerId,
  peripheralInstallServices,
  peripheralRecycleServices,
  responseServices,
  timeSlotServices,
  transportServices,
  computerServiceMap,
  selectedItems,
  subtotal,
  onItemChange,
  onComputerServiceChange,
  onPeripheralChange,
  selectResponse,
  selectTimeSlot,
  saveRecord,
  resetCalculator,
  init,
} = useFeeCalculator();

// 包装保存：成功后通知父组件刷新费用记录列表
const handleSave = async () => {
  const ok = await saveRecord();
  if (ok) emit('saved');
};

// 折叠状态
const expandedSections = reactive<Record<string, boolean>>({
  computer: true,
  peripheral: false,
  timeSlot: false,
  response: false,
  transport: false,
  additional: false,
});

const toggleSection = (key: string) => {
  expandedSections[key] = !expandedSections[key];
};

// 外设按设备类型分组
const deviceTypes = ['复印机', '打印机', '扫描仪', '碎纸机', '投影机'];

interface PeripheralGroup {
  type: string;
  installItem: ServiceItem | null;
  recycleItem: ServiceItem | null;
  comboItem: ServiceItem | null;
  selectedCount: number;
  activeItem: ServiceItem | null;
}

const peripheralGroups = computed((): PeripheralGroup[] => {
  return deviceTypes.map(type => {
    const installItem = peripheralInstallServices.value.find(s => s.item.includes(type)) || null;
    const recycleItem = peripheralRecycleServices.value.find(s => !s.item.includes('全流程') && s.item.includes(type)) || null;
    const comboItem = peripheralRecycleServices.value.find(s => s.item.includes('全流程') && s.item.includes(type)) || null;
    const selectedCount = [installItem, recycleItem, comboItem].filter(s => s?.selected).length;
    const activeItem = [installItem, recycleItem, comboItem].find(s => s?.selected) || null;
    return { type, installItem, recycleItem, comboItem, selectedCount, activeItem };
  }).filter(g => g.installItem || g.recycleItem || g.comboItem);
});

const selectedPeripheralCount = computed(() => {
  return peripheralGroups.value.reduce((sum, g) => sum + g.selectedCount, 0);
});

const selectedTimeSlotLabel = computed(() => {
  const item = timeSlotServices.value.find(s => s.id === selectedTimeSlot.value);
  return item?.item || '';
});

const selectedResponseLabel = computed(() => {
  const item = responseServices.value.find(s => s.id === selectedResponse.value);
  return item?.item || '';
});

const toggleComputerService = (name: string) => {
  const item = computerServiceMap.value[name];
  if (!item || item.disabled) return;
  item.selected = !item.selected;
  onComputerServiceChange(item);
};

const togglePeripheral = (item: ServiceItem) => {
  if (item.disabled) return;
  item.selected = !item.selected;
  onPeripheralChange(item);
};

const getComputerPriceText = (name: string) => {
  const item = computerServiceMap.value[name];
  if (!item) return '';
  if (name === '出库到就位') {
    return `≤5台${item.priceSmall || 150}元/次, >5台${item.priceLarge || 40}元/台`;
  }
  if (name === '出库送货' || name === '回收转运') {
    return `≤5台${item.priceSmall || 100}元/次, >5台${item.priceLarge || 20}元/台`;
  }
  if (name === '全流程服务' || name === '回收到入库') {
    return `${item.priceSmall || 200}元/台`;
  }
  return `${item.priceSmall || 20}元/台`;
};

void init();

// 同步当前项目ID，决定费用记录归属与客户必填
watch(
  () => props.projectId,
  (val) => {
    currentProjectId.value = val || '';
  },
  { immediate: true },
);
</script>

<style scoped>
.mobile-calculator {
  padding-bottom: 100px;
}

/* ========== 区块卡片 ========== */
.section-card {
  background: var(--card-bg, #fff);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color-lighter, #f0f0f0);
}

/* 客户选择卡片 */
.customer-card {
  border-color: #bfdbfe;
  background: #f0f9ff;
}

.customer-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
  white-space: nowrap;
}

.customer-label em {
  color: #ef4444;
  font-style: normal;
  margin-left: 2px;
}

.customer-select {
  flex: 1;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title-row.collapsible {
  cursor: pointer;
}

.section-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-badge {
  font-size: 11px;
  background: #eff6ff;
  color: #3b82f6;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.expand-icon {
  transition: transform 0.2s;
  color: var(--text-secondary, #999);
  font-size: 14px;
}

.expand-icon.small {
  font-size: 12px;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

/* ========== 计算机数量 ========== */
.count-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 12px 0 8px;
}

.count-val {
  font-size: 28px;
  font-weight: 700;
  min-width: 50px;
  text-align: center;
  color: var(--text-primary, #1a1a1a);
}

.count-unit {
  font-size: 14px;
  color: var(--text-secondary, #999);
}

/* ========== 服务选择网格 ========== */
.service-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 10px;
}

.service-chip {
  background: var(--bg-color-page, #f5f7fa);
  border-radius: 10px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
  border: 2px solid transparent;
}

.service-chip:active {
  transform: scale(0.96);
}

.service-chip.active {
  background: #eff6ff;
  border-color: #3b82f6;
}

.service-chip.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.chip-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #333);
  margin-bottom: 4px;
}

.service-chip.active .chip-name {
  color: #3b82f6;
}

.chip-price {
  font-size: 10px;
  color: var(--text-secondary, #999);
  line-height: 1.3;
}

.service-chip.active .chip-price {
  color: #3b82f6;
}

/* ========== 外设卡片 ========== */
.peripheral-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 10px;
}

.peripheral-card {
  background: var(--bg-color-page, #f5f7fa);
  border-radius: 10px;
  padding: 10px;
  border: 2px solid transparent;
  transition: all 0.15s;
}

.peripheral-card.has-selected {
  background: #eff6ff;
  border-color: #3b82f6;
}

.pcard-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #333);
  margin-bottom: 8px;
  text-align: center;
}

.has-selected .pcard-title {
  color: #3b82f6;
}

.pcard-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pcard-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.15s;
}

.pcard-option:active {
  transform: scale(0.96);
}

.pcard-option.selected {
  background: #3b82f6;
}

.pcard-option.selected .opt-name,
.pcard-option.selected .opt-price {
  color: #fff;
}

.pcard-option.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.opt-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary, #333);
}

.opt-price {
  font-size: 10px;
  color: var(--text-secondary, #999);
}

.pcard-qty {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
}

.qty-label {
  font-size: 11px;
  color: var(--text-secondary, #666);
}

.qty-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-val {
  font-size: 16px;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

/* ========== 选项芯片 ========== */
.option-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.option-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 14px;
  background: var(--bg-color-page, #f5f7fa);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  border: 2px solid transparent;
  min-width: 70px;
}

.option-chip:active {
  transform: scale(0.96);
}

.option-chip.active {
  background: #eff6ff;
  border-color: #3b82f6;
}

.option-name {
  font-size: 13px;
  font-weight: 500;
}

.option-price {
  font-size: 10px;
  color: var(--text-secondary, #999);
}

.option-chip.active .option-price {
  color: #3b82f6;
}

/* ========== 附加费用 ========== */
.additional-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  color: var(--text-secondary, #666);
  min-width: 36px;
}

.form-unit {
  font-size: 13px;
  color: var(--text-secondary, #999);
}

/* ========== 已选摘要 ========== */
.selected-summary {
  background: #f0f9ff;
  border-color: #bfdbfe;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 2px 0;
}

.item-text {
  color: var(--text-primary, #333);
}

.item-total {
  color: #3b82f6;
  font-weight: 500;
}

/* ========== 底部结果栏 ========== */
.result-bar {
  position: fixed;
  bottom: 56px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: var(--card-bg, #fff);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
  z-index: 101;
}

.result-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.result-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.result-label {
  font-size: 12px;
  color: var(--text-secondary, #999);
}

.result-amount {
  font-size: 14px;
  font-weight: 600;
}

.result-row.main .result-label {
  font-size: 14px;
  color: var(--text-primary, #333);
}

.result-row.main .result-amount {
  font-size: 20px;
}

.highlight {
  color: #3b82f6;
  font-weight: 700;
}

.result-right {
  display: flex;
  gap: 8px;
}

/* ========== 明细抽屉 ========== */
.detail-content {
  padding: 0 4px;
}

.detail-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed var(--border-color-lighter, #eee);
  font-size: 14px;
}

.detail-name {
  color: var(--text-primary, #333);
}

.detail-total {
  font-weight: 600;
  color: var(--text-primary, #333);
}

.detail-divider {
  height: 1px;
  background: var(--border-color-lighter, #eee);
  margin: 12px 0;
}

.detail-calc {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.calc-row.total {
  font-size: 16px;
  font-weight: 600;
}

.detail-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}
</style>
