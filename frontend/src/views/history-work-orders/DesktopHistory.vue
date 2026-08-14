<template>
  <div>
    <!-- 筛选栏 -->
    <div class="filter-bar card-premium">
      <el-checkbox-group v-model="localFilter.statuses" size="default" class="status-checkbox-group">
        <el-checkbox-button value="PENDING">待接收</el-checkbox-button>
        <el-checkbox-button value="RECEIVED">已接收</el-checkbox-button>
        <el-checkbox-button value="COMPLETED">已完成</el-checkbox-button>
      </el-checkbox-group>
      <el-select v-model="localFilter.regionId" placeholder="区域" clearable size="default" style="width: 120px">
        <el-option 
          v-for="r in baseDataStore.regions" 
          :key="r.id" 
          :label="r.name" 
          :value="r.id" 
        />
      </el-select>
      <el-select v-model="localFilter.serviceTypeId" placeholder="服务类型" clearable size="default" style="width: 120px">
        <el-option 
          v-for="s in baseDataStore.serviceTypes" 
          :key="s.id" 
          :label="s.name" 
          :value="s.id" 
        />
      </el-select>
      <el-select 
        v-model="localFilter.completerId" 
        placeholder="完成人" 
        clearable 
        filterable 
        size="default"
        :filter-method="completerFilterMethod"
        @visible-change="handleCompleterVisibleChange"
        style="width: 120px"
      >
        <el-option 
          v-for="u in filteredCompleters" 
          :key="u.id" 
          :label="u.name" 
          :value="u.id" 
        />
      </el-select>
      <el-date-picker
        v-model="localDateRange"
        type="daterange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        size="default"
        style="width: 240px"
      />
      <el-input
        v-model="localFilter.keyword"
        placeholder="搜索"
        :prefix-icon="Search"
        clearable
        size="default"
        style="width: 180px"
      />
      <div class="filter-actions">
        <el-button @click="$emit('resetFilters')">重置</el-button>
      </div>
    </div>

    <!-- 表格 -->
    <el-table v-if="workOrders.length > 0" :data="workOrders" class="work-order-table card-premium" empty-text="暂无历史工单">
      <el-table-column label="客户" width="140">
        <template #default="{ row }">
          <span style="font-size: 16px; font-weight: 600">{{ getCustomerDisplayName(row.customer) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="detail" label="详情" min-width="200" show-overflow-tooltip />
      <el-table-column prop="region.name" label="区域" width="80" />
      <el-table-column prop="serviceType.name" label="服务类型" width="100" />
      <el-table-column label="分值" width="70">
        <template #default="{ row }">{{ SCORE_VALUES[row.scoreLevel] ?? '-' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <span class="status-tag" :class="getStatusClass(row.status)">
            {{ STATUS_LABELS[row.status] }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="维修费" width="100">
        <template #default="{ row }">
          <span v-if="canViewRepairFee(row) && row.repairFee !== null && row.repairFee !== undefined" class="fee-value">
            ¥ {{ row.repairFee.toFixed(2) }}
          </span>
          <span v-else class="text-muted">--</span>
        </template>
      </el-table-column>
      <el-table-column label="完成信息" width="150">
        <template #default="{ row }">
          <template v-if="row.completedAt">
            <div class="cell-info">
              <span>{{ row.completer?.name }}</span>
              <span class="time">{{ formatDate(row.completedAt) }}</span>
            </div>
          </template>
          <span v-else class="text-muted">--</span>
        </template>
      </el-table-column>
      <el-table-column label="协作人" width="150">
        <template #default="{ row }">
          <template v-if="row.collaborators?.length">
            <div class="collaborator-list">
              <span 
                v-for="collaborator in row.collaborators"
                :key="collaborator.id"
                class="collaborator-tag"
              >
                {{ collaborator.user?.name }}
              </span>
            </div>
          </template>
          <span v-else class="text-muted">--</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <div v-else-if="!loading" class="empty-state card-premium">
      <el-empty description="暂无历史工单" />
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="total > 0">
      <el-pagination
        v-model:current-page="localFilter.page"
        v-model:page-size="localFilter.pageSize"
        :page-sizes="[20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="$emit('fetchData')"
        @current-change="$emit('fetchData')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';
import type { WorkOrder, WorkOrderFilterParams, User as UserType } from '@/types';
import type { WorkOrderStatus } from '@/types';
import { useBaseDataStore } from '@/stores/baseData';
import { useAuthStore } from '@/stores/auth';
import { getCustomerDisplayName } from '@/utils/customer';

const baseDataStore = useBaseDataStore();
const authStore = useAuthStore();

function canViewRepairFee(row: WorkOrder): boolean {
  // 管理员或工单完成人可以查看维修费
  return authStore.isAdmin || String(row.completerId) === String(authStore.user?.id);
}

const props = defineProps<{
  loading: boolean;
  loadingMore: boolean;
  workOrders: WorkOrder[];
  total: number;
  filter: WorkOrderFilterParams;
  dateRange: [string, string] | null;
  filteredCompleters: UserType[];
  SCORE_VALUES: Record<string, number>;
  STATUS_LABELS: Record<string, string>;
  getStatusClass: (status: WorkOrderStatus) => Record<string, boolean>;
  formatDate: (date: string) => string;
  completerFilterMethod: (query: string) => void;
  handleCompleterVisibleChange: (visible: boolean) => void;
}>();

const emit = defineEmits<{
  fetchData: [];
  resetFilters: [];
  'update:dateRange': [val: [string, string] | null];
}>();

const localDateRange = ref(props.dateRange);
watch(() => props.dateRange, v => localDateRange.value = v);
watch(localDateRange, v => emit('update:dateRange', v));

// Alias the reactive filter so v-model binds to a local name (parent holds the same reactive object by reference)
const localFilter = props.filter;
</script>

<style scoped>
.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  padding: 18px 24px;
  align-items: center;
}

.filter-bar :deep(.el-input),
.filter-bar :deep(.el-select),
.filter-bar :deep(.el-date-editor) {
  --el-input-height: 32px;
}

.filter-bar :deep(.el-input__wrapper),
.filter-bar :deep(.el-select__wrapper),
.filter-bar :deep(.el-date-editor .el-input__wrapper) {
  height: 32px !important;
  min-height: 32px !important;
}

.filter-bar .filter-actions {
  margin-left: auto;
}

.cell-info {
  display: flex;
  flex-direction: column;
}

.cell-info .time {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.text-muted {
  color: var(--text-tertiary);
}

.fee-value {
  color: var(--danger-color);
  font-weight: 600;
}

.collaborator-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.collaborator-tag {
  padding: 2px 8px;
  background: var(--bg-color-page);
  border-radius: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
