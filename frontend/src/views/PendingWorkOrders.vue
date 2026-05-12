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

    <!-- 完成工单模态框 - Desktop -->
    <el-dialog
      v-model="showCompleteDialog"
      title="完成工单"
      width="500px"
      append-to-body
    >
      <el-form>
        <!-- 同区域工程师快捷选择 -->
        <el-form-item label="同区域工程师">
          <el-checkbox-group v-model="sameRegionEngineerIds">
            <el-checkbox 
              v-for="engineer in sameRegionEngineers" 
              :key="engineer.id" 
              :value="engineer.id"
            >
              {{ engineer.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <!-- 协作人选择 -->
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
        
        <!-- 维修费记录 -->
        <el-form-item label="维修费">
          <el-input 
            v-model.number="repairFee" 
            type="number" 
            placeholder="输入维修费用（可选）"
            style="width: 100%"
            :min="0"
            step="0.01"
          />
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
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { WorkOrder } from '@/types';
import { useResponsive } from '@/composables';
import { useSSE } from '@/composables/useSSE';
import { useBaseDataStore } from '@/stores/baseData';
import { useAuthStore } from '@/stores/auth';
import { workOrdersApi } from '@/api';

import { useWorkOrderFilter } from './pending-work-orders/composables/useWorkOrderFilter';
import { useWorkOrderForm } from './pending-work-orders/composables/useWorkOrderForm';
const DesktopPendingOrders = defineAsyncComponent(() => import('./pending-work-orders/DesktopPendingOrders.vue'));
const MobilePendingOrders = defineAsyncComponent(() => import('./pending-work-orders/MobilePendingOrders.vue'));

const { isMobile } = useResponsive();
const baseDataStore = useBaseDataStore();
const authStore = useAuthStore();
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
const sameRegionEngineerIds = ref<string[]>([]);
const repairFee = ref<number | undefined>(undefined);

// 获取同区域工程师列表
const sameRegionEngineers = computed(() => {
  const currentRegionId = completingWorkOrder.value?.regionId;
  if (!currentRegionId) return [];
  return baseDataStore.users.filter(
    u => u.role?.code === 'engineer' && 
         u.regionId === currentRegionId && 
         u.id !== authStore.user?.id
  );
});

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

async function handleComplete(wo: WorkOrder, collaborators: string[] = [], fee?: number) {
  completingWorkOrder.value = wo;
  collaboratorIds.value = collaborators;
  repairFee.value = fee;
  sameRegionEngineerIds.value = [];
  
  if (isMobile.value) {
    // Mobile: 直接完成，因为气泡弹窗已经收集了协作人信息
    completeSubmitting.value = true;
    try {
      await workOrdersApi.complete(wo.id, {
        collaboratorIds: collaborators,
        repairFee: fee,
      });
      ElMessage.success('完成成功');
      fetchData(true);
      fetchStats();
    } catch {
      ElMessage.error('操作失败');
    } finally {
      completeSubmitting.value = false;
    }
  } else {
    // Desktop: 显示对话框
    showCompleteDialog.value = true;
  }
}

async function confirmComplete() {
  if (!completingWorkOrder.value) return;
  
  // 合并同区域工程师和手动选择的协作人
  const allCollaboratorIds = [...new Set([...sameRegionEngineerIds.value, ...collaboratorIds.value])];
  
  completeSubmitting.value = true;
  try {
    await workOrdersApi.complete(completingWorkOrder.value.id, {
      collaboratorIds: allCollaboratorIds,
      repairFee: repairFee.value,
    });
    ElMessage.success('完成成功');
    showCompleteDialog.value = false;
    sameRegionEngineerIds.value = [];
    collaboratorIds.value = [];
    repairFee.value = undefined;
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
    await workOrdersApi.cancelReceive(wo.id);
    ElMessage.success('已取消接收');
    fetchData(true);
    fetchStats();
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '取消接收失败');
  }
}

function handleDelete() {
  fetchData(true);
  fetchStats();
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
  sse.on('work-order.updated', () => {
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
