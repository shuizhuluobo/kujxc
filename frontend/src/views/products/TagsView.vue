<template>
  <div class="admin-crud-page">
    <div class="page-header">
      <div style="display: flex; align-items: center; gap: 8px;">
        <el-button :icon="ArrowLeft" circle plain @click="goBack" />
        <h2>标签管理</h2>
      </div>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索标签名称"
          :prefix-icon="Search"
          clearable
          class="search-box"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button type="primary" :icon="Plus" @click="handleCreate">新增标签</el-button>
      </div>
    </div>

    <el-table v-if="!isMobile" :data="filteredTags" v-loading="loading" class="card-premium" empty-text="暂无标签数据">
      <el-table-column label="标签" width="180">
        <template #default="{ row }">
          <el-tag :color="row.color || undefined" :effect="row.color ? 'dark' : 'plain'">{{ row.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="使用产品数" width="120">
        <template #default="{ row }">{{ row._count?.products ?? 0 }}</template>
      </el-table-column>
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
          placeholder="搜索标签名称"
          shape="round"
          background="var(--card-bg)"
          @search="handleSearch"
        />
      </van-sticky>
      <van-cell
        v-for="tag in filteredTags"
        :key="tag.id"
        center
        is-link
        @click="handleEdit(tag)"
      >
        <template #title>
          <el-tag :color="tag.color || undefined" :effect="tag.color ? 'dark' : 'plain'">{{ tag.name }}</el-tag>
          <span class="sub-title">({{ tag._count?.products ?? 0 }} 个产品)</span>
        </template>
        <template #right-icon>
          <van-button size="mini" type="danger" text="删除" @click.stop="handleDelete(tag)" />
        </template>
      </van-cell>
      <el-empty v-if="!loading && filteredTags.length === 0" description="暂无标签" />
    </div>

    <el-dialog v-model="dialogVisible" :title="isEditing ? '编辑标签' : '新增标签'" :width="isMobile ? '90%' : '500px'">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="form.name" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="标签颜色">
          <el-color-picker v-model="form.color" :predefine="PREDEFINED_COLORS" />
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
import { useRouter } from 'vue-router';
import type { FormRules } from 'element-plus';
import { Plus, Search, ArrowLeft } from '@element-plus/icons-vue';
import type { ProductTag } from '@/types';
import { productTagsApi } from '@/api';
import { useResponsive, useCrudDialog } from '@/composables';
import { Search as VanSearch, Sticky as VanSticky, Cell as VanCell, Button as VanButton } from 'vant';

const PREDEFINED_COLORS = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#B37FEB'];

const { isMobile } = useResponsive();
const router = useRouter();

interface TagForm { name: string; color: string }

// CRUD 骨架来自共享 composable，页面只保留表单差异
const crud = useCrudDialog<TagForm, ProductTag>({
    entityName: '标签',
    fetchList: async () => (await productTagsApi.getAll()).data,
    create: (p) => productTagsApi.create(p),
    update: (id, p) => productTagsApi.update(id, p),
    remove: (id) => productTagsApi.remove(id),
    emptyForm: () => ({ name: '', color: '' }),
    toForm: (row) => ({ name: row.name, color: row.color || '' }),
});
const { loading, submitting, dialogVisible, form, formRef, isEditing } = crud;
const { handleCreate, handleEdit, handleDelete, handleSubmit } = crud;
void formRef; // 模板 ref="formRef" 绑定所需，脚本本身不读取
const tags = crud.list;
const searchKeyword = ref('');
const filteredTags = computed(() => {
    const kw = searchKeyword.value.trim().toLowerCase();
    if (!kw) return tags.value;
    return tags.value.filter((t) => t.name.toLowerCase().includes(kw));
});

const rules: FormRules = { name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }] };

function handleSearch() { /* computed 已实现本地过滤 */ }

function goBack() {
    const parent = router.currentRoute.value.query.from as string | undefined;
    if (parent) router.push(parent);
    else router.back();
}

onMounted(crud.fetchData);
</script>

<style scoped>
.admin-crud-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.header-actions { display: flex; gap: 12px; }
.search-box { width: 240px; }
.sub-title { font-size: 12px; color: var(--text-tertiary); margin-left: 8px; font-weight: normal; }
</style>
