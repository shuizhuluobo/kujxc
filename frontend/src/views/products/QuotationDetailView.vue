<template>
  <div class="quotation-detail-page" v-loading="loading">
    <template v-if="quotation">
      <div class="page-header">
        <div class="header-left">
          <el-button :icon="ArrowLeft" text @click="goBack">返回</el-button>
          <h2>{{ quotation.code }}</h2>
          <el-tag type="warning" size="small" v-if="quotation.version > 1">V{{ quotation.version }}</el-tag>
          <el-tag :type="statusType(quotation.status)" size="small">{{ QUOTATION_STATUS_LABELS[quotation.status] }}</el-tag>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="createVersion">修订</el-button>
          <el-dropdown v-if="quotation.status === 'DRAFT' || quotation.status === 'SENT'">
            <el-button>变更状态<el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="quotation.status === 'DRAFT'" @click="changeStatus('SENT')">标记为已发送</el-dropdown-item>
                <el-dropdown-item @click="changeStatus('CLOSED')">标记为已成交</el-dropdown-item>
                <el-dropdown-item @click="changeStatus('CANCELLED')">标记为已取消</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="primary" @click="exportVisible = true">导出</el-button>
        </div>
      </div>

      <el-card class="card-premium">
        <template #header><span class="card-title-text">客户信息</span></template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="客户名称">{{ quotation.customerName }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ quotation.customerContact || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ quotation.createdBy || '-' }}</el-descriptions-item>
          <el-descriptions-item label="客户地址" :span="2">{{ quotation.customerAddress || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ fmtDate(quotation.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="报价模板">{{ quotation.template?.name || '默认模板' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="card-premium">
        <template #header><span class="card-title-text">报价明细</span></template>
        <el-table :data="quotation.items" class="card-premium">
          <el-table-column label="#" type="index" width="45" />
          <el-table-column label="产品" min-width="220">
            <template #default="{ row }">
              <div class="item-product">
                <el-image v-if="row.selectedImages?.length" :src="resolveAssetUrl(row.selectedImages[0])" fit="cover" class="item-thumb" :preview-src-list="row.selectedImages.map((s: string) => resolveAssetUrl(s))" preview-teleported />
                <div class="item-product-info">
                  <div class="item-name">{{ snapshotName(row) }}</div>
                  <div class="item-code">{{ snapshotField(row, 'code') }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="产品参数" min-width="240" show-overflow-tooltip>
            <template #default="{ row }">{{ itemParams(row) }}</template>
          </el-table-column>
          <el-table-column label="品牌" min-width="100">
            <template #default="{ row }">{{ snapshotField(row, 'brand') || '-' }}</template>
          </el-table-column>
          <el-table-column label="数量" width="80" align="center">
            <template #default="{ row }">{{ row.quantity }}</template>
          </el-table-column>
          <el-table-column label="单价" width="110">
            <template #default="{ row }">{{ fmtPrice(row.unitPrice) }}</template>
          </el-table-column>
          <el-table-column label="折扣" width="80" align="center">
            <template #default="{ row }">{{ row.discount != null && row.discount > 0 ? `${row.discount}%` : '-' }}</template>
          </el-table-column>
          <el-table-column label="小计" width="120">
            <template #default="{ row }">{{ fmtPrice(row.subtotal) }}</template>
          </el-table-column>
          <el-table-column label="成本" width="110" v-if="canViewCost">
            <template #default="{ row }">{{ fmtPrice(row.costPrice) }}</template>
          </el-table-column>
          <el-table-column label="毛利" width="110" v-if="canViewCost">
            <template #default="{ row }"><span :class="{ negative: (row.profit ?? 0) < 0 }">{{ fmtPrice(row.profit) }}</span></template>
          </el-table-column>
        </el-table>

        <div class="summary">
          <div class="summary-line"><span>含税总额：</span><strong class="final">{{ fmtPrice(quotation.finalAmount) }}</strong></div>
          <div class="summary-line" v-if="canViewCost"><span>预估毛利：</span><strong>{{ fmtPrice(quotation.estimatedProfit) }}</strong></div>
        </div>
      </el-card>
    </template>


    <QuotationExportDialog v-model="exportVisible" :quotation="quotation" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import type { Quotation, QuotationStatus, QuotationItem } from '@/types';
import { QUOTATION_STATUS_LABELS } from '@/types';
import { quotationsApi } from '@/api';
import { usePermission } from '@/composables/usePermission';
import { resolveAssetUrl } from '@/utils/url';
import QuotationExportDialog from '@/views/products/QuotationExportDialog.vue';
import { getApiErrorMessage, quotationStatusTagType as statusType, formatPrice as fmtPrice, formatDateTime as fmtDate } from '@/utils/format';

const route = useRoute();
const router = useRouter();
const { has } = usePermission();
const canViewCost = computed(() => has('product:viewCost'));

const loading = ref(false);
const quotation = ref<Quotation | null>(null);
const exportVisible = ref(false);

async function fetchData() {
    loading.value = true;
    try {
        const id = route.params.id as string;
        const { data } = await quotationsApi.getOne(id);
        quotation.value = data;
    } finally {
        loading.value = false;
    }
}

function goBack() {
    if (window.history.length > 1) router.back();
    else void router.push('/products/quotations');
}

function createVersion() {
    if (!quotation.value) return;
    void router.push({ path: '/products/quotations/new', query: { base: quotation.value.id } });
}

async function changeStatus(status: QuotationStatus) {
    if (!quotation.value) return;
    try {
        const { data } = await quotationsApi.updateStatus(quotation.value.id, status);
        quotation.value = data;
        ElMessage.success('状态已更新');
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '操作失败'));
    }
}

function snapshotName(row: QuotationItem): string {
    return (row.productSnapshot.name as string) || '未知产品';
}

function snapshotField(row: QuotationItem, key: string): string {
    return (row.productSnapshot[key] as string) || '';
}

/** 聚合单个报价项的参数，用于详情页「产品参数」列展示 */
function itemParams(row: QuotationItem): string {
    const snap = row.productSnapshot;
    if (!snap) return '-';
    const params =
        (snap.param as Record<string, unknown>) ||
        (snap.spec as Record<string, unknown>) ||
        null;
    if (params && typeof params === 'object') {
        const kv = Object.entries(params)
            .map(([k, v]) => `${k}: ${v}`)
            .join('；')
            .trim();
        return kv || (typeof snap.description === 'string' && snap.description ? snap.description : '-');
    }
    if (typeof snap.description === 'string' && snap.description) {
        return snap.description;
    }
    return '-';
}




onMounted(fetchData);
</script>

<style scoped>
.quotation-detail-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.header-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.header-left h2 { margin: 0; }
.header-actions { display: flex; align-items: center; gap: 8px; }
.card-premium { margin-bottom: 16px; }
.card-title-text { font-weight: 600; }
.item-product { display: flex; align-items: center; gap: 10px; }
.item-thumb { width: 44px; height: 44px; border-radius: 6px; flex-shrink: 0; }
.item-name { font-weight: 500; }
.item-code { font-size: 12px; color: var(--text-secondary); }
.negative { color: var(--el-color-danger); }
.summary { margin-top: 16px; display: flex; justify-content: flex-end; gap: 32px; flex-wrap: wrap; }
.summary-line strong.final { color: var(--primary-color); font-size: 18px; }
.version-entry { display: flex; align-items: center; gap: 12px; }
.version-code { font-weight: 600; color: var(--primary-color); }
.version-total { color: var(--text-secondary); font-size: 13px; }
</style>
