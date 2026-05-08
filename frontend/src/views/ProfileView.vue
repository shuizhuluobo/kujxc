<template>
  <div class="profile-view">
    <div v-if="!isMobile" class="page-header">
      <h2>个人中心</h2>
    </div>

    <component
      :is="isMobile ? MobileProfile : DesktopProfile"
      :loading="loading"
      :submitting="submitting"
      :saving-avatar="savingAvatar"
      :show-password-dialog="showPasswordDialog"
      :show-avatar-dialog="showAvatarDialog"
      :active-tab="activeTab"
      :stats="stats"
      :preset-avatars="presetAvatars"
      :selected-preset="selectedPreset"
      :temp-image-url="tempImageUrl"
      :options="options"
      :password-form="passwordForm"
      :get-avatar-url="getAvatarUrl"
      :format-date="formatDate"
      @show-password-dialog="showPasswordDialog = true"
      @show-avatar-dialog="showAvatarDialog = true"
      @change-password="handleChangePassword"
      @save-avatar="handleSaveAvatar"
      @trigger-file-input="triggerFileInput"
      @file-change="onFileChange"
      @logout="handleLogout"
      @update:show-password-dialog="showPasswordDialog = $event"
      @update:show-avatar-dialog="showAvatarDialog = $event"
      @update:selected-preset="selectedPreset = $event"
      @update:temp-image-url="tempImageUrl = $event"
      @update:active-tab="activeTab = $event"
      @update-cropper="setCropper"
      @update-file-input="setFileInput"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { useProfile } from './profile/composables/useProfile';
import { useSSE } from '@/composables/useSSE';

const MobileProfile = defineAsyncComponent(() => import('./profile/MobileProfile.vue'));
const DesktopProfile = defineAsyncComponent(() => import('./profile/DesktopProfile.vue'));

const {
  isMobile,
  loading,
  submitting,
  savingAvatar,
  showPasswordDialog,
  showAvatarDialog,
  activeTab,
  stats,
  notificationsEnabled,
  presetAvatars,
  selectedPreset,
  cropper,
  fileInput,
  tempImageUrl,
  options,
  passwordForm,
  toggleNotifications,
  getAvatarUrl,
  formatDate,
  fetchStats,
  handleChangePassword,
  handleLogout,
  triggerFileInput,
  onFileChange,
  handleSaveAvatar,
  setCropper,
  setFileInput,
} = useProfile();

const sse = useSSE();
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  fetchStats();
  
  // 监听工单状态变化事件，实时更新统计
  unsubscribe = sse.on('work-order.updated', () => {
    fetchStats();
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<style scoped>
.profile-view {
  max-width: 800px;
  margin: 0 auto;
}

.page-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}
</style>
