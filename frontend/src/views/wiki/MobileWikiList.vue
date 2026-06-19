<template>
  <div class="wiki-mobile m-page-root">
    <!-- 页头：h2 + 统计 + 内联分类 chips + 圆形主操作 -->
    <div class="m-page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-row-top">
            <h2>知识库</h2>
            <div class="stats-tag">
              <span class="stat-item primary">{{ articles.length }}</span>
            </div>
            <div class="header-right">
              <van-button
                v-if="has('wiki:create')"
                icon="edit"
                type="primary"
                round
                size="small"
                class="header-create-btn"
                @click="handleCreate"
              />
            </div>
          </div>
          <!-- 内联横滑分类 chips -->
          <div class="filter-chips-inline" style="max-width: none; padding: 4px 0 8px;">
            <div class="filter-chips-container">
              <div
                class="filter-chip"
                :class="{ active: activeCategoryId === 'all' }"
                @click="handleCategoryTab({ name: 'all' } as any)"
              >
                全部
              </div>
              <div
                v-for="cat in categories"
                :key="cat.id"
                class="filter-chip"
                :class="{ active: activeCategoryId === cat.id }"
                @click="handleCategoryTab({ name: cat.id } as any)"
              >
                {{ cat.name }}
              </div>
            </div>
          </div>
          <!-- 搜索框 -->
          <van-search
            :model-value="searchKeyword"
            placeholder="搜索文章..."
            shape="round"
            background="transparent"
            @search="handleSearch"
            @clear="handleSearch"
            @update:model-value="$emit('update:searchKeyword', $event)"
          />
        </div>
      </div>
    </div>

    <van-pull-refresh v-model="localRefreshing" @refresh="onRefresh" class="pull-refresh-container">
      <van-list
        v-model:loading="localLoadingMore"
        :finished="finished"
        :finished-text="articles.length === 0 ? '' : '没有更多了'"
        @load="onLoad"
      >
        <div class="card-list">
          <div
            v-for="article in articles"
            :key="article.id"
            class="mobile-article-card"
            @click="viewDetail(article.id)"
          >
            <div class="mobile-card-header">
              <span class="mobile-card-title">{{ article.title }}</span>
              <el-tag size="small" type="info">{{ article.category?.name }}</el-tag>
            </div>
            <div class="mobile-card-summary">{{ getSummary(article.content) }}</div>
            <div class="mobile-card-footer">
              <div class="mobile-author">
                <van-image round width="20" height="20" :src="resolveAssetUrl(article.author?.avatar)" />
                <span class="ml-1">{{ article.author?.name }}</span>
              </div>
              <div class="mobile-meta">
                <span>{{ formatDate(article.createdAt) }}</span>
                <span class="ml-2"><van-icon name="eye-o" /> {{ article.viewCount }}</span>
              </div>
            </div>
          </div>
          <el-empty v-if="articles.length === 0 && !loading" description="暂无文章" />
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Search as VanSearch, PullRefresh as VanPullRefresh, List as VanList, Image as VanImage, Button as VanButton, Icon as VanIcon } from 'vant';
import type { WikiArticle, WikiCategory } from '@/types';
import { resolveAssetUrl } from '@/utils/url';
import { stripMarkdown } from '@/utils/string';

const props = defineProps<{
  loading: boolean;
  articles: WikiArticle[];
  categories: WikiCategory[];
  activeCategoryId: string;
  searchKeyword: string;
  refreshing: boolean;
  loadingMore: boolean;
  finished: boolean;
  has: (perm: string) => boolean;
}>();

const emit = defineEmits<{
  search: [];
  categorySelect: [id: string];
  refresh: [];
  load: [];
  create: [];
  viewDetail: [id: string];
  'update:searchKeyword': [val: string];
}>();

// Local refs for v-model that Vant needs to mutate
const localRefreshing = ref(props.refreshing);
const localLoadingMore = ref(props.loadingMore);
watch(() => props.refreshing, v => localRefreshing.value = v);
watch(() => props.loadingMore, v => localLoadingMore.value = v);

function handleSearch() { emit('search'); }
function handleCategoryTab({ name }: { name: string | number }) {
  emit('categorySelect', String(name));
}
function onRefresh() { emit('refresh'); }
function onLoad() { emit('load'); }
function handleCreate() { emit('create'); }
function viewDetail(id: string) { emit('viewDetail', id); }

function formatDate(d: string) {
  const date = new Date(d);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getSummary(content: string) {
  if (!content) return '';
  const plainText = stripMarkdown(content);
  return plainText.length > 120 ? plainText.slice(0, 120) + '...' : plainText;
}
</script>

<style scoped>
.wiki-mobile {
  background: var(--bg-color);
  min-height: 100vh;
}

/* 页头副样式（基准 .m-page-header 由全局提供） */
.m-page-header .header-create-btn {
  width: 36px;
  height: 36px;
}

.m-page-header :deep(.van-search) {
  padding: 0;
}

.m-page-header :deep(.van-search__content) {
  background: var(--bg-color-page);
}

/* 卡片列表（使用全局 .card-list） */
.card-list {
  padding: 12px 16px 20px;
}

.mobile-article-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color-lighter);
  transition: transform 0.2s var(--ease-out, ease), box-shadow 0.2s var(--ease-out, ease);
}

.mobile-article-card:active {
  transform: scale(0.98);
}

.mobile-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.mobile-card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
  margin-right: 12px;
  line-height: 1.4;
}

.mobile-card-summary {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mobile-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-tertiary);
}

.mobile-author {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

/* Dark mode support for Vant Search */
:deep(.van-search__content) {
  background: var(--bg-color-page);
}
</style>
