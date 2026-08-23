<template>
  <div class="pending-work-orders-desktop">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <h2>待办工单</h2>
        <div class="stats-tag" v-if="stats.total > 0">
          <el-tag type="danger" effect="dark" round v-if="stats.pending > 0">
            待接收: {{ stats.pending }}
          </el-tag>
          <el-tag type="warning" effect="dark" round v-if="stats.received > 0">
            处理中: {{ stats.received }}
          </el-tag>
        </div>
      </div>
      <el-button type="primary" :icon="Plus" @click="emit('create')">
        新建工单
      </el-button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar card-premium">
      <el-select v-model="localFilter.status" placeholder="状态" clearable class="filter-item">
        <el-option label="待接收" value="PENDING" />
        <el-option label="已接收" value="RECEIVED" />
      </el-select>

      <el-select v-model="localFilter.serviceTypeId" placeholder="服务类型" clearable class="filter-item">
        <el-option 
          v-for="s in baseDataStore.serviceTypes" 
          :key="s.id" 
          :label="s.name" 
          :value="s.id" 
        />
      </el-select>

      <el-select v-model="localFilter.regionId" placeholder="区域" clearable class="filter-item">
        <el-option 
          v-for="r in baseDataStore.regions" 
          :key="r.id" 
          :label="r.name" 
          :value="r.id" 
        />
      </el-select>

      <el-input 
        v-model="localFilter.keyword" 
        placeholder="搜索客户、工单号..." 
        :prefix-icon="Search"
        clearable
        class="filter-item filter-search"
      />

      <div class="filter-actions">
        <el-button @click="emit('resetFilters')">重置</el-button>
      </div>

      <el-badge :is-dot="hasActiveFilters" class="filter-badge">
          <!-- Visually hidden or just indicator -->
      </el-badge>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 表格视图 -->
    <el-table 
      v-else-if="workOrders.length > 0"
      :data="workOrders" 
      class="work-order-table card-premium"
      :row-class-name="tableRowClassName"
      @row-click="(row: WorkOrder) => emit('rowClick', row)"
      empty-text="暂无待办工单"
    >
      <el-table-column label="客户" width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <span style="font-size: 16px; font-weight: 600">{{ getCustomerDisplayName(row.customer) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="detail" label="工单详情" min-width="300" show-overflow-tooltip />
      <el-table-column prop="region.name" label="区域" width="70" />
      <el-table-column prop="serviceType.name" label="服务类型" width="90" />

      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <span class="status-tag" :class="getStatusClass(row.status)">
            {{ STATUS_LABELS[row.status as WorkOrderStatus] }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="创建" width="105">
        <template #default="{ row }">
          <div class="cell-info">
            <span>{{ row.creator?.name }}</span>
            <span class="time">{{ formatDate(row.createdAt) }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="接收" width="105">
        <template #default="{ row }">
          <div class="cell-info" v-if="row.receiver">
            <span>{{ row.receiver.name }}</span>
            <span class="time">{{ formatDate(row.receivedAt) }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="完成" width="105">
        <template #default="{ row }">
          <div class="cell-info" v-if="row.completer">
            <span>{{ row.completer.name }}</span>
            <span class="time">{{ formatDate(row.completedAt) }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="230" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button 
              v-if="row.status === 'PENDING' && canReceive" 
              type="primary" 
              size="small"
              @click.stop="emit('receive', row)"
            >
              接收
            </el-button>
            <!-- 转接按钮: 已被接收 但 接收不是自己 -->
            <el-button 
              v-if="row.status === 'RECEIVED' && String(row.receiverId) !== String(authStore.user?.id) && canReceive" 
              type="warning" 
              size="small"
              @click.stop="emit('transfer', row)"
            >
              转接
            </el-button>
            <el-button 
              v-if="row.status === 'RECEIVED' && String(row.receiverId) === String(authStore.user?.id)" 
              type="success" 
              size="small"
              @click.stop="emit('complete', row)"
            >
              完成
            </el-button>
            <el-button 
              v-if="row.status === 'RECEIVED' && String(row.receiverId) === String(authStore.user?.id)" 
              type="warning" 
              size="small"
              @click.stop="handleCancelReceive(row)"
            >
              取消
            </el-button>
            <el-button 
              v-if="row.creatorId === authStore.user?.id || authStore.isAdmin" 
              size="small"
              @click.stop="emit('edit', row)"
            >
              编辑
            </el-button>
            <el-button 
              v-if="row.creatorId === authStore.user?.id || authStore.isAdmin" 
              type="danger" 
              size="small"
              @click.stop="handleDelete(row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <div v-else class="empty-state card-premium">
      <el-empty description="暂无待办工单">
        <el-button type="primary" @click="emit('create')">新建工单</el-button>
      </el-empty>
    </div>

    <div class="pagination-container" v-if="pagination.total > 0">
      <el-pagination
        v-model:current-page="localPagination.page"
        v-model:page-size="localPagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="(val: number) => emit('sizeChange', val)"
        @current-change="(val: number) => emit('pageChange', val)"
      />
    </div>

    <!-- 新建/编辑工单对话框 -->
    <el-dialog
      :model-value="formState.showDialog.value"
      @update:model-value="(val: boolean | string | number) => localFormState.showDialog.value = !!val"
      :title="formState.editingWorkOrder.value ? '编辑工单' : '新建工单'"
      width="500px"
      @closed="workOrderFormRef?.clearValidate()"
    >
      <WorkOrderForm
        ref="workOrderFormRef"
        :model-value="formState.form"
        :rules="formState.formRules"
        :customers="formState.filteredCustomers.value"
        :on-search="formState.customerFilterMethod"
      />
      
      <template #footer>
        <el-button @click="localFormState.showDialog.value = false">取消</el-button>
        <el-button type="primary" :loading="formState.submitting.value" @click="handleDialogSubmit">
          {{ formState.editingWorkOrder.value ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Plus, Search } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import Sortable from 'sortablejs';
import type { WorkOrder, WorkOrderStatus } from '@/types';
import { STATUS_LABELS } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { useBaseDataStore } from '@/stores/baseData';
import { usePermission } from '@/composables';
import WorkOrderForm from './components/WorkOrderForm.vue';
import { getCustomerDisplayName } from '@/utils/customer';
import type { WorkOrderFormState } from './composables/useWorkOrderForm';
import { ElMessageBox, ElMessage } from 'element-plus';
import { workOrdersApi } from '@/api';

// Define Props
interface WorkOrderFilter {
  status: string;
  regionId: string;
  serviceTypeId: string;
  keyword: string;
}

interface WorkOrderStats {
  pending: number;
  received: number;
  total: number;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

interface WorkOrderFormExpose {
  validate: () => Promise<boolean>;
  clearValidate: () => void;
}

interface Props {
  loading: boolean;
  workOrders: WorkOrder[];
  filter: WorkOrderFilter;
  pagination: Pagination;
  stats: WorkOrderStats;
  formState: WorkOrderFormState;
}

const props = defineProps<Props>();

// Define Emits
const emit = defineEmits<{
  (e: 'create'): void;
  (e: 'edit', row: WorkOrder): void;
  (e: 'delete', row: WorkOrder): void;
  (e: 'receive', row: WorkOrder): void;
  (e: 'transfer', row: WorkOrder): void;
  (e: 'complete', row: WorkOrder): void;
  (e: 'cancelReceive', row: WorkOrder): void;
  (e: 'rowClick', row: WorkOrder): void;
  (e: 'pageChange', page: number): void;
  (e: 'sizeChange', size: number): void;
  (e: 'resetFilters'): void;
}>();

const authStore = useAuthStore();
const baseDataStore = useBaseDataStore();
const { has: hasPermission } = usePermission();

const workOrderFormRef = ref<WorkOrderFormExpose | null>(null);

// Alias reactive props so v-model binds to local names (parent holds the same reactive objects by reference)
const localFilter = props.filter;
const localPagination = props.pagination;
const localFormState = props.formState;

const hasActiveFilters = computed(() => {
  return props.filter.status !== '' || props.filter.serviceTypeId !== '' || props.filter.regionId !== '' || props.filter.keyword !== '';
});

const canReceive = computed(() => hasPermission('workOrder:receive'));

async function handleCancelReceive(row: WorkOrder) {
  try {
    await ElMessageBox.confirm(
      '确定要取消接收这个工单吗？工单将重新变为待接收状态。',
      '确认取消接收',
      { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
    );
    emit('cancelReceive', row);
  } catch {
    // cancelled
  }
}

async function handleDelete(row: WorkOrder) {
  try {
    await ElMessageBox.confirm('确定要删除这个工单吗？', '提示', { type: 'warning' });
    await workOrdersApi.delete(row.id);
    ElMessage.success('删除成功');
    emit('delete', row);
  } catch {
    // cancelled
  }
}

function getStatusClass(status: string) {
  return {
    pending: status === 'PENDING',
    received: status === 'RECEIVED',
    completed: status === 'COMPLETED',
  };
}

function formatDate(date: string) {
  return dayjs(date).format('MM/DD HH:mm');
}

function tableRowClassName({ row: _row }: { row: WorkOrder }) {
  // If we want to support highlighting new rows, we'd need to pass that state down too.
  // For now simple stripping.
  return '';
}

async function handleDialogSubmit() {
  if (!workOrderFormRef.value) return;
  
  const valid = await workOrderFormRef.value.validate().catch(() => false);
  if (valid) {
    await props.formState.submit();
  }
}

// Draggable Headers Logic
onMounted(() => {
  const el = document.querySelector('.work-order-table .el-table__header-wrapper tr');
  if (el) {
    Sortable.create(el as HTMLElement, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      onEnd: (_evt) => {
        // Handle column reordering if needed (persisting or internal state)
      }
    });
  }
});

</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h2 {
  margin: 0;
  font-size: 24px;
  color: var(--text-primary);
  font-weight: 600;
}

.stats-tag {
  display: flex;
  gap: 8px;
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px 24px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-item {
  width: 160px;
}

.filter-search {
  width: 240px;
}

.filter-actions {
  margin-left: auto;
}

.work-order-table {
  width: 100%;
  margin-bottom: 24px;
}

.status-tag {
  /* 使用全局 .status-tag（定义于 style.css），此处保留 class 绑定兼容 */
}

.cell-info {
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.cell-info .time {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.action-buttons {
  display: flex;
  gap: 2px;
  flex-wrap: nowrap;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.loading-container {
    padding: 24px;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}
</style>
