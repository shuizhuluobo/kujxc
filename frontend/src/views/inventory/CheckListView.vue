<template>
  <div class="check-page">
    <div class="page-header">
      <h2>盘点管理</h2>
      <div class="header-actions">
        <el-input v-model="list.keyword.value" placeholder="搜索单号" clearable class="search-box" @keyup.enter="list.handleSearch" @clear="list.handleSearch" />
        <el-button @click="list.handleSearch">查询</el-button>
        <el-button v-if="canCreate" type="primary" @click="openCreate">新建盘点</el-button>
      </div>
    </div>

    <BaseTable
      :data="list.data.value"
      :total="list.total.value"
      :loading="list.loading.value"
      :page="list.pagination.page"
      :page-size="list.pagination.pageSize"
      empty-text="暂无盘点单"
      @update:page="onPage"
      @update:page-size="onSize"
      @size-change="onSize"
      @current-change="onPage"
    >
      <el-table-column prop="code" label="单号" min-width="160" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'COMPLETED' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="明细数" width="100" align="right">
        <template #default="{ row }">{{ row.details?.length ?? '-' }}</template>
      </el-table-column>
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="viewDetail(row)">查看</el-button>
        </template>
      </el-table-column>
    </BaseTable>

    <el-dialog v-model="detailVisible" title="盘点详情（差异）" width="780px">
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="单号">{{ detail.code }}</el-descriptions-item>
          <el-descriptions-item label="状态"><el-tag size="small">{{ detail.status }}</el-tag></el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(detail.createdAt) }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.remark" label="备注" :span="2">{{ detail.remark }}</el-descriptions-item>
        </el-descriptions>
        <el-table :data="detail.details || []" class="detail-table" empty-text="无明细">
          <el-table-column label="产品" min-width="180">
            <template #default="{ row }">{{ row.product?.name || row.productId }}</template>
          </el-table-column>
          <el-table-column label="系统数量" width="110" align="right">
            <template #default="{ row }">{{ row.systemQuantity }}</template>
          </el-table-column>
          <el-table-column label="实际数量" width="110" align="right">
            <template #default="{ row }">{{ row.actualQuantity }}</template>
          </el-table-column>
          <el-table-column label="差异" width="110" align="right">
            <template #default="{ row }">
              <span :style="{ color: Number(row.diffQuantity) === 0 ? 'inherit' : Number(row.diffQuantity) > 0 ? '#67C23A' : '#F56C6C' }">{{ row.diffQuantity }}</span>
            </template>
          </el-table-column>
          <el-table-column label="备注" min-width="140">
            <template #default="{ row }">{{ row.remark || '-' }}</template>
          </el-table-column>
        </el-table>
      </template>
      <el-skeleton v-else :rows="3" animated />
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="createVisible" title="新建盘点（批量）" width="720px" @close="resetCreate">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="备注">
          <el-input v-model="createForm.remark" type="textarea" :rows="2" maxlength="500" placeholder="可选" />
        </el-form-item>
      </el-form>
      <div class="batch-header">
        <span class="card-title-text">明细（产品 + 实际数量）</span>
        <el-button type="primary" size="small" @click="addRow">添加行</el-button>
      </div>
      <div v-for="(row, idx) in createForm.items" :key="idx" class="detail-row">
        <el-select v-model="row.productId" filterable :filter-method="(q: string) => filterProducts(q, idx)" placeholder="选择产品" style="flex: 2; min-width: 180px">
          <el-option v-for="p in row.filtered" :key="p.id" :label="`${p.name} (${p.code})`" :value="p.id" />
        </el-select>
        <el-input-number v-model="row.actualQuantity" :min="0" :precision="2" :step="1" placeholder="实际数量" style="flex: 1" />
        <el-button type="danger" size="small" text @click="removeRow(idx)">删除</el-button>
      </div>
      <el-empty v-if="!createForm.items.length" description="请添加明细" :image-size="60" />
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleCreate">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { Product, StockCheckOrder } from '@/types';
import { inventoryApi } from '@/api/inventory';
import { productsApi } from '@/api/products';
import { usePaginatedList } from '@/composables/useInventory';
import { usePermission } from '@/composables/usePermission';
import BaseTable from '@/components/BaseTable.vue';
import { formatDateTime, getApiErrorMessage } from '@/utils/format';
import { matchPinyin } from '@/utils/pinyinFilter';

const { has } = usePermission();
const canCreate = computed(() => has('inventory:check') || has('inventory:*'));

const list = usePaginatedList<StockCheckOrder, { page?: number; pageSize?: number; keyword?: string }>({
  fetchFn: (params) => inventoryApi.listChecks(params as never),
  defaultPageSize: 20,
});

function onPage(p: number) { list.handlePageChange(p); }
function onSize(s: number) { list.handleSizeChange(s); }

const detailVisible = ref(false);
const detail = ref<StockCheckOrder | null>(null);

async function viewDetail(row: StockCheckOrder) {
  detailVisible.value = true;
  detail.value = null;
  try {
    const { data } = await inventoryApi.getCheck(row.id);
    detail.value = data;
  } catch (e: unknown) {
    ElMessage.error(getApiErrorMessage(e, '加载详情失败'));
    detailVisible.value = false;
  }
}

// create
const createVisible = ref(false);
const submitting = ref(false);
interface CheckRow { productId: string; actualQuantity: number | undefined; filtered: Product[] }
const createForm = reactive<{ remark: string; items: CheckRow[] }>({
  remark: '',
  items: [{ productId: '', actualQuantity: undefined, filtered: [] }],
});

const allProducts = ref<Product[]>([]);

function filterProducts(query: string, idx: number) {
  const row = createForm.items[idx];
  if (!row) return;
  if (!query) { row.filtered = allProducts.value.slice(0, 50); return; }
  row.filtered = allProducts.value.filter((p) => matchPinyin(p.name, query) || matchPinyin(p.code, query)).slice(0, 50);
}

function addRow() {
  createForm.items.push({ productId: '', actualQuantity: undefined, filtered: allProducts.value.slice(0, 50) });
}
function removeRow(idx: number) {
  createForm.items.splice(idx, 1);
  if (!createForm.items.length) addRow();
}
function resetCreate() {
  createForm.remark = '';
  createForm.items = [{ productId: '', actualQuantity: undefined, filtered: allProducts.value.slice(0, 50) }];
}

function openCreate() {
  // refresh filtered
  for (const r of createForm.items) r.filtered = allProducts.value.slice(0, 50);
  createVisible.value = true;
}

async function handleCreate() {
  const cleaned = createForm.items.filter((r) => r.productId);
  if (!cleaned.length) { ElMessage.warning('请至少添加一行有效明细'); return; }
  for (const r of cleaned) {
    if (r.actualQuantity == null || Number(r.actualQuantity) < 0) { ElMessage.warning('实际数量不合法'); return; }
  }
  submitting.value = true;
  try {
    await inventoryApi.createCheck({
      remark: createForm.remark || undefined,
      items: cleaned.map((r) => ({ productId: r.productId, actualQuantity: Number(r.actualQuantity), remark: undefined })),
    });
    ElMessage.success('创建成功');
    createVisible.value = false;
    void list.fetchData();
  } catch (e: unknown) {
    ElMessage.error(getApiErrorMessage(e, '创建失败'));
  } finally {
    submitting.value = false;
  }
}

async function loadProducts() {
  try {
    const pRes = await productsApi.getAll({ pageSize: 100, page: 1 });
    allProducts.value = pRes.data.data ?? [];
    for (const r of createForm.items) r.filtered = allProducts.value.slice(0, 50);
  } catch {
    // ignore
  }
}

onMounted(() => {
  void list.fetchData();
  void loadProducts();
});
</script>

<style scoped>
.check-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.header-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.search-box { width: 200px; }
.detail-table { margin-top: 16px; }
.batch-header { display: flex; align-items: center; justify-content: space-between; margin: 12px 0 8px; }
.card-title-text { font-weight: 600; }
.detail-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
</style>
