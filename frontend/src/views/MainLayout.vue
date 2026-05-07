<template>
  <el-container class="main-layout">
    <DesktopSidebar
      v-if="!isMobile && !isFullscreen"
      :sidebar-collapsed="sidebarCollapsed"
      :current-path="route.path"
      :can-access-work-order="canAccessWorkOrder"
      :can-access-work-order-history="canAccessWorkOrderHistory"
      :can-access-wiki="canAccessWiki"
      :can-access-fee-calculator="canAccessFeeCalculator"
      :can-access-profile="canAccessProfile"
      :can-access-any-admin="canAccessAnyAdmin"
      :can-access-user-manage="canAccessUserManage"
      :can-access-role-manage="canAccessRoleManage"
      :can-access-customer="canAccessCustomer"
      :can-access-base-data="canAccessBaseData"
      @navigate="router.push($event)"
    />
    
    <el-container class="main-container">
      <el-header class="header" v-if="!isFullscreen">
        <div class="header-left">
          <el-icon 
            v-if="!isMobile" 
            class="collapse-btn" 
            @click="sidebarCollapsed = !sidebarCollapsed"
          >
            <Fold v-if="!sidebarCollapsed" />
            <Expand v-else />
          </el-icon>
          <span v-if="isMobile" class="mobile-title">工单管理</span>
        </div>
        
        <div class="header-right">
          <ThemeToggle />
          <NotificationBell v-if="!isMobile" />
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="resolveAssetUrl(authStore.user?.avatar)">
                {{ authStore.user?.name?.charAt(0) }}
              </el-avatar>
              <span v-if="!isMobile" class="user-name">{{ authStore.user?.name }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main-content" :class="{ 'with-mobile-nav': isMobile && !isFullscreen, 'fullscreen-content': isFullscreen }">
        <router-view v-slot="{ Component }">
          <transition 
            @before-enter="beforeEnter"
            @enter="enter"
            @leave="leave"
            mode="out-in"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
    
    <MobileNavBar
      v-if="isMobile && !isFullscreen"
      :current-path="route.path"
      :can-access-work-order="canAccessWorkOrder"
      :can-access-work-order-history="canAccessWorkOrderHistory"
      :can-access-wiki="canAccessWiki"
      :can-access-fee-calculator="canAccessFeeCalculator"
      :can-access-profile="canAccessProfile"
      :can-access-any-admin="canAccessAnyAdmin"
      @navigate="router.push($event)"
      @show-admin="showAdminMenu = true"
    />

    <el-drawer
      v-model="showAdminMenu"
      title="基础数据管理"
      direction="btt"
      size="auto"
    >
      <div class="admin-menu-list">
        <div class="admin-menu-item" @click="goTo('/admin/users')" v-if="canAccessUserManage">用户管理</div>
        <div class="admin-menu-item" @click="goTo('/admin/roles')" v-if="canAccessRoleManage">角色管理</div>
        <div class="admin-menu-item" @click="goTo('/admin/customers')" v-if="canAccessCustomer">客户管理</div>
        <div class="admin-menu-item" @click="goTo('/admin/regions')" v-if="canAccessBaseData">区域管理</div>
        <div class="admin-menu-item" @click="goTo('/admin/service-types')" v-if="canAccessBaseData">服务类型</div>
      </div>
    </el-drawer>
  </el-container>
</template>

<script setup lang="ts">
import { Fold, Expand } from '@element-plus/icons-vue';
import ThemeToggle from '@/components/ThemeToggle.vue';
import NotificationBell from '@/components/NotificationBell.vue';
import DesktopSidebar from './layout/DesktopSidebar.vue';
import MobileNavBar from './layout/MobileNavBar.vue';
import { useMainLayout } from './layout/useMainLayout';
import { resolveAssetUrl } from '@/utils/url';

const {
  router,
  route,
  authStore,
  isMobile,
  sidebarCollapsed,
  showAdminMenu,
  isFullscreen,
  canAccessWorkOrder,
  canAccessWorkOrderHistory,
  canAccessWiki,
  canAccessFeeCalculator,
  canAccessProfile,
  canAccessUserManage,
  canAccessRoleManage,
  canAccessCustomer,
  canAccessBaseData,
  canAccessAnyAdmin,
  beforeEnter,
  enter,
  leave,
  handleCommand,
  goTo,
} = useMainLayout();
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.main-container {
  overflow: hidden;
}

.header {
  height: calc(64px + var(--safe-area-top));
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  padding-top: var(--safe-area-top);
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color-lighter);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 18px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.3s;
}

.collapse-btn:hover {
  color: var(--primary-color);
}

.mobile-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 8px 4px 4px;
  border-radius: 24px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: var(--bg-color);
}

.user-name {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.main-content {
  padding: 24px;
  overflow-y: auto;
  background: var(--bg-color);
}

.main-content.with-mobile-nav {
  padding-bottom: calc(80px + var(--safe-area-bottom));
}

.main-content.fullscreen-content {
    padding: 0;
    overflow: hidden;
}

.admin-menu-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-menu-item {
  padding: 16px;
  border-radius: 12px;
  background: var(--bg-color);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  font-weight: 500;
  min-height: 48px;
  display: flex;
  align-items: center;
}

.admin-menu-item:hover {
  background: var(--primary-color);
  color: var(--card-bg);
}

@media (max-width: 768px) {
  .header {
    padding: 0 16px;
    padding-top: var(--safe-area-top);
    height: calc(56px + var(--safe-area-top));
    min-height: 56px;
  }
  
  .main-content {
    padding: 16px;
  }
}
</style>
