<template>
  <div class="pending-work-orders-mobile">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <h2>待办工单</h2>
        <div class="stats-tag" v-if="stats.total > 0">
           <span class="stat-item danger" v-if="stats.pending > 0">待:{{ stats.pending }}</span>
           <span class="stat-item warning" v-if="stats.received > 0">处理:{{ stats.received }}</span>
        </div>
      </div>
      <div class="header-actions">
        <!-- 筛选按钮 -->
        <div class="filter-btn-wrapper" @click="showFilterDrawer = true">
          <el-badge :is-dot="hasActiveFilters" class="filter-badge">
             <van-icon name="filter-o" size="24" />
          </el-badge>
        </div>
        <el-button type="primary" circle :icon="Plus" @click="emit('create')" />
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 列表视图 -->
    <van-pull-refresh v-else v-model="refreshing" @refresh="onRefresh" class="pull-refresh-container">
      <div class="card-list">
        <transition-group name="list">
          <WorkOrderCard
            v-for="wo in workOrders"
            :key="wo.id"
            :work-order="wo"
            :show-actions="true"
            @receive="emit('receive', wo)"
            @complete="emit('complete', wo)"
            @edit="emit('edit', wo)"
            @delete="emit('delete', wo)"
            @cancel-receive="emit('cancelReceive', wo)"
          />
        </transition-group>
        <el-empty v-if="workOrders.length === 0" description="暂无待办工单" />
      </div>
    </van-pull-refresh>
    
    <!-- 筛选抽屉 -->
    <van-popup
      v-model:show="showFilterDrawer"
      position="bottom"
      :style="{ maxHeight: '85%', borderRadius: '24px 24px 0 0' }"
      :close-on-click-overlay="true"
    >
      <div class="van-filter-drawer">
        <div class="van-drawer-header">
          <h3>筛选工单</h3>
          <van-icon name="cross" @click="showFilterDrawer = false" />
        </div>
        <div class="van-drawer-body">
          <div class="filter-section">
            <div class="filter-label">工单状态</div>
            <div class="filter-options">
              <van-button 
                :type="filter.status === '' ? 'primary' : 'default'"
                size="small"
                @click="filter.status = ''"
              >
                全部
              </van-button>
              <van-button 
                :type="filter.status === 'PENDING' ? 'primary' : 'default'"
                size="small"
                @click="filter.status = 'PENDING'"
              >
                待接收
              </van-button>
              <van-button 
                :type="filter.status === 'RECEIVED' ? 'primary' : 'default'"
                size="small"
                @click="filter.status = 'RECEIVED'"
              >
                已接收
              </van-button>
            </div>
          </div>

          <div class="filter-section">
            <div class="filter-label">服务类型</div>
            <div class="filter-options">
              <van-button 
                :type="filter.serviceTypeId === '' ? 'primary' : 'default'"
                size="small"
                @click="filter.serviceTypeId = ''"
              >
                全部
              </van-button>
              <van-button 
                v-for="s in baseDataStore.serviceTypes"
                :key="s.id"
                :type="filter.serviceTypeId === s.id ? 'primary' : 'default'"
                size="small"
                @click="filter.serviceTypeId = s.id"
              >
                {{ s.name }}
              </van-button>
            </div>
          </div>

          <div class="filter-section">
            <div class="filter-label">所属区域</div>
            <div class="filter-options">
              <van-button 
                :type="filter.regionId === '' ? 'primary' : 'default'"
                size="small"
                @click="filter.regionId = ''"
              >
                全部
              </van-button>
              <van-button 
                v-for="r in baseDataStore.regions"
                :key="r.id"
                :type="filter.regionId === r.id ? 'primary' : 'default'"
                size="small"
                @click="filter.regionId = r.id"
              >
                {{ r.name }}
              </van-button>
            </div>
          </div>

          <div class="filter-section">
            <div class="filter-label">关键字</div>
            <van-search
              v-model="filter.keyword"
              placeholder="搜索客户、内容..."
              shape="round"
              background="#f7f8fa"
              show-action
            >
              <template #action>
                <div @click="filter.keyword = ''">清空</div>
              </template>
            </van-search>
          </div>
        </div>
        <div class="van-drawer-footer">
          <van-button block @click="emit('resetFilters')">重置</van-button>
          <van-button block type="primary" @click="showFilterDrawer = false">完成</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 新建/编辑工单抽屉 -->
    <el-drawer
      :model-value="formState.showDialog.value"
      @update:model-value="(val) => formState.showDialog.value = val"
      :title="formState.editingWorkOrder.value ? '编辑工单' : '新建工单'"
      direction="btt"
      size="85%"
      class="create-drawer"
      :lock-scroll="true"
      :close-on-press-escape="false"
      @closed="workOrderFormRef?.clearValidate()"
    >
      <div class="drawer-content">
        <WorkOrderForm
          ref="workOrderFormRef"
          :model-value="formState.form"
          :rules="formState.formRules"
          :customers="formState.filteredCustomers.value"
          :on-search="formState.customerFilterMethod"
          :is-mobile="true"
        />
        <div class="drawer-footer">
          <el-button @click="formState.showDialog.value = false">取消</el-button>
          <el-button type="primary" :loading="formState.submitting.value" @click="handleDrawerSubmit">
            {{ formState.editingWorkOrder.value ? '保存' : '创建' }}
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { Button as VanButton, Popup as VanPopup, Icon as VanIcon, Search as VanSearch, PullRefresh as VanPullRefresh } from 'vant';
import type { WorkOrder } from '@/types';
import { useBaseDataStore } from '@/stores/baseData';
import WorkOrderCard from '@/components/workorder/WorkOrderCard.vue';
import WorkOrderForm from './components/WorkOrderForm.vue';

// Define Props
interface Props {
  loading: boolean;
  workOrders: WorkOrder[];
  filter: any;
  stats: any;
  formState: any; 
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
  (e: 'resetFilters'): void;
  (e: 'refresh', done: () => void): void;
}>();

const baseDataStore = useBaseDataStore();
const showFilterDrawer = ref(false);
const workOrderFormRef = ref();

const hasActiveFilters = computed(() => {
  return props.filter.status !== '' || props.filter.serviceTypeId !== '' || props.filter.keyword !== '';
});

async function handleDrawerSubmit() {
  if (!workOrderFormRef.value) return;
  
  await workOrderFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      await props.formState.submit();
    }
  });
}

const refreshing = ref(false);

function onRefresh() {
  emit('refresh', () => {
    refreshing.value = false;
  });
}
</script>

<style scoped>
.pending-work-orders-mobile {
  padding-bottom: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
  padding-top: var(--safe-area-top);
}

.header-left h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-btn-wrapper {
  padding: 8px;
}

.stats-tag {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.stat-item {
  border-radius: 4px;
  padding: 2px 6px;
  color: white;
}
.stat-item.danger { background: var(--el-color-danger); }
.stat-item.warning { background: var(--el-color-warning); }

.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pull-refresh-container {
  min-height: calc(100vh - 120px);
}

/* Vant Drawer Styles */
.van-filter-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.van-drawer-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color-light);
}

.van-drawer-header h3 {
  margin: 0;
  font-size: 18px;
}

.van-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.van-drawer-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color-light);
  display: flex;
  gap: 12px;
}

/* Drawer Content */
.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 20px 20px;
}

.drawer-footer {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
}
</style>
