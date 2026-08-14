<template>
  <div class="admin-crud-page">
    <div class="page-header">
      <h2>客户管理</h2>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索客户名称/电话"
          :prefix-icon="Search"
          clearable
          class="search-box"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button type="primary" :icon="Plus" @click="handleCreate">新增</el-button>
      </div>
    </div>
    
    <!-- Desktop Table -->
    <el-table v-if="!isMobile" :data="customers" v-loading="loading" class="card-premium" empty-text="暂无客户数据">
      <el-table-column prop="name" label="客户名称" min-width="150" />
      <el-table-column prop="shortName" label="简称" width="100" />
      <el-table-column prop="contact" label="联系人" width="100" />
      <el-table-column prop="phone" label="电话" width="130" />
      <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
      <el-table-column label="默认区域" width="120">
        <template #default="{ row }">{{ row.region?.name || '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container" v-if="!isMobile && total > 0">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- Mobile View -->
    <div v-else class="admin-mobile-container">
       <van-sticky>
        <van-search
          v-model="searchKeyword"
          placeholder="搜索客户/电话"
          shape="round"
          background="var(--card-bg)"
          @search="handleSearch"
        />
      </van-sticky>

        <van-pull-refresh v-model="loading" @refresh="fetchData">
            <van-list
                v-if="customers.length > 0"
                class="admin-list"
            >
                <van-swipe-cell 
                v-for="customer in customers" 
                :key="customer.id"
                class="admin-list-item"
                >
                <van-cell 
                    center
                    is-link
                    @click="handleEdit(customer)"
                >
                    <template #title>
                        <div class="list-title">
                            {{ customer.shortName || customer.name }}
                            <span v-if="customer.shortName" class="sub-title">({{ customer.name }})</span>
                        </div>
                    </template>
                    <template #label>
                        <div class="list-info">
                            <div class="info-row" v-if="customer.contact || customer.phone">
                                <van-icon name="manager-o" /> {{ customer.contact }}
                                <span class="separator" v-if="customer.contact && customer.phone">|</span>
                                <van-icon name="phone-o" v-if="customer.phone" /> {{ customer.phone }}
                            </div>
                              <div class="info-row" v-if="customer.address">
                                 <van-icon name="location-o" /> {{ customer.address }}
                             </div>
                             <div class="info-row" v-if="customer.region">
                                 <span class="region-label">默认区域：</span>{{ customer.region.name }}
                             </div>
                        </div>
                    </template>
                </van-cell>
                <template #right>
                    <van-button square type="danger" text="删除" class="swipe-btn" @click.stop="handleDelete(customer)" />
                </template>
                </van-swipe-cell>
            </van-list>
            <el-empty v-else description="暂无客户" />
            
             <!-- Mobile Pagination -->
             <div class="mobile-pagination-wrapper" v-if="total > 0">
                 <van-pagination 
                    v-model="pagination.page" 
                    :total-items="total" 
                    :items-per-page="pagination.pageSize"
                    @change="handlePageChange"
                    force-ellipses
                 />
             </div>
        </van-pull-refresh>
    </div>
    
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑客户' : '新增客户'" :width="isMobile ? '90%' : '500px'">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="客户全称" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="简称">
          <el-input v-model="form.shortName" placeholder="客户简称（可选）" maxlength="50" />
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
        <el-form-item label="默认区域">
          <el-select v-model="form.defaultRegionId" style="width: 100%" clearable placeholder="可选，新建工单时自动带出">
            <el-option v-for="r in regions" :key="r.id" :label="r.name" :value="r.id" />
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
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import type { Customer, Region } from '@/types';
import { customersApi, regionsApi } from '@/api';
import { useResponsive } from '@/composables';

import { 
  Button as VanButton, 
  Sticky as VanSticky, 
  Search as VanSearch, 
  List as VanList, 
  SwipeCell as VanSwipeCell, 
  Cell as VanCell, 
  Icon as VanIcon,
  PullRefresh as VanPullRefresh,
  Pagination as VanPagination
} from 'vant';

const { isMobile } = useResponsive();

const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const customers = ref<Customer[]>([]);
const regions = ref<Region[]>([]);
const searchKeyword = ref('');
const total = ref(0);

const pagination = reactive({
  page: 1,
  pageSize: 20,
});

const editing = ref<Customer | null>(null);
const formRef = ref<FormInstance>();

const form = reactive({ name: '', shortName: '', contact: '', phone: '', address: '', defaultRegionId: '' });
const rules: FormRules = { name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }] };

async function fetchData() {
  loading.value = true;
  try {
    const { data } = await customersApi.getAll({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value || undefined,
    });
    customers.value = data.data;
    total.value = data.total;

    const regionsRes = await regionsApi.getAll();
    regions.value = regionsRes.data;
  } finally {
    loading.value = false;
  }
}

function handlePageChange(page: number) {
  pagination.page = page;
  void fetchData();
}

function handleSizeChange(size: number) {
  pagination.pageSize = size;
  pagination.page = 1;
  void fetchData();
}

function handleSearch() {
  pagination.page = 1;
  void fetchData();
}

function handleCreate() { editing.value = null; Object.assign(form, { name: '', shortName: '', contact: '', phone: '', address: '', defaultRegionId: '' }); dialogVisible.value = true; }
function handleEdit(row: Customer) { 
  editing.value = row; 
  Object.assign(form, { 
    name: row.name, 
    shortName: row.shortName || '', 
    contact: row.contact || '', 
    phone: row.phone || '', 
    address: row.address || '', 
    defaultRegionId: row.defaultRegionId || '' 
  }); 
  dialogVisible.value = true; 
}

async function handleDelete(row: Customer) {
  await ElMessageBox.confirm('确定删除此客户吗？', '提示', { type: 'warning' });
  try { await customersApi.delete(row.id); ElMessage.success('删除成功'); void fetchData(); }
  catch (e: unknown) { const err = e as { response?: { data?: { message?: string } } }; ElMessage.error(err.response?.data?.message || '删除失败'); }
}

async function handleSubmit() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    const defaultRegionIdValue = form.defaultRegionId || null;
    const payload = { name: form.name, shortName: form.shortName, contact: form.contact, phone: form.phone, address: form.address, defaultRegionId: defaultRegionIdValue };
    if (editing.value) { await customersApi.update(editing.value.id, payload); }
    else { await customersApi.create(payload); }
    ElMessage.success(editing.value ? '更新成功' : '创建成功');
    dialogVisible.value = false;
    void fetchData();
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    ElMessage.error(err.response?.data?.message || '操作失败');
  } finally { submitting.value = false; }
}

onMounted(fetchData);
</script>

<style scoped>
.admin-crud-page { max-width: 1200px; margin: 0 auto; }

.header-actions {
  display: flex;
  gap: 12px;
}

.search-box {
  width: 240px;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  background: var(--card-bg);
  padding: 12px;
  border-radius: 8px;
}

.mobile-pagination {
  margin-top: 16px;
  justify-content: center;
}
</style>

<style scoped>
/* Mobile Optimizations */
.admin-mobile-container {
  padding-bottom: 80px; /* 底部导航安全间距 */
  background: var(--bg-color);
  min-height: 100vh;
}

.admin-list {
  margin-top: 8px;
}

.admin-list-item {
  margin-bottom: 1px;
}

.list-title {
    font-weight: 500;
    font-size: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
}
.sub-title {
    font-size: 12px;
    color: var(--text-tertiary);
    margin-left: 4px;
    font-weight: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 120px;
}

.list-info {
    margin-top: 4px;
}

.info-row {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 2px;
}

  .info-row .van-icon {
    margin-right: 4px;
    font-size: 14px;
  }

  .region-label {
    margin-right: 4px;
    color: var(--text-tertiary);
    font-weight: 500;
  }

.separator {
    margin: 0 8px;
    color: var(--border-color-lighter);
}

.swipe-btn {
  height: 100%;
}

.mobile-pagination-wrapper {
    padding: 16px;
    display: flex;
    justify-content: center;
}
</style>
