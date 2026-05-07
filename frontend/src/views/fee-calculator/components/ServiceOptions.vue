<template>
  <div class="category-section">
    <div class="section-title">
      <span>服务时段<span class="title-note">（正常工作时间内不额外收费）</span></span>
    </div>
    <div class="horizontal-options">
      <div 
        v-for="item in timeSlotServices" 
        :key="item.id" 
        class="option-item"
        :class="{ selected: selectedTimeSlot === item.id }"
      >
        <el-radio v-model="localSelectedTimeSlot" :label="item.id" @change="handleTimeSlotChange">
          {{ item.item }}
          <span class="price-note">{{ item.price === 0 ? '免费' : '+' + item.price + '元' }}</span>
        </el-radio>
      </div>
    </div>
  </div>

  <div class="category-section">
    <div class="section-title">
      <span>响应时效<span class="title-note">（下一工作日不额外收费）</span></span>
    </div>
    <div class="horizontal-options">
      <div 
        v-for="item in responseServices" 
        :key="item.id" 
        class="option-item"
        :class="{ selected: selectedResponse === item.id }"
      >
        <el-radio v-model="localSelectedResponse" :label="item.id" @change="handleResponseChange">
          {{ item.item }}
          <span v-if="item.description" class="option-description">{{ item.description }}</span>
          <span class="price-note">{{ item.price === 0 ? '免费' : item.price + '元' }}</span>
        </el-radio>
      </div>
    </div>
  </div>

  <div class="category-section">
    <div class="section-title">
      <span>交通费<span class="title-note">（市区不额外收费）</span></span>
    </div>
    <div class="horizontal-options multi-select">
      <div 
        v-for="item in transportServices" 
        :key="item.id" 
        class="option-item"
        :class="{ selected: item.selected }"
      >
        <el-checkbox :model-value="item.selected" @update:model-value="handleTransportChange(item, $event)">
          {{ item.item }}
          <span class="price-note">{{ item.price }}元</span>
        </el-checkbox>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ServiceItem } from '../composables/useFeeCalculator';

const props = defineProps<{
  responseServices: ServiceItem[];
  timeSlotServices: ServiceItem[];
  transportServices: ServiceItem[];
  selectedResponse: string;
  selectedTimeSlot: string;
}>();

const emit = defineEmits<{
  selectResponse: [id: string];
  selectTimeSlot: [id: string];
  itemChange: [];
}>();

// 本地响应式变量
const localSelectedResponse = ref(props.selectedResponse);
const localSelectedTimeSlot = ref(props.selectedTimeSlot);

// 监听 props 变化
watch(() => props.selectedResponse, (newValue) => {
  localSelectedResponse.value = newValue;
});

watch(() => props.selectedTimeSlot, (newValue) => {
  localSelectedTimeSlot.value = newValue;
});

// 处理响应时效选择
const handleResponseChange = () => {
  emit('selectResponse', localSelectedResponse.value);
  emit('itemChange');
};

// 处理服务时段选择
const handleTimeSlotChange = () => {
  emit('selectTimeSlot', localSelectedTimeSlot.value);
  emit('itemChange');
};

const handleTransportChange = (item: ServiceItem, value: boolean) => {
  item.selected = value;
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

.section-title .title-note {
  font-weight: normal;
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 4px;
}

.horizontal-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 12px 0;
}

.horizontal-options.multi-select {
  gap: 24px;
}

.option-item {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.option-item:hover {
  background: var(--bg-color-page);
}

.option-item.selected {
  background: rgba(var(--primary-rgb), 0.1);
  border-color: var(--primary-color);
}

.price-note {
  font-size: 12px;
  color: var(--primary-color);
  margin-left: 4px;
  white-space: nowrap;
}

.option-description {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: normal;
  margin-left: 4px;
}
</style>