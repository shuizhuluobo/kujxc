<template>
  <div class="mobile-profile">
    <!-- Header / Avatar -->
    <div class="mobile-profile-header">
      <div class="mobile-avatar-wrapper" @click="$emit('showAvatarDialog')">
        <van-image
          round
          width="80px"
          height="80px"
          fit="cover"
          :src="getAvatarUrl(authStore.user?.avatar)"
        >
          <template v-if="!authStore.user?.avatar" #error>
            <div class="avatar-placeholder">{{ authStore.user?.name?.charAt(0) }}</div>
          </template>
        </van-image>
        <div class="mobile-avatar-edit">
          <van-icon name="photograph" />
        </div>
      </div>
      <h3 class="mobile-username">{{ authStore.user?.name }}</h3>
      <p class="mobile-role">{{ authStore.user?.role?.name }}</p>
    </div>

    <!-- Stats Tab -->
    <div class="mobile-stats-container">
      <van-tabs v-model:active="activeStatsTab" class="mobile-stats-tabs" :border="false">
        <van-tab title="本月" name="monthly">
          <van-grid :column-num="4" :border="false" class="mobile-stats-grid" :gutter="10">
            <van-grid-item>
              <div class="mobile-stat-value">{{ stats.monthlyCompleted }}</div>
              <div class="mobile-stat-label">完成工单</div>
            </van-grid-item>
            <van-grid-item>
              <div class="mobile-stat-value">{{ stats.monthlyReceived }}</div>
              <div class="mobile-stat-label">已接收</div>
            </van-grid-item>
            <van-grid-item>
              <div class="mobile-stat-value">{{ stats.monthlyCreated }}</div>
              <div class="mobile-stat-label">已创建</div>
            </van-grid-item>
            <van-grid-item>
              <div class="mobile-stat-value fee-value">¥ {{ stats.monthlyRepairFee.toFixed(2) }}</div>
              <div class="mobile-stat-label">维修费</div>
            </van-grid-item>
          </van-grid>
        </van-tab>
        <van-tab title="总计" name="total">
          <van-grid :column-num="4" :border="false" class="mobile-stats-grid" :gutter="10">
            <van-grid-item>
              <div class="mobile-stat-value">{{ stats.completed }}</div>
              <div class="mobile-stat-label">完成工单</div>
            </van-grid-item>
            <van-grid-item>
              <div class="mobile-stat-value">{{ stats.received }}</div>
              <div class="mobile-stat-label">已接收</div>
            </van-grid-item>
            <van-grid-item>
              <div class="mobile-stat-value">{{ stats.created }}</div>
              <div class="mobile-stat-label">已创建</div>
            </van-grid-item>
            <van-grid-item>
              <div class="mobile-stat-value fee-value">¥ {{ stats.totalRepairFee.toFixed(2) }}</div>
              <div class="mobile-stat-label">维修费</div>
            </van-grid-item>
          </van-grid>
        </van-tab>
      </van-tabs>
    </div>

    <!-- Info Cells -->
    <van-cell-group inset class="mt-4">
      <van-cell title="用户名" :value="authStore.user?.username" />
      <van-cell title="注册时间" :value="formatDate(authStore.user?.createdAt)" />
    </van-cell-group>

    <!-- Actions -->
    <van-cell-group inset class="mt-4">
      <van-cell title="修改密码" is-link @click="$emit('showPasswordDialog')" />
    </van-cell-group>

    <div class="logout-btn-wrapper">
      <van-button block type="danger" @click="$emit('logout')">退出登录</van-button>
    </div>

    <!-- Mobile Password Popup -->
    <van-popup
      v-model:show="localShowPasswordDialog"
      position="bottom"
      round
      :style="{ height: 'auto', padding: '20px' }"
    >
      <h3 class="mobile-popup-title">修改密码</h3>
      <van-form @submit="$emit('changePassword')">
        <van-cell-group inset>
          <van-field
            v-model="localPasswordForm.oldPassword"
            type="password"
            name="oldPassword"
            label="原密码"
            placeholder="请输入原密码"
            :rules="[{ required: true, message: '请填写原密码' }]"
          />
          <van-field
            v-model="localPasswordForm.newPassword"
            type="password"
            name="newPassword"
            label="新密码"
            placeholder="请输入新密码"
            :rules="[{ required: true, message: '请填写新密码' }, { validator: (val) => val.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(val), message: '至少8位，含大小写字母、数字和特殊字符(@$!%*?&)' }]"
          />
          <van-field
            v-model="localPasswordForm.confirmPassword"
            type="password"
            name="confirmPassword"
            label="确认密码"
            placeholder="请再次输入新密码"
            :rules="[{ required: true, message: '请确认新密码' }, { validator: (val) => val === localPasswordForm.newPassword, message: '两次密码不一致' }]"
          />
        </van-cell-group>
        <div style="margin: 30px 16px 16px;">
          <van-button round block type="primary" native-type="submit" :loading="submitting">
            确认修改
          </van-button>
        </div>
      </van-form>
    </van-popup>

    <!-- Mobile Avatar Popup -->
    <van-popup
      v-model:show="localShowAvatarDialog"
      position="bottom"
      round
      :style="{ height: '80%' }"
      class="mobile-avatar-popup"
    >
      <div class="mobile-popup-header">
        <h3>更换头像</h3>
        <span class="close-btn" @click="localShowAvatarDialog = false"><van-icon name="cross" /></span>
      </div>

      <van-tabs v-model:active="localActiveTab">
        <van-tab title="选择预设" name="preset">
          <div class="preset-grid">
            <div
              v-for="(url, index) in presetAvatars"
              :key="index"
              class="preset-item"
              :class="{ active: localSelectedPreset === url }"
              @click="localSelectedPreset = url"
            >
              <van-image
                round
                width="70px"
                height="70px"
                :src="getAvatarUrl(url)"
              />
              <div class="check-icon" v-if="localSelectedPreset === url">
                <van-icon name="success" />
              </div>
            </div>
          </div>
        </van-tab>
        <van-tab title="自定义上传" name="upload">
          <div class="upload-container">
            <input
              type="file"
              ref="fileInputRef"
              style="display: none"
              accept="image/*"
              @change="$emit('fileChange', $event)"
            />
            <div v-if="!tempImageUrl" class="upload-trigger" @click="triggerLocalFile">
              <van-icon name="photograph" size="40" />
              <p>点击选择图片</p>
            </div>
            <div v-else class="cropper-box">
              <div class="cropper-wrapper">
                <vue-cropper
                  ref="cropperRef"
                  :img="tempImageUrl"
                  :outputSize="options.outputSize"
                  :outputType="options.outputType"
                  :info="true"
                  :full="options.full"
                  :canMove="options.canMove"
                  :canMoveBox="options.canMoveBox"
                  :original="options.original"
                  :autoCrop="options.autoCrop"
                  :autoCropWidth="options.autoCropWidth"
                  :autoCropHeight="options.autoCropHeight"
                  :fixedBox="options.fixedBox"
                  :centerBox="options.centerBox"
                  :infoTrue="options.infoTrue"
                  :fixed="options.fixed"
                  :fixedNumber="options.fixedNumber"
                />
              </div>
              <div class="cropper-actions">
                <van-button size="small" @click="localTempImageUrl = ''">重新选择</van-button>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>

      <div class="mobile-popup-footer">
        <van-button block type="primary" :loading="savingAvatar" @click="$emit('saveAvatar')">
          确认更换
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  Image as VanImage,
  Icon as VanIcon,
  Grid as VanGrid,
  GridItem as VanGridItem,
  Cell as VanCell,
  CellGroup as VanCellGroup,
  Button as VanButton,
  Popup as VanPopup,
  Form as VanForm,
  Field as VanField,
  Tabs as VanTabs,
  Tab as VanTab,
} from 'vant';
import 'vue-cropper/dist/index.css';
import { VueCropper } from 'vue-cropper';
import type { UserStats } from '@/types';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

interface CropperInstance {
  getCropBlob: (cb: (data: Blob) => void) => void;
}

const fileInputRef = ref<HTMLInputElement>();
const cropperRef = ref<CropperInstance>();
const activeStatsTab = ref('monthly');

watch(fileInputRef, val => emit('updateFileInput', val));
watch(cropperRef, val => {
  emit('updateCropper', val ? { getCropBlob: (cb: (data: Blob) => void) => val.getCropBlob(cb) } : null);
});

function triggerLocalFile(_e: Event) {
  fileInputRef.value?.click();
}

const props = defineProps<{
  loading: boolean;
  submitting: boolean;
  savingAvatar: boolean;
  showPasswordDialog: boolean;
  showAvatarDialog: boolean;
  activeTab: string;
  stats: UserStats;
  presetAvatars: string[];
  selectedPreset: string;
  tempImageUrl: string;
  options: Record<string, any>;
  passwordForm: { oldPassword: string; newPassword: string; confirmPassword: string };
  getAvatarUrl: (path?: string) => string;
  formatDate: (date?: string) => string;
}>();

const emit = defineEmits<{
  showPasswordDialog: [];
  showAvatarDialog: [];
  changePassword: [];
  saveAvatar: [];
  triggerFileInput: [];
  fileChange: [e: Event];
  logout: [];
  updateCropper: [val: any];
  updateFileInput: [val: any];
  'update:showPasswordDialog': [val: boolean];
  'update:showAvatarDialog': [val: boolean];
  'update:selectedPreset': [val: string];
  'update:tempImageUrl': [val: string];
  'update:activeTab': [val: string];
}>();

// Local copies for v-model bindings (can't v-model on props)
const localShowPasswordDialog = ref(props.showPasswordDialog);
const localShowAvatarDialog = ref(props.showAvatarDialog);
const localSelectedPreset = ref(props.selectedPreset);
const localTempImageUrl = ref(props.tempImageUrl);
const localActiveTab = ref(props.activeTab);
// Alias the reactive passwordForm so v-model binds to a local name (parent holds the same reactive object by reference)
const localPasswordForm = props.passwordForm;

// Sync parent → local
watch(() => props.showPasswordDialog, v => localShowPasswordDialog.value = v);
watch(() => props.showAvatarDialog, v => localShowAvatarDialog.value = v);
watch(() => props.selectedPreset, v => localSelectedPreset.value = v);
watch(() => props.tempImageUrl, v => localTempImageUrl.value = v);
watch(() => props.activeTab, v => localActiveTab.value = v);

// Sync local → parent
watch(localShowPasswordDialog, v => emit('update:showPasswordDialog', v));
watch(localShowAvatarDialog, v => emit('update:showAvatarDialog', v));
watch(localSelectedPreset, v => emit('update:selectedPreset', v));
watch(localTempImageUrl, v => emit('update:tempImageUrl', v));
watch(localActiveTab, v => emit('update:activeTab', v));
</script>

<style scoped>
.mobile-profile {
  background: var(--bg-color);
  min-height: 100vh;
  padding-bottom: 30px;
  --van-cell-background: var(--card-bg);
  --van-cell-text-color: var(--text-primary);
  --van-cell-value-color: var(--text-secondary);
  --van-cell-group-background: transparent;
  --van-popup-background: var(--card-bg);
  --van-popup-close-icon-color: var(--text-secondary);
  --van-grid-item-content-background: var(--card-bg);
  --van-grid-item-text-color: var(--text-secondary);
}

.mobile-profile-header {
  background: var(--card-bg);
  padding: 30px 20px 20px;
  padding-top: calc(30px + var(--safe-area-top));
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
}

.mobile-avatar-wrapper {
  position: relative;
  margin-bottom: 12px;
  cursor: pointer;
  border-radius: 50%;
  transition: opacity 0.2s ease;
}

.mobile-avatar-wrapper:hover {
  opacity: 0.85;
}

.mobile-avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: var(--el-color-primary);
  border-radius: 50%;
  color: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border: 2px solid var(--card-bg);
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.mobile-username {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px;
}

.mobile-role {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.mobile-stats-container {
  background: var(--card-bg);
  margin-bottom: 12px;
}

.mobile-stats-tabs {
  --van-tabs-bottom-bar-color: var(--primary-color);
  --van-tab-active-color: var(--primary-color);
  --van-tab-font-size: 13px;
}

.mobile-stats-tabs :deep(.van-tabs__nav) {
  background: var(--card-bg);
}

.mobile-stats-tabs :deep(.van-tab) {
  border-radius: 6px;
  border: 1px solid var(--border-color);
  padding: 4px 16px;
  margin-right: 8px;
  transition: all 0.2s ease;
  flex: none;
}

.mobile-stats-tabs :deep(.van-tab--active) {
  color: #fff;
  background: var(--primary-color);
  border-color: var(--primary-color);
  font-weight: 600;
}

.mobile-stats-tabs :deep(.van-tabs__line) {
  display: none;
}

.mobile-stats-grid {
  background: var(--card-bg);
}

.mobile-stat-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-color-primary);
  margin-bottom: 4px;
}

.mobile-stat-value.fee-value {
  color: var(--danger-color);
}

.mobile-stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.mt-4 {
  margin-top: 16px;
  margin-bottom: 16px;
}

.logout-btn-wrapper {
  padding: 20px 16px;
}

.mobile-popup-title {
  text-align: center;
  font-size: 18px;
  margin: 0 0 20px;
}

.mobile-avatar-popup {
  display: flex;
  flex-direction: column;
}

.mobile-popup-header {
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-bottom: 1px solid var(--border-color-lighter);
}

.mobile-popup-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  position: absolute;
  right: 16px;
  font-size: 20px;
  color: var(--text-secondary);
}

.mobile-popup-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color-lighter);
}

/* 预设头像网格 */
.preset-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 20px;
}

.preset-item {
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 8px;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.preset-item.active {
  border-color: var(--primary-color);
  background: var(--bg-color);
}

.check-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  background: var(--primary-color);
  color: var(--card-bg);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

/* 上传与剪裁 */
.upload-container {
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
  border-radius: 12px;
  border: 2px dashed var(--border-color);
  margin: 10px;
}

.upload-trigger {
  text-align: center;
  cursor: pointer;
  color: var(--text-secondary);
}

.upload-trigger p {
  margin-top: 8px;
  font-size: 14px;
}

.cropper-box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.cropper-wrapper {
  flex: 1;
  width: 100%;
}

.cropper-actions {
  padding: 12px;
  display: flex;
  justify-content: center;
  background: var(--card-bg);
  border-top: 1px solid var(--border-color-lighter);
}
</style>
