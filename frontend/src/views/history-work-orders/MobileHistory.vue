<template>
  <div class="history-work-orders-mobile">
    <!-- 页面标题和操作栏 -->
    <div class="m-page-header" v-if="!hideTitle">
      <div class="header-content">
        <div class="header-left">
          <div class="header-row-top">
            <h2>历史工单</h2>
            <!-- 数量统计 -->
            <div class="stats-tag" v-if="stats.total > 0">
              <span class="stat-item primary">共:{{ stats.total }}</span>
            </div>
          </div>
          <!-- 滑动筛选条 -->
          <div class="filter-bar-inline">
            <div class="filter-bar-container">
              <div 
                class="filter-item" 
                :class="{ active: isMyOrders }"
                @click="$emit('toggleMyOrders')"
                title="我的工单"
              >
                我的工单
              </div>
              <div 
                class="filter-item" 
                :class="{ active: filter.regionId === undefined }"
                @click="filter.regionId = undefined"
                title="全部区域"
              >
                全部区域
              </div>
              <div 
                v-for="r in baseDataStore.regions"
                :key="r.id"
                class="filter-item" 
                :class="{ active: filter.regionId === r.id }"
                @click="filter.regionId = r.id"
                :title="r.name"
              >
                {{ r.name }}
              </div>
              <div 
                class="filter-item more-filter"
                ref="moreFilterBtn"
                @click="toggleFilterPopup"
                title="更多筛选选项"
              >
                更多
                <van-icon name="arrow-down" size="12" />
              </div>
            </div>
          </div>
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
              <div class="bubble-filter-label">工单状态</div>
              <div class="bubble-filter-options">
                <van-button 
                  :type="!filter.statuses || filter.statuses.length === 0 ? 'primary' : 'default'"
                  size="small"
                  @click="filter.statuses = []"
                >全部</van-button>
                <van-button 
                  :type="filter.statuses?.includes('PENDING') ? 'primary' : 'default'"
                  size="small"
                  @click="filter.statuses = ['PENDING']"
                >待接收</van-button>
                <van-button 
                  :type="filter.statuses?.includes('RECEIVED') ? 'primary' : 'default'"
                  size="small"
                  @click="filter.statuses = ['RECEIVED']"
                >已接收</van-button>
                <van-button 
                  :type="filter.statuses?.includes('COMPLETED') ? 'primary' : 'default'"
                  size="small"
                  @click="filter.statuses = ['COMPLETED']"
                >已完成</van-button>
              </div>
            </div>
            <div class="bubble-filter-section">
              <div class="bubble-filter-label">服务类型</div>
              <div class="bubble-filter-options">
                <van-button 
                  :type="filter.serviceTypeId === undefined ? 'primary' : 'default'"
                  size="small"
                  @click="filter.serviceTypeId = undefined"
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
              <div class="bubble-filter-label">关键字</div>
              <van-search
                v-model="filter.keyword"
                placeholder="搜索客户、内容..."
                shape="round"
                background="var(--bg-color-page)"
                show-action
              >
                <template #action>
                  <div @click="filter.keyword = undefined">清空</div>
                </template>
              </van-search>
            </div>
            <div class="bubble-filter-section">
              <div class="bubble-filter-label">时间范围</div>
              <div class="date-range-inputs">
                <el-date-picker
                  v-model="startDate"
                  type="date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  placeholder="开始"
                  :picker-options="{
                    disabledDate: (time) => time.getTime() > Date.now() || (endDate && time.getTime() > new Date(endDate).getTime())
                  }"
                  :teleported="true"
                />
                <span class="date-separator">至</span>
                <el-date-picker
                  v-model="endDate"
                  type="date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  placeholder="结束"
                  :picker-options="{
                    disabledDate: (time) => time.getTime() > Date.now() || (startDate && time.getTime() < new Date(startDate).getTime())
                  }"
                  :teleported="true"
                />
              </div>
            </div>
            <div class="bubble-filter-section">
              <div class="bubble-filter-label">完成人</div>
              <van-search
                v-model="completerSearchText"
                placeholder="搜索完成人(支持拼音)"
                shape="round"
                background="var(--bg-color-page)"
                show-action
              >
                <template #action>
                  <div @click="completerSearchText = ''">清空</div>
                </template>
              </van-search>
              <div class="bubble-filter-options">
                <van-button 
                  :type="isMyOrders ? 'primary' : 'default'"
                  size="small"
                  @click="$emit('toggleMyOrders')"
                >
                  我的工单
                </van-button>
              </div>
            </div>
          </div>
          <div class="bubble-footer">
            <van-button block size="small" @click="$emit('resetFilters')">重置</van-button>
            <van-button block size="small" type="primary" @click="showFilterPopup = false">完成</van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选状态显示 -->
    <div v-if="hasActiveFilters" class="filter-status">
      <div class="filter-status-content">
        <div v-if="filter.statuses && filter.statuses.length > 0" class="filter-status-tag">
          {{ getStatusLabel(filter.statuses[0]) }}
          <van-icon name="cross" size="14" @click="filter.statuses = []" />
        </div>
        <div v-if="filter.serviceTypeId" class="filter-status-tag">
          {{ getServiceTypeName(filter.serviceTypeId) }}
          <van-icon name="cross" size="14" @click="filter.serviceTypeId = undefined" />
        </div>
        <div v-if="filter.regionId" class="filter-status-tag">
          {{ getRegionName(filter.regionId) }}
          <van-icon name="cross" size="14" @click="filter.regionId = undefined" />
        </div>
        <div v-if="filter.keyword" class="filter-status-tag">
          关键词:{{ filter.keyword }}
          <van-icon name="cross" size="14" @click="filter.keyword = undefined" />
        </div>
        <div v-if="filter.completerId && !isMyOrders" class="filter-status-tag">
          {{ getCompleterName(filter.completerId) }}
          <van-icon name="cross" size="14" @click="filter.completerId = undefined" />
        </div>
        <div v-if="isMyOrders" class="filter-status-tag">
          我的工单
          <van-icon name="cross" size="14" @click="$emit('toggleMyOrders')" />
        </div>
        <div v-if="localDateRange" class="filter-status-tag">
          {{ localDateRange[0] }} ~ {{ localDateRange[1] }}
          <van-icon name="cross" size="14" @click="localDateRange = null" />
        </div>
        <div class="filter-status-tag clear-all" @click="$emit('resetFilters')">
          清除全部
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- 卡片列表：下拉刷新 + 无限滚动 -->
    <van-pull-refresh v-else v-model="refreshing" @refresh="onRefresh" class="pull-refresh-container">
      <van-list
        v-model:loading="listLoading"
        :finished="!hasMore"
        :finished-text="workOrders.length === 0 ? '' : '没有更多了'"
        @load="onLoad"
      >
        <div class="card-list">
          <WorkOrderCard
            v-for="wo in workOrders"
            :key="wo.id"
            :work-order="wo"
            :show-actions="false"
          />
          <el-empty v-if="workOrders.length === 0 && !listLoading" description="暂无历史工单" />
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { Filter } from '@element-plus/icons-vue';
import { Button as VanButton, Icon as VanIcon, Search as VanSearch, PullRefresh as VanPullRefresh, List as VanList } from 'vant';
import type { WorkOrder, WorkOrderFilterParams, User as UserType } from '@/types';
import { useBaseDataStore } from '@/stores/baseData';
import WorkOrderCard from '@/components/workorder/WorkOrderCard.vue';
import { match } from 'pinyin-pro';

const baseDataStore = useBaseDataStore();
const showFilterDrawer = ref(false);
const showFilterPopup = ref(false);
const completerSearchText = ref('');
const startDate = ref<string>('');
const endDate = ref<string>('');

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
  stats?: { total: number };
  hideTitle?: boolean;
}>();

const emit = defineEmits<{
  showFilter: [];
  toggleMyOrders: [];
  resetFilters: [];
  loadMore: [];
  fetchData: [];
  refresh: [];
  'update:dateRange': [val: [string, string] | null];
}>();

function toggleFilterPopup() {
  showFilterPopup.value = !showFilterPopup.value;
}

watch(() => props.dateRange, (val) => {
  if (val) {
    startDate.value = val[0];
    endDate.value = val[1];
  } else {
    startDate.value = '';
    endDate.value = '';
  }
}, { immediate: true });

watch([startDate, endDate], ([start, end]) => {
  if (start && end) {
    emit('update:dateRange', [start, end]);
  } else if (!start && !end) {
    emit('update:dateRange', null);
  }
});

const filteredCompleters = computed(() => {
  if (!completerSearchText.value) {
    return props.allCompleters;
  }
  const query = completerSearchText.value.toLowerCase();
  return props.allCompleters.filter(user => {
    if (user.name.includes(query)) return true;
    return match(user.name, query, { precision: 'start' });
  });
});

// Get display names
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'PENDING': '待接收',
    'RECEIVED': '已接收',
    'COMPLETED': '已完成'
  };
  return labels[status] || status;
}

function getServiceTypeName(id: string): string {
  const serviceType = baseDataStore.serviceTypes.find(s => s.id === id);
  return serviceType?.name || id;
}

function getRegionName(id: string): string {
  const region = baseDataStore.regions.find(r => r.id === id);
  return region?.name || id;
}

function getCompleterName(id: string): string {
  const completer = props.allCompleters.find(u => u.id === id);
  return completer?.name || id;
}

// Local copy for dateRange v-model
const localDateRange = ref(props.dateRange);
watch(() => props.dateRange, v => localDateRange.value = v);
watch(localDateRange, v => emit('update:dateRange', v));

// 下拉刷新 + 无限滚动（复用父级 loadMore 逻辑）
const refreshing = ref(false);
const listLoading = ref(false);

function onRefresh() {
  emit('refresh');
  refreshing.value = false;
}

function onLoad() {
  if (props.hasMore) {
    listLoading.value = true;
    emit('loadMore');
    setTimeout(() => {
      listLoading.value = false;
    }, 100);
  }
}

// Expose showFilterDrawer for parent to open
defineExpose({ showFilterDrawer });
</script>

<style scoped>
.history-work-orders-mobile {
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

.stat-item.primary { background: var(--el-color-primary); }

.header-right {
  display: flex;
  align-items: center;
}

.filter-bar-inline {
  flex: 1;
  min-width: 0;
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
  position: fixed;
  top: calc(var(--safe-area-top) + 80px);
  left: 16px;
  right: 16px;
  z-index: 100;
  max-height: calc(100vh - var(--safe-area-top) - 120px);
  overflow-y: auto;
}

 .bubble-content {
   background: var(--card-bg);
   border-radius: 12px;
   box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
   overflow: hidden;
   animation: bubbleFadeIn 0.2s ease;
 }

 .date-range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-range-inputs .el-date-editor {
  flex: 1;
}

.date-separator {
  color: var(--text-tertiary);
  font-size: 14px;
  padding: 0 4px;
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

/* 筛选状态显示（使用全局 .filter-status / .filter-status-tag） */
.filter-status {
  padding: 0 16px 12px;
}

.loading-container {
  padding: 20px;
  background: var(--card-bg);
  border-radius: 8px;
}

.card-list {
  padding: 0 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-list :deep(.work-order-card) {
  margin-bottom: 0;
}
</style>
