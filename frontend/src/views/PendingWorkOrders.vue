<template>
  <div class="pending-work-orders-container">
    <component 
      :is="isMobile ? MobilePendingOrders : DesktopPendingOrders"
      :loading="loading"
      :work-orders="workOrders"
      :filter="filter"
      :pagination="pagination"
      :stats="stats"
      :form-state="formState"
      @create="handleCreate"
      @edit="handleEdit"
      @delete="handleDelete"
      @receive="handleReceive"
      @transfer="handleTransfer"
      @complete="handleComplete"
      @cancel-receive="handleCancelReceive"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @reset-filters="resetFilters"
      @row-click="handleRowClick"
      @refresh="handleRefresh"
    />

    <!-- 完成工单弹窗 - Mobile -->
    <van-popup
      v-if="isMobile"
      v-model:show="showCompleteDialog"
      position="bottom"
      round
      :style="{ padding: '20px' }"
    >
      <h3 style="text-align: center; margin-bottom: 20px;">完成工单</h3>
      <div style="margin-bottom: 20px;">
        <div style="margin-bottom: 8px; font-size: 14px; color: var(--text-secondary);">协作人 (可选)</div>
        <el-select 
          v-model="collaboratorIds" 
          multiple 
          filterable 
          :reserve-keyword="false"
          placeholder="请选择协作人"
          style="width: 100%"
          size="large"
        >
          <el-option 
            v-for="u in baseDataStore.users.filter(u => u.role?.code === 'engineer')" 
            :key="u.id" 
            :label="u.name" 
            :value="u.id"
          />
        </el-select>
      </div>
      <van-button block type="primary" :loading="completeSubmitting" @click="confirmComplete">
        确认完成
      </van-button>
    </van-popup>

    <!-- 完成工单模态框 - Desktop -->
    <el-dialog
      v-else
      v-model="showCompleteDialog"
      title="完成工单"
      width="500px"
      append-to-body
    >
      <el-form>
        <el-form-item label="协作人">
          <el-select 
            v-model="collaboratorIds" 
            multiple 
            filterable 
            :reserve-keyword="false"
            placeholder="选择协作人（可选）"
            style="width: 100%"
          >
            <el-option 
              v-for="u in baseDataStore.users.filter(u => u.role?.code === 'engineer')" 
              :key="u.id" 
              :label="u.name" 
              :value="u.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCompleteDialog = false">取消</el-button>
          <el-button type="primary" :loading="completeSubmitting" @click="confirmComplete">
            确认完成
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Popup as VanPopup, Button as VanButton } from 'vant';
import type { WorkOrder } from '@/types';
import { useResponsive } from '@/composables';
import { useSSE } from '@/composables/useSSE';
import { useBaseDataStore } from '@/stores/baseData';
import { workOrdersApi } from '@/api';

import { useWorkOrderFilter } from './pending-work-orders/composables/useWorkOrderFilter';
import { useWorkOrderForm } from './pending-work-orders/composables/useWorkOrderForm';
import DesktopPendingOrders from './pending-work-orders/DesktopPendingOrders.vue';
import MobilePendingOrders from './pending-work-orders/MobilePendingOrders.vue';

const { isMobile } = useResponsive();
const baseDataStore = useBaseDataStore();
const sse = useSSE();

// Initialize Composables
const { 
  loading, 
  workOrders, 
  filter, 
  stats, 
  pagination, 
  fetchData, 
  fetchStats, 
  handlePageChange, 
  handleSizeChange, 
  resetFilters 
} = useWorkOrderFilter();

const formState = useWorkOrderForm(() => {
  // On form success
  fetchData();
  fetchStats();
});

// Since we need to pass the whole formState object to child components, we keep it as is.
// But we can destructure methods we need locally if any.
const { openCreate, openEdit } = formState;

// Logic for "Complete" action (still kept here as it's simple enough not to need a composable yet)
const showCompleteDialog = ref(false);
const completeSubmitting = ref(false);
const completingWorkOrder = ref<WorkOrder | null>(null);
const collaboratorIds = ref<string[]>([]);

function handleCreate() {
  openCreate();
}

function handleEdit(wo: WorkOrder) {
  openEdit(wo);
}

function handleRowClick(row: WorkOrder) {
  // Optional: functionality for row click
}

async function handleReceive(wo: WorkOrder) {
  try {
    await workOrdersApi.receive(wo.id);
    ElMessage.success('接收成功');
    fetchData(true);
    fetchStats();
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '接收失败');
  }
}

async function handleTransfer(wo: WorkOrder) {
  try {
    await ElMessageBox.confirm(
      `该工单已被 ${wo.receiver?.name || '其他人'} 接收，确定要转接到自己名下吗？`, 
      '确认转接', 
      { confirmButtonText: '确认转接', cancelButtonText: '取消', type: 'warning' }
    );
    await workOrdersApi.receive(wo.id);
    ElMessage.success('转接成功');
    fetchData(true);
    fetchStats();
  } catch {
    // cancelled
  }
}

function handleComplete(wo: WorkOrder) {
  completingWorkOrder.value = wo;
  collaboratorIds.value = [];
  showCompleteDialog.value = true;
}

async function confirmComplete() {
  if (!completingWorkOrder.value) return;
  
  completeSubmitting.value = true;
  try {
    await workOrdersApi.complete(completingWorkOrder.value.id, {
      collaboratorIds: collaboratorIds.value,
    });
    ElMessage.success('完成成功');
    showCompleteDialog.value = false;
    fetchData(true);
    fetchStats();
  } catch {
    ElMessage.error('操作失败');
  } finally {
    completeSubmitting.value = false;
  }
}

async function handleCancelReceive(wo: WorkOrder) {
  try {
    await ElMessageBox.confirm(
      '确定要取消接收这个工单吗？工单将重新变为待接收状态。', 
      '确认取消接收', 
      { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
    );
    await workOrdersApi.cancelReceive(wo.id);
    ElMessage.success('已取消接收');
    fetchData(true);
    fetchStats();
  } catch {
    // cancelled
  }
}

async function handleDelete(wo: WorkOrder) {
  try {
    await ElMessageBox.confirm('确定要删除这个工单吗？', '提示', { type: 'warning' });
    await workOrdersApi.delete(wo.id);
    ElMessage.success('删除成功');
    fetchData(true);
    fetchStats();
  } catch {
  }
}

async function handleRefresh(done: () => void) {
  try {
    await fetchData(true);
  } finally {
    done();
  }
}

// Lifecycle and SSE
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  fetchData();
  fetchStats();
  baseDataStore.fetchRegions();
  
  sse.connect();
  sse.on('workOrder:update', () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchData(true); // silent update
      fetchStats();
    }, 1000);
  });
});

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
  sse.disconnect();
});
</script>
