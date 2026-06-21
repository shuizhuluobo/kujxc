<template>
  <el-aside :width="sidebarCollapsed ? '64px' : '220px'" class="sidebar">
    <div class="logo" @click="$emit('navigate', '/')">
      <img v-if="!sidebarCollapsed" src="/ku_main_logo.png" alt="Logo" class="logo-img" />
      <img v-else src="/ku_main_logo.png" alt="Logo" class="logo-img-small" />
    </div>
    
    <el-menu
      :default-active="currentPath"
      :collapse="sidebarCollapsed"
      router
      class="sidebar-menu"
    >
      <el-menu-item index="/" v-if="canAccessWorkOrder">
        <el-icon><Document /></el-icon>
        <span>待办工单</span>
      </el-menu-item>
      
      <el-menu-item index="/history" v-if="canAccessWorkOrderHistory">
        <el-icon><List /></el-icon>
        <span>历史工单</span>
      </el-menu-item>
      
      <el-menu-item index="/wiki" v-if="canAccessWiki">
        <el-icon><Collection /></el-icon>
        <span>知识库</span>
      </el-menu-item>
      
      <el-menu-item index="/projects" v-if="canAccessProjects">
        <el-icon><Wallet /></el-icon>
        <span>项目记录</span>
      </el-menu-item>
      
      <el-sub-menu index="admin" v-if="canAccessAnyAdmin">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>基础数据</span>
        </template>
        <el-menu-item index="/admin/users" v-if="canAccessUserManage">用户管理</el-menu-item>
        <el-menu-item index="/admin/roles" v-if="canAccessRoleManage">角色管理</el-menu-item>
        <el-menu-item index="/admin/customers" v-if="canAccessCustomer">客户管理</el-menu-item>
        <el-menu-item index="/admin/regions" v-if="canAccessBaseData">区域管理</el-menu-item>
        <el-menu-item index="/admin/service-types" v-if="canAccessBaseData">服务类型</el-menu-item>
      </el-sub-menu>
      
      <el-menu-item index="/profile" v-if="canAccessProfile">
        <el-icon><User /></el-icon>
        <span>个人中心</span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script setup lang="ts">
import { Document, List, Setting, User, Collection, Wallet } from '@element-plus/icons-vue';

defineProps<{
  sidebarCollapsed: boolean;
  currentPath: string;
  canAccessWorkOrder: boolean;
  canAccessWorkOrderHistory: boolean;
  canAccessWiki: boolean;
  canAccessProjects: boolean;
  canAccessProfile: boolean;
  canAccessAnyAdmin: boolean;
  canAccessUserManage: boolean;
  canAccessRoleManage: boolean;
  canAccessCustomer: boolean;
  canAccessBaseData: boolean;
}>();

defineEmits<{
  navigate: [path: string];
}>();
</script>

<style scoped>
.sidebar {
  background: var(--sidebar-bg);
  transition: background-color 0.3s;
  overflow: hidden;
  border-right: 1px solid var(--border-color-lighter);
  z-index: 10;
  padding: 12px 0;
  will-change: width;
}

.logo {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 24px;
  padding: 0 12px;
  border-radius: 12px;
  transition: opacity 0.2s ease;
}

.logo:hover {
  opacity: 0.8;
}

.logo-img {
  height: 36px;
  width: auto;
  object-fit: contain;
}

.logo-img-small {
  height: 32px;
  width: auto;
  object-fit: contain;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
  padding: 0 12px;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 100%;
}

:deep(.el-menu) {
  background-color: transparent;
}

:deep(.el-menu-item), :deep(.el-sub-menu__title) {
  color: var(--text-secondary);
  height: 48px;
  line-height: 48px;
  margin-bottom: 4px;
  border-radius: 12px;
  transition: background-color 0.3s var(--ease-out), color 0.3s var(--ease-out);
}

:deep(.el-menu-item:hover), :deep(.el-sub-menu__title:hover) {
  color: var(--primary-color);
  background-color: var(--bg-color) !important;
}

:deep(.el-menu-item.is-active) {
  color: var(--card-bg) !important;
  background-color: var(--primary-color) !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
}
</style>
