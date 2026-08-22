<template>
  <div class="admin-crud-page">
    <div class="page-header">
      <h2>品牌管理</h2>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索品牌名称"
          :prefix-icon="Search"
          clearable
          class="search-box"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button type="primary" :icon="Plus" @click="handleCreate">新增品牌</el-button>
      </div>
    </div>

    <el-table v-if="!isMobile" :data="filteredBrands" v-loading="loading" class="card-premium" empty-text="暂无品牌数据">
      <el-table-column prop="name" label="品牌名称" min-width="160" />
      <el-table-column prop="description" label="说明" min-width="200" show-overflow-tooltip />
      <el-table-column label="产品数" width="100">
        <template #default="{ row }">{{ row._count?.products ?? 0 }}</template>
      </el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="80" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-else class="admin-mobile-container">
      <van-sticky>
        <van-search
          v-model="searchKeyword"
          placeholder="搜索品牌名称"
          shape="round"
          background="var(--card-bg)"
          @search="handleSearch"
        />
      </van-sticky>
      <van-cell
        v-for="brand in filteredBrands"
        :key="brand.id"
        center
        is-link
        @click="handleEdit(brand)"
      >
        <template #title>
          <div class="list-title">
            {{ brand.name }}
            <span class="sub-title">({{ brand._count?.products ?? 0 }} 个产品)</span>
          </div>
        </template>
        <template #label>
          <div class="list-info">{{ brand.description || '无说明' }}</div>
        </template>
        <template #right-icon>
          <van-button size="mini" type="danger" text="删除" @click.stop="handleDelete(brand)" />
        </template>
      </van-cell>
      <el-empty v-if="!loading && filteredBrands.length === 0" description="暂无品牌" />
    </div>

    <el-dialog v-model="dialogVisible" :title="isEditing ? '编辑品牌' : '新增品牌'" :width="isMobile ? '90%' : '500px'">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="品牌名称" prop="name">
          <el-input v-model="form.name" maxlength="100" show-word-limit />
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
import { ref, computed, onMounted } from 'vue';
import { type FormRules } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import type { Brand } from '@/types';
import { brandsApi } from '@/api';
import { useResponsive, useCrudDialog } from '@/composables';
import { Search as VanSearch, Sticky as VanSticky, Cell as VanCell, Button as VanButton } from 'vant';

const { isMobile } = useResponsive();
const searchKeyword = ref('');

interface BrandForm { name: string; description: string; sortOrder: number }

// CRUD 骨架（列表加载/弹窗/提交/删除）来自共享 composable，页面只保留表单差异
const crud = useCrudDialog<BrandForm, Brand>({
    entityName: '品牌',
    fetchList: async () => (await brandsApi.getAll()).data,
    create: (p) => brandsApi.create(p),
    update: (id, p) => brandsApi.update(id, p),
    remove: (id) => brandsApi.remove(id),
    emptyForm: () => ({ name: '', description: '', sortOrder: 0 }),
    toForm: (row) => ({ name: row.name, description: row.description || '', sortOrder: row.sortOrder ?? 0 }),
});
const { loading, submitting, dialogVisible, form, formRef, isEditing } = crud;
const { handleCreate, handleEdit, handleDelete, handleSubmit } = crud;
void formRef; // 模板 ref="formRef" 绑定所需，脚本本身不读取
const brands = crud.list;
const filteredBrands = computed(() => {
    const kw = searchKeyword.value.trim().toLowerCase();
    if (!kw) return brands.value;
    return brands.value.filter((b) => b.name.toLowerCase().includes(kw));
});

const rules: FormRules = { name: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }] };

function handleSearch() { /* computed 已实现本地过滤 */ }

onMounted(crud.fetchData);
</script>

<style scoped>
.admin-crud-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.header-actions { display: flex; gap: 12px; }
.search-box { width: 240px; }
.list-title { font-weight: 500; font-size: 16px; }
.sub-title { font-size: 12px; color: var(--text-tertiary); margin-left: 4px; font-weight: normal; }
.list-info { margin-top: 4px; font-size: 13px; color: var(--text-secondary); }
</style>
