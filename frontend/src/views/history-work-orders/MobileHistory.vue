<template>
  <div>
    <!-- 悬浮筛选按钮 -->
    <teleport to="body">
      <div class="mobile-filter-fab" @click="showFilterDrawer = true">
        <el-badge :is-dot="hasActiveFilters" class="filter-badge">
          <el-button type="primary" circle :icon="Filter" size="large" class="fab-button" />
        </el-badge>
      </div>
    </teleport>

    <!-- 筛选抽屉 -->
    <el-drawer
      v-model="showFilterDrawer"
      title="高级筛选"
      direction="btt"
      size="auto"
      custom-class="mobile-filter-drawer"
    >
      <div class="drawer-content">
        <el-form label-position="top">
          <el-form-item label="工单状态">
            <el-checkbox-group v-model="filter.statuses" class="filter-tag-group">
              <el-checkbox-button label="PENDING">待接收</el-checkbox-button>
              <el-checkbox-button label="RECEIVED">已接收</el-checkbox-button>
              <el-checkbox-button label="COMPLETED">已完成</el-checkbox-button>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="所属区域">
            <el-radio-group v-model="filter.regionId" class="filter-tag-group">
              <el-radio-button label="" :value="undefined">全部</el-radio-button>
              <el-radio-button 
                v-for="r in baseDataStore.regions" 
                :key="r.id" 
                :label="r.name" 
                :value="r.id" 
              />
            </el-radio-group>
          </el-form-item>
          <el-form-item label="服务类型">
            <el-radio-group v-model="filter.serviceTypeId" class="filter-tag-group">
              <el-radio-button label="" :value="undefined">全部</el-radio-button>
              <el-radio-button 
                v-for="s in baseDataStore.serviceTypes" 
                :key="s.id" 
                :label="s.name" 
                :value="s.id" 
              />
            </el-radio-group>
          </el-form-item>
          <el-form-item label="完成人">
            <div class="my-orders-btn">
              <el-button 
                :type="isMyOrders ? 'primary' : 'default'" 
                @click="$emit('toggleMyOrders')"
                style="width: 100%"
              >
                我的工单
              </el-button>
            </div>
            <el-select 
              v-model="filter.completerId" 
              placeholder="选择完成人" 
              clearable 
              filterable 
              style="width: 100%"
            >
              <el-option label="全部" :value="undefined" />
              <el-option 
                v-for="u in allCompleters" 
                :key="u.id" 
                :label="u.name" 
                :value="u.id" 
              />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="localDateRange"
              type="daterange"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="搜索关键字">
            <el-input 
              v-model="filter.keyword" 
              placeholder="搜索客户/详情..."
              :prefix-icon="Search"
              clearable
            />
          </el-form-item>
        </el-form>
        <div class="drawer-footer">
          <el-button @click="$emit('resetFilters')">重置</el-button>
          <el-button type="primary" @click="showFilterDrawer = false">完成</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- 卡片列表 -->
    <div v-else class="card-list">
      <WorkOrderCard
        v-for="wo in workOrders"
        :key="wo.id"
        :work-order="wo"
        :show-actions="false"
      />
      <el-empty v-if="workOrders.length === 0" description="暂无历史工单" />
      
      <!-- 加载更多 -->
      <div v-if="hasMore" class="load-more">
        <el-button text :loading="loadingMore" @click="$emit('loadMore')">
          加载更多
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Filter, Search } from '@element-plus/icons-vue';
import type { WorkOrder, WorkOrderFilterParams, User as UserType } from '@/types';
import { useBaseDataStore } from '@/stores/baseData';
import WorkOrderCard from '@/components/workorder/WorkOrderCard.vue';

const baseDataStore = useBaseDataStore();
const showFilterDrawer = ref(false);

const props = defineProps<{
  loading: boolean;
  loadingMore: boolean;
  workOrders: WorkOrder[];
  filter: WorkOrderFilterParams;
  dateRange: [string, string] | null;
  hasActiveFilters: boolean;
  isMyOrders: boolean;
  hasMore: boolean;
  allCompleters: UserType[];
}>();

const emit = defineEmits<{
  showFilter: [];
  toggleMyOrders: [];
  resetFilters: [];
  loadMore: [];
  fetchData: [];
  'update:dateRange': [val: [string, string] | null];
}>();

// Local copy for dateRange v-model
const localDateRange = ref(props.dateRange);
watch(() => props.dateRange, v => localDateRange.value = v);
watch(localDateRange, v => emit('update:dateRange', v));

// Expose showFilterDrawer for parent to open
defineExpose({ showFilterDrawer });
</script>

<style scoped>
.loading-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

.card-list {
  padding-bottom: 20px;
}

.load-more {
  text-align: center;
  padding: 12px;
}

.mobile-filter-fab {
  position: fixed !important;
  right: 20px;
  bottom: calc(var(--mobile-nav-height) + 20px);
  z-index: 1000;
}

.fab-button {
  width: 56px;
  height: 56px;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.4);
  background: var(--primary-color) !important;
  border: none !important;
}

.filter-tag-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

:deep(.filter-tag-group .el-radio-button__inner) {
  padding: 8px 16px;
  margin-bottom: 8px;
  border-radius: 10px !important;
  border: 1px solid var(--border-color-lighter) !important;
  background: var(--bg-color);
}

.drawer-content {
  padding: 0 20px 20px;
}

.drawer-footer {
  margin-top: 32px;
  display: flex;
  gap: 12px;
}

.drawer-footer .el-button {
  flex: 1;
  height: 44px;
  border-radius: 12px;
}

:deep(.mobile-filter-drawer) {
  border-radius: 24px 24px 0 0 !important;
  overflow: hidden;
}

:deep(.mobile-filter-drawer .el-drawer__header) {
  margin-bottom: 12px;
  padding-top: 20px;
}

.my-orders-btn {
  margin-bottom: 12px;
}
</style>
