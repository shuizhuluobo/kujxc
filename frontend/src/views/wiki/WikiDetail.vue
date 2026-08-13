<template>
  <div class="detail-page" data-v-refreshed="202603062330">
    <!-- Mobile Nav -->
    <van-nav-bar
      v-if="isMobile"
      title="文章详情"
      left-arrow
      fixed
      placeholder
      safe-area-inset-top
      @click-left="goBack"
      class="mobile-nav-bar"
    >
        <template #right>
            <div class="mobile-nav-actions">
                <van-icon v-if="canEdit" name="edit" size="20" @click="goToEdit" />
                <van-icon v-if="canDelete" name="delete-o" size="20" @click="handleDelete" style="margin-left: 12px;" />
            </div>
        </template>
    </van-nav-bar>

    <!-- Desktop Nav -->
    <div v-else class="detail-nav">
      <el-button :icon="ArrowLeft" @click="goBack" class="nav-back">
        返回
      </el-button>
      <div class="nav-actions">
        <el-button v-if="canEdit" type="primary" :icon="Edit" @click="goToEdit">
          编辑
        </el-button>
        <el-button v-if="canDelete" type="danger" :icon="Delete" @click="handleDelete">
          删除
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="loading-container-new">
      <div class="skeleton-wrapper">
        <el-skeleton :rows="6" animated />
      </div>
    </div>

    <div v-else-if="article" class="article-container-new">
      <!-- 文章头部 -->
      <header class="article-header">
        <!-- 第一行：操作栏 (已经在 detail-nav 处理) -->
        
        <!-- 第二行：标题 -->
        <h1 class="article-title">{{ article.title }}</h1>

        <!-- 第三行：元数据与点赞 (作者、分类、点赞) -->
        <div class="article-meta-row">
          <div class="author-and-category">
            <el-avatar :size="32" class="author-avatar" :src="resolveAssetUrl(article.author?.avatar)">
              {{ !article.author?.avatar ? article.author?.name?.charAt(0) : '' }}
            </el-avatar>
            <span class="author-name">{{ article.author?.name }}</span>
            <el-divider direction="vertical" />
            <el-tag size="small" effect="plain" class="category-tag">
              {{ article.category?.name }}
            </el-tag>
            <el-divider direction="vertical" />
            <span class="publish-time">{{ formatDate(article.createdAt) }}</span>
            <el-divider direction="vertical" />
            <span class="read-count">
              <el-icon><View /></el-icon>
              {{ article.viewCount }}
            </span>
          </div>
          
          <div class="header-actions">
            <el-button 
              size="small"
              :icon="Pointer" 
              class="like-btn" 
              :class="{ 'is-liked': article.isLiked }"
              @click="handleLike"
            >
              <span class="btn-text">{{ article.likeCount || 0 }}</span>
            </el-button>
          </div>
        </div>
      </header>

      <!-- 文章内容 - 使用 MdPreview -->
      <article class="article-content md-preview-custom">
        <MdPreview
          :model-value="resolveMarkdownAssets(article.content)"
          preview-theme="github"
          code-theme="atom-one-dark"
          :show-code-row-number="true"
          :language="'zh-CN'"
          :theme="isDark ? 'dark' : 'light'"
        />
      </article>

      <!-- 附件列表 -->
      <div v-if="article.attachments && article.attachments.length > 0" class="article-attachments">
        <div class="attachment-header">
          <el-icon><Paperclip /></el-icon>
          <span>附件 ({{ article.attachments.length }})</span>
        </div>
        <div class="attachment-list">
          <a 
            v-for="file in article.attachments" 
            :key="file.id" 
            :href="resolveAssetUrl(file.url)" 
            :download="file.filename"
            class="attachment-item"
            target="_blank"
          >
            <div class="file-info">
              <el-icon><Document /></el-icon>
              <div class="text">
                <span class="filename">{{ file.filename }}</span>
                <span class="size">{{ formatFileSize(file.size) }}</span>
              </div>
            </div>
            <el-icon class="download-icon"><Download /></el-icon>
          </a>
        </div>
      </div>
    </div>

    <div v-else class="empty-container">
      <el-empty description="文章不存在" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft, Edit, View, Pointer,
  Delete, Paperclip, Document, Download
} from '@element-plus/icons-vue';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import { NavBar as VanNavBar, Icon as VanIcon } from 'vant';
import { useWikiDetail } from './composables/useWikiDetail';
import { resolveAssetUrl, resolveMarkdownAssets } from '@/utils/url';

const {
  isMobile,
  isDark,
  loading,
  article,
  canEdit,
  canDelete,
  formatDate,
  goToEdit,
  handleDelete,
  handleLike,
  goBack,
} = useWikiDetail();

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
</script>

<style scoped>
.detail-page {
  min-height: 100%;
  background: var(--bg-color);
}

/* 导航栏 */
.detail-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color-lighter);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.nav-back {
  transition: color 0.2s ease, background-color 0.2s ease;
}

.nav-back:hover {
  transform: translateX(-4px);
}

.nav-actions {
  display: flex;
  gap: 12px;
}

/* 加载状态 */
.loading-container-new {
  max-width: 1200px;
  margin: 48px auto;
  padding: 24px;
}

.skeleton-wrapper {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 32px;
}

/* 文章容器 */
.article-container-new {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 64px;
}

/* 文章头部 */
.article-header {
  margin-bottom: 32px;
}

.article-title {
  margin: 0 0 20px;
  font-size: clamp(26px, 4vw, 36px);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  letter-spacing: -0.5px;
  text-align: left;
}

.article-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid var(--border-color-lighter);
}

.author-and-category {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-tertiary);
  font-size: 13px;
}

.author-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

.category-tag {
  font-weight: 500;
}

.publish-time, .read-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.like-btn {
  transition: transform 0.3s ease, color 0.3s ease, background-color 0.3s ease;
  padding: 8px 16px;
}

.like-btn.is-liked {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-5);
  background-color: var(--el-color-primary-light-9);
}

/* 文章内容 */
.article-content {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 40px;
  min-height: 400px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color-lighter);
}

:deep(.md-editor-catalog) {
  display: none !important;
}

:deep(.md-preview) {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-primary);
}

:deep(.md-preview h1) {
  font-size: clamp(24px, 2.4vw, 28px);
  font-weight: 700;
  margin: 32px 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color-lighter);
  letter-spacing: -0.3px;
}

:deep(.md-preview h2) {
  font-size: clamp(20px, 2.1vw, 24px);
  font-weight: 600;
  margin: 28px 0 16px;
  letter-spacing: -0.2px;
}

:deep(.md-preview h3) {
  font-size: clamp(18px, 1.8vw, 20px);
  font-weight: 600;
  margin: 24px 0 14px;
}

:deep(.md-preview p) {
  margin: 16px 0;
  line-height: 1.85;
}

:deep(.md-preview code) {
  background: var(--bg-color);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--danger-color);
}

:deep(.md-preview pre) {
  margin: 20px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

:deep(.md-preview pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: 14px;
  line-height: 1.7;
}

:deep(.md-preview ul),
:deep(.md-preview ol) {
  margin: 16px 0;
  padding-left: 24px;
}

:deep(.md-preview li) {
  margin: 8px 0;
  line-height: 1.75;
}

:deep(.md-preview blockquote) {
  margin: 20px 0;
  padding: 16px 20px;
  border-left: 4px solid var(--primary-color);
  background: var(--bg-color);
  border-radius: 0 8px 8px 0;
  color: var(--text-secondary);
}

:deep(.md-preview img) {
  border-radius: 12px;
  margin: 20px 0;
  box-shadow: var(--shadow-md);
}

:deep(.md-preview table) {
  margin: 20px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

:deep(.md-preview table th),
:deep(.md-preview table td) {
  padding: 12px 16px;
  border-color: var(--border-color-lighter);
}

:deep(.md-preview table th) {
  background: var(--bg-color);
  font-weight: 600;
}

.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .article-container-new {
    padding: 12px 8px 40px;
  }

  .article-header {
    margin-bottom: 24px;
  }

  .article-title {
    font-size: 24px;
    line-height: 1.35;
    margin-bottom: 16px;
  }

  /* 作者信息与点赞同一行：作者信息可换行，点赞固定在右侧 */
  .article-meta-row {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    padding: 12px 0;
  }

  .author-and-category {
    flex-wrap: wrap;
    flex: 1;
    min-width: 0;
  }

  .header-actions {
    margin-left: auto;
  }

  .author-and-category {
    flex-wrap: wrap;
  }

  .article-content {
    padding: 12px 8px;
    border-radius: 12px;
    min-height: 240px;
  }

  .article-attachments {
    padding: 16px;
    margin-top: 20px;
  }

  :deep(.md-preview) {
    font-size: 15px;
  }

  :deep(.md-preview h1) {
    font-size: 22px;
    margin: 24px 0 16px;
  }

  :deep(.md-preview h2) {
    font-size: 18px;
    margin: 20px 0 12px;
  }

  :deep(.md-preview h3) {
    font-size: 16px;
    margin: 18px 0 10px;
  }

  .attachment-list {
    grid-template-columns: 1fr;
  }
}

/* 附件样式 */
.article-attachments {
  margin-top: 32px;
  padding: 24px;
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color-lighter);
}

.attachment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.attachment-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-color);
  border: 1px solid var(--border-color-lighter);
  border-radius: 12px;
  text-decoration: none;
  transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: inherit;
}

.attachment-item:hover {
  border-color: var(--primary-color);
  background: var(--bg-color-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.attachment-item .file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
  flex: 1;
}

.attachment-item .text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.attachment-item .filename {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attachment-item .size {
  font-size: 12px;
  color: var(--text-tertiary);
}

.attachment-item .download-icon {
  color: var(--text-tertiary);
  font-size: 18px;
  transition: color 0.2s;
}

.attachment-item:hover .download-icon {
  color: var(--primary-color);
}

/* 全局样式覆盖（移动端）见下方非 scoped style 块 */
</style>

<style>
/* 全局样式覆盖，确保移动端体验 */

/* 代码块标题默认 sticky(top:0) 且 z-index:10000，滚动时会遮挡顶部标题栏，改为随内容滚动 */
.md-editor-preview .md-editor-code .md-editor-code-head {
  position: static !important;
  z-index: auto !important;
}

@media (max-width: 768px) {
  /* 行内代码：允许换行，避免超长行溢出容器 */
  .article-container-new .md-preview code,
  .md-editor-preview code {
    white-space: pre-wrap !important;
    word-break: break-all !important;
    overflow-wrap: break-word !important;
  }

  /* 代码块：不换行以保持行号逐行对齐（md-editor-v3 行号按源码行计数），
     超长内容在代码块内横向滚动，避免 wrap 后行号错位 */
  .article-container-new .md-preview pre,
  .article-container-new .md-preview pre code,
  .md-editor-preview pre,
  .md-editor-preview pre code {
    white-space: pre !important;
    word-break: normal !important;
    overflow-wrap: normal !important;
  }

  /* 移动端压缩行号列宽与代码起始间距，减小代码块左边距 */
  .md-editor-preview.md-editor-scrn span[rn-wrapper] {
    width: 2em !important;
  }

  .md-editor-preview.md-editor-scrn pre code {
    padding-inline-start: 2.3em !important;
  }

  /* 移动端代码字号随屏宽自适应缩小，同屏显示更多字符，减少横向滚动 */
  .md-editor-preview pre,
  .md-editor-preview pre code {
    font-size: clamp(12px, 3.5vw, 14px) !important;
    line-height: 1.55 !important;
  }

  /* 详情页代码块贴卡片边缘全宽展示（外勤工程师移动端查看），进一步提升可读宽度 */
  .article-container-new .md-editor-preview .md-editor-code {
    margin-left: -8px !important;
    margin-right: -8px !important;
  }
}

/* 触摸优化 - 全局也适用 */
@media (hover: none) and (pointer: coarse) {
  .like-btn:hover {
    transform: none;
  }

  .nav-back:hover {
    transform: none;
  }
}
</style>
