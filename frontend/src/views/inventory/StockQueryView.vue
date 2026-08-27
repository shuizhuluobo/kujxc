<template>
  <div class="stock-page">
    <div class="page-header">
      <h2>库存查询 (kccx)</h2>
      <div class="header-actions">
        <el-input v-model="list.keyword.value" placeholder="搜索产品名称/编码" :prefix-icon="Search" clearable class="search-box" @keyup.enter="list.handleSearch" @clear="list.handleSearch" />
        <el-button type="primary" @click="list.handleSearch">查询</el-button>
      </div>
    </div>

    <el-card class="filter-card">
      <div class="filter-row">
        <el-input v-model="productIdFilter" placeholder="按产品ID精确筛选" clearable class="filter-item" style="width: 260px" @clear="onFilter" @keyup.enter="onFilter" />
        <el-button @click="onFilter">筛选</el-button>
        <el-button @click="onReset">重置</el-button>
      </div>
    </el-card>

    <BaseTable
      :data="list.data.value"
      :total="list.total.value"
      :loading="list.loading.value"
      :page="list.pagination.page"
      :page-size="list.pagination.pageSize"
      empty-text="暂无库存数据"
      @update:page="onPage"
      @update:page-size="onSize"
      @size-change="onSize"
      @current-change="onPage"
    >
      <el-table-column label="产品" min-width="240">
        <template #default="{ row }">
          <div class="product-cell">
            <span class="product-name">{{ row.product?.name || row.productId }}</span>
            <span class="product-code">{{ row.product?.code || '-' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="单位" width="80">
        <template #default="{ row }">{{ row.product?.unit || '-' }}</template>
      </el-table-column>
      <el-table-column label="总库存" width="120" align="right">
        <template #default="{ row }">{{ formatQty(row.totalQuantity) }}</template>
      </el-table-column>
      <el-table-column label="总金额" width="140" align="right">
        <template #default="{ row }">{{ formatPrice(row.totalAmount) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="viewBatches(row)">批次</el-button>
        </template>
      </el-table-column>
    </BaseTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import type { StockItem } from '@/types';
import { inventoryApi } from '@/api/inventory';
import { usePaginatedList } from '@/composables/useInventory';
import BaseTable from '@/components/BaseTable.vue';
import { formatPrice } from '@/utils/format';

const router = useRouter();
const productIdFilter = ref('');

const list = usePaginatedList<StockItem, { page?: number; pageSize?: number; keyword?: string; productId?: string }>({
  fetchFn: (params) => inventoryApi.getStock(params),
  defaultPageSize: 20,
});

function formatQty(v: number) { return Number(v).toFixed(2); }

function onPage(p: number) { list.handlePageChange(p); }
function onSize(s: number) { list.handleSizeChange(s); }

function onFilter() {
  const pid = productIdFilter.value.trim() || undefined;
  (list.extraParams as Record<string, unknown>).productId = pid;
  list.pagination.page = 1;
  void list.fetchData();
}
function onReset() {
  productIdFilter.value = '';
  list.keyword.value = '';
  (list.extraParams as Record<string, unknown>).productId = undefined;
  list.pagination.page = 1;
  void list.fetchData();
}
void formatPrice; // keep import used

function viewBatches(row: StockItem) {
  void router.push({ path: '/inventory/batches', query: { productId: row.productId } });
}

onMounted(() => { void list.fetchData(); });
</script>

<style scoped>
.stock-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.header-actions { display: flex; align-items: center; gap: 12px; }
.search-box { width: 260px; }
.filter-card { margin-bottom: 16px; }
.filter-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.filter-item { width: 200px; }
.product-cell { display: flex; flex-direction: column; }
.product-name { font-weight: 500; }
.product-code { font-size: 12px; color: var(--text-secondary); }
</style>
