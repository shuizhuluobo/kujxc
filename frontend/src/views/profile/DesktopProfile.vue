<template>
  <div>
    <div class="profile-cards">
      <!-- 用户信息卡片 -->
      <div class="card profile-card">
        <div class="avatar-section">
          <div class="avatar-wrapper" @click="$emit('showAvatarDialog')">
            <el-avatar :size="80" :src="getAvatarUrl(authStore.user?.avatar)">
              {{ authStore.user?.name?.charAt(0) }}
            </el-avatar>
            <div class="avatar-edit-overlay">
              <el-icon><Camera /></el-icon>
            </div>
          </div>
          <div class="user-info">
            <h3>{{ authStore.user?.name }}</h3>
            <p>{{ authStore.user?.role?.name }}</p>
          </div>
        </div>

        <el-divider />

        <el-descriptions :column="1" size="large">
          <el-descriptions-item label="用户名">{{ authStore.user?.username }}</el-descriptions-item>
          <el-descriptions-item label="角色">{{ authStore.user?.role?.name }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">
            {{ formatDate(authStore.user?.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="card-actions">
          <el-button @click="$emit('showPasswordDialog')" class="btn-premium">修改密码</el-button>
        </div>
      </div>

      <!-- 工单统计卡片 -->
      <div class="card stats-card">
        <div class="stats-header">
          <h3>我的统计</h3>
          <el-tabs v-model="activeStatsTab" type="card" class="stats-tabs">
            <el-tab-pane label="本月" name="monthly"></el-tab-pane>
            <el-tab-pane label="总计" name="total"></el-tab-pane>
          </el-tabs>
        </div>
        <div class="stats-grid" v-if="!loading">
          <div class="stat-item">
            <div class="stat-value">{{ activeStatsTab === 'monthly' ? stats.monthlyCompleted : stats.completed }}</div>
            <div class="stat-label">完成工单</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ activeStatsTab === 'monthly' ? stats.monthlyReceived : stats.received }}</div>
            <div class="stat-label">已接收</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ activeStatsTab === 'monthly' ? stats.monthlyCreated : stats.created }}</div>
            <div class="stat-label">已创建</div>
          </div>
          <div class="stat-item fee-item">
            <div class="stat-value fee-value">¥ {{ (activeStatsTab === 'monthly' ? stats.monthlyRepairFee : stats.totalRepairFee).toFixed(2) }}</div>
            <div class="stat-label">维修费</div>
          </div>
        </div>
        <el-skeleton v-else :rows="2" />
      </div>
    </div>

    <!-- 修改密码抽屉 -->
    <el-drawer
      v-model="localShowPasswordDialog"
      title="修改密码"
      size="400px"
      direction="rtl"
    >
      <el-form ref="formRef" :model="passwordForm" :rules="passwordRules" label-width="80px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="localShowPasswordDialog = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="$emit('changePassword')" class="btn-premium">
            确认
          </el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 头像更换抽屉 -->
    <el-drawer
      v-model="localShowAvatarDialog"
      title="更换头像"
      size="560px"
      direction="rtl"
    >
      <el-tabs v-model="localActiveTab" class="avatar-tabs">
        <el-tab-pane label="选择预设" name="preset">
          <div class="preset-grid">
            <div
              v-for="(url, index) in presetAvatars"
              :key="index"
              class="preset-item"
              :class="{ active: localSelectedPreset === url }"
              @click="localSelectedPreset = url"
            >
              <el-avatar :size="70" :src="getAvatarUrl(url)" />
              <div class="check-icon" v-if="localSelectedPreset === url">
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="自定义上传" name="upload">
          <div class="upload-container">
              <input
                type="file"
                ref="fileInputRef"
                accept="image/*"
                style="display: none"
                @change="$emit('fileChange', $event)"
              />
              <div v-if="!tempImageUrl" class="upload-trigger" @click="triggerLocalFile">
                <el-icon class="upload-icon"><Upload /></el-icon>
                <div class="upload-text">点击选择图片</div>
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
                <el-button @click="localTempImageUrl = ''">重新选择</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="localShowAvatarDialog = false">取消</el-button>
          <el-button type="primary" :loading="savingAvatar" @click="$emit('saveAvatar')" class="btn-premium">
            确认更换
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Camera, Plus, Check } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import 'vue-cropper/dist/index.css';
import { VueCropper } from 'vue-cropper';
import type { UserStats } from '@/types';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const formRef = ref<FormInstance>();
const fileInputRef = ref<HTMLInputElement>();
const cropperRef = ref();
const activeStatsTab = ref('monthly');

watch(fileInputRef, val => emit('updateFileInput', val));
watch(cropperRef, val => {
  emit('updateCropper', val ? { getCropBlob: (cb: any) => val.getCropBlob(cb) } : null);
});

function triggerLocalFile(e: Event) {
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
  updateCropper: [val: any];
  updateFileInput: [val: any];
  'update:showPasswordDialog': [val: boolean];
  'update:showAvatarDialog': [val: boolean];
  'update:selectedPreset': [val: string];
  'update:tempImageUrl': [val: string];
  'update:activeTab': [val: string];
}>();

// Local copies for v-model bindings
const localShowPasswordDialog = ref(props.showPasswordDialog);
const localShowAvatarDialog = ref(props.showAvatarDialog);
const localSelectedPreset = ref(props.selectedPreset);
const localTempImageUrl = ref(props.tempImageUrl);
const localActiveTab = ref(props.activeTab);

watch(() => props.showPasswordDialog, v => localShowPasswordDialog.value = v);
watch(() => props.showAvatarDialog, v => localShowAvatarDialog.value = v);
watch(() => props.selectedPreset, v => localSelectedPreset.value = v);
watch(() => props.tempImageUrl, v => localTempImageUrl.value = v);
watch(() => props.activeTab, v => localActiveTab.value = v);

watch(localShowPasswordDialog, v => emit('update:showPasswordDialog', v));
watch(localShowAvatarDialog, v => emit('update:showAvatarDialog', v));
watch(localSelectedPreset, v => emit('update:selectedPreset', v));
watch(localTempImageUrl, v => emit('update:tempImageUrl', v));
watch(localActiveTab, v => emit('update:activeTab', v));

const passwordComplexityValidator = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入新密码'));
  } else if (value.length < 8) {
    callback(new Error('密码长度至少8位'));
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value)) {
    callback(new Error('密码必须包含大小写字母、数字和特殊字符(@$!%*?&)'));
  } else {
    callback();
  }
};

const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, validator: passwordComplexityValidator, trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== props.passwordForm.newPassword) {
          callback(new Error('两次密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

defineExpose({ formRef });
</script>

<style scoped>
.profile-cards {
  display: grid;
  gap: 16px;
}

.card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  transition: transform 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out);
}

.avatar-wrapper:hover {
  transform: scale(1.05);
}

.avatar-edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: var(--card-bg);
  font-size: 24px;
}

.avatar-wrapper:hover .avatar-edit-overlay {
  opacity: 1;
}

.user-info h3 {
  font-size: 22px;
  margin-bottom: 4px;
  color: var(--text-primary);
  font-weight: 600;
}

.user-info p {
  color: var(--text-secondary);
  font-size: 14px;
}

.card-actions {
  margin-top: 16px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.stats-tabs {
  font-size: 12px;
}

.stats-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.stats-tabs :deep(.el-tabs__nav) {
  gap: 8px;
}

.stats-tabs :deep(.el-tab__button) {
  padding: 4px 12px;
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.fee-value {
  color: var(--danger-color) !important;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: var(--bg-color);
  border-radius: 12px;
  border: 1px solid var(--border-color-lighter);
  transition: transform 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out);
}

.stat-item:hover {
  border-color: var(--primary-color);
  background: var(--card-bg);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

/* 预设头像网格 */
.preset-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 20px 0;
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

.preset-item:hover {
  background: var(--bg-color);
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
  margin: 10px 0;
}

.upload-trigger {
  text-align: center;
  cursor: pointer;
  color: var(--text-secondary);
}

.upload-trigger:hover {
  color: var(--primary-color);
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

.drawer-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.drawer-footer .el-button {
  flex: 1;
}

.avatar-tabs {
  height: calc(100% - 60px);
}

.avatar-tabs :deep(.el-tabs__content) {
  height: calc(100% - 55px);
  overflow-y: auto;
}
</style>
