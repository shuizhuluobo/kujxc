<template>
  <div class="batch-page">
    <div class="page-header">
      <h2>库存批次</h2>
      <div class="header-actions">
        <el-input v-model="list.keyword.value" placeholder="搜索批次ID/产品/库位" :prefix-icon="Search" clearable class="search-box" @keyup.enter="list.handleSearch" @clear="list.handleSearch" />
        <el-button type="primary" @click="list.handleSearch">查询</el-button>
      </div>
    </div>

    <el-card class="filter-card">
      <div class="filter-row">
        <el-input v-model="productIdFilter" placeholder="productId" clearable style="width: 200px" @clear="onFilter" />
        <el-input v-model="warehouseIdFilter" placeholder="warehouseId" clearable style="width: 200px" @clear="onFilter" />
        <el-input v-model="supplierIdFilter" placeholder="supplierId" clearable style="width: 200px" @clear="onFilter" />
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
      empty-text="暂无批次数据"
      @update:page="onPage"
      @update:page-size="onSize"
      @size-change="onSize"
      @current-change="onPage"
    >
      <el-table-column prop="id" label="批次ID (rkid)" min-width="160" />
      <el-table-column label="产品" min-width="180">
        <template #default="{ row }">{{ row.product?.name || row.productId }}</template>
      </el-table-column>
      <el-table-column label="仓库" width="120">
        <template #default="{ row }">{{ row.warehouse?.name || row.storeName || '-' }}</template>
      </el-table-column>
      <el-table-column label="供应商" width="120">
        <template #default="{ row }">{{ row.supplier?.name || '-' }}</template>
      </el-table-column>
      <el-table-column label="入库数量" width="100" align="right">
        <template #default="{ row }">{{ row.quantityIn }}</template>
      </el-table-column>
      <el-table-column label="剩余数量" width="100" align="right">
        <template #default="{ row }">{{ row.quantityRem }}</template>
      </el-table-column>
      <el-table-column label="单价" width="100" align="right">
        <template #default="{ row }">{{ formatPrice(Number(row.unitPrice)) }}</template>
      </el-table-column>
      <el-table-column label="入库时间" width="160">
        <template #default="{ row }">{{ formatDate(row.receivedAt) }}</template>
      </el-table-column>
    </BaseTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Search } from '@element-plus/icons-vue';
import type { InventoryBatch } from '@/types';
import { inventoryApi } from '@/api/inventory';
import { usePaginatedList } from '@/composables/useInventory';
import BaseTable from '@/components/BaseTable.vue';
import { formatPrice, formatDate } from '@/utils/format';

const route = useRoute();

const productIdFilter = ref((route.query.productId as string) || '');
const warehouseIdFilter = ref('');
const supplierIdFilter = ref('');

const list = usePaginatedList<InventoryBatch, { page?: number; pageSize?: number; keyword?: string; productId?: string; warehouseId?: string; supplierId?: string }>({
  fetchFn: (params) => inventoryApi.getBatches(params),
  defaultPageSize: 20,
  defaultParams: { productId: productIdFilter.value || undefined },
});

function onPage(p: number) { list.handlePageChange(p); }
function onSize(s: number) { list.handleSizeChange(s); }

function onFilter() {
  (list.extraParams as Record<string, unknown>).productId = productIdFilter.value.trim() || undefined;
  (list.extraParams as Record<string, unknown>).warehouseId = warehouseIdFilter.value.trim() || undefined;
  (list.extraParams as Record<string, unknown>).supplierId = supplierIdFilter.value.trim() || undefined;
  list.pagination.page = 1;
  void list.fetchData();
}
function onReset() {
  productIdFilter.value = '';
  warehouseIdFilter.value = '';
  supplierIdFilter.value = '';
  list.keyword.value = '';
  (list.extraParams as Record<string, unknown>).productId = undefined;
  (list.extraParams as Record<string, unknown>).warehouseId = undefined;
  (list.extraParams as Record<string, unknown>).supplierId = undefined;
  list.pagination.page = 1;
  void list.fetchData();
}

watch(() => route.query.productId, (v) => {
  productIdFilter.value = (v as string) || '';
  (list.extraParams as Record<string, unknown>).productId = productIdFilter.value || undefined;
  list.pagination.page = 1;
  void list.fetchData();
});

onMounted(() => { void list.fetchData(); });
</script>

<style scoped>
.batch-page { max-width: 1300px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.header-actions { display: flex; align-items: center; gap: 12px; }
.search-box { width: 260px; }
.filter-card { margin-bottom: 16px; }
.filter-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
</style>
