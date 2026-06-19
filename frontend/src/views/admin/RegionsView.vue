<template>
  <div class="admin-crud-page">
    <div class="page-header">
      <h2>区域管理</h2>
      <div class="header-actions">
        <el-input v-model="searchKeyword" placeholder="搜索区域" :prefix-icon="Search" clearable class="search-box" />
        <el-button type="primary" :icon="Plus" @click="handleCreate">新增</el-button>
      </div>
    </div>
    
    <!-- Desktop Table -->
    <el-table v-if="!isMobile" :data="filteredRegions" v-loading="loading" class="card-premium" empty-text="暂无区域数据">
      <el-table-column prop="name" label="区域名称" show-overflow-tooltip />
      <el-table-column prop="sortOrder" label="排序" width="80" />
      <el-table-column label="钉钉通知" width="100">
        <template #default="{ row }">
          <el-tag :type="row.dingtalkWebhook ? 'success' : 'info'" size="small">
            {{ row.dingtalkWebhook ? '已配置' : '未配置' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Mobile View -->
    <div v-else class="admin-mobile-container">
      <van-sticky>
        <van-search
          v-model="searchKeyword"
          placeholder="搜索区域"
          shape="round"
          background="var(--card-bg)"
        />
      </van-sticky>

      <van-list
        v-if="filteredRegions.length > 0"
        class="admin-list"
      >
        <van-swipe-cell 
          v-for="region in filteredRegions" 
          :key="region.id"
          class="admin-list-item"
        >
          <van-cell 
            :title="region.name" 
            :label="`排序: ${region.sortOrder}`"
            center
            is-link
            @click="handleEdit(region)"
          >
            <template #icon>
              <div class="list-icon-wrapper">
                <van-icon name="location-o" size="20" color="var(--primary-color)"/>
              </div>
            </template>
          </van-cell>
          <template #right>
            <van-button square type="danger" text="删除" class="swipe-btn" @click.stop="handleDelete(region)" />
          </template>
        </van-swipe-cell>
      </van-list>
      
      <el-empty v-else description="暂无区域" />
    </div>
    
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑区域' : '新增区域'" :width="isMobile ? '90%' : '450px'">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" maxlength="50" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>
        <el-divider content-position="left">钉钉配置</el-divider>
        <el-form-item label="Webhook">
          <el-input v-model="form.dingtalkWebhook" placeholder="钉钉群机器人 Webhook 地址" maxlength="500" />
        </el-form-item>
        <el-form-item label="加签密钥">
          <el-input v-model="form.dingtalkSecret" placeholder="钉钉加签密钥（可选）" maxlength="200" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import type { Region } from '@/types';
import { regionsApi } from '@/api';
import { useResponsive } from '@/composables';

import { 
  Button as VanButton, 
  Sticky as VanSticky, 
  Search as VanSearch, 
  List as VanList, 
  SwipeCell as VanSwipeCell, 
  Cell as VanCell, 
  Icon as VanIcon 
} from 'vant';

const { isMobile } = useResponsive();
import { match } from 'pinyin-pro';

const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const regions = ref<Region[]>([]);
const searchKeyword = ref('');

const filteredRegions = computed(() => {
  if (!searchKeyword.value) return regions.value;
  const kw = searchKeyword.value.toLowerCase();
  return regions.value.filter(r => 
    r.name.toLowerCase().includes(kw) || match(r.name, kw, { precision: 'start' })
  );
});

const editing = ref<Region | null>(null);
const formRef = ref<FormInstance>();

const form = reactive({ name: '', sortOrder: 0, dingtalkWebhook: '', dingtalkSecret: '' });
const rules: FormRules = { name: [{ required: true, message: '请输入区域名称', trigger: 'blur' }] };

async function fetchData() {
  loading.value = true;
  try { regions.value = (await regionsApi.getAll()).data; } finally { loading.value = false; }
}

function handleCreate() { editing.value = null; Object.assign(form, { name: '', sortOrder: 0, dingtalkWebhook: '', dingtalkSecret: '' }); dialogVisible.value = true; }
function handleEdit(row: Region) { editing.value = row; Object.assign(form, { name: row.name, sortOrder: row.sortOrder, dingtalkWebhook: row.dingtalkWebhook || '', dingtalkSecret: row.dingtalkSecret || '' }); dialogVisible.value = true; }

async function handleDelete(row: Region) {
  await ElMessageBox.confirm('确定删除此区域吗？', '提示', { type: 'warning' });
  try { await regionsApi.delete(row.id); ElMessage.success('删除成功'); fetchData(); }
  catch (e: unknown) { const err = e as { response?: { data?: { message?: string } } }; ElMessage.error(err.response?.data?.message || '删除失败'); }
}

async function handleSubmit() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    if (editing.value) { await regionsApi.update(editing.value.id, form); }
    else { await regionsApi.create(form); }
    ElMessage.success(editing.value ? '更新成功' : '创建成功');
    dialogVisible.value = false;
    fetchData();
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    ElMessage.error(err.response?.data?.message || '操作失败');
  } finally { submitting.value = false; }
}

onMounted(fetchData);
</script>

<style scoped>
.admin-crud-page { max-width: 800px; margin: 0 auto; }

.header-actions {
  display: flex;
  gap: 12px;
}

.search-box {
  width: 240px;
}

.text-tertiary {
  color: var(--text-tertiary);
  font-size: 13px;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
}
</style>

<style scoped>
/* Mobile Optimizations */
.admin-mobile-container {
  padding-bottom: 80px; /* 底部导航安全间距 */
  background: var(--bg-color);
  min-height: 100vh;
}

.admin-list {
  margin-top: 8px;
}

.admin-list-item {
  margin-bottom: 1px;
}

.swipe-btn {
  height: 100%;
}

.list-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
  margin-right: 12px;
}
</style>
