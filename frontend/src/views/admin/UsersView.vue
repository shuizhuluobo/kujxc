<template>
  <div class="admin-crud-page">
    <div class="page-header">
      <h2>用户管理</h2>
      <div class="header-actions">
        <el-input v-model="searchKeyword" placeholder="搜索用户/姓名" :prefix-icon="Search" clearable class="search-box" @keyup.enter="handleSearch" @clear="handleSearch" />
        <el-button type="primary" :icon="Plus" @click="handleCreate">新增</el-button>
      </div>
    </div>
    
    <!-- Desktop Table -->
    <el-table v-if="!isMobile" :data="paginatedUsers" v-loading="loading" stripe class="card-premium">
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column label="角色" width="100">
        <template #default="{ row }">{{ row.role?.name }}</template>
      </el-table-column>
      <el-table-column label="区域" width="100">
        <template #default="{ row }">{{ row.region?.name || '-' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'info'">
            {{ row.isActive ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="160">
        <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" min-width="260" fixed="right">
        <template #default="{ row }">
          <div style="display: flex; gap: 4px">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="warning" @click="handleResetPassword(row)">重置</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper" v-if="!isMobile && total > 0">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- Mobile View -->
    <div v-else class="admin-mobile-container">
       <van-sticky>
        <van-search
          v-model="searchKeyword"
          placeholder="搜索用户/姓名"
          shape="round"
          background="#fff"
        />
      </van-sticky>

      <van-list
        v-if="paginatedUsers.length > 0"
        class="admin-list"
      >
        <van-swipe-cell 
          v-for="user in paginatedUsers" 
          :key="user.id"
          class="admin-list-item"
        >
          <van-cell 
            center
            is-link
            @click="handleEdit(user)"
          >
            <template #title>
              <div class="list-title">
                {{ user.name }}
                <span class="sub-title">({{ user.username }})</span>
              </div>
            </template>
            <template #label>
              <div class="list-info">
                 <div class="info-row">
                    <el-tag size="small" effect="plain" style="margin-right: 8px">{{ user.role?.name }}</el-tag>
                    <span v-if="user.region" class="region-text"><van-icon name="location-o" /> {{ user.region.name }}</span>
                 </div>
                 <div class="info-row mt-1">
                    <span :class="['status-dot', user.isActive ? 'active' : 'inactive']"></span>
                    {{ user.isActive ? '启用' : '禁用' }}
                    <span class="separator">|</span>
                    {{ formatDate(user.createdAt).split(' ')[0] }}
                 </div>
              </div>
            </template>
          </van-cell>
          <template #right>
            <div class="swipe-actions">
               <van-button square type="warning" text="重置" class="swipe-btn" @click.stop="handleResetPassword(user)" />
               <van-button square type="danger" text="删除" class="swipe-btn" @click.stop="handleDelete(user)" />
            </div>
          </template>
        </van-swipe-cell>
      </van-list>
      <el-empty v-else description="暂无用户" />

      <!-- Mobile Pagination -->
      <div class="mobile-pagination-wrapper" v-if="total > 0">
           <van-pagination 
              v-model="pagination.page" 
              :total-items="total" 
              :items-per-page="pagination.pageSize"
              @change="handlePageChange"
              force-ellipses
           />
       </div>

      <!-- Floating Action Button -->
      <div class="fab-wrapper" @click="handleCreate">
        <van-icon name="plus" size="24" color="#fff" />
      </div>
    </div>
    
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑用户' : '新增用户'" :width="isMobile ? '90%' : '500px'">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="!!editing" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!editing">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="form.roleId" style="width: 100%">
            <el-option v-for="r in roles" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="区域" prop="regionId">
          <el-select v-model="form.regionId" style="width: 100%" clearable placeholder="可选">
            <el-option v-for="r in regions" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="resetDialogVisible" title="重置密码" :width="isMobile ? '90%' : '400px'">
      <el-form ref="resetFormRef" :model="resetForm" :rules="resetRules" label-width="80px">
        <div style="margin-bottom: 20px; padding-left: 20px; color: #666;">
          正在为用户 <b>{{ editing?.name }}</b> ({{ editing?.username }}) 重置密码
        </div>
        <el-form-item label="新密码" prop="password">
          <el-input v-model="resetForm.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleResetSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import type { User, Role, Region } from '@/types';
import { usersApi, rolesApi, regionsApi } from '@/api';
import { useResponsive } from '@/composables';
import { match } from 'pinyin-pro';

import { 
  Button as VanButton, 
  Sticky as VanSticky, 
  Search as VanSearch, 
  List as VanList, 
  SwipeCell as VanSwipeCell, 
  Cell as VanCell, 
  Icon as VanIcon,
  Pagination as VanPagination
} from 'vant';

const { isMobile } = useResponsive();

const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const resetDialogVisible = ref(false);
const allUsers = ref<User[]>([]);
const searchKeyword = ref('');
const total = ref(0);

const pagination = reactive({
  page: 1,
  pageSize: 20,
});

const roles = ref<Role[]>([]);
const regions = ref<Region[]>([]);
const editing = ref<User | null>(null);
const formRef = ref<FormInstance>();
const resetFormRef = ref<FormInstance>();

// 筛选后的用户列表
const filteredUsers = computed(() => {
  if (!searchKeyword.value) {
    return allUsers.value;
  }
  const query = searchKeyword.value.toLowerCase();
  return allUsers.value.filter(u => {
    // 基础匹配：用户名或姓名
    if (u.username.toLowerCase().includes(query) || u.name.toLowerCase().includes(query)) {
      return true;
    }
    // 拼音匹配
    // precision: 'start' 为拼音首字母或全拼开头匹配
    if (match(u.name, query, { precision: 'start' })) {
      return true;
    }
    return false;
  });
});

// 分页后的用户列表
const paginatedUsers = computed(() => {
  // 更新总数，确保分页正确
  total.value = filteredUsers.value.length;
  
  const start = (pagination.page - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return filteredUsers.value.slice(start, end);
});

// 当搜索关键字变化时，重置分页到第一页
watch(searchKeyword, () => {
  pagination.page = 1;
});

const resetForm = reactive({ password: '' });

const passwordValidator = (rule: any, value: string, callback: any) => {
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

const resetRules: FormRules = {
  password: [{ required: true, validator: passwordValidator, trigger: 'blur' }]
};

const form = reactive({
  username: '',
  name: '',
  password: '',
  roleId: '',
  regionId: '',
  isActive: true,
});

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  password: [{ required: true, validator: passwordValidator, trigger: 'blur' }],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
};

const formatDate = (d: string) => dayjs(d).format('YYYY-MM-DD HH:mm');

async function fetchData() {
  loading.value = true;
  try {
    // 一次性获取大量用户进行前端分页 (假设用户数 < 10000)
    const [usersRes, rolesRes, regionsRes] = await Promise.all([
      usersApi.getAll({ page: 1, pageSize: 10000 }),
      rolesApi.getAll(),
      regionsApi.getAll()
    ]);
    
    allUsers.value = usersRes.data.data;
    // total.value 由 computed 属性根据 filteredUsers 更新
    
    roles.value = rolesRes.data;
    regions.value = regionsRes.data;
  } finally {
    loading.value = false;
  }
}

function handlePageChange(page: number) {
  pagination.page = page;
  // 前端分页不需要重新请求
}

function handleSizeChange(size: number) {
  pagination.pageSize = size;
  pagination.page = 1;
}

function handleSearch() {
  // 前端搜索，computed 自动响应，不需要 api 调用
  pagination.page = 1;
}

function handleCreate() {
  editing.value = null;
  Object.assign(form, { username: '', name: '', password: '', roleId: '', regionId: '', isActive: true });
  dialogVisible.value = true;
}

function handleEdit(row: User) {
  editing.value = row;
  Object.assign(form, { username: row.username, name: row.name, password: '', roleId: row.roleId, regionId: row.regionId ?? '', isActive: row.isActive });
  dialogVisible.value = true;
}

function handleResetPassword(row: User) {
  editing.value = row;
  resetForm.password = '';
  resetDialogVisible.value = true;
}

async function handleDelete(row: User) {
  await ElMessageBox.confirm('确定删除此用户吗？', '提示', { type: 'warning' });
  await usersApi.delete(row.id);
  ElMessage.success('删除成功');
  fetchData();
}

async function handleSubmit() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  
  submitting.value = true;
  try {
    if (editing.value) {
      await usersApi.update(editing.value.id, { name: form.name, roleId: form.roleId, regionId: form.regionId || undefined, isActive: form.isActive });
    } else {
      await usersApi.create(form);
    }
    ElMessage.success(editing.value ? '更新成功' : '创建成功');
    dialogVisible.value = false;
    fetchData(); 
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    ElMessage.error(err.response?.data?.message || '操作失败');
  } finally {
    submitting.value = false;
  }
}

async function handleResetSubmit() {
  if (!resetFormRef.value) return;
  const valid = await resetFormRef.value.validate().catch(() => false);
  if (!valid) return;

  if (!editing.value) return;

  submitting.value = true;
  try {
    await usersApi.update(editing.value.id, { password: resetForm.password });
    ElMessage.success('密码重置成功');
    resetDialogVisible.value = false;
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    ElMessage.error(err.response?.data?.message || '重置失败');
  } finally {
    submitting.value = false;
  }
}

onMounted(fetchData);
</script>

<style scoped>
.admin-crud-page { max-width: 1000px; margin: 0 auto; }

.header-actions {
  display: flex;
  gap: 12px;
}

.search-box {
  width: 240px;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  background: #fff;
  padding: 12px;
  border-radius: 8px;
}

.mobile-pagination {
  margin-top: 16px;
  justify-content: center;
}
</style>

<style scoped>
/* Mobile Optimizations */
.admin-mobile-container {
  padding-bottom: 80px; /* Space for FAB */
  background: var(--bg-color);
  min-height: 100vh;
}

.admin-list {
  margin-top: 8px;
}

.admin-list-item {
  margin-bottom: 1px;
}

.list-title {
    font-weight: 500;
    font-size: 16px;
}
.sub-title {
    font-size: 12px;
    color: var(--text-tertiary);
    margin-left: 4px;
    font-weight: normal;
}

.list-info {
    margin-top: 4px;
}

.info-row {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: var(--text-secondary);
}

.mt-1 {
    margin-top: 4px;
}

.region-text {
    display: flex;
    align-items: center;
    gap: 2px;
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 4px;
}
.status-dot.active { background-color: var(--el-color-success); }
.status-dot.inactive { background-color: var(--el-color-info); }

.separator {
    margin: 0 8px;
    color: var(--border-color-light);
}

.swipe-actions {
    height: 100%;
}

.swipe-btn {
  height: 100%;
}

.mobile-pagination-wrapper {
    padding: 16px;
    display: flex;
    justify-content: center;
}

/* Floating Action Button */
.fab-wrapper {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  background: var(--el-color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  z-index: 100;
  transition: transform 0.2s;
}

.fab-wrapper:active {
  transform: scale(0.95);
}
</style>
