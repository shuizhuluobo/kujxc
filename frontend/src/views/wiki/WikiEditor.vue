<template>
  <div class="editor-page">
    <!-- Immersive Header -->
    <div class="editor-header">
      <div class="header-left">
        <el-button link class="icon-btn" @click="router.back()">
          <el-icon :size="20"><ArrowLeft /></el-icon>
        </el-button>
      </div>
      <div class="header-center">
        <span class="page-title">{{ isEdit ? '编辑文章' : '新文章' }}</span>
      </div>
      <div class="header-right">
        <!-- Mobile Mode Toggle -->
        <el-button link class="icon-btn" @click="toggleMobileMode" v-if="isMobile">
          <el-icon :size="20">
            <View v-if="mobileMode === 'edit'" />
            <EditPen v-else />
          </el-icon>
        </el-button>
        
        <!-- Publish -->
        <el-button type="primary" size="small" circle :loading="submitting" @click="handleSave" class="publish-btn">
          <el-icon><Check /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- Main Scrollable Content -->
    <div class="editor-main">
      <div class="document-container">
        <!-- Title Input as Document Head -->
        <div class="document-header">
            <input 
                v-model="title" 
                class="document-title-input" 
                placeholder="请输入标题..." 
                type="text"
                maxlength="200"
            />
            <!-- Meta Bar -->
            <div class="meta-bar">
                <!-- Category Dropdown -->
                <el-dropdown trigger="click" @command="handleCategoryCommand">
                    <div class="meta-item interactive">
                        <el-icon><Folder /></el-icon>
                        <span>{{ currentCategoryName || '选择分类' }}</span>
                        <el-icon class="meta-arrow"><ArrowDown /></el-icon>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item 
                                v-for="cat in categories" 
                                :key="cat.id" 
                                :command="cat.id"
                                :class="{ 'is-active': cat.id === categoryId }"
                            >
                                {{ cat.name }}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>

                <div class="meta-separator">•</div>

                <!-- Public Toggle -->
                <div class="meta-item interactive" @click="togglePublic">
                    <el-icon><component :is="isPublic ? 'Unlock' : 'Lock'" /></el-icon>
                    <span>{{ isPublic ? '公开' : '私密' }}</span>
                </div>
            </div>
        </div>

        <!-- Editor Area -->
        <div class="editor-wrapper">
            <template v-if="!isMobile || mobileMode === 'edit'">
                <md-editor
                v-model="content"
                :editor-id="'wiki-editor'"
                :preview="!isMobile"
                :show-code-row="true"
                :code-theme="'atom-one-dark'"
                :preview-theme="'github'"
                :language="'zh-CN'"
                :toolbars="isMobile ? mobileToolbars : undefined"
                class="md-editor-custom"
                @onUploadImg="onUploadImg"
                />
            </template>
            <div v-else class="mobile-preview-container">
                <md-preview
                    :model-value="resolveMarkdownAssets(content)"
                    :editor-id="'wiki-editor-preview'"
                    :code-theme="'atom-one-dark'"
                    :preview-theme="'github'"
                />
            </div>
        </div>

        <!-- Attachment Section -->
        <div class="attachment-section">
          <div class="attachment-container">
            <div class="section-header">
              <div class="title">
                <el-icon><Paperclip /></el-icon>
                <span>附件 ({{ attachments.length }})</span>
              </div>
              <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleFileUpload"
                class="upload-trigger"
              >
                <el-button type="primary" link :icon="Plus">添加附件</el-button>
              </el-upload>
            </div>
            
            <div class="attachment-list" v-if="attachments.length > 0">
              <div 
                v-for="(file, index) in attachments" 
                :key="index" 
                class="attachment-item"
              >
                <div class="file-info">
                  <el-icon><Document /></el-icon>
                  <div class="text">
                    <span class="filename" :title="file.filename">{{ file.filename }}</span>
                    <span class="size">{{ formatFileSize(file.size) }}</span>
                  </div>
                </div>
                <el-button 
                  link 
                  type="danger" 
                  class="remove-btn" 
                  @click="removeAttachment(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div v-else class="empty-attachments">
              <p>暂无附件，支持压缩包格式 (max 500MB)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft, Check, View, EditPen, Folder,
  ArrowDown, Paperclip, Plus, Document, Delete
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { UploadFile } from 'element-plus';
import { MdEditor, MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { wikiApi, uploadsApi } from '@/api';
import { resolveAssetUrl, resolveMarkdownAssets } from '@/utils/url';
import type { WikiCategory } from '@/types';
import { useResponsive } from '@/composables';

const route = useRoute();
const router = useRouter();
const { isMobile } = useResponsive();

const title = ref('');
const categoryId = ref('');
const isPublic = ref(true);
const content = ref('');
interface WikiAttachment {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

const attachments = ref<WikiAttachment[]>([]);
const categories = ref<WikiCategory[]>([]);
const submitting = ref(false);
const isEdit = computed(() => !!route.query.id);

const currentCategoryName = computed(() => {
    const cat = categories.value.find(c => c.id === categoryId.value);
    return cat ? cat.name : '';
});

function handleCategoryCommand(command: string) {
    categoryId.value = command;
}

function togglePublic() {
    isPublic.value = !isPublic.value;
    ElMessage.success(isPublic.value ? '已设为公开' : '已设为私密');
}

const mobileMode = ref<'edit' | 'preview'>('edit');

const mobileToolbars = [
  'bold', 'underline', 'italic', '-', 
  'title', 'quote', 'unorderedList', 'orderedList', '-',
  'link', 'image', 'code', 'table', '=',
  'fullscreen'
];

function toggleMobileMode() {
  mobileMode.value = mobileMode.value === 'edit' ? 'preview' : 'edit';
}

async function fetchCategories() {
  const res = await wikiApi.getCategories();
  categories.value = res.data;
  if (categories.value.length > 0 && !categoryId.value) {
    categoryId.value = categories.value[0].id;
  }
}

async function fetchArticle() {
  const id = route.query.id as string;
  if (!id) return;

  try {
    const res = await wikiApi.getArticle(id);
    title.value = res.data.title;
    categoryId.value = res.data.categoryId;
    isPublic.value = res.data.isPublic;
    content.value = res.data.content || '';
    attachments.value = res.data.attachments || [];
  } catch (e) {
    console.error(e);
  }
}

async function handleSave() {
  if (!title.value.trim()) return ElMessage.warning('请输入标题');
  if (!categoryId.value) return ElMessage.warning('请选择分类');
  if (!content.value.trim()) return ElMessage.warning('请输入内容');

  submitting.value = true;
  try {
    const payload = {
      title: title.value,
      content: content.value,
      categoryId: categoryId.value,
      isPublic: isPublic.value,
      attachments: attachments.value.map(a => ({
        filename: a.filename,
        url: a.url,
        size: a.size,
        mimeType: a.mimeType
      }))
    };

    const id = route.query.id as string;
    if (id) {
      await wikiApi.updateArticle(id, payload);
      ElMessage.success('更新成功');
    } else {
      await wikiApi.createArticle(payload);
      ElMessage.success('发布成功');
    }
    void router.push('/wiki');
  } catch (e) {
    console.error('保存文章失败:', e);
    ElMessage.error('保存失败');
  } finally {
    submitting.value = false;
  }
}

async function onUploadImg(files: Array<File>, callback: (urls: Array<string>) => void) {
  const res = await Promise.all(
    files.map((file) => {
      return new Promise<string>((resolve, reject) => {
        uploadsApi.uploadImage(file)
          .then((response) => resolve(resolveAssetUrl(response.data.url)))
          .catch(reject);
      });
    })
  );
  callback(res);
}

async function handleFileUpload(uploadFile: UploadFile) {
  const file = uploadFile.raw as File;
  if (!file) return;

  // Extension validation
  const validExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz'];
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (!validExtensions.includes(ext)) {
    return ElMessage.error('仅支持压缩包格式 (.zip, .rar, .7z, .tar, .gz, .bz2, .xz)');
  }

  // Size validation
  if (file.size > 500 * 1024 * 1024) {
    return ElMessage.error('文件大小不能超过 500MB');
  }

  const uploadLoading = ElMessage({
    message: '正在上传附件...',
    duration: 0,
    type: 'info'
  });

  try {
    const res = await uploadsApi.uploadWikiAttachment(file);
    attachments.value.push({
      filename: res.data.filename,
      url: res.data.url,
      size: res.data.size,
      mimeType: res.data.mimeType
    });
    ElMessage.success('上传成功');
  } catch (e) {
    ElMessage.error('上传失败');
    console.error(e);
  } finally {
    uploadLoading.close();
  }
}

function removeAttachment(index: number) {
  attachments.value.splice(index, 1);
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

onMounted(async () => {
  await fetchCategories();
  await fetchArticle();
});
</script>

<style scoped>
.editor-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
}

/* Header */
.editor-header {
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color-lighter);
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 80px;
}

.header-right {
  justify-content: flex-end;
}

.header-center {
  font-weight: 600;
  font-size: 16px;
  color: var(--text-primary);
}

.icon-btn {
  color: var(--text-secondary);
  padding: 8px;
  height: auto;
}

.publish-btn {
  margin-left: 8px;
}

/* Main Content */
.editor-main {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

.document-container {
  max-width: 800px;
  margin: 0 auto;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
}

/* Title Input */
.document-header {
  padding: 24px 20px 12px;
}

.document-title-input {
  width: 100%;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  outline: none;
  line-height: 1.4;
  padding-bottom: 4px;
  transition: border-color 0.2s ease;
}

.document-title-input:focus {
  border-bottom-color: var(--primary-color);
}

.document-title-input::placeholder {
  color: var(--text-tertiary);
}

.meta-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  color: var(--text-secondary);
  font-size: 14px;
  padding: 8px 0;
  width: fit-content;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-item.interactive {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.meta-item.interactive:hover {
  background-color: var(--bg-color-hover, rgba(0, 0, 0, 0.05));
  color: var(--primary-color);
}

.meta-separator {
  color: var(--border-color);
}

.meta-arrow {
  margin-left: 4px;
  font-size: 12px;
  opacity: 0.5;
}

/* Active Dropdown Item */
:deep(.el-dropdown-menu__item.is-active) {
  color: var(--primary-color);
  font-weight: 600;
  background-color: var(--el-dropdown-menuItem-hover-fill);
}

/* Editor Wrapper */
.editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.md-editor-custom {
  border: none;
  background: transparent;
  flex: 1;
}

/* Hide toolbar border in custom layout if needed */
:deep(.md-editor-toolbar-wrapper) {
  border-bottom: 1px solid var(--border-color-lighter);
}

:deep(.md-editor-content-wrapper) {
  padding: 0 20px 40px;
}

/* Mobile Preview */
.mobile-preview-container {
  padding: 0 20px 40px;
}

/* Attachment Section */
.attachment-section {
  padding: 0 20px 40px;
}

.attachment-container {
  border-top: 1px solid var(--border-color-lighter);
  padding-top: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header .title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.attachment-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--card-bg);
  border: 1px solid var(--border-color-lighter);
  border-radius: 8px;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.attachment-item:hover {
  border-color: var(--primary-color-light);
  background: var(--bg-color-hover);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  flex: 1;
}

.file-info .text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.file-info .filename {
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-info .size {
  font-size: 12px;
  color: var(--text-tertiary);
}

.empty-attachments {
  text-align: center;
  padding: 20px;
  color: var(--text-tertiary);
  font-size: 14px;
  background: var(--bg-color-lighter);
  border-radius: 8px;
  border: 1px dashed var(--border-color);
}

/* Mobile Ops */
@media (max-width: 768px) {
  /* CSS Optimizations for Touch & Text */
  :deep(.md-editor-preview-wrapper) {
    padding: 0 8px;
  }

  /* Prevent double-tap zoom on buttons/inputs */
  :deep(button), :deep(input) {
    touch-action: manipulation;
  }

  /* Fix code block overflow */
  :deep(pre) {
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* Ensure long words break */
  :deep(.md-editor-preview) {
    word-break: break-word;
    overflow-wrap: break-word;
  }
}
</style>
