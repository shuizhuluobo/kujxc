<template>
  <div class="admin-crud-page">
    <div class="page-header">
      <h2>仓库管理</h2>
      <div class="header-actions">
        <el-input v-model="list.keyword.value" placeholder="搜索仓库名称/类型" :prefix-icon="Search" clearable class="search-box" @keyup.enter="list.handleSearch" @clear="list.handleSearch" />
        <el-button type="primary" :icon="Plus" @click="handleCreate">新增</el-button>
      </div>
    </div>

    <BaseTable
      v-if="!isMobile"
      :data="list.data.value"
      :total="list.total.value"
      :loading="list.loading.value"
      :page="list.pagination.page"
      :page-size="list.pagination.pageSize"
      empty-text="暂无仓库数据"
      @update:page="onPage"
      @update:page-size="onSize"
      @size-change="onSize"
      @current-change="onPage"
    >
      <el-table-column prop="name" label="仓库名称" min-width="180" />
      <el-table-column prop="type" label="类型" width="120">
        <template #default="{ row }">{{ row.type || '-' }}</template>
      </el-table-column>
      <el-table-column label="所属区域" width="140">
        <template #default="{ row }">{{ row.region?.name || '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </BaseTable>

    <div v-else class="admin-mobile-container">
      <van-sticky>
        <van-search v-model="list.keyword.value" placeholder="搜索仓库" shape="round" background="var(--card-bg)" @search="list.handleSearch" />
      </van-sticky>
      <van-list v-if="list.data.value.length > 0" class="admin-list">
        <van-swipe-cell v-for="item in list.data.value" :key="item.id" class="admin-list-item">
          <van-cell :title="item.name" :label="item.type || '未分类'" center is-link @click="handleEdit(item)">
            <template #icon>
              <div class="list-icon-wrapper"><van-icon name="shop-o" size="20" color="var(--primary-color)" /></div>
            </template>
          </van-cell>
          <template #right>
            <van-button square type="danger" text="删除" class="swipe-btn" @click.stop="handleDelete(item)" />
          </template>
        </van-swipe-cell>
      </van-list>
      <el-empty v-else description="暂无仓库" />
      <div class="mobile-pagination-wrapper" v-if="list.total.value > 0">
        <van-pagination v-model="list.pagination.page" :total-items="list.total.value" :items-per-page="list.pagination.pageSize" @change="onPage" force-ellipses />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑仓库' : '新增仓库'" :width="isMobile ? '90%' : '480px'">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" maxlength="100" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" clearable placeholder="总库/分库/样品库" style="width: 100%">
            <el-option label="总库" value="总库" />
            <el-option label="分库" value="分库" />
            <el-option label="样品库" value="样品库" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属区域">
          <el-select v-model="form.regionId" clearable placeholder="可选" style="width: 100%">
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
import type { Warehouse, Region } from '@/types';
import { warehousesApi } from '@/api/warehouses';
import { regionsApi } from '@/api';
import { useResponsive } from '@/composables';
import { usePaginatedList } from '@/composables/useInventory';
import BaseTable from '@/components/BaseTable.vue';
import { getApiErrorMessage } from '@/utils/format';
import { Button as VanButton, Sticky as VanSticky, Search as VanSearch, List as VanList, SwipeCell as VanSwipeCell, Cell as VanCell, Icon as VanIcon, Pagination as VanPagination } from 'vant';

const { isMobile } = useResponsive();

const list = usePaginatedList<Warehouse, { page?: number; pageSize?: number; keyword?: string }>({
  fetchFn: (params) => warehousesApi.getAll(params),
  defaultPageSize: 20,
});

function onPage(p: number) { list.handlePageChange(p); }
function onSize(s: number) { list.handleSizeChange(s); }

const dialogVisible = ref(false);
const submitting = ref(false);
const editing = ref<Warehouse | null>(null);
const formRef = ref<FormInstance>();
const form = reactive({ name: '', type: '', regionId: '' });
const rules: FormRules = { name: [{ required: true, message: '请输入仓库名称', trigger: 'blur' }] };
const regions = ref<Region[]>([]);

async function loadRegions() {
  try { regions.value = (await regionsApi.getAll()).data; } catch { /* ignore */ }
}

function handleCreate() {
  editing.value = null;
  Object.assign(form, { name: '', type: '', regionId: '' });
  dialogVisible.value = true;
}
function handleEdit(row: Warehouse) {
  editing.value = row;
  Object.assign(form, { name: row.name, type: row.type || '', regionId: row.regionId || '' });
  dialogVisible.value = true;
}
async function handleDelete(row: Warehouse) {
  await ElMessageBox.confirm('确定删除此仓库吗？', '提示', { type: 'warning' });
  try { await warehousesApi.remove(row.id); ElMessage.success('删除成功'); void list.fetchData(); }
  catch (e: unknown) { ElMessage.error(getApiErrorMessage(e, '删除失败')); }
}
async function handleSubmit() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    const payload = { name: form.name, type: form.type || undefined, regionId: form.regionId || undefined };
    if (editing.value) await warehousesApi.update(editing.value.id, payload);
    else await warehousesApi.create(payload);
    ElMessage.success(editing.value ? '更新成功' : '创建成功');
    dialogVisible.value = false;
    void list.fetchData();
  } catch (e: unknown) { ElMessage.error(getApiErrorMessage(e, '操作失败')); }
  finally { submitting.value = false; }
}

onMounted(() => { void list.fetchData(); void loadRegions(); });
</script>

<style scoped>
.admin-crud-page { max-width: 900px; margin: 0 auto; }
.header-actions { display: flex; gap: 12px; }
.search-box { width: 240px; }
.admin-mobile-container { padding-bottom: 80px; background: var(--bg-color); min-height: 100vh; }
.admin-list { margin-top: 8px; }
.admin-list-item { margin-bottom: 1px; }
.swipe-btn { height: 100%; }
.list-icon-wrapper { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: var(--el-color-primary-light-9); border-radius: 8px; margin-right: 12px; }
.mobile-pagination-wrapper { padding: 16px; display: flex; justify-content: center; }
</style>
