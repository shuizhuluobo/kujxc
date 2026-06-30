<template>
  <div class="history-work-orders">
    <div class="page-header" v-if="!isMobile">
      <h2>历史工单</h2>
      <div class="header-actions">
        <el-button 
          :type="isMyOrders ? 'primary' : 'default'" 
          @click="toggleMyOrders"
        >
          我的工单
        </el-button>
        <el-button :icon="Download" @click="handleExport" :loading="exporting">
          导出 Excel
        </el-button>
      </div>
    </div>

    <component
      :is="isMobile ? MobileHistory : DesktopHistory"
      :loading="loading"
      :loading-more="loadingMore"
      :work-orders="workOrders"
      :total="total"
      :filter="filter"
      :date-range="dateRange"
      :has-active-filters="hasActiveFilters"
      :is-my-orders="isMyOrders"
      :has-more="hasMore"
      :all-completers="allCompleters"
      :filtered-completers="filteredCompleters"
      :SCORE_VALUES="SCORE_VALUES"
      :STATUS_LABELS="STATUS_LABELS"
      :get-status-class="getStatusClass"
      :format-date="formatDate"
      :completer-filter-method="completerFilterMethod"
      :handle-completer-visible-change="handleCompleterVisibleChange"
      :stats="{ total }"
      @toggle-my-orders="toggleMyOrders"
      @reset-filters="resetFilters"
      @load-more="loadMore"
      @refresh="fetchData"
      @fetch-data="fetchData"
      @update:date-range="dateRange = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { Download } from '@element-plus/icons-vue';
import { useResponsive } from '@/composables';
import { useHistoryFilter } from './history-work-orders/composables/useHistoryFilter';
import { useSSE } from '@/composables/useSSE';

const MobileHistory = defineAsyncComponent(() => import('./history-work-orders/MobileHistory.vue'));
const DesktopHistory = defineAsyncComponent(() => import('./history-work-orders/DesktopHistory.vue'));

const { isMobile } = useResponsive();
const sse = useSSE();
let unsubscribe: (() => void) | null = null;

const {
  loading,
  loadingMore,
  exporting,
  workOrders,
  total,
  filter,
  dateRange,
  hasActiveFilters,
  isMyOrders,
  hasMore,
  allCompleters,
  filteredCompleters,
  toggleMyOrders,
  resetFilters,
  completerFilterMethod,
  handleCompleterVisibleChange,
  getStatusClass,
  formatDate,
  fetchData,
  loadMore,
  handleExport,
  STATUS_LABELS,
  SCORE_VALUES,
} = useHistoryFilter();

onMounted(() => {
  void fetchData();

  // 监听工单状态变化事件，实时更新历史工单列表
  const handleHistoryChange = () => {
    void fetchData();
  };
  sse.on('work-order.created', handleHistoryChange);
  sse.on('work-order.updated', handleHistoryChange);
  sse.on('work-order.deleted', handleHistoryChange);
  sse.on('work-order.change', handleHistoryChange);
  unsubscribe = () => {
    sse.off('work-order.created', handleHistoryChange);
    sse.off('work-order.updated', handleHistoryChange);
    sse.off('work-order.deleted', handleHistoryChange);
    sse.off('work-order.change', handleHistoryChange);
  };
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<style scoped>
.history-work-orders {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-top: var(--safe-area-top);
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.header-actions {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}
</style>
