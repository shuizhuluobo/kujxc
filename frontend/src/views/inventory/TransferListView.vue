<template>
  <div class="transfer-page">
    <div class="page-header">
      <h2>调拨管理</h2>
      <div class="header-actions">
        <el-input v-model="list.keyword.value" placeholder="搜索单号" clearable class="search-box" @keyup.enter="list.handleSearch" @clear="list.handleSearch" />
        <el-button @click="list.handleSearch">查询</el-button>
        <el-button v-if="canCreate" type="primary" @click="dialogVisible = true">新建调拨</el-button>
      </div>
    </div>

    <BaseTable
      :data="list.data.value"
      :total="list.total.value"
      :loading="list.loading.value"
      :page="list.pagination.page"
      :page-size="list.pagination.pageSize"
      empty-text="暂无调拨单"
      @update:page="onPage"
      @update:page-size="onSize"
      @size-change="onSize"
      @current-change="onPage"
    >
      <el-table-column prop="code" label="单号" min-width="160" />
      <el-table-column label="产品" min-width="180">
        <template #default="{ row }">{{ row.product?.name || row.productId }}</template>
      </el-table-column>
      <el-table-column label="数量" width="100" align="right">
        <template #default="{ row }">{{ row.quantity }}</template>
      </el-table-column>
      <el-table-column label="来源仓库" min-width="140">
        <template #default="{ row }">{{ row.fromWarehouse?.name || '-' }}</template>
      </el-table-column>
      <el-table-column label="目标仓库" min-width="140">
        <template #default="{ row }">{{ row.toWarehouse?.name || '-' }}</template>
      </el-table-column>
      <el-table-column label="备注" min-width="160">
        <template #default="{ row }">{{ row.remark || '-' }}</template>
      </el-table-column>
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
      </el-table-column>
    </BaseTable>

    <el-dialog v-model="dialogVisible" title="新建调拨" width="560px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="产品" prop="productId">
          <el-select
            v-model="form.productId"
            filterable
            :filter-method="filterProducts"
            placeholder="选择产品（拼音搜索）"
            style="width: 100%"
          >
            <el-option v-for="p in filteredProducts" :key="p.id" :label="`${p.name} (${p.code})`" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="0.01" :precision="2" :step="1" style="width: 100%" placeholder="调拨数量" />
        </el-form-item>
        <el-form-item label="来源仓库">
          <el-select v-model="form.fromWarehouseId" clearable placeholder="可选" style="width: 100%">
            <el-option v-for="w in warehouses" :key="w.id" :label="w.name" :value="w.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标仓库">
          <el-select v-model="form.toWarehouseId" clearable placeholder="可选" style="width: 100%">
            <el-option v-for="w in warehouses" :key="w.id" :label="w.name" :value="w.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleCreate">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import type { Product, Warehouse, TransferOrder } from '@/types';
import { inventoryApi } from '@/api/inventory';
import { productsApi } from '@/api/products';
import { warehousesApi } from '@/api/warehouses';
import { usePaginatedList } from '@/composables/useInventory';
import { usePermission } from '@/composables/usePermission';
import BaseTable from '@/components/BaseTable.vue';
import { formatDateTime, getApiErrorMessage } from '@/utils/format';
import { matchPinyin } from '@/utils/pinyinFilter';

const { has } = usePermission();
const canCreate = computed(() => has('inventory:transfer') || has('inventory:*'));

const list = usePaginatedList<TransferOrder, { page?: number; pageSize?: number; keyword?: string; productId?: string }>({
  fetchFn: (params) => inventoryApi.listTransfers(params as never),
  defaultPageSize: 20,
});

function onPage(p: number) { list.handlePageChange(p); }
function onSize(s: number) { list.handleSizeChange(s); }

const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const submitting = ref(false);
const form = reactive<{ productId: string; quantity: number | undefined; fromWarehouseId: string; toWarehouseId: string; remark: string }>({
  productId: '',
  quantity: undefined,
  fromWarehouseId: '',
  toWarehouseId: '',
  remark: '',
});
const rules: FormRules = {
  productId: [{ required: true, message: '请选择产品', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
};

const allProducts = ref<Product[]>([]);
const filteredProducts = ref<Product[]>([]);
const warehouses = ref<Warehouse[]>([]);

function filterProducts(query: string) {
  if (!query) { filteredProducts.value = allProducts.value.slice(0, 50); return; }
  filteredProducts.value = allProducts.value.filter((p) => matchPinyin(p.name, query) || matchPinyin(p.code, query)).slice(0, 50);
}

function resetForm() {
  form.productId = '';
  form.quantity = undefined;
  form.fromWarehouseId = '';
  form.toWarehouseId = '';
  form.remark = '';
  formRef.value?.resetFields();
}

async function loadOptions() {
  try {
    const [pRes, wRes] = await Promise.all([
      productsApi.getAll({ pageSize: 100, page: 1 }),
      warehousesApi.getAll({ pageSize: 100, page: 1 }),
    ]);
    allProducts.value = pRes.data.data ?? [];
    filteredProducts.value = allProducts.value.slice(0, 50);
    warehouses.value = wRes.data.data ?? [];
  } catch {
    // ignore
  }
}

async function handleCreate() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (valid === false) return;
  if (form.fromWarehouseId && form.toWarehouseId && form.fromWarehouseId === form.toWarehouseId) {
    ElMessage.warning('来源与目标仓库不能相同');
    return;
  }
  submitting.value = true;
  try {
    await inventoryApi.createTransfer({
      productId: form.productId,
      quantity: Number(form.quantity),
      fromWarehouseId: form.fromWarehouseId || undefined,
      toWarehouseId: form.toWarehouseId || undefined,
      remark: form.remark || undefined,
    });
    ElMessage.success('创建成功');
    dialogVisible.value = false;
    void list.fetchData();
  } catch (e: unknown) {
    ElMessage.error(getApiErrorMessage(e, '创建失败'));
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  void list.fetchData();
  void loadOptions();
});
</script>

<style scoped>
.transfer-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.header-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.search-box { width: 200px; }
</style>
