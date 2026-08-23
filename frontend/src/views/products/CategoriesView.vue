<template>
  <div class="admin-crud-page">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" text @click="goBack">返回</el-button>
        <h2>类型管理</h2>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleCreate()">新增根类型</el-button>
      </div>
    </div>

    <el-card v-loading="loading" class="card-premium">
      <el-tree
        :data="tree"
        :props="{ label: 'name', children: 'children' }"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
        empty-text="暂无类型，点击右上角新增"
      >
        <template #default="{ data }">
          <div class="tree-node">
            <span class="node-name">{{ data.name }}</span>
            <el-tag size="small" type="info" class="node-count">{{ data.productCount ?? 0 }} 产品</el-tag>
            <span class="node-actions">
              <el-button size="small" @click.stop="handleCreate(data.id)">添加子类</el-button>
              <el-button size="small" @click.stop="handleEdit(data)">编辑</el-button>
              <el-button size="small" type="danger" @click.stop="handleDelete(data)">删除</el-button>
            </span>
          </div>
        </template>
      </el-tree>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEditing ? '编辑类型' : '新增类型'" :width="isMobile ? '90%' : '500px'">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="父级类型">
          <el-select v-model="form.parentId" style="width: 100%" clearable placeholder="不选则为根类型">
            <el-option v-for="c in tree" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="form.name" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="form.description" type="textarea" :rows="2" maxlength="200" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" />
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
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { FormRules } from 'element-plus';
import { ArrowLeft, Plus } from '@element-plus/icons-vue';
import type { Category } from '@/types';
import { categoriesApi } from '@/api';
import { useResponsive, useCrudDialog } from '@/composables';

const router = useRouter();
const { isMobile } = useResponsive();

// 返回：优先回退历史；直链进入（无上一页）时兜底到产品列表，避免退出站点
function goBack() {
    const state = window.history.state as { back?: string | null } | null;
    if (state?.back != null) {
        void router.back();
    } else {
        void router.push('/products');
    }
}


interface CategoryForm { name: string; parentId?: string; description: string; sortOrder: number }

// CRUD 骨架来自共享 composable；树形数据与「添加子类」预填是本页差异
const crud = useCrudDialog<CategoryForm, Category>({
    entityName: '类型',
    fetchList: async () => (await categoriesApi.getTree()).data,
    create: (p) => categoriesApi.create(p),
    update: (id, p) => categoriesApi.update(id, p),
    remove: (id) => categoriesApi.remove(id),
    emptyForm: () => ({ name: '', parentId: undefined, description: '', sortOrder: 0 }),
    toForm: (row) => ({
        name: row.name,
        parentId: row.parentId || undefined,
        description: row.description || '',
        sortOrder: row.sortOrder ?? 0,
    }),
});
const { loading, submitting, dialogVisible, form, formRef, isEditing } = crud;
const { handleEdit, handleDelete, handleSubmit } = crud;
void formRef; // 模板 ref="formRef" 绑定所需，脚本本身不读取
const tree = crud.list;
const rules: FormRules = { name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }] };

/** 添加子类：以父节点 id 预填表单 */
function handleCreate(parentId?: string) {
    crud.handleCreate(parentId ? { parentId } : undefined);
}

onMounted(crud.fetchData);
</script>

<style scoped>
.admin-crud-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.header-left { display: flex; align-items: center; gap: 12px; }
.header-left h2 { margin: 0; }
.tree-node { display: flex; align-items: center; gap: 10px; padding: 4px 0; width: 100%; }
.node-name { font-weight: 500; }
.node-count { margin-left: 2px; }
.node-actions { margin-left: auto; display: flex; gap: 4px; }
</style>
