<template>
  <div class="wiki-mobile">
    <van-sticky>
      <div class="mobile-header">
        <h2 class="mobile-title">知识库</h2>
        <van-search
          :model-value="searchKeyword"
          placeholder="搜索文章..."
          shape="round"
          background="transparent"
          @search="handleSearch"
          @clear="handleSearch"
          @update:model-value="$emit('update:searchKeyword', $event)"
        />
        <van-tabs :active="activeCategoryId" background="transparent" @click-tab="handleCategoryTab">
          <van-tab title="全部" name="all" />
          <van-tab v-for="cat in categories" :key="cat.id" :title="cat.name" :name="cat.id" />
        </van-tabs>
      </div>
    </van-sticky>

    <van-pull-refresh v-model="localRefreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="localLoadingMore"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
        class="mobile-article-list"
      >
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
      </van-list>
    </van-pull-refresh>

    <!-- Mobile FAB -->
    <div class="mobile-fab-container">
      <van-button
        v-if="has('wiki:create')"
        icon="edit"
        type="primary"
        round
        class="mobile-fab-btn"
        @click="handleCreate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Sticky as VanSticky, Search as VanSearch, Tabs as VanTabs, Tab as VanTab, PullRefresh as VanPullRefresh, List as VanList, Image as VanImage, Button as VanButton, Icon as VanIcon } from 'vant';
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

.mobile-header {
  background: var(--card-bg);
  padding-bottom: 0;
  box-shadow: var(--shadow-sm);
}

.mobile-title {
  margin: 0;
  padding: calc(16px + var(--safe-area-top)) 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.mobile-article-list {
  padding: 12px;
}

.mobile-article-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color-lighter);
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

.mobile-fab-container {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 99;
}

.mobile-fab-btn {
  width: 50px;
  height: 50px;
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
}

/* Dark mode support for Vant Tabs */
:deep(.van-tabs__nav) {
  background: transparent;
}
:deep(.van-tab) {
  color: var(--text-secondary);
}
:deep(.van-tab--active) {
  color: var(--primary-color);
  font-weight: 600;
}
</style>
