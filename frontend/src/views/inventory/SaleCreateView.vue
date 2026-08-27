<template>
  <div class="sale-create-page">
    <div class="page-header">
      <el-button text @click="router.back()">返回</el-button>
      <h2>新建销售单</h2>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-card class="card-premium">
        <el-form-item label="客户" prop="customerId">
          <el-select
            v-model="form.customerId"
            filterable
            clearable
            placeholder="选择客户（支持拼音搜索）"
            :filter-method="filterCustomers"
            style="width: 100%"
          >
            <el-option
              v-for="c in filteredCustomers"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" placeholder="可选" />
        </el-form-item>
      </el-card>

      <el-card class="card-premium">
        <template #header>
          <div class="card-header">
            <span class="card-title-text">明细</span>
            <el-button type="primary" size="small" @click="addRow">添加行</el-button>
          </div>
        </template>

        <div v-for="(row, idx) in form.details" :key="idx" class="detail-row">
          <el-select
            v-model="row.productId"
            filterable
            :filter-method="(q: string) => filterProducts(q, idx)"
            placeholder="选择产品（拼音搜索）"
            style="flex: 2; min-width: 180px"
            @change="onProductChange(idx)"
          >
            <el-option
              v-for="p in row.filtered"
              :key="p.id"
              :label="`${p.name} (${p.code})`"
              :value="p.id"
            />
          </el-select>
          <el-input-number
            v-model="row.quantity"
            :min="0.01"
            :precision="2"
            :step="1"
            placeholder="数量"
            style="flex: 1"
          />
          <el-input-number
            v-model="row.unitPrice"
            :min="0"
            :precision="2"
            :step="1"
            placeholder="单价"
            style="flex: 1"
          />
          <el-button type="danger" size="small" text @click="removeRow(idx)">删除</el-button>
        </div>

        <el-empty v-if="!form.details.length" description="请添加明细" :image-size="60" />
      </el-card>

      <div class="form-footer">
        <el-button @click="router.push('/inventory/sales')">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import type { Customer, Product } from '@/types';
import { inventoryApi } from '@/api/inventory';
import { customersApi } from '@/api';
import { productsApi } from '@/api/products';
import { getApiErrorMessage } from '@/utils/format';
import { matchPinyin } from '@/utils/pinyinFilter';

const router = useRouter();

const formRef = ref<FormInstance>();
const submitting = ref(false);

interface DetailRow {
  productId: string;
  quantity: number | undefined;
  unitPrice: number | undefined;
  filtered: Product[];
}

const form = reactive<{
  customerId: string;
  remark: string;
  details: DetailRow[];
}>({
  customerId: '',
  remark: '',
  details: [{ productId: '', quantity: undefined, unitPrice: undefined, filtered: [] }],
});

const rules: FormRules = {
  customerId: [{ required: false, message: '', trigger: 'blur' }],
};

const allProducts = ref<Product[]>([]);
const customers = ref<Customer[]>([]);

const filteredCustomers = ref<Customer[]>([]);

function filterCustomers(query: string) {
  if (!query) {
    filteredCustomers.value = customers.value;
    return;
  }
  filteredCustomers.value = customers.value.filter((c) => matchPinyin(c.name, query));
}

function filterProducts(query: string, idx: number) {
  const row = form.details[idx];
  if (!row) return;
  if (!query) {
    row.filtered = allProducts.value.slice(0, 50);
    return;
  }
  row.filtered = allProducts.value.filter((p) => matchPinyin(p.name, query) || matchPinyin(p.code, query)).slice(0, 50);
}

function onProductChange(idx: number) {
  const row = form.details[idx];
  if (!row) return;
  const p = allProducts.value.find((x) => x.id === row.productId);
  if (p) {
    // 自动带出单价（优先 salePrice / marketPrice）
    if (row.unitPrice == null) {
      const price = p.salePrice ?? p.marketPrice ?? undefined;
      if (price != null) row.unitPrice = Number(price);
    }
  }
}

function addRow() {
  form.details.push({ productId: '', quantity: undefined, unitPrice: undefined, filtered: allProducts.value.slice(0, 50) });
}

function removeRow(idx: number) {
  form.details.splice(idx, 1);
  if (!form.details.length) addRow();
}

async function loadOptions() {
  try {
    const [cRes, pRes] = await Promise.all([
      customersApi.getAll({ pageSize: 100, page: 1 }),
      productsApi.getAll({ pageSize: 100, page: 1 }),
    ]);
    customers.value = cRes.data.data ?? [];
    filteredCustomers.value = customers.value;
    allProducts.value = pRes.data.data ?? [];
    // init filtered for each row
    for (const r of form.details) r.filtered = allProducts.value.slice(0, 50);
  } catch {
    // ignore, empty will show
  }
}

async function handleSubmit() {
  if (!formRef.value) return;
  // minimal validation
  const valid = await formRef.value.validate().catch(() => false);
  if (valid === false) return;

  // details validation
  const cleaned = form.details.filter((r) => r.productId);
  if (!cleaned.length) {
    ElMessage.warning('请至少添加一行有效明细（选择产品）');
    return;
  }
  for (const r of cleaned) {
    if (r.quantity == null || Number(r.quantity) <= 0) {
      ElMessage.warning('数量必须大于 0');
      return;
    }
  }

  submitting.value = true;
  try {
    const payload = {
      customerId: form.customerId || undefined,
      remark: form.remark || undefined,
      details: cleaned.map((r) => ({
        productId: r.productId,
        quantity: Number(r.quantity),
        unitPrice: r.unitPrice != null ? Number(r.unitPrice) : undefined,
      })),
    };
    await inventoryApi.createSale(payload);
    ElMessage.success('创建成功');
    void router.push('/inventory/sales');
  } catch (e: unknown) {
    ElMessage.error(getApiErrorMessage(e, '创建失败'));
  } finally {
    submitting.value = false;
  }
}

onMounted(() => { void loadOptions(); });
</script>

<style scoped>
.sale-create-page { max-width: 900px; margin: 0 auto; }
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.page-header h2 { margin: 0; }
.card-premium { margin-bottom: 16px; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.card-title-text { font-weight: 600; }
.detail-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.form-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 12px 0; }
</style>
