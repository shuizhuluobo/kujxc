<template>
  <div class="product-settings-page">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" text @click="goBack">返回</el-button>
        <h2>产品管理设置</h2>
      </div>
    </div>

    <el-card class="card-premium">
      <template #header><span class="card-title-text">超期未更新提醒</span></template>
      <div class="setting-row">
        <div class="setting-label">
          <div class="setting-name">超期阈值（天）</div>
          <div class="setting-desc">产品超过该天数未更新价格/参数，将被标记为「超期」并在列表中以黄色高亮提示</div>
        </div>
        <div class="setting-control">
          <el-input-number v-model="staleThresholdDays" :min="1" :max="3650" :precision="0" />
          <el-button type="primary" :loading="saving" :disabled="!canManage" @click="saveStaleThreshold">保存</el-button>
        </div>
      </div>
    </el-card>

    <el-alert
      v-if="!canManage"
      type="warning"
      :closable="true"
      title="当前角色没有系统设置管理权限，仅可查看配置。"
      class="permission-alert"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { settingsApi } from '@/api';
import { usePermission } from '@/composables/usePermission';
import { getApiErrorMessage } from '@/utils/format';

const router = useRouter();
const { has } = usePermission();

// 返回：优先回退历史；直链进入（无上一页）时兜底到产品列表，避免退出站点
function goBack() {
    const state = window.history.state as { back?: string | null } | null;
    if (state?.back != null) {
        void router.back();
    } else {
        void router.push('/products');
    }
}

const canManage = has('system:user_manage');

const staleThresholdDays = ref(90);
const saving = ref(false);

async function fetchSetting() {
    try {
        const { data } = await settingsApi.get('staleThresholdDays');
        if (typeof data === 'number' && data > 0) {
            staleThresholdDays.value = data;
        }
    } catch {
        // 设置不存在时使用默认值 90
    }
}

async function saveStaleThreshold() {
    saving.value = true;
    try {
        await settingsApi.update('staleThresholdDays', staleThresholdDays.value);
        ElMessage.success('保存成功');
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '保存失败'));
    } finally {
        saving.value = false;
    }
}

onMounted(fetchSetting);
</script>

<style scoped>
.product-settings-page { max-width: 800px; margin: 0 auto; }
.page-header { display: flex; align-items: center; margin-bottom: 16px; }
.header-left { display: flex; align-items: center; gap: 12px; }
.header-left h2 { margin: 0; }
.card-title-text { font-weight: 600; }
.setting-row { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.setting-name { font-weight: 500; }
.setting-desc { color: var(--text-secondary); font-size: 13px; margin-top: 4px; max-width: 420px; }
.setting-control { display: flex; align-items: center; gap: 12px; }
.permission-alert { margin-top: 16px; }
</style>