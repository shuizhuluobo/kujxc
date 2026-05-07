<template>
  <button 
    class="theme-toggle" 
    @click="toggleDark()" 
    title="切换深色模式"
    type="button"
  >
    <div class="toggle-track">
      <div class="toggle-thumb">
        <el-icon v-if="isDark" class="icon moon"><Moon /></el-icon>
        <el-icon v-else class="icon sun"><Sunny /></el-icon>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core';
import { Sunny, Moon } from '@element-plus/icons-vue';

const isDark = useDark();
const toggleDark = useToggle(isDark);
</script>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 20px;
  transition: background-color 0.3s;
}

.theme-toggle:hover {
  background-color: rgba(128, 128, 128, 0.1);
}

.toggle-track {
  width: 44px;
  height: 24px;
  background-color: var(--border-color);
  border-radius: 12px;
  position: relative;
  transition: background-color 0.3s;
  border: 1px solid var(--border-color);
}

.dark .toggle-track {
  background-color: #334155;
  border-color: #475569;
}

.toggle-thumb {
  width: 20px;
  height: 20px;
  background-color: var(--card-bg);
  border-radius: 50%;
  position: absolute;
  top: 1px;
  left: 1px;
  transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.dark .toggle-thumb {
  background-color: var(--bg-color);
  transform: translateX(20px);
}

.icon {
  font-size: 14px;
}

.sun {
  color: var(--warning-color);
}

.moon {
  color: var(--primary-color);
}
</style>
