<template>
  <div class="admin-crud-page">
    <div class="page-header">
      <h2>角色管理</h2>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleCreate">新增角色</el-button>
      </div>
    </div>

    <el-table v-if="!isMobile" :data="roles" v-loading="loading" class="card-premium" empty-text="暂无角色数据">
      <el-table-column prop="name" label="角色名称" width="150" show-overflow-tooltip />
      <el-table-column prop="code" label="角色代码" width="120" show-overflow-tooltip />
      <el-table-column label="权限数量" width="100">
        <template #default="{ row }">
          <el-tag :type="getPermissionTagType(row.permissions?.length)">
            {{ row.permissions?.length || 0 }} 项
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Mobile View -->
    <div v-else class="admin-mobile-container">
       <van-sticky>
         <div class="mobile-header">
           <h2>角色管理</h2>
         </div>
      </van-sticky>

      <van-list
        v-if="roles.length > 0"
        class="admin-list"
      >
        <van-swipe-cell 
          v-for="role in roles" 
          :key="role.id"
          class="admin-list-item"
        >
          <van-cell 
            center
            is-link
            @click="handleEdit(role)"
          >
            <template #title>
              <div class="list-title">
                {{ role.name }}
                <span class="sub-title">({{ role.code }})</span>
              </div>
            </template>
            <template #label>
              <div class="list-info">
                 <el-tag size="small" :type="getPermissionTagType(role.permissions?.length)">
                    {{ role.permissions?.length || 0 }} 项权限
                 </el-tag>
              </div>
            </template>
            <template #icon>
              <div class="list-icon-wrapper">
                <van-icon name="user-o" size="20" color="var(--primary-color)"/>
              </div>
            </template>
          </van-cell>
          <template #right>
            <van-button square type="danger" text="删除" class="swipe-btn" @click.stop="handleDelete(role)" />
          </template>
        </van-swipe-cell>
      </van-list>
      
      <el-empty v-else description="暂无角色" />
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="editing ? '编辑角色权限' : '新增角色'"
      :width="isMobile ? '95%' : '900px'"
      class="role-dialog"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="角色代码" prop="code">
          <el-input v-model="form.code" placeholder="请输入角色代码" :disabled="!!editing" maxlength="50" />
        </el-form-item>
      </el-form>

      <div class="permission-matrix-section">
        <div class="matrix-header">
          <h3>权限配置</h3>
          <div class="matrix-actions">
            <el-button size="small" @click="selectAll">全选</el-button>
            <el-button size="small" @click="clearAll">清空</el-button>
            <el-button size="small" type="primary" @click="applyTemplate('business')">商务模板</el-button>
            <el-button size="small" type="success" @click="applyTemplate('engineer')">工程师模板</el-button>
          </div>
        </div>

        <el-collapse v-model="activeModules" class="permission-collapse">
          <el-collapse-item
            v-for="module in permissionModules"
            :key="module.key"
            :name="module.key"
          >
            <template #title>
              <div class="collapse-title">
                <el-icon class="module-icon"><component :is="module.icon" /></el-icon>
                <span class="module-name">{{ module.name }}</span>
                <el-tag size="small" :type="getModuleTagType(module)">
                  {{ getModuleSelectedCount(module) }}/{{ getModuleTotalCount(module) }}
                </el-tag>
              </div>
            </template>

            <div class="permission-module-content">
              <div v-if="module.pages.length" class="permission-section">
                <div class="section-title">页面访问</div>
                <el-checkbox-group v-model="selectedPermissions[module.key].pages">
                  <el-checkbox
                    v-for="page in module.pages"
                    :key="page.key"
                    :value="`${module.key}:${page.key}`"
                    class="permission-checkbox"
                  >
                    {{ page.name }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>

              <div v-if="module.actions.length" class="permission-section">
                <div class="section-title">功能操作</div>
                <el-checkbox-group v-model="selectedPermissions[module.key].actions">
                  <el-checkbox
                    v-for="action in module.actions"
                    :key="action.key"
                    :value="`${module.key}:${action.key}`"
                    class="permission-checkbox"
                  >
                    <el-tooltip :content="action.description" placement="top">
                      <span>{{ action.name }}</span>
                    </el-tooltip>
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>

        <div class="selected-summary">
          <div class="summary-title">已选择权限 ({{ selectedPermissionsCount }}项)</div>
          <el-scrollbar max-height="100px">
            <el-tag
              v-for="perm in selectedPermissionsList"
              :key="perm"
              size="small"
              closable
              @close="removePermission(perm)"
              class="permission-tag"
            >
              {{ getPermissionLabel(perm) }}
            </el-tag>
          </el-scrollbar>
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ editing ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import type { Role } from '@/types';
import { rolesApi } from '@/api';
import { useResponsive } from '@/composables';
import { PermissionModules, RolePermissionTemplates } from '@/config/permissions';

import { 
  Button as VanButton, 
  Sticky as VanSticky, 
  List as VanList, 
  SwipeCell as VanSwipeCell, 
  Cell as VanCell, 
  Icon as VanIcon 
} from 'vant';

const { isMobile } = useResponsive();

const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const roles = ref<Role[]>([]);
const editing = ref<Role | null>(null);
const formRef = ref<FormInstance>();
const activeModules = ref<string[]>([]);

const form = reactive({ name: '', code: '' });
const rules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色代码', trigger: 'blur' }],
};

const permissionModules = computed(() => Object.values(PermissionModules));

const selectedPermissions = reactive<Record<string, { pages: string[], actions: string[] }>>({});

const initPermissionState = () => {
  Object.values(PermissionModules).forEach((module) => {
    selectedPermissions[module.key] = { pages: [], actions: [] };
  });
};

initPermissionState();

const selectedPermissionsList = computed(() => {
  const list: string[] = [];
  Object.values(PermissionModules).forEach((module) => {
    selectedPermissions[module.key].pages.forEach((p) => list.push(p));
    selectedPermissions[module.key].actions.forEach((a) => list.push(a));
  });
  return list;
});

const selectedPermissionsCount = computed(() => selectedPermissionsList.value.length);

const getPermissionLabel = (permission: string): string => {
  const [moduleKey, actionKey] = permission.split(':');
  const module = PermissionModules[moduleKey as keyof typeof PermissionModules];
  if (!module) return permission;
  
  const page = module.pages.find((p) => p.key === actionKey);
  if (page) return `${module.name} - ${page.name}`;
  
  const action = module.actions.find((a) => a.key === actionKey);
  if (action) return `${module.name} - ${action.name}`;
  
  return permission;
};

const removePermission = (permission: string) => {
  const [moduleKey, actionKey] = permission.split(':');
  const module = selectedPermissions[moduleKey];
  if (module) {
    const pageIndex = module.pages.indexOf(permission);
    if (pageIndex > -1) module.pages.splice(pageIndex, 1);
    const actionIndex = module.actions.indexOf(permission);
    if (actionIndex > -1) module.actions.splice(actionIndex, 1);
  }
};

const getModuleSelectedCount = (module: typeof PermissionModules[keyof typeof PermissionModules]) => {
  const state = selectedPermissions[module.key];
  return state.pages.length + state.actions.length;
};

const getModuleTotalCount = (module: typeof PermissionModules[keyof typeof PermissionModules]) => {
  return module.pages.length + module.actions.length;
};

const getModuleTagType = (module: typeof PermissionModules[keyof typeof PermissionModules]) => {
  const count = getModuleSelectedCount(module);
  const total = getModuleTotalCount(module);
  if (count === 0) return 'info';
  if (count === total) return 'success';
  return 'warning';
};

const selectAll = () => {
  Object.values(PermissionModules).forEach((module) => {
    selectedPermissions[module.key].pages = module.pages.map((p) => `${module.key}:${p.key}`);
    selectedPermissions[module.key].actions = module.actions.map((a) => `${module.key}:${a.key}`);
  });
};

const clearAll = () => {
  Object.values(PermissionModules).forEach((module) => {
    selectedPermissions[module.key].pages = [];
    selectedPermissions[module.key].actions = [];
  });
};

const applyTemplate = (templateKey: 'business' | 'engineer') => {
  clearAll();
  const template = RolePermissionTemplates[templateKey];
  if (!template) return;
  
  template.permissions.forEach((perm) => {
    if (perm === '*') {
      selectAll();
      return;
    }
    const [moduleKey, actionKey] = perm.split(':');
    if (moduleKey && actionKey && selectedPermissions[moduleKey]) {
      const module = PermissionModules[moduleKey as keyof typeof PermissionModules];
      const isPage = module?.pages.some((p) => p.key === actionKey);
      const isAction = module?.actions.some((a) => a.key === actionKey);
      
      if (isPage && !selectedPermissions[moduleKey].pages.includes(perm)) {
        selectedPermissions[moduleKey].pages.push(perm);
      }
      if (isAction && !selectedPermissions[moduleKey].actions.includes(perm)) {
        selectedPermissions[moduleKey].actions.push(perm);
      }
    }
  });
  
  ElMessage.success(`已应用${template.name}模板`);
};

const getPermissionTagType = (count?: number) => {
  if (!count || count === 0) return 'info';
  if (count < 10) return 'warning';
  return 'success';
};

const formatDate = (d: string) => dayjs(d).format('YYYY-MM-DD HH:mm');

async function fetchData() {
  loading.value = true;
  try {
    roles.value = (await rolesApi.getAll()).data;
  } finally {
    loading.value = false;
  }
}

function handleCreate() {
  editing.value = null;
  Object.assign(form, { name: '', code: '' });
  clearAll();
  activeModules.value = [];
  dialogVisible.value = true;
}

function handleEdit(row: Role) {
  editing.value = row;
  Object.assign(form, { name: row.name, code: row.code });
  
  // 先清空权限
  Object.keys(selectedPermissions).forEach((key) => {
    selectedPermissions[key].pages = [];
    selectedPermissions[key].actions = [];
  });
  
  // 加载已有权限
  if (row.permissions && row.permissions.length > 0) {
    // 处理通配符权限
    if (row.permissions.includes('*')) {
      Object.values(PermissionModules).forEach((module) => {
        selectedPermissions[module.key].pages = module.pages.map((p) => `${module.key}:${p.key}`);
        selectedPermissions[module.key].actions = module.actions.map((a) => `${module.key}:${a.key}`);
      });
    } else {
      // 处理具体权限
      row.permissions.forEach((perm: string) => {
        const [moduleKey, actionKey] = perm.split(':');
        if (!moduleKey || !actionKey) return;
        
        // 通过 moduleKey 查找对应模块
        const module = Object.values(PermissionModules).find((m) => m.key === moduleKey);
        if (!module || !selectedPermissions[moduleKey]) return;
        
        const isPage = module.pages.some((p) => p.key === actionKey);
        const isAction = module.actions.some((a) => a.key === actionKey);
        
        if (isPage) {
          selectedPermissions[moduleKey].pages = [...selectedPermissions[moduleKey].pages, perm];
        }
        if (isAction) {
          selectedPermissions[moduleKey].actions = [...selectedPermissions[moduleKey].actions, perm];
        }
      });
    }
  }
  
  dialogVisible.value = true;
}

async function handleDelete(row: Role) {
  try {
    await ElMessageBox.confirm('确定删除此角色吗？', '提示', { type: 'warning' });
  } catch { return; }
  try {
    await rolesApi.delete(row.id);
    ElMessage.success('删除成功');
    fetchData();
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    ElMessage.error(err.response?.data?.message || '删除失败');
  }
}

async function handleSubmit() {
  if (!formRef.value) return;
  
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  
  submitting.value = true;
  try {
    const permissions: string[] = [];
    Object.values(PermissionModules).forEach((module) => {
      permissions.push(...selectedPermissions[module.key].pages);
      permissions.push(...selectedPermissions[module.key].actions);
    });
    
    const data = { ...form, permissions };
    
    if (editing.value) {
      await rolesApi.update(editing.value.id, data);
    } else {
      await rolesApi.create(data);
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

onMounted(fetchData);
</script>

<style scoped>
.admin-crud-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.permission-matrix-section {
  margin-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 20px;
}

.matrix-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.matrix-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.matrix-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.permission-collapse {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.module-icon {
  font-size: 18px;
  color: var(--el-color-primary);
}

.module-name {
  flex: 1;
  font-weight: 500;
}

.permission-module-content {
  padding: 16px;
}

.permission-section {
  margin-bottom: 20px;
}

.permission-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}

.permission-checkbox {
  margin-right: 20px;
  margin-bottom: 12px;
}

.actions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-summary {
  margin-top: 20px;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.summary-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
}

.permission-tag {
  margin: 4px;
}

@media (max-width: 768px) {
  .matrix-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .matrix-actions {
    width: 100%;
  }
  
  .permission-checkbox {
    display: block;
    margin-right: 0;
    margin-bottom: 8px;
  }
  
  .actions-grid {
    flex-direction: column;
  }
}

:deep(.role-dialog .el-dialog__body) {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}
</style>

<style scoped>
/* Mobile Optimizations */
.admin-mobile-container {
  padding-bottom: 80px; /* 底部导航安全间距 */
  background: var(--bg-color);
  min-height: 100vh;
}

.mobile-header {
  background: var(--card-bg);
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color-lighter);
}
.mobile-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
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

.swipe-btn {
  height: 100%;
}
</style>
