<template>
  <div class="wiki-page">
    <component
      :is="isMobile ? MobileWikiList : DesktopWikiList"
      :loading="loading"
      :articles="articles"
      :categories="categories"
      :active-category-id="activeCategoryId"
      :search-keyword="searchKeyword"
      :total="total"
      :pagination="pagination"
      :refreshing="refreshing"
      :loading-more="loadingMore"
      :finished="finished"
      :has="has"
      :get-current-category-name="getCurrentCategoryName"
      @search="handleSearch"
      @category-select="handleCategorySelect"
      @create="handleCreate"
      @view-detail="viewDetail"
      @page-change="handlePageChange"
      @refresh="onRefresh"
      @load="onLoad"
      @manage-categories="handleManageCategories"
      @update:search-keyword="searchKeyword = $event"
    />

    <!-- 分类管理抽屉（桌面端专用） -->
    <el-drawer
      v-model="categoryDialogVisible"
      title="分类管理"
      :size="'500px'"
      direction="rtl"
    >
      <div class="category-manage">
        <el-form :inline="true" :model="categoryForm" class="add-form">
          <el-form-item>
            <el-input v-model="categoryForm.name" placeholder="新分类名称" maxlength="100" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveCategory">添加</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="categories" stripe size="small" empty-text="暂无分类">
          <el-table-column prop="name" label="名称" />
          <el-table-column label="文章数" width="80">
            <template #default="{ row }">
              {{ row._count?.articles || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ row }">
              <el-button type="danger" size="small" :icon="Delete" circle @click="deleteCategory(row.id)" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, defineAsyncComponent } from 'vue';
import { Delete } from '@element-plus/icons-vue';
import { useResponsive } from '@/composables';
import { useWikiList, useWikiCategory } from './composables/useWikiList';

const MobileWikiList = defineAsyncComponent(() => import('./MobileWikiList.vue'));
const DesktopWikiList = defineAsyncComponent(() => import('./DesktopWikiList.vue'));

const { isMobile } = useResponsive();

const {
  loading,
  articles,
  categories,
  activeCategoryId,
  searchKeyword,
  total,
  refreshing,
  loadingMore,
  finished,
  pagination,
  has,
  fetchCategories,
  fetchArticles,
  onRefresh,
  onLoad,
  handlePageChange,
  handleSearch,
  handleCategorySelect,
  handleCreate,
  viewDetail,
  getCurrentCategoryName,
} = useWikiList();

const {
  categoryDialogVisible,
  categoryForm,
  handleManageCategories,
  saveCategory,
  deleteCategory,
} = useWikiCategory(fetchCategories);

onMounted(() => {
  void fetchCategories();
  void fetchArticles();
});
</script>

<style scoped>
.wiki-page {
  min-height: 100%;
}
</style>
