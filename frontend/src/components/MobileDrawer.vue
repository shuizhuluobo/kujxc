<template>
  <van-popup
    v-model:show="visible"
    position="left"
    :style="{ width: '80%', height: '100%' }"
    :close-on-click-overlay="true"
  >
    <div class="mobile-drawer">
      <div class="drawer-header">
        <h3>{{ title }}</h3>
        <van-icon name="cross" @click="handleClose" />
      </div>
      <div class="drawer-body">
        <slot></slot>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Popup as VanPopup, Icon as VanIcon } from 'vant';

interface Props {
  modelValue: boolean;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '标题'
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const visible = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  visible.value = val;
});

watch(visible, (val) => {
  emit('update:modelValue', val);
});

const handleClose = () => {
  visible.value = false;
};
</script>

<style scoped>
.mobile-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-color-page);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color-lighter);
  background: white;
}

.drawer-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.drawer-header .van-icon {
  font-size: 20px;
  color: var(--text-secondary);
  cursor: pointer;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
</style>
