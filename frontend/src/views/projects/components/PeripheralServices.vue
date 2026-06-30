<template>
  <div class="category-section">
    <div class="section-title">外设服务</div>
    <div class="peripheral-table">
      <div class="table-header">
        <div class="header-cell">安装（含送货）</div>
        <div class="header-cell">回收（单项）</div>
        <div class="header-cell">全流程服务</div>
      </div>
      <div class="table-body">
        <div class="table-row" v-for="row in rows" :key="row.deviceType">
          <!-- 安装列 -->
          <div class="table-cell">
            <template v-if="row.install">
              <el-checkbox :model-value="row.install.selected" :disabled="row.install.disabled" @update:model-value="handlePeripheralChange(row.install!, $event)">
                {{ row.install.item }}
                <span class="price-note">{{ row.install.price }}元/{{ row.install.unit }}</span>
              </el-checkbox>
              <div v-if="row.install.selected" class="qty-row">
                <el-input-number 
                  :model-value="row.install.quantity" 
                  @update:model-value="updatePeripheralQuantity(row.install!, $event)"
                  :min="1" 
                  :max="9999" 
                  size="small" 
                  style="width: 80px"
                />
                <span class="unit">台</span>
                <template v-if="row.install.item.includes('复印机') || row.install.item.includes('打印机')">
                  <span style="margin-left: 12px" class="unit">终端连接：</span>
                  <el-input-number 
                    :model-value="row.install.terminalCount" 
                    @update:model-value="updatePeripheralTerminalCount(row.install!, $event)"
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
          <!-- 回收单项列 -->
          <div class="table-cell">
            <template v-if="row.recycle">
              <el-checkbox :model-value="row.recycle.selected" :disabled="row.recycle.disabled" @update:model-value="handlePeripheralChange(row.recycle!, $event)">
                {{ row.recycle.item }}
                <span class="price-note">{{ row.recycle.price }}元/{{ row.recycle.unit }}</span>
              </el-checkbox>
              <div v-if="row.recycle.selected" class="qty-row">
                <el-input-number 
                  :model-value="row.recycle.quantity" 
                  @update:model-value="updatePeripheralQuantity(row.recycle!, $event)"
                  :min="1" 
                  :max="9999" 
                  size="small" 
                  style="width: 80px"
                />
                <span class="unit">台</span>
              </div>
            </template>
          </div>
          <!-- 全流程服务列 -->
          <div class="table-cell">
            <template v-if="row.combo">
              <el-checkbox :model-value="row.combo.selected" :disabled="row.combo.disabled" @update:model-value="handlePeripheralChange(row.combo!, $event)">
                {{ row.combo.item }}
                <span class="price-note">{{ row.combo.price }}元/{{ row.combo.unit }}</span>
              </el-checkbox>
              <div v-if="row.combo.selected" class="qty-row">
                <el-input-number 
                  :model-value="row.combo.quantity" 
                  @update:model-value="updatePeripheralQuantity(row.combo!, $event)"
                  :min="1" 
                  :max="9999" 
                  size="small" 
                  style="width: 80px"
                />
                <span class="unit">台</span>
                <template v-if="row.combo.item.includes('复印机') || row.combo.item.includes('打印机')">
                  <span style="margin-left: 12px" class="unit">终端连接：</span>
                  <el-input-number 
                    :model-value="row.combo.terminalCount" 
                    @update:model-value="updatePeripheralTerminalCount(row.combo!, $event)"
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ServiceItem } from '../composables/useFeeCalculator';

const props = defineProps<{
  peripheralInstallServices: ServiceItem[];
  peripheralRecycleServices: ServiceItem[];
  peripheralDeliveryServices: ServiceItem[];
  maxPeripheralRows: number;
}>();

const emit = defineEmits<{
  peripheralChange: [item: ServiceItem];
  itemChange: [];
}>();

// 获取回收单项服务（非全流程服务）
const recycleSingleServices = computed(() => {
  return props.peripheralRecycleServices.filter(s => !s.item.includes('全流程'));
});

// 获取全流程服务
const comboServices = computed(() => {
  return props.peripheralRecycleServices.filter(s => s.item.includes('全流程'));
});

// 根据设备类型获取对应的服务
const getInstallServiceByType = (deviceType: string): ServiceItem | undefined => {
  return props.peripheralInstallServices.find(s => s.item.includes(deviceType));
};

const getRecycleServiceByType = (deviceType: string): ServiceItem | undefined => {
  return recycleSingleServices.value.find(s => s.item.includes(deviceType));
};

const getComboServiceByType = (deviceType: string): ServiceItem | undefined => {
  return comboServices.value.find(s => s.item.includes(deviceType));
};

// 获取"其他外设回收"服务
const otherRecycleService = computed(() => {
  return recycleSingleServices.value.find(s => s.item.includes('其他外设'));
});

// 计算行数据（按设备类型对齐）
const rows = computed(() => {
  const result = [];
  
  // 复印机行
  result.push({
    deviceType: '复印机',
    install: getInstallServiceByType('复印机'),
    recycle: getRecycleServiceByType('复印机'),
    combo: getComboServiceByType('复印机'),
  });
  
  // 打印机行：包含打印机安装 + 其他外设回收
  result.push({
    deviceType: '打印机',
    install: getInstallServiceByType('打印机'),
    recycle: otherRecycleService.value,
    combo: getComboServiceByType('打印机'),
  });
  
  // 其他设备行（扫描仪、碎纸机、投影机）
  ['扫描仪', '碎纸机', '投影机'].forEach(deviceType => {
    result.push({
      deviceType,
      install: getInstallServiceByType(deviceType),
      recycle: getRecycleServiceByType(deviceType),
      combo: getComboServiceByType(deviceType),
    });
  });
  
  return result;
});

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
  padding: 10px 12px;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 13px;
}

.header-cell:not(:last-child) {
  border-right: 1px solid var(--border-color-lighter);
}

.table-body {
  background: var(--card-bg);
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
  padding: 12px;
  min-height: 50px;
}

.table-cell:not(:last-child) {
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