<template>
  <div class="admin-crud-page">
    <div class="page-header">
      <h2>供应商管理</h2>
      <div class="header-actions">
        <el-input
          v-model="list.keyword.value"
          placeholder="搜索供应商/联系人/电话"
          :prefix-icon="Search"
          clearable
          class="search-box"
          @keyup.enter="list.handleSearch"
          @clear="list.handleSearch"
        />
        <el-button type="primary" :icon="Plus" @click="handleCreate" v-if="canEdit">新增</el-button>
      </div>
    </div>

    <!-- Desktop Table via BaseTable -->
    <BaseTable
      v-if="!isMobile"
      :data="list.data.value"
      :total="list.total.value"
      :loading="list.loading.value"
      :page="list.pagination.page"
      :page-size="list.pagination.pageSize"
      empty-text="暂无供应商数据"
      @update:page="onPage"
      @update:page-size="onSize"
      @size-change="onSize"
      @current-change="onPage"
    >
      <el-table-column prop="name" label="供应商名称" min-width="160" />
      <el-table-column prop="contact" label="联系人" width="100" />
      <el-table-column prop="phone" label="电话" width="130" />
      <el-table-column prop="address" label="地址" min-width="180" show-overflow-tooltip />
      <el-table-column label="打款信息" min-width="220">
        <template #default="{ row }">
          <div class="pay-info">
            <div v-if="row.bankName">开户行：{{ row.bankName }}</div>
            <div v-if="row.bankAccount">账号：{{ row.bankAccount }}</div>
            <div v-if="row.accountName">户名：{{ row.accountName }}</div>
            <div v-if="row.paymentMethod">方式：{{ row.paymentMethod }}</div>
            <span v-if="!row.bankName && !row.bankAccount && !row.accountName && !row.paymentMethod">-</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </BaseTable>

    <!-- Mobile -->
    <div v-else class="admin-mobile-container">
      <van-sticky>
        <van-search
          v-model="list.keyword.value"
          placeholder="搜索供应商/电话"
          shape="round"
          background="var(--card-bg)"
          @search="list.handleSearch"
        />
      </van-sticky>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list v-if="list.data.value.length > 0" class="admin-list">
          <van-swipe-cell v-for="item in list.data.value" :key="item.id" class="admin-list-item">
            <van-cell center is-link @click="handleEdit(item)">
              <template #title>
                <div class="list-title">{{ item.name }}</div>
              </template>
              <template #label>
                <div class="list-info">
                  <div class="info-row" v-if="item.contact || item.phone">
                    <van-icon name="manager-o" /> {{ item.contact }}
                    <span class="separator" v-if="item.contact && item.phone">|</span>
                    <van-icon name="phone-o" v-if="item.phone" /> {{ item.phone }}
                  </div>
                  <div class="info-row" v-if="item.address"><van-icon name="location-o" /> {{ item.address }}</div>
                  <div class="info-row pay-info-mobile" v-if="item.bankName || item.bankAccount">
                    <span>{{ item.bankName }} {{ item.bankAccount }} {{ item.accountName }}</span>
                  </div>
                </div>
              </template>
            </van-cell>
            <template #right>
              <van-button square type="danger" text="删除" class="swipe-btn" @click.stop="handleDelete(item)" />
            </template>
          </van-swipe-cell>
        </van-list>
        <el-empty v-else description="暂无供应商" />
        <div class="mobile-pagination-wrapper" v-if="list.total.value > 0">
          <van-pagination v-model="list.pagination.page" :total-items="list.total.value" :items-per-page="list.pagination.pageSize" @change="onPage" force-ellipses />
        </div>
      </van-pull-refresh>
    </div>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑供应商' : '新增供应商'" :width="isMobile ? '90%' : '560px'">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="供应商全称" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="form.contact" maxlength="50" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" maxlength="30" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" type="textarea" :rows="2" maxlength="200" />
        </el-form-item>
        <el-divider content-position="left">打款信息</el-divider>
        <el-form-item label="开户行">
          <el-input v-model="form.bankName" maxlength="100" placeholder="如 中国银行XX支行" />
        </el-form-item>
        <el-form-item label="银行账号">
          <el-input v-model="form.bankAccount" maxlength="50" />
        </el-form-item>
        <el-form-item label="户名">
          <el-input v-model="form.accountName" maxlength="100" />
        </el-form-item>
        <el-form-item label="付款方式">
          <el-select v-model="form.paymentMethod" clearable placeholder="请选择" style="width: 100%">
            <el-option label="银行转账" value="银行转账" />
            <el-option label="现金" value="现金" />
            <el-option label="支票" value="支票" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import type { Supplier } from '@/types';
import { suppliersApi } from '@/api/suppliers';
import { useResponsive } from '@/composables';
import { usePaginatedList, useInventoryPermission } from '@/composables/useInventory';
import BaseTable from '@/components/BaseTable.vue';
import { getApiErrorMessage } from '@/utils/format';
import { Button as VanButton, Sticky as VanSticky, Search as VanSearch, List as VanList, SwipeCell as VanSwipeCell, Cell as VanCell, Icon as VanIcon, PullRefresh as VanPullRefresh, Pagination as VanPagination } from 'vant';

const { isMobile } = useResponsive();
const { has } = useInventoryPermission();
const canEdit = computed(() => has('supplier:create') || has('supplier:edit') || has('supplier:*') || has('supplier:manage'));

const list = usePaginatedList<Supplier, { page?: number; pageSize?: number; keyword?: string }>({
  fetchFn: (params) => suppliersApi.getAll(params),
  defaultPageSize: 20,
});

const refreshing = ref(false);
function onPage(p: number) { list.handlePageChange(p); }
function onSize(s: number) { list.handleSizeChange(s); }
async function onRefresh() { await list.fetchData(); refreshing.value = false; }

const dialogVisible = ref(false);
const submitting = ref(false);
const editing = ref<Supplier | null>(null);
const formRef = ref<FormInstance>();
const form = reactive({ name: '', contact: '', phone: '', address: '', bankName: '', bankAccount: '', accountName: '', paymentMethod: '' });
const rules: FormRules = { name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }] };

function handleCreate() {
  editing.value = null;
  Object.assign(form, { name: '', contact: '', phone: '', address: '', bankName: '', bankAccount: '', accountName: '', paymentMethod: '' });
  dialogVisible.value = true;
}
function handleEdit(row: Supplier) {
  editing.value = row;
  Object.assign(form, {
    name: row.name,
    contact: row.contact || '',
    phone: row.phone || '',
    address: row.address || '',
    bankName: row.bankName || '',
    bankAccount: row.bankAccount || '',
    accountName: row.accountName || '',
    paymentMethod: row.paymentMethod || '',
  });
  dialogVisible.value = true;
}

async function handleDelete(row: Supplier) {
  await ElMessageBox.confirm('确定删除此供应商吗？', '提示', { type: 'warning' });
  try { await suppliersApi.remove(row.id); ElMessage.success('删除成功'); void list.fetchData(); }
  catch (e: unknown) { ElMessage.error(getApiErrorMessage(e, '删除失败')); }
}

async function handleSubmit() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    const payload = { ...form };
    // 清理空字符串为 undefined，避免后端校验
    (Object.keys(payload) as Array<keyof typeof payload>).forEach(k => {
      if ((payload[k] as string) === '') (payload as Record<string, unknown>)[k] = undefined;
    });
    if (editing.value) await suppliersApi.update(editing.value.id, payload);
    else await suppliersApi.create(payload as { name: string });
    ElMessage.success(editing.value ? '更新成功' : '创建成功');
    dialogVisible.value = false;
    void list.fetchData();
  } catch (e: unknown) { ElMessage.error(getApiErrorMessage(e, '操作失败')); }
  finally { submitting.value = false; }
}

onMounted(() => { void list.fetchData(); });
</script>

<style scoped>
.admin-crud-page { max-width: 1200px; margin: 0 auto; }
.header-actions { display: flex; gap: 12px; }
.search-box { width: 260px; }
.pay-info { font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
.pay-info-mobile { font-size: 12px; color: var(--text-secondary); }
/* reuse CustomersView mobile styles */
.admin-mobile-container { padding-bottom: 80px; background: var(--bg-color); min-height: 100vh; }
.admin-list { margin-top: 8px; }
.admin-list-item { margin-bottom: 1px; }
.list-title { font-weight: 500; font-size: 16px; }
.list-info { margin-top: 4px; }
.info-row { display: flex; align-items: center; font-size: 13px; color: var(--text-secondary); margin-bottom: 2px; }
.info-row .van-icon { margin-right: 4px; font-size: 14px; }
.separator { margin: 0 8px; color: var(--border-color-lighter); }
.swipe-btn { height: 100%; }
.mobile-pagination-wrapper { padding: 16px; display: flex; justify-content: center; }
</style>
