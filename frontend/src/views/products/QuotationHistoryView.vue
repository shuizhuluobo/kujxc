<template>
  <div class="quotation-history-page">
    <div class="page-header">
      <div class="header-left">
        <h2>报价历史</h2>
        <el-input v-model="filters.customerName" placeholder="搜索客户名称" :prefix-icon="Search" clearable class="search-box" @keyup.enter="handleSearch" @clear="handleSearch" />
        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 130px">
          <el-option v-for="(label, key) in QUOTATION_STATUS_LABELS" :key="key" :label="label" :value="key" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>
      <div class="header-right">
        <el-button :icon="Files" v-if="canManageTemplate" @click="router.push('/products/quotations/templates')">报价模板</el-button>
        <el-button type="primary" :icon="Plus" @click="router.push('/products/quotations/new')">新建报价</el-button>
      </div>
    </div>

    <el-table :data="quotations" v-loading="loading" class="card-premium quotation-table" empty-text="暂无报价记录" @row-click="goDetail">
      <el-table-column label="版本" width="70" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.version > 1 ? 'warning' : 'info'" effect="plain">V{{ row.version }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="客户" min-width="160">
        <template #default="{ row }">
          <span class="code-link" @click="goDetail(row)">{{ row.customerName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="包含产品" min-width="260" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ productsOf(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="含税总额" width="130">
        <template #default="{ row }"><span class="final-price">{{ fmtPrice(row.finalAmount) }}</span></template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small">{{ QUOTATION_STATUS_LABELS[row.status as QuotationStatus] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作人" width="110">
        <template #default="{ row }">{{ row.createdByName || row.createdBy || '-' }}</template>
      </el-table-column>
      <el-table-column label="更新时间" width="140">
        <template #default="{ row }">{{ fmtDate(row.updatedAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons" @click.stop>
            <el-button size="small" type="warning" @click="createVersion(row)">修订</el-button>
            <el-button size="small" @click="openExport(row)">导出</el-button>
            <el-button size="small" type="danger" v-if="canDelete" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container" v-if="total > 0">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        :total="total"
        @size-change="handleSearch"
        @current-change="fetchData"
      />
    </div>

    <QuotationExportDialog v-model="exportVisible" :quotation="exportTarget" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search, Files } from '@element-plus/icons-vue';
import type { Quotation, QuotationStatus } from '@/types';
import { QUOTATION_STATUS_LABELS } from '@/types';
import { quotationsApi } from '@/api';
import { usePermission } from '@/composables/usePermission';
import QuotationExportDialog from '@/views/products/QuotationExportDialog.vue';
import { getApiErrorMessage, quotationStatusTagType as statusType, formatPrice as fmtPrice, formatDateTime as fmtDate } from '@/utils/format';

const router = useRouter();
const { has } = usePermission();
const canDelete = computed(() => has('quotation:delete') || has('quotation:manage'));
const canManageTemplate = computed(() => has('quotationTemplate:manage'));

const loading = ref(false);
const quotations = ref<Quotation[]>([]);
const total = ref(0);
const exportVisible = ref(false);
const exportTarget = ref<Quotation | null>(null);
const pagination = reactive({ page: 1, pageSize: 20 });
const filters = reactive<{ customerName: string; status: QuotationStatus | '' }>({
    customerName: '',
    status: '',
});

async function fetchData() {
    loading.value = true;
    try {
        const { data } = await quotationsApi.getAll({
            page: pagination.page,
            pageSize: pagination.pageSize,
            status: filters.status || undefined,
            customerName: filters.customerName || undefined,
        });
        quotations.value = data.data;
        total.value = data.total;
    } finally {
        loading.value = false;
    }
}

function handleSearch() {
    pagination.page = 1;
    void fetchData();
}

function goDetail(row: Quotation) {
    void router.push(`/products/quotations/${row.id}`);
}

function createVersion(row: Quotation) {
    void router.push({ path: '/products/quotations/new', query: { base: row.id } });
}

async function openExport(row: Quotation) {
    try {
        // 列表行可能缺少 items/template 详情，取完整报价单再打开导出对话框
        const { data } = await quotationsApi.getOne(row.id);
        exportTarget.value = data;
    } catch {
        exportTarget.value = row;
    }
    exportVisible.value = true;
}

async function handleDelete(row: Quotation) {
    await ElMessageBox.confirm(`确定删除报价单「${row.code}」吗？`, '提示', { type: 'warning' });
    try {
        await quotationsApi.remove(row.id);
        ElMessage.success('删除成功');
        void fetchData();
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '删除失败'));
    }
}




/** 聚合报价单包含的产品名称（含数量），用于列表「包含产品」列展示 */
function productsOf(row: Quotation): string {
    const items = (row.items as Array<{ productSnapshot?: Record<string, unknown>; quantity?: number }>) || [];
    const parts: string[] = [];
    for (const it of items) {
        const snap = it.productSnapshot;
        const name = (snap?.name as string) || '未知产品';
        const qty = it.quantity != null ? `×${it.quantity}` : '';
        parts.push(`${name}${qty}`);
    }
    return parts.join('、') || '-';
}

onMounted(fetchData);
</script>

<style scoped>
/* 行内点击查看详情 */
.quotation-table :deep(.el-table__row) {
  cursor: pointer;
}

.action-buttons {
  display: flex;
  gap: 2px;
  flex-wrap: nowrap;
}
/* 抵消 el-button 相邻默认 margin-left:12px（与 gap 叠加导致列宽不足、按钮被裁） */
.action-buttons :deep(.el-button + .el-button) {
  margin-left: 0;
}

.quotation-history-page { max-width: 1300px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.header-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.header-left h2 { margin: 0; }
.header-right { display: flex; align-items: center; gap: 12px; }
.search-box { width: 220px; }
.code-link { cursor: pointer; color: var(--primary-color); font-weight: 500; }
.final-price { color: var(--primary-color); font-weight: 600; }
.negative { color: var(--el-color-danger); }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; background: var(--card-bg); padding: 12px; border-radius: 8px; }
</style>
