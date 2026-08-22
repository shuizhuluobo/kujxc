<template>
  <div class="product-detail-page" v-loading="loading">
    <template v-if="product">
      <div class="page-header">
        <div class="header-left">
          <el-button :icon="ArrowLeft" text @click="goBack">返回</el-button>
          <h2>{{ product.name }}</h2>
          <el-tag :type="statusType(product.status)" size="small">{{ PRODUCT_STATUS_LABELS[product.status] }}</el-tag>
          <el-tag v-if="product.isStale" type="warning" size="small" effect="dark">超期未更新</el-tag>
        </div>
        <div class="header-actions">
          <el-icon class="fav-icon" :class="{ active: product.isFavorite }" @click="toggleFavorite">
            <StarFilled v-if="product.isFavorite" />
            <Star v-else />
          </el-icon>
          <el-button type="primary" @click="addToQuotation">加入报价</el-button>
          <el-button v-if="canEdit" @click="router.push(`/products/${product.id}/edit`)">编辑</el-button>
          <el-button type="danger" v-if="canDelete" @click="handleDelete">删除</el-button>
        </div>
      </div>

      <!-- 超期提醒横幅：提供一键续期或立即更新 -->
      <el-alert
        v-if="product.isStale"
        class="stale-alert"
        type="warning"
        :closable="false"
        show-icon
      >
        <template #title>
          <span class="stale-alert-title">价格/参数可能已过期</span>
        </template>
        <div class="stale-alert-body">
          <span class="stale-alert-desc">
            该产品已超过阈值未更新价格或参数（最后更新：{{ fmtDate(product.lastPriceUpdateAt) }}）。
          </span>
          <div class="stale-alert-actions">
            <el-button
              size="small"
              type="warning"
              plain
              :loading="ackLoading"
              @click="acknowledgeStale"
            >
              <el-icon><Check /></el-icon> 确认无需更新
            </el-button>
            <el-button
              size="small"
              type="primary"
              :disabled="!canEdit"
              @click="router.push(`/products/${product.id}/edit`)"
            >
              <el-icon><Edit /></el-icon> 立即更新
            </el-button>
          </div>
        </div>
      </el-alert>

      <div class="detail-grid">
        <!-- 左：图片 + 证书 -->
        <div class="left-col">
          <el-card class="card-premium">
            <template #header><span class="card-title-text">产品图片</span></template>
            <el-carousel v-if="product.images.length" height="300px" indicator-position="outside">
              <el-carousel-item v-for="img in product.images" :key="img.id">
                <el-image :src="resolveAssetUrl(img.url)" fit="contain" class="detail-img" :preview-src-list="imagePreviewList" preview-teleported />
                <div class="img-desc" v-if="img.description">{{ img.description }}</div>
              </el-carousel-item>
            </el-carousel>
            <el-empty v-else description="暂无图片" :image-size="80" />
          </el-card>

          <el-card class="card-premium cert-card">
            <template #header><span class="card-title-text">产品证书</span></template>
            <div class="cert-list" v-if="product.certificates.length">
              <div v-for="cert in product.certificates" :key="cert.id" class="cert-item" @click="previewCert(cert)">
                <el-icon><Document /></el-icon>
                <span class="cert-name">{{ cert.name }}</span>
              </div>
            </div>
            <el-empty v-else description="暂无证书" :image-size="80" />
          </el-card>
        </div>

        <!-- 右：参数 -->
        <div class="right-col">
          <el-card class="card-premium">
            <template #header><span class="card-title-text">产品信息</span></template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="产品编号">{{ product.code }}</el-descriptions-item>
              <el-descriptions-item label="状态">{{ PRODUCT_STATUS_LABELS[product.status] }}</el-descriptions-item>
              <el-descriptions-item label="品牌">{{ product.brand?.name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="型号">{{ product.model || '-' }}</el-descriptions-item>
              <el-descriptions-item label="类型">{{ product.category?.name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="单位">{{ product.unit }}</el-descriptions-item>
              <el-descriptions-item label="最小起订量">{{ product.minOrderQty ?? '-' }}</el-descriptions-item>
              <el-descriptions-item label="商城价格">{{ fmtPrice(product.marketPrice) }}</el-descriptions-item>
              <el-descriptions-item label="成本价" v-if="canViewCost">{{ fmtPrice(product.costPrice) }}</el-descriptions-item>
              <el-descriptions-item label="保修期">{{ product.warranty || '-' }}</el-descriptions-item>
              <el-descriptions-item label="供应商">{{ product.supplier || '-' }}</el-descriptions-item>
              <el-descriptions-item label="最后价格更新">{{ fmtDate(product.lastPriceUpdateAt) }}</el-descriptions-item>
              <el-descriptions-item label="浏览量">{{ product.viewCount }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ fmtDate(product.createdAt) }}</el-descriptions-item>
              <el-descriptions-item label="标签">
                <el-tag v-for="t in product.tags" :key="t.id" size="small" class="tag-chip">{{ t.name }}</el-tag>
                <span v-if="!product.tags.length">-</span>
              </el-descriptions-item>
            </el-descriptions>
            <div class="desc-section" v-if="product.description">
              <div class="desc-title">详细参数</div>
              <div class="desc-content" v-html="renderedDescription" />
            </div>
            <div class="desc-section" v-if="product.marketUrl">
              <div class="desc-title">商城链接</div>
              <el-link type="primary" :href="product.marketUrl" target="_blank">{{ product.marketUrl }}</el-link>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 变更历史 -->
      <el-card class="card-premium change-log-card">
        <template #header><span class="card-title-text">变更历史</span></template>
        <el-timeline v-if="changeLogs.length">
          <el-timeline-item v-for="log in changeLogs" :key="log.id" :timestamp="fmtDate(log.createdAt)">
            <div class="log-entry">
              <span class="log-field">{{ changeFieldLabel(log.field) }}</span>
              <span class="log-old">{{ log.oldValue ?? '空' }}</span>
              <el-icon><Right /></el-icon>
              <span class="log-new">{{ log.newValue ?? '空' }}</span>
              <span class="log-by" v-if="log.changedByName">（{{ log.changedByName }}）</span>
            </div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无变更记录" :image-size="80" />
      </el-card>
    </template>

    <el-dialog v-model="certDialogVisible" :title="currentCert?.name || '证书预览'" width="80%" top="5vh">
      <el-image v-if="currentCert && !isPdf(currentCert.url)" :src="resolveAssetUrl(currentCert.url)" fit="contain" style="width: 100%" />
      <iframe v-else-if="currentCert" :src="resolveAssetUrl(currentCert.url)" class="cert-iframe" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, Star, StarFilled, Document, Right, Check, Edit } from '@element-plus/icons-vue';
import type { Product, ProductChangeLog, ProductCertificate } from '@/types';
import { PRODUCT_STATUS_LABELS, PRODUCT_CHANGE_FIELD_LABELS } from '@/types';
import { productsApi } from '@/api';
import { usePermission } from '@/composables/usePermission';
import { resolveAssetUrl } from '@/utils/url';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { getApiErrorMessage, productStatusTagType as statusType, formatPrice as fmtPrice, formatDateTime as fmtDate } from '@/utils/format';

const route = useRoute();
const router = useRouter();
const { has, hasAny } = usePermission();

// 返回：优先回退历史；直链进入（无上一页）时兜底到产品列表，避免退出站点
function goBack() {
    const state = window.history.state as { back?: string | null } | null;
    if (state?.back != null) {
        void router.back();
    } else {
        void router.push('/products');
    }
}

const canEdit = computed(() => hasAny(['product:edit', 'product:manage']));
const canDelete = computed(() => hasAny(['product:delete', 'product:manage']));
const canViewCost = computed(() => has('product:viewCost'));


const loading = ref(false);
const ackLoading = ref(false);
const product = ref<Product | null>(null);
const changeLogs = ref<ProductChangeLog[]>([]);
const certDialogVisible = ref(false);
const currentCert = ref<ProductCertificate | null>(null);

const imagePreviewList = computed(() => (product.value?.images || []).map((img) => resolveAssetUrl(img.url)));
const renderedDescription = computed(() => {
    const desc = product.value?.description;
    if (!desc) return '';
    // marked 不消毒，description 可能来自批量导入，必须过 DOMPurify 防 XSS
    return DOMPurify.sanitize(marked.parse(desc) as string);
});

async function fetchData() {
    loading.value = true;
    try {
        const id = route.params.id as string;
        const [{ data }, logsRes] = await Promise.all([
            productsApi.getOne(id),
            productsApi.getChangeLogs(id),
        ]);
        product.value = data;
        changeLogs.value = logsRes.data;
        // 记录浏览量
        void productsApi.recordView(id);
    } finally {
        loading.value = false;
    }
}

async function toggleFavorite() {
    if (!product.value) return;
    try {
        const { data } = await productsApi.toggleFavorite(product.value.id);
        product.value.isFavorite = data.isFavorite;
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '操作失败'));
    }
}

/** 确认无需更新：一键续期，消除超期提醒 */
async function acknowledgeStale() {
    if (!product.value) return;
    ackLoading.value = true;
    try {
        const { data } = await productsApi.acknowledgeStale(product.value.id);
        product.value = data;
        ElMessage.success('已确认无需更新，提醒已消除');
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '操作失败'));
    } finally {
        ackLoading.value = false;
    }
}

function addToQuotation() {
    if (!product.value) return;
    void router.push({ path: '/products/quotations/new', query: { ids: product.value.id } });
}

async function handleDelete() {
    if (!product.value) return;
    await ElMessageBox.confirm(`确定删除产品「${product.value.name}」吗？`, '提示', { type: 'warning' });
    try {
        await productsApi.remove(product.value.id);
        ElMessage.success('删除成功');
        void router.push('/products');
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '删除失败'));
    }
}

function previewCert(cert: ProductCertificate) {
    currentCert.value = cert;
    certDialogVisible.value = true;
}

function isPdf(url: string): boolean {
    return url.toLowerCase().endsWith('.pdf');
}


function changeFieldLabel(field: string): string {
    return PRODUCT_CHANGE_FIELD_LABELS[field] || field;
}



onMounted(fetchData);
</script>

<style scoped>
.product-detail-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.header-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.header-left h2 { margin: 0; }

.stale-alert {
  margin-bottom: 16px;
  border-radius: 10px;
  align-items: flex-start;
}
.stale-alert-title { font-weight: 600; }
.stale-alert-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.stale-alert-desc { font-size: 13px; color: var(--el-color-warning-dark, #8a5a00); }
.stale-alert-actions { display: flex; gap: 8px; flex-shrink: 0; }
.header-actions { display: flex; align-items: center; gap: 8px; }
.fav-icon { cursor: pointer; color: var(--text-tertiary); font-size: 20px; }
.fav-icon.active { color: #f5b50a; }
.detail-grid { display: grid; grid-template-columns: 380px 1fr; gap: 16px; }
@media (max-width: 900px) {
  .detail-grid { grid-template-columns: 1fr; }
}
.card-title-text { font-weight: 600; }
.detail-img { width: 100%; }
.img-desc { text-align: center; color: var(--text-secondary); font-size: 13px; margin-top: 8px; }
.cert-card { margin-top: 16px; }
.cert-list { display: flex; flex-direction: column; gap: 8px; }
.cert-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 8px; background: var(--bg-color); cursor: pointer; transition: background-color 0.2s; }
.cert-item:hover { background: var(--el-color-primary-light-9); color: var(--primary-color); }
.cert-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.desc-section { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color-lighter); }
.desc-title { font-weight: 600; margin-bottom: 8px; }
.desc-content { color: var(--text-secondary); line-height: 1.7; }
.change-log-card { margin-top: 16px; }
.log-entry { display: flex; align-items: center; gap: 8px; font-size: 13px; flex-wrap: wrap; }
.log-field { font-weight: 600; }
.log-old { color: var(--text-tertiary); text-decoration: line-through; }
.log-new { color: var(--success-color); }
.log-by { color: var(--text-tertiary); }
.tag-chip { margin-right: 4px; }
.cert-iframe { width: 100%; height: 70vh; border: none; }
</style>
