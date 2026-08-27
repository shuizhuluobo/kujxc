<template>
  <div class="sale-list-page">
    <div class="page-header">
      <h2>销售出库</h2>
      <div class="header-actions">
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 140px" @change="onStatusChange">
          <el-option label="待审核" value="PENDING" />
          <el-option label="已审核" value="APPROVED" />
        </el-select>
        <el-input
          v-model="list.keyword.value"
          placeholder="搜索单号/客户"
          clearable
          class="search-box"
          @keyup.enter="list.handleSearch"
          @clear="list.handleSearch"
        />
        <el-button type="primary" @click="list.handleSearch">查询</el-button>
        <el-button type="primary" v-if="canCreate" @click="goCreate">新建销售单</el-button>
      </div>
    </div>

    <BaseTable
      :data="list.data.value"
      :total="list.total.value"
      :loading="list.loading.value"
      :page="list.pagination.page"
      :page-size="list.pagination.pageSize"
      empty-text="暂无销售单"
      @update:page="onPage"
      @update:page-size="onSize"
      @size-change="onSize"
      @current-change="onPage"
    >
      <el-table-column prop="code" label="单号" min-width="180" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="saleStatusTagType(row.status)" size="small">{{ SALE_STATUS_LABELS[row.status] || row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="客户" min-width="160">
        <template #default="{ row }">{{ row.customer?.name || row.customerId || '-' }}</template>
      </el-table-column>
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="viewDetail(row)">查看</el-button>
          <el-button
            v-if="row.status === 'PENDING' && canApprove"
            size="small"
            type="success"
            :loading="approvingId === row.id"
            @click="handleApprove(row)"
          >审核</el-button>
        </template>
      </el-table-column>
    </BaseTable>

    <el-dialog v-model="detailVisible" title="销售单详情" width="780px">
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="单号">{{ detail.code }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="saleStatusTagType(detail.status)" size="small">{{ SALE_STATUS_LABELS[detail.status] || detail.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="客户">{{ detail.customer?.name || detail.customerId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(detail.createdAt) }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.remark" label="备注" :span="2">{{ detail.remark }}</el-descriptions-item>
        </el-descriptions>
        <el-table :data="detail.details || []" class="detail-table" empty-text="无明细">
          <el-table-column label="产品" min-width="180">
            <template #default="{ row }">{{ row.product?.name || row.productId }}</template>
          </el-table-column>
          <el-table-column label="数量" width="100" align="right">
            <template #default="{ row }">{{ row.quantity }}</template>
          </el-table-column>
          <el-table-column label="单价" width="120" align="right">
            <template #default="{ row }">{{ row.unitPrice != null ? formatPrice(Number(row.unitPrice)) : '-' }}</template>
          </el-table-column>
          <el-table-column v-if="detail.status === 'APPROVED'" label="批次分配" min-width="180">
            <template #default="{ row }">
              <div v-if="row.allocations?.length">
                <div v-for="a in row.allocations" :key="a.id" class="alloc-line">
                  批次 {{ a.batchId.slice(0, 8) }} x {{ a.quantity }} @ {{ formatPrice(Number(a.unitCost)) }}
                </div>
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <el-skeleton v-else :rows="3" animated />
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button
          v-if="detail && detail.status === 'PENDING' && canApprove"
          type="success"
          :loading="approvingId === detail.id"
          @click="handleApprove(detail)"
        >审核</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { SaleOrder } from '@/types';
import { SALE_STATUS_LABELS, saleStatusTagType } from '@/types';
import { inventoryApi } from '@/api/inventory';
import { usePaginatedList } from '@/composables/useInventory';
import { usePermission } from '@/composables/usePermission';
import BaseTable from '@/components/BaseTable.vue';
import { formatDateTime, formatPrice, getApiErrorMessage } from '@/utils/format';

const router = useRouter();
const { has } = usePermission();

const canCreate = computed(() => has('inventory:create'));
const canApprove = computed(() => has('inventory:approve'));

const statusFilter = ref<string>('');

const list = usePaginatedList<SaleOrder, { page?: number; pageSize?: number; keyword?: string; status?: string }>({
  fetchFn: (params) => inventoryApi.listSales(params),
  defaultPageSize: 20,
});

function onPage(p: number) { list.handlePageChange(p); }
function onSize(s: number) { list.handleSizeChange(s); }

function onStatusChange() {
  (list.extraParams as Record<string, unknown>).status = statusFilter.value || undefined;
  list.pagination.page = 1;
  void list.fetchData();
}

function goCreate() {
  void router.push('/inventory/sales/create');
}

const detailVisible = ref(false);
const detail = ref<SaleOrder | null>(null);

async function viewDetail(row: SaleOrder) {
  detailVisible.value = true;
  detail.value = null;
  try {
    const { data } = await inventoryApi.getSale(row.id);
    detail.value = data;
  } catch (e: unknown) {
    ElMessage.error(getApiErrorMessage(e, '加载详情失败'));
    detailVisible.value = false;
  }
}

const approvingId = ref<string>('');

async function handleApprove(row: SaleOrder) {
  try {
    await ElMessageBox.confirm(`确定审核销售单 ${row.code} 吗？将按 FIFO 扣减库存。`, '审核确认', { type: 'warning' });
  } catch {
    return;
  }
  approvingId.value = row.id;
  try {
    await inventoryApi.approveSale(row.id);
    ElMessage.success('审核成功，已 FIFO 扣减');
    if (detail.value && detail.value.id === row.id) {
      // refresh detail
      try {
        const { data } = await inventoryApi.getSale(row.id);
        detail.value = data;
      } catch {
        // ignore
      }
    }
    void list.fetchData();
  } catch (e: unknown) {
    ElMessage.error(getApiErrorMessage(e, '审核失败'));
  } finally {
    approvingId.value = '';
  }
}

onMounted(() => { void list.fetchData(); });
</script>

<style scoped>
.sale-list-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.header-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.search-box { width: 200px; }
.detail-table { margin-top: 16px; }
.alloc-line { font-size: 12px; color: var(--text-secondary); }
</style>
