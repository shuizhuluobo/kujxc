<template>
  <div class="result-section">
    <h3>费用明细</h3>
    <div class="result-items">
      <div v-for="item in selectedItems" :key="item.id" class="result-item">
        <span class="item-name">{{ item.displayText }}</span>
        <span class="item-total">{{ item.total }}元</span>
      </div>
      <div v-if="selectedItems.length === 0" class="empty-hint">请选择服务项目</div>
    </div>
    <el-divider></el-divider>
    <div class="result-summary">
      <div class="summary-row">
        <span>小计：</span>
        <span class="amount">{{ subtotal }}元</span>
      </div>
      <div class="summary-row">
        <span>优惠金额：</span>
        <el-input-number :model-value="discount" @update:model-value="$emit('update:discount', $event)" :min="0" :max="subtotal" :precision="2" size="small" />
      </div>
      <div class="summary-row total">
        <span>实收：</span>
        <el-input-number :model-value="actualAmount" @update:model-value="$emit('update:actualAmount', $event)" :min="0" :max="999999" :precision="2" size="small" />
      </div>
      <div class="summary-row final-total">
        <span>应收金额：</span>
        <span class="amount">{{ actualAmount }}元</span>
      </div>
    </div>
    <div class="remark-section">
      <el-input :model-value="remark" @update:model-value="$emit('update:remark', $event)" type="textarea" :rows="2" placeholder="备注说明" />
    </div>
    <slot name="extra-actions" />
    <div class="action-buttons">
      <el-button v-if="canSave !== false" type="primary" @click="emit('save')" :disabled="selectedItems.length === 0">保存记录</el-button>
      <el-button @click="emit('print')" :disabled="selectedItems.length === 0">打印</el-button>
      <el-button @click="emit('reset')">重置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SelectedItem } from '../composables/useFeeCalculator';

defineProps<{
  selectedItems: SelectedItem[];
  subtotal: number;
  discount: number;
  actualAmount: number;
  remark: string;
  canSave?: boolean;
}>();

const emit = defineEmits<{
  'update:discount': [value: number];
  'update:actualAmount': [value: number];
  'update:remark': [value: string];
  save: [];
  print: [];
  reset: [];
}>();
</script>

<style scoped>
.result-section {
  width: 340px;
  flex-shrink: 0;
  background: var(--bg-color-page);
  padding: 16px;
  border-radius: 8px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.result-section h3 {
  font-size: 16px;
  margin: 0 0 16px;
  color: var(--text-primary);
}

.result-items {
  max-height: 300px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed var(--border-color-lighter);
  gap: 12px;
}

.result-item .item-name {
  flex: 1;
  word-break: break-all;
}

.empty-hint {
  color: var(--text-secondary);
  text-align: center;
  padding: 20px;
}

.item-total {
  font-weight: 600;
  color: var(--primary-color);
  white-space: nowrap;
}

.result-summary {
  margin-top: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.summary-row.total {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color-lighter);
}

.summary-row.final-total {
  font-size: 18px;
  font-weight: 600;
}

.summary-row .amount {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
}

.remark-section {
  margin-top: 16px;
}

.action-buttons {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}
</style>