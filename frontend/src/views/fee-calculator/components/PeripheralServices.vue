<template>
  <div class="category-section">
    <div class="section-title">外设服务</div>
    <div class="peripheral-table">
      <div class="table-header">
        <div class="header-cell">安装</div>
        <div class="header-cell">回收</div>
      </div>
      <div class="table-body">
        <div class="table-row" v-for="index in maxPeripheralRows" :key="index">
          <div class="table-cell">
            <template v-if="peripheralInstallServices[index - 1]">
              <el-checkbox :model-value="peripheralInstallServices[index - 1].selected" @update:model-value="handlePeripheralChange(peripheralInstallServices[index - 1], $event)">
                {{ peripheralInstallServices[index - 1].item }}
                <span class="price-note">{{ peripheralInstallServices[index - 1].price }}元/{{ peripheralInstallServices[index - 1].unit }}</span>
              </el-checkbox>
              <div v-if="peripheralInstallServices[index - 1].selected" class="qty-row">
                <el-input-number 
                  :model-value="peripheralInstallServices[index - 1].quantity" 
                  @update:model-value="updatePeripheralQuantity(peripheralInstallServices[index - 1], $event)"
                  :min="1" 
                  :max="9999" 
                  size="small" 
                  style="width: 80px"
                />
                <span class="unit">台</span>
                <template v-if="peripheralInstallServices[index - 1].item.includes('复印机') || peripheralInstallServices[index - 1].item.includes('打印机')">
                  <span style="margin-left: 12px" class="unit">终端连接：</span>
                  <el-input-number 
                    :model-value="peripheralInstallServices[index - 1].terminalCount" 
                    @update:model-value="updatePeripheralTerminalCount(peripheralInstallServices[index - 1], $event)"
                    :min="0" 
                    :max="99" 
                    size="small" 
                    style="width: 80px"
                  />
                  <span class="unit">台</span>
                </template>
              </div>
            </template>
          </div>
          <div class="table-cell">
            <template v-if="peripheralRecycleServices[index - 1]">
              <el-checkbox :model-value="peripheralRecycleServices[index - 1].selected" @update:model-value="handlePeripheralChange(peripheralRecycleServices[index - 1], $event)">
                {{ peripheralRecycleServices[index - 1].item }}
                <span class="price-note">{{ peripheralRecycleServices[index - 1].price }}元/{{ peripheralRecycleServices[index - 1].unit }}</span>
              </el-checkbox>
              <div v-if="peripheralRecycleServices[index - 1].selected" class="qty-row">
                <el-input-number 
                  :model-value="peripheralRecycleServices[index - 1].quantity" 
                  @update:model-value="updatePeripheralQuantity(peripheralRecycleServices[index - 1], $event)"
                  :min="1" 
                  :max="9999" 
                  size="small" 
                  style="width: 80px"
                />
                <span class="unit">台</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ServiceItem } from '../composables/useFeeCalculator';

defineProps<{
  peripheralInstallServices: ServiceItem[];
  peripheralRecycleServices: ServiceItem[];
  maxPeripheralRows: number;
}>();

const emit = defineEmits<{
  peripheralChange: [item: ServiceItem];
  itemChange: [];
}>();

const handlePeripheralChange = (item: ServiceItem, value: boolean) => {
  item.selected = value;
  emit('peripheralChange', item);
};

const updatePeripheralQuantity = (item: ServiceItem, value: number | undefined) => {
  item.quantity = value || 0;
  emit('itemChange');
};

const updatePeripheralTerminalCount = (item: ServiceItem, value: number | undefined) => {
  item.terminalCount = value || 0;
  emit('itemChange');
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
}

.peripheral-table {
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

.price-note {
  font-size: 12px;
  color: var(--primary-color);
  margin-left: 4px;
  white-space: nowrap;
}

.qty-row {
  margin-top: 8px;
  padding-left: 24px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.qty-row .unit {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>