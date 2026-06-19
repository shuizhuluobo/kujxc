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
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import type { Customer } from '@/types';
import { customersApi } from '@/api';
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
import { match } from 'pinyin-pro';

const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const allCustomers = ref<Customer[]>([]);
const customers = ref<Customer[]>([]);
const searchKeyword = ref('');
const total = ref(0);

const pagination = reactive({
  page: 1,
  pageSize: 20,
});

const editing = ref<Customer | null>(null);
const formRef = ref<FormInstance>();

const form = reactive({ name: '', shortName: '', contact: '', phone: '', address: '' });
const rules: FormRules = { name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }] };

async function fetchData() {
  loading.value = true;
  try {
    // Fetch all customers for client-side filtering
    const { data } = await customersApi.getAll({ page: 1, pageSize: 10000 });
    allCustomers.value = data.data;
    applyFiltersAndPagination();
  } finally {
    loading.value = false;
  }
}

function applyFiltersAndPagination() {
    let result = allCustomers.value;

    if (searchKeyword.value) {
        const query = searchKeyword.value.toLowerCase();
        result = result.filter(c => {
            // 优先匹配客户简称
            if (c.shortName?.toLowerCase().includes(query)) return true;
            if (match(c.shortName || '', query, { precision: 'start' })) return true;
            // 然后匹配客户名称
            if (c.name.toLowerCase().includes(query)) return true;
            if (match(c.name, query, { precision: 'start' })) return true;
            // 最后匹配联系人和电话
            if (c.contact?.toLowerCase().includes(query)) return true;
            if (c.phone?.includes(query)) return true;
            return false;
        });
        
        // 按优先级排序：shortName 精确匹配 > shortName 包含 > name 匹配
        result.sort((a, b) => {
            const aShortExact = a.shortName?.toLowerCase() === query;
            const bShortExact = b.shortName?.toLowerCase() === query;
            if (aShortExact && !bShortExact) return -1;
            if (!aShortExact && bShortExact) return 1;
            
            const aShortContains = a.shortName?.toLowerCase().includes(query);
            const bShortContains = b.shortName?.toLowerCase().includes(query);
            if (aShortContains && !bShortContains) return -1;
            if (!aShortContains && bShortContains) return 1;
            
            return 0;
        });
    }

    total.value = result.length;

    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    customers.value = result.slice(start, end);
}

function handlePageChange(page: number) {
  pagination.page = page;
  applyFiltersAndPagination();
}

function handleSizeChange(size: number) {
  pagination.pageSize = size;
  pagination.page = 1;
  applyFiltersAndPagination();
}

function handleSearch() {
  pagination.page = 1;
  applyFiltersAndPagination();
}

function handleCreate() { editing.value = null; Object.assign(form, { name: '', shortName: '', contact: '', phone: '', address: '' }); dialogVisible.value = true; }
function handleEdit(row: Customer) { 
  editing.value = row; 
  // Only copy the editable fields
  Object.assign(form, { 
    name: row.name, 
    shortName: row.shortName || '', 
    contact: row.contact || '', 
    phone: row.phone || '', 
    address: row.address || '' 
  }); 
  dialogVisible.value = true; 
}

async function handleDelete(row: Customer) {
  await ElMessageBox.confirm('确定删除此客户吗？', '提示', { type: 'warning' });
  try { await customersApi.delete(row.id); ElMessage.success('删除成功'); fetchData(); }
  catch (e: unknown) { const err = e as { response?: { data?: { message?: string } } }; ElMessage.error(err.response?.data?.message || '删除失败'); }
}

async function handleSubmit() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    if (editing.value) { await customersApi.update(editing.value.id, form); }
    else { await customersApi.create(form); }
    ElMessage.success(editing.value ? '更新成功' : '创建成功');
    dialogVisible.value = false;
    fetchData();
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
