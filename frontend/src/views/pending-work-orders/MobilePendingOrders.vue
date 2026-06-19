<template>
  <div class="pending-work-orders-mobile">
    <!-- 页面标题和操作栏 -->
    <div class="m-page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-row-top">
            <h2>待办工单</h2>
            <!-- 数量统计 -->
            <div class="stats-tag" v-if="stats.total > 0">
              <span class="stat-item danger" v-if="stats.pending > 0">待:{{ stats.pending }}</span>
              <span class="stat-item warning" v-if="stats.received > 0">处理:{{ stats.received }}</span>
            </div>
          </div>
          <!-- 滑动筛选条 -->
          <div class="filter-bar-inline">
            <div class="filter-bar-container">
              <div 
                class="filter-item" 
                :class="{ active: filter.status === '' }"
                @click="filter.status = ''"
                title="全部工单"
              >
                全部
              </div>
              <div 
                class="filter-item" 
                :class="{ active: filter.status === 'PENDING' }"
                @click="filter.status = 'PENDING'"
                title="待接收工单"
              >
                待接
              </div>
              <div 
                class="filter-item" 
                :class="{ active: filter.status === 'RECEIVED' }"
                @click="filter.status = 'RECEIVED'"
                title="已接收工单"
              >
                已接
              </div>
              <div 
                class="filter-item more-filter"
                @click="toggleFilterPopup"
                title="更多筛选选项"
              >
                更多
                <van-icon name="arrow-down" size="12" />
              </div>
            </div>
          </div>
        </div>
        <div class="header-right">
          <el-button type="primary" circle :icon="Plus" @click="emit('create')" />
        </div>
      </div>
      
      <!-- 气泡筛选弹窗 -->
      <div 
        v-if="showFilterPopup" 
        class="filter-bubble-popup"
        @click.self="showFilterPopup = false"
      >
        <div class="bubble-content">
          <div class="bubble-header">
            <h4>筛选工单</h4>
            <van-icon name="cross" @click="showFilterPopup = false" />
          </div>
          <div class="bubble-body">
            <div class="bubble-filter-section">
              <div class="bubble-filter-label">服务类型</div>
              <div class="bubble-filter-options">
                <van-button 
                  :type="filter.serviceTypeId === '' ? 'primary' : 'default'"
                  size="small"
                  @click="filter.serviceTypeId = ''"
                >全部</van-button>
                <van-button 
                  v-for="s in baseDataStore.serviceTypes"
                  :key="s.id"
                  :type="filter.serviceTypeId === s.id ? 'primary' : 'default'"
                  size="small"
                  @click="filter.serviceTypeId = s.id"
                >{{ s.name }}</van-button>
              </div>
            </div>
            <div class="bubble-filter-section">
              <div class="bubble-filter-label">所属区域</div>
              <div class="bubble-filter-options">
                <van-button 
                  :type="filter.regionId === '' ? 'primary' : 'default'"
                  size="small"
                  @click="filter.regionId = ''"
                >全部</van-button>
                <van-button 
                  v-for="r in baseDataStore.regions"
                  :key="r.id"
                  :type="filter.regionId === r.id ? 'primary' : 'default'"
                  size="small"
                  @click="filter.regionId = r.id"
                >{{ r.name }}</van-button>
              </div>
            </div>
            <div class="bubble-filter-section">
              <div class="bubble-filter-label">关键字</div>
              <van-search
                v-model="filter.keyword"
                placeholder="搜索客户、内容..."
                shape="round"
                background="var(--bg-color-page)"
                show-action
              >
                <template #action>
                  <div @click="filter.keyword = ''">清空</div>
                </template>
              </van-search>
            </div>
          </div>
          <div class="bubble-footer">
            <van-button block size="small" @click="emit('resetFilters')">重置</van-button>
            <van-button block size="small" type="primary" @click="showFilterPopup = false">完成</van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选状态显示 -->
    <div v-if="hasActiveFilters" class="filter-status">
      <div class="filter-status-content">
        <div v-if="filter.status" class="filter-tag">
          {{ filter.status === 'PENDING' ? '待接收' : '已接收' }}
          <van-icon name="cross" size="14" @click="filter.status = ''" />
        </div>
        <div v-if="filter.serviceTypeId" class="filter-tag">
          {{ getServiceTypeName(filter.serviceTypeId) }}
          <van-icon name="cross" size="14" @click="filter.serviceTypeId = ''" />
        </div>
        <div v-if="filter.regionId && !isDefaultRegion" class="filter-tag">
          {{ getRegionName(filter.regionId) }}
          <van-icon name="cross" size="14" @click="filter.regionId = ''" />
        </div>
        <div v-if="filter.keyword" class="filter-tag">
          关键词: {{ filter.keyword }}
          <van-icon name="cross" size="14" @click="filter.keyword = ''" />
        </div>
        <div class="filter-tag clear-all" @click="emit('resetFilters')">
          清除全部
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 列表视图 -->
    <van-pull-refresh v-else v-model="refreshing" @refresh="onRefresh" class="pull-refresh-container">
      <van-list
        v-model:loading="listLoading"
        :finished="listFinished"
        :finished-text="workOrders.length === 0 ? '' : '没有更多了'"
        @load="onLoad"
      >
        <div class="card-list">
          <transition-group name="list">
            <WorkOrderCard
              v-for="wo in workOrders"
              :key="wo.id"
              :work-order="wo"
              :show-actions="true"
              @receive="emit('receive', wo)"
              @complete="(wo, collaborators, fee) => emit('complete', wo, collaborators, fee)"
              @edit="emit('edit', wo)"
              @delete="emit('delete', wo)"
              @cancel-receive="emit('cancelReceive', wo)"
            />
          </transition-group>
          <el-empty v-if="workOrders.length === 0 && !listLoading" description="暂无待办工单" />
        </div>
      </van-list>
    </van-pull-refresh>
    
    <!-- 新建/编辑工单抽屉 -->
    <el-drawer
      :model-value="formState.showDialog.value"
      @update:model-value="(val) => formState.showDialog.value = val"
      direction="btt"
      size="85%"
      class="create-drawer"
      :lock-scroll="true"
      :close-on-press-escape="false"
      @closed="workOrderFormRef?.clearValidate()"
    >
      <div class="drawer-content">
        <!-- 顶部标题栏 -->
        <div class="drawer-header">
          <span class="drawer-title">{{ formState.editingWorkOrder.value ? '编辑工单' : '新建工单' }}</span>
        </div>
        
        <!-- 表单内容区域（可滚动） -->
        <div class="drawer-body">
          <WorkOrderForm
            ref="workOrderFormRef"
            :model-value="formState.form"
            :rules="formState.formRules"
            :customers="formState.filteredCustomers.value"
            :on-search="formState.customerFilterMethod"
            :is-mobile="true"
          />
        </div>
        
        <!-- 底部操作栏 -->
        <div class="drawer-footer">
          <el-button 
            size="large"
            @click="formState.showDialog.value = false"
          >
            取消
          </el-button>
          <el-button 
            type="primary" 
            size="large"
            :loading="formState.submitting.value" 
            @click="handleDrawerSubmit"
          >
            {{ formState.editingWorkOrder.value ? '保存' : '创建' }}
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { Button as VanButton, Icon as VanIcon, Search as VanSearch, PullRefresh as VanPullRefresh, List as VanList } from 'vant';
import type { WorkOrder } from '@/types';
import { useBaseDataStore } from '@/stores/baseData';
import { useAuthStore } from '@/stores/auth';
import WorkOrderCard from '@/components/workorder/WorkOrderCard.vue';
import WorkOrderForm from './components/WorkOrderForm.vue';

// Define Props
interface Props {
  loading: boolean;
  workOrders: WorkOrder[];
  filter: any;
  stats: any;
  formState: any; 
  pagination: any;
}

const props = defineProps<Props>();

// Define Emits
const emit = defineEmits<{
  (e: 'create'): void;
  (e: 'edit', row: WorkOrder): void;
  (e: 'delete', row: WorkOrder): void;
  (e: 'receive', row: WorkOrder): void;
  (e: 'complete', row: WorkOrder): void;
  (e: 'cancelReceive', row: WorkOrder): void;
  (e: 'resetFilters'): void;
  (e: 'refresh', done: () => void): void;
  (e: 'pageChange', page: number): void;
}>();

const baseDataStore = useBaseDataStore();
const authStore = useAuthStore();
const showFilterPopup = ref(false);
const workOrderFormRef = ref();

function toggleFilterPopup() {
  showFilterPopup.value = !showFilterPopup.value;
}

// Check if current region is the engineer's default region
const isDefaultRegion = computed(() => {
  if (authStore.roleCode !== 'engineer') return false;
  return props.filter.regionId === authStore.user?.regionId;
});

const hasActiveFilters = computed(() => {
  return props.filter.status !== '' || props.filter.serviceTypeId !== '' || props.filter.keyword !== '' || 
         (props.filter.regionId !== '' && !isDefaultRegion.value);
});

// 获取服务类型名称
function getServiceTypeName(id: string): string {
  const serviceType = baseDataStore.serviceTypes.find(s => s.id === id);
  return serviceType?.name || '服务类型';
}

// 获取区域名称
function getRegionName(id: string): string {
  const region = baseDataStore.regions.find(r => r.id === id);
  return region?.name || '区域';
}

async function handleDrawerSubmit() {
  if (!workOrderFormRef.value) return;
  
  const valid = await workOrderFormRef.value.validate().catch(() => false);
  if (valid) {
    await props.formState.submit();
  }
}

const refreshing = ref(false);
const listLoading = ref(false);
const listFinished = computed(() => {
  if (!props.pagination || props.pagination.total === 0) return true;
  return props.pagination.page * props.pagination.pageSize >= props.pagination.total;
});

// 实时筛选功能
let filterTimeout: ReturnType<typeof setTimeout> | null = null;

watch(() => props.filter, () => {
  // 防抖处理，避免频繁触发筛选
  if (filterTimeout) clearTimeout(filterTimeout);
  filterTimeout = setTimeout(() => {
    emit('pageChange', 1);
    emit('refresh', () => {});
  }, 300);
}, { deep: true });

function onLoad() {
  if (!listFinished.value) {
    emit('pageChange', props.pagination.page + 1);
  }
  setTimeout(() => {
    listLoading.value = false;
  }, 100);
}

function onRefresh() {
  emit('pageChange', 1);
  emit('refresh', () => {
    refreshing.value = false;
  });
}
</script>

<style scoped>
.pending-work-orders-mobile {
  padding-bottom: 20px;
}

.m-page-header {
  padding: 0 16px;
  padding-top: var(--safe-area-top);
  position: relative;
}

.header-content {
  display: flex;
  align-items: stretch;
  gap: 12px;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.header-left h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  padding: 8px 0 4px;
}

.header-row-top {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 4px;
}

.header-row-top h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  padding: 8px 0 4px;
}

.stats-tag {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.stat-item {
  border-radius: 4px;
  padding: 2px 6px;
  color: var(--card-bg);
  font-size: 12px;
}

.stat-item.danger { background: var(--el-color-danger); }
.stat-item.warning { background: var(--el-color-warning); }

.header-right {
  display: flex;
  align-items: center;
}

.filter-bar-inline {
  flex: 1;
  max-width: 200px;
  overflow: hidden;
}

.filter-bar-container {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-bar-container::-webkit-scrollbar {
  display: none;
}

.filter-item {
  flex-shrink: 0;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: var(--bg-color-page);
  font-size: 11px;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  white-space: nowrap;
}

.filter-item:hover {
  background-color: var(--border-color-lighter);
}

.filter-item.active {
  background-color: var(--primary-color);
  color: var(--card-bg);
}

.filter-item.more-filter {
  display: flex;
  align-items: center;
  gap: 2px;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  background-color: transparent;
}

.filter-item.more-filter:hover {
  background-color: rgba(var(--primary-rgb), 0.1);
}

/* 气泡筛选弹窗 */
.filter-bubble-popup {
  position: absolute;
  top: 100%;
  left: 16px;
  right: 16px;
  z-index: 100;
  margin-top: 8px;
}

 .bubble-content {
   background: var(--card-bg);
   border-radius: 12px;
   box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
   overflow: hidden;
   animation: bubbleFadeIn 0.2s ease;
 }

 .bubble-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color-lighter);
}

.bubble-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.bubble-header .van-icon {
  font-size: 18px;
  color: var(--text-tertiary);
  cursor: pointer;
}

.bubble-body {
  padding: 12px 16px;
}

.bubble-filter-section {
  margin-bottom: 16px;
}

.bubble-filter-section:last-child {
  margin-bottom: 0;
}

.bubble-filter-label {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-bottom: 8px;
}

.bubble-filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.bubble-footer {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color-lighter);
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pull-refresh-container {
  min-height: calc(100vh - 120px);
}

/* 筛选状态显示样式 */
.filter-status {
  padding: 0 16px 12px;
}

.filter-status-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  background-color: rgba(var(--primary-rgb), 0.1);
  color: var(--primary-color);
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.filter-tag:hover {
  background-color: rgba(var(--primary-rgb), 0.2);
}

.filter-tag.clear-all {
  background-color: var(--bg-color-page);
  color: var(--text-secondary);
}

.filter-tag.clear-all:hover {
  background-color: var(--border-color-lighter);
}

/* 覆盖 el-drawer 默认样式 */
:deep(.create-drawer) {
  .el-drawer__header {
    display: none !important;
  }
  
  .el-drawer__body {
    padding: 0 !important;
    overflow: hidden !important;
  }
  
  .el-drawer__container {
    outline: none;
  }
}

/* Drawer Content */
.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  background-color: var(--card-bg);
  border-radius: 16px 16px 0 0;
  overflow: hidden;
}

/* 顶部标题栏 */
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px 8px;
  padding-top: calc(8px + var(--safe-area-top));
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color-lighter);
  position: sticky;
  top: 0;
  z-index: 10;
  min-height: 48px;
}

.drawer-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 表单内容区域 */
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  background-color: var(--bg-color-page);
}

/* 底部操作栏 */
.drawer-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 16px;
  padding-bottom: calc(12px + var(--safe-area-bottom));
  background: var(--card-bg);
  border-top: 1px solid var(--border-color-lighter);
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.drawer-footer .el-button {
  min-width: 88px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
}

.drawer-footer .el-button--default {
  color: var(--text-secondary);
  border-color: var(--border-color);
}

.drawer-footer .el-button--primary {
  background: var(--primary-color);
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.3);
}


</style>
