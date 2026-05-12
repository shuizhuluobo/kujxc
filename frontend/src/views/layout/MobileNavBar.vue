<template>
  <div class="mobile-nav">
    <div 
      class="nav-item" 
      :class="{ active: currentPath === '/' }"
      @click="$emit('navigate', '/')"
      v-if="canAccessWorkOrder"
    >
      <el-icon><Document /></el-icon>
      <span>待办</span>
    </div>
    <div 
      class="nav-item" 
      :class="{ active: currentPath === '/history' }"
      @click="$emit('navigate', '/history')"
      v-if="canAccessWorkOrderHistory"
    >
      <el-icon><List /></el-icon>
      <span>历史</span>
    </div>
    <div 
      class="nav-item" 
      :class="{ active: currentPath.startsWith('/wiki') }"
      @click="$emit('navigate', '/wiki')"
      v-if="canAccessWiki"
    >
      <el-icon><Collection /></el-icon>
      <span>知识</span>
    </div>
    <div 
      class="nav-item" 
      :class="{ active: currentPath === '/fee-calculator' }"
      @click="$emit('navigate', '/fee-calculator')"
      v-if="canAccessFeeCalculator"
    >
      <el-icon><Wallet /></el-icon>
      <span>台账</span>
    </div>
    <div 
      class="nav-item" 
      :class="{ active: currentPath.startsWith('/admin') }"
      @click="$emit('showAdmin')"
      v-if="canAccessAnyAdmin"
    >
      <el-icon><Setting /></el-icon>
      <span>管理</span>
    </div>
    <div 
      class="nav-item" 
      :class="{ active: currentPath === '/profile' }"
      @click="$emit('navigate', '/profile')"
      v-if="canAccessProfile"
    >
      <el-icon><User /></el-icon>
      <span>我的</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document, List, Setting, User, Collection, Wallet } from '@element-plus/icons-vue';

defineProps<{
  currentPath: string;
  canAccessWorkOrder: boolean;
  canAccessWorkOrderHistory: boolean;
  canAccessWiki: boolean;
  canAccessFeeCalculator: boolean;
  canAccessProfile: boolean;
  canAccessAnyAdmin: boolean;
}>();

defineEmits<{
  navigate: [path: string];
  showAdmin: [];
}>();
</script>

<style scoped>
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--card-bg);
  border-top: 1px solid var(--border-color-lighter);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-top: 8px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  z-index: 100;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 8px 16px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 8px;
}

.nav-item:hover {
  color: var(--primary-color);
}

.nav-item.active {
  color: var(--primary-color);
}

.nav-item .el-icon {
  font-size: 22px;
}
</style>
