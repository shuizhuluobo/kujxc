<template>
  <div class="history-work-orders-mobile">
    <!-- 页面标题和操作栏 -->
    <div class="page-header" v-if="!hideTitle">
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
                background="#f7f8fa"
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
                background="#f7f8fa"
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
                <van-button 
                  v-for="u in filteredCompleters"
                  :key="u.id"
                  :type="filter.completerId === u.id ? 'primary' : 'default'"
                  size="small"
                  @click="filter.completerId = u.id"
                >{{ u.name }}</van-button>
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
        <div v-if="filter.statuses && filter.statuses.length > 0" class="filter-tag">
          {{ getStatusLabel(filter.statuses[0]) }}
          <span class="filter-tag-close" @click="filter.statuses = []">×</span>
        </div>
        <div v-if="filter.serviceTypeId" class="filter-tag">
          {{ getServiceTypeName(filter.serviceTypeId) }}
          <span class="filter-tag-close" @click="filter.serviceTypeId = undefined">×</span>
        </div>
        <div v-if="filter.regionId" class="filter-tag">
          {{ getRegionName(filter.regionId) }}
          <span class="filter-tag-close" @click="filter.regionId = undefined">×</span>
        </div>
        <div v-if="filter.keyword" class="filter-tag">
          关键字:{{ filter.keyword }}
          <span class="filter-tag-close" @click="filter.keyword = undefined">×</span>
        </div>
        <div v-if="filter.completerId && !isMyOrders" class="filter-tag">
          {{ getCompleterName(filter.completerId) }}
          <span class="filter-tag-close" @click="filter.completerId = undefined">×</span>
        </div>
        <div v-if="isMyOrders" class="filter-tag">
          我的工单
          <span class="filter-tag-close" @click="$emit('toggleMyOrders')">×</span>
        </div>
        <div v-if="localDateRange" class="filter-tag">
          {{ localDateRange[0] }} ~ {{ localDateRange[1] }}
          <span class="filter-tag-close" @click="localDateRange = null">×</span>
        </div>
      </div>
      <div class="filter-status-reset" @click="$emit('resetFilters')">
        清除筛选
      </div>
    </div>

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
import { ref, watch, computed } from 'vue';
import { Filter } from '@element-plus/icons-vue';
import { Button as VanButton, Icon as VanIcon, Search as VanSearch } from 'vant';
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

// Expose showFilterDrawer for parent to open
defineExpose({ showFilterDrawer });
</script>

<style scoped>
.history-work-orders-mobile {
  padding-bottom: 20px;
}

.page-header {
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
  color: white;
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
  background-color: #f0f2f5;
  font-size: 11px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filter-item:hover {
  background-color: #e6e8eb;
}

.filter-item.active {
  background-color: var(--primary-color);
  color: white;
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
  background-color: rgba(37, 99, 235, 0.1);
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
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: bubbleFadeIn 0.2s ease;
}

@keyframes bubbleFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  color: #999;
  font-size: 14px;
  padding: 0 4px;
}

.bubble-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.bubble-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.bubble-header .van-icon {
  font-size: 18px;
  color: #999;
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
  color: #999;
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
  border-top: 1px solid #f0f0f0;
}

/* 筛选状态显示 */
.filter-status {
  padding: 0 16px 8px;
}

.filter-status-content {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-tag {
  background: #f0f2f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.filter-tag-close {
  color: #999;
  font-size: 14px;
  cursor: pointer;
  line-height: 1;
}

.filter-tag-close:hover {
  color: #666;
}

.filter-status-reset {
  margin-top: 8px;
  font-size: 12px;
  color: var(--primary-color);
  cursor: pointer;
  text-align: center;
}

.filter-status-reset:hover {
  text-decoration: underline;
}

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
</style>
