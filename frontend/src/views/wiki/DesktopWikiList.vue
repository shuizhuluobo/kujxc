<template>
  <div class="wiki-desktop">
    <!-- 头部区域 -->
    <div class="wiki-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <el-icon><Reading /></el-icon>
          <span>知识库</span>
        </h1>
        <p class="hero-subtitle">分享技术经验，沉淀团队知识</p>
      </div>
    </div>

    <div class="wiki-layout">
      <!-- 左侧导航 -->
      <div class="wiki-sidebar card-premium">
        <div class="sidebar-section">
          <div class="section-header">
            <el-icon><Search /></el-icon>
            <el-input
              :model-value="searchKeyword"
              placeholder="搜索文章..."
              clearable
              @input="$emit('update:searchKeyword', $event); $emit('search')"
              class="sidebar-search"
            />
          </div>
        </div>

        <div class="sidebar-section">
          <div class="section-header">
            <span>分类</span>
            <el-button 
              v-if="has('wiki:manage_categories')" 
              text 
              type="primary" 
              size="small"
              @click="$emit('manageCategories')"
            >
              管理
            </el-button>
          </div>
          <div class="category-list">
            <div 
              class="category-item"
              :class="{ active: activeCategoryId === 'all' }"
              @click="$emit('categorySelect', 'all')"
            >
              <el-icon><Document /></el-icon>
              <span>全部文章</span>
              <el-tag size="small" type="info" class="count-badge">{{ total }}</el-tag>
            </div>
            <div 
              v-for="cat in categories" 
              :key="cat.id"
              class="category-item"
              :class="{ active: activeCategoryId === cat.id }"
              @click="$emit('categorySelect', cat.id)"
            >
              <el-icon><Folder /></el-icon>
              <span>{{ cat.name }}</span>
              <el-tag size="small" type="info" class="count-badge">{{ cat._count?.articles || 0 }}</el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="wiki-main">
        <!-- 操作栏 -->
        <div class="action-bar">
          <div class="action-info">
            <div class="current-category">
              <span v-if="activeCategoryId !== 'all'">
                <el-icon><Folder /></el-icon>
                {{ getCurrentCategoryName() }}
              </span>
              <span v-else>
                <el-icon><Document /></el-icon>
                全部文章
              </span>
            </div>
            <span class="total-count">共 {{ total }} 篇</span>
          </div>
          <el-button type="primary" @click="$emit('create')" class="create-btn">
            <el-icon><Edit /></el-icon>
            <span class="btn-text">写文章</span>
          </el-button>
        </div>

        <!-- 加载骨架屏 -->
        <div v-if="loading" class="article-list">
          <div v-for="i in 3" :key="i" class="article-skeleton">
            <div class="skeleton-header">
              <el-skeleton-item variant="text" style="width: 60%" />
            </div>
            <div class="skeleton-body">
              <el-skeleton-item variant="text" style="width: 100%" />
              <el-skeleton-item variant="text" style="width: 80%" />
            </div>
            <div class="skeleton-footer">
              <el-skeleton-item variant="text" style="width: 100px" />
            </div>
          </div>
        </div>

        <!-- 文章列表 -->
        <div v-else-if="articles.length > 0" class="article-list">
          <div
            v-for="article in articles"
            :key="article.id"
            class="article-card card-premium"
            @click="$emit('viewDetail', article.id)"
          >
            <div class="card-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-header">
                <h3 class="card-title">{{ article.title }}</h3>
                <el-tag size="small" effect="plain" class="card-category">{{ article.category?.name }}</el-tag>
              </div>
              <p class="card-summary">{{ getSummary(article.content) }}</p>
              <div class="card-footer">
                <div class="card-author">
                  <el-avatar :size="20" :src="resolveAssetUrl(article.author?.avatar)">
                    {{ article.author?.name?.charAt(0) }}
                  </el-avatar>
                  <span class="author-name">{{ article.author?.name }}</span>
                </div>
                <div class="card-meta">
                  <span class="meta-item">
                    <el-icon><Calendar /></el-icon>
                    {{ formatDate(article.createdAt) }}
                  </span>
                  <span class="meta-item">
                    <el-icon><View /></el-icon>
                    {{ article.viewCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state card-premium">
          <el-empty description="暂无文章">
            <el-button type="primary" @click="$emit('create')">写第一篇文章</el-button>
          </el-empty>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper" v-if="total > pagination.pageSize">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 30]"
            layout="prev, pager, next"
            :total="total"
            @current-change="$emit('pageChange', $event)"
            size="small"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Reading, Search, Edit, Document, Folder, Calendar, View } from '@element-plus/icons-vue';
import type { WikiArticle, WikiCategory } from '@/types';
import { resolveAssetUrl } from '@/utils/url';
import { stripMarkdown } from '@/utils/string';

const props = defineProps<{
  loading: boolean;
  articles: WikiArticle[];
  categories: WikiCategory[];
  activeCategoryId: string;
  searchKeyword: string;
  total: number;
  pagination: { page: number; pageSize: number };
  has: (perm: string) => boolean;
  getCurrentCategoryName: () => string;
}>();

defineEmits<{
  search: [];
  categorySelect: [id: string];
  create: [];
  viewDetail: [id: string];
  pageChange: [page: number];
  manageCategories: [];
  'update:searchKeyword': [val: string];
}>();

function formatDate(d: string) {
  const date = new Date(d);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getSummary(content: string) {
  if (!content) return '';
  const text = stripMarkdown(content);
  return text.length > 150 ? text.substring(0, 150) + '...' : text;
}
</script>

<style scoped>
.wiki-desktop {
  padding-bottom: 80px;
}

/* Hero 头部 */
.wiki-hero {
  background: linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%);
  padding: 48px 24px;
  text-align: center;
  margin-bottom: 32px;
  border-radius: 0 0 24px 24px;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.hero-title {
  margin: 0 0 12px;
  font-size: 36px;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.hero-subtitle {
  margin: 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
}

/* 布局 */
.wiki-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 48px;
}

/* 侧边栏 */
.wiki-sidebar {
  height: fit-content;
  position: sticky;
  top: 24px;
}

.sidebar-section {
  padding: 16px;
  border-bottom: 1px solid var(--border-color-lighter);
}

.sidebar-section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sidebar-search {
  width: 100%;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
  min-height: 44px;
}

.category-item:hover {
  background: var(--bg-color);
  color: var(--text-primary);
}

.category-item.active {
  background: var(--primary-color);
  color: white;
}

.category-item .count-badge {
  margin-left: auto;
  font-size: 11px;
}

.category-item.active .count-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* 主内容区 */
.wiki-main {
  min-height: 400px;
}

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;
  flex-wrap: wrap;
  gap: 12px;
}

.action-info {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--text-secondary);
  font-size: 14px;
}

.action-info span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.total-count {
  color: var(--text-tertiary);
  font-size: 13px;
}

.current-category {
  display: flex;
  align-items: center;
  gap: 6px;
}

.create-btn .btn-text {
  margin-left: 4px;
}

/* 文章列表 */
.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 88px;
}

.article-card:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-lg);
}

.card-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.card-category {
  flex-shrink: 0;
  font-size: 12px;
}

.card-summary {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.card-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.author-name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 骨架屏 */
.article-skeleton {
  display: flex;
  gap: 16px;
  padding: 20px;
}

.skeleton-header {
  margin-bottom: 12px;
}

.skeleton-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.skeleton-footer {
  display: flex;
  gap: 16px;
}

/* 空状态 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
}

/* 响应式设计 */
@media (max-width: 900px) {
  .wiki-layout {
    grid-template-columns: 1fr;
    padding: 0 16px 48px;
  }

  .wiki-sidebar {
    display: none;
  }

  .wiki-hero {
    padding: 32px 16px;
    margin-bottom: 20px;
    border-radius: 0 0 16px 16px;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-subtitle {
    font-size: 14px;
  }

  .action-bar {
    padding: 0;
    margin-bottom: 20px;
  }

  .current-category {
    flex: 1;
  }

  .action-info {
    flex-wrap: wrap;
    gap: 8px;
  }

  .total-count {
    width: 100%;
    order: 3;
    margin-top: 4px;
  }

  .article-list {
    gap: 12px;
  }

  .article-card {
    flex-direction: row;
    padding: 16px;
    gap: 14px;
    min-height: auto;
  }

  .card-icon {
    width: 44px;
    height: 44px;
    font-size: 20px;
    border-radius: 10px;
  }

  .card-header {
    margin-bottom: 6px;
  }

  .card-title {
    font-size: 16px;
  }

  .card-category {
    font-size: 11px;
    padding: 2px 8px;
  }

  .card-summary {
    font-size: 13px;
    margin-bottom: 10px;
    -webkit-line-clamp: 2;
  }

  .card-footer {
    gap: 8px;
  }

  .card-author {
    font-size: 12px;
  }

  .author-name {
    max-width: 80px;
  }

  .card-meta {
    gap: 12px;
    font-size: 11px;
  }

  .meta-item .el-icon {
    font-size: 12px;
  }

  .article-skeleton {
    padding: 16px;
    gap: 14px;
  }

  .pagination-wrapper {
    margin-top: 24px;
    padding-top: 16px;
  }

  .empty-state {
    min-height: 250px;
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 24px;
    gap: 8px;
  }

  .hero-subtitle {
    font-size: 13px;
  }

  .article-card {
    padding: 14px;
    gap: 12px;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
    border-radius: 8px;
  }

  .card-title {
    font-size: 15px;
  }

  .card-summary {
    font-size: 12px;
    line-height: 1.5;
  }

  .card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .card-meta {
    width: 100%;
    justify-content: flex-start;
  }
}

/* 触摸优化 */
@media (hover: none) and (pointer: coarse) {
  .article-card:hover {
    transform: none;
  }

  .article-card:active {
    background: var(--bg-color);
    transform: scale(0.98);
  }

  .category-item {
    min-height: 48px;
  }
}
</style>
