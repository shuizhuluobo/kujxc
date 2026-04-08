<template>
  <div class="category-section">
    <div class="section-title">
      <span>计算机服务</span>
      <span class="count-input">
        数量：
        <el-input-number :model-value="computerCount" @update:model-value="$emit('update:computerCount', $event)" :min="0" :max="9999" size="small" style="width: 80px" />
        <span class="unit">台</span>
      </span>
    </div>
    <div class="computer-table">
      <div class="table-header">
        <div class="header-cell">单项服务</div>
        <div class="header-cell">组合服务</div>
      </div>
      <div class="table-body">
        <div class="table-row">
          <div class="table-cell" :class="{ disabled: computerServiceMap['出库送货']?.disabled }">
            <el-checkbox 
              :model-value="computerServiceMap['出库送货']?.selected" 
              :disabled="computerServiceMap['出库送货']?.disabled"
              @update:model-value="emitComputerServiceChange('出库送货', $event)"
            >
              出库送货
              <span class="price-note">
                {{ computerServiceMap['出库送货']?.priceLarge || 20 }}元/台  ≤5台{{ computerServiceMap['出库送货']?.priceSmall || 100 }}元/次
              </span>
            </el-checkbox>
          </div>
          <div class="table-cell" :class="{ disabled: computerServiceMap['出库到就位']?.disabled }">
            <el-checkbox 
              :model-value="computerServiceMap['出库到就位']?.selected" 
              :disabled="computerServiceMap['出库到就位']?.disabled"
              @update:model-value="emitComputerServiceChange('出库到就位', $event)"
            >
              出库到就位
              <span class="price-note">(含送货+安装)</span>
              <span class="price-note">
                {{ computerServiceMap['出库到就位']?.priceLarge || 40 }}元/台  ≤5台{{ computerServiceMap['出库到就位']?.priceSmall || 150 }}元/次
              </span>
            </el-checkbox>
          </div>
        </div>
        <div class="table-row">
          <div class="table-cell" :class="{ disabled: computerServiceMap['安装就位']?.disabled }">
            <el-checkbox 
              :model-value="computerServiceMap['安装就位']?.selected" 
              :disabled="computerServiceMap['安装就位']?.disabled"
              @update:model-value="emitComputerServiceChange('安装就位', $event)"
            >
              安装就位
              <span class="price-note">{{ computerServiceMap['安装就位']?.priceSmall || 20 }}元/台</span>
            </el-checkbox>
          </div>
          <div class="table-cell" :class="{ disabled: computerServiceMap['回收到入库']?.disabled }">
            <el-checkbox 
              :model-value="computerServiceMap['回收到入库']?.selected" 
              :disabled="computerServiceMap['回收到入库']?.disabled"
              @update:model-value="emitComputerServiceChange('回收到入库', $event)"
            >
              回收到入库
              <span class="price-note">(含回收+脱密)</span>
              <span class="price-note">{{ computerServiceMap['回收到入库']?.priceSmall || 170 }}元/台</span>
            </el-checkbox>
          </div>
        </div>
        <div class="table-row">
          <div class="table-cell" :class="{ disabled: computerServiceMap['回收转运']?.disabled }">
            <el-checkbox 
              :model-value="computerServiceMap['回收转运']?.selected" 
              :disabled="computerServiceMap['回收转运']?.disabled"
              @update:model-value="emitComputerServiceChange('回收转运', $event)"
            >
              回收转运
              <span class="price-note">
                {{ computerServiceMap['回收转运']?.priceLarge || 20 }}元/台  ≤5台{{ computerServiceMap['回收转运']?.priceSmall || 100 }}元/次
              </span>
            </el-checkbox>
          </div>
          <div class="table-cell" :class="{ disabled: computerServiceMap['全流程服务']?.disabled }">
            <el-checkbox 
              :model-value="computerServiceMap['全流程服务']?.selected" 
              :disabled="computerServiceMap['全流程服务']?.disabled"
              @update:model-value="emitComputerServiceChange('全流程服务', $event)"
            >
              全流程服务
              <span class="price-note">(含所有服务)</span>
              <span class="price-note">{{ computerServiceMap['全流程服务']?.priceSmall || 200 }}元/台</span>
            </el-checkbox>
          </div>
        </div>
        <div class="table-row">
          <div class="table-cell" :class="{ disabled: computerServiceMap['脱密入库']?.disabled }">
            <el-checkbox 
              :model-value="computerServiceMap['脱密入库']?.selected" 
              :disabled="computerServiceMap['脱密入库']?.disabled"
              @update:model-value="emitComputerServiceChange('脱密入库', $event)"
            >
              脱密入库
              <span class="price-note">{{ computerServiceMap['脱密入库']?.priceSmall || 150 }}元/台</span>
            </el-checkbox>
          </div>
          <div class="table-cell empty"></div>
        </div>
      </div>
    </div>
  </div>

  <div class="category-section">
    <div class="section-title">
      <span>附加费用</span>
      <span class="unit">（网络调试、额外软件安装等其他要求）</span>
    </div>
    <div class="additional-fee-section">
      <el-checkbox :model-value="additionalFeeEnabled" @update:model-value="$emit('update:additionalFeeEnabled', $event)">
        启用附加费用
      </el-checkbox>
      <div v-if="additionalFeeEnabled" class="additional-fee-inputs">
        <div class="input-row">
          <span class="label">金额：</span>
          <el-input-number 
            :model-value="additionalFeeAmount" 
            @update:model-value="$emit('update:additionalFeeAmount', $event)" 
            :min="0" 
            :max="99999" 
            :precision="2"
            :step="10"
            size="small" 
            style="width: 150px"
            @change="$emit('itemChange')"
          />
          <span class="unit">元</span>
        </div>
        <div class="input-row" style="margin-top: 8px">
          <span class="label">说明：</span>
          <el-input 
            :model-value="additionalFeeRemark" 
            @update:model-value="$emit('update:additionalFeeRemark', $event)"
            placeholder="请输入附加费用说明"
            size="small"
            style="flex: 1; max-width: 300px"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ServiceItem } from '../composables/useFeeCalculator';

const props = defineProps<{
  computerCount: number;
  computerServiceMap: Record<string, ServiceItem>;
  additionalFeeEnabled: boolean;
  additionalFeeAmount: number;
  additionalFeeRemark: string;
}>();

const emit = defineEmits<{
  'update:computerCount': [value: number];
  'update:additionalFeeEnabled': [value: boolean];
  'update:additionalFeeAmount': [value: number];
  'update:additionalFeeRemark': [value: string];
  'computerServiceChange': [item: ServiceItem];
  'itemChange': [];
}>();

const emitComputerServiceChange = (name: string, value: boolean) => {
  const item = props.computerServiceMap[name];
  if (item) {
    emit('computerServiceChange', { ...item, selected: value });
  }
};
</script>

<style scoped>
.category-section {
  margin-bottom: 20px;
}

.section-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title .count-input {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal;
  font-size: 14px;
}

.section-title .unit {
  color: var(--text-secondary);
}

.computer-table, .peripheral-table {
  border: 1px solid var(--border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: flex;
  background: var(--bg-color-page);
  border-bottom: 1px solid var(--border-color-lighter);
}

.header-cell {
  flex: 1;
  padding: 10px 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-cell:first-child {
  border-right: 1px solid var(--border-color-lighter);
}

.table-body {
  background: #fff;
}

.table-row {
  display: flex;
  border-bottom: 1px solid var(--border-color-lighter);
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  flex: 1;
  padding: 12px 16px;
  min-height: 50px;
}

.table-cell:first-child {
  border-right: 1px solid var(--border-color-lighter);
}

.table-cell.empty {
  background: var(--bg-color-page);
}

.table-cell.disabled {
  opacity: 0.5;
  background: var(--bg-color-page);
}

.table-cell.disabled :deep(.el-checkbox) {
  cursor: not-allowed;
}

.table-cell.disabled :deep(.el-checkbox__inner) {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
}

.table-cell.disabled :deep(.el-checkbox__label) {
  color: #c0c4cc;
}

.price-note {
  font-size: 12px;
  color: var(--primary-color);
  margin-left: 4px;
  white-space: nowrap;
}

.additional-fee-section {
  padding: 16px 0;
}

.additional-fee-inputs {
  margin-top: 12px;
  padding: 12px 16px;
  background: var(--bg-color-page);
  border-radius: 4px;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-row .label {
  font-size: 14px;
  color: var(--text-primary);
  min-width: 60px;
}
</style>