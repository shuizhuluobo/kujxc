<template>
  <div>
    <!-- 筛选栏 -->
    <div class="filter-bar card-premium">
      <el-checkbox-group v-model="filter.statuses" size="default" class="status-checkbox-group">
        <el-checkbox-button label="PENDING">待接收</el-checkbox-button>
        <el-checkbox-button label="RECEIVED">已接收</el-checkbox-button>
        <el-checkbox-button label="COMPLETED">已完成</el-checkbox-button>
      </el-checkbox-group>
      <el-select v-model="filter.regionId" placeholder="区域" clearable size="default" style="width: 120px">
        <el-option 
          v-for="r in baseDataStore.regions" 
          :key="r.id" 
          :label="r.name" 
          :value="r.id" 
        />
      </el-select>
      <el-select v-model="filter.serviceTypeId" placeholder="服务类型" clearable size="default" style="width: 120px">
        <el-option 
          v-for="s in baseDataStore.serviceTypes" 
          :key="s.id" 
          :label="s.name" 
          :value="s.id" 
        />
      </el-select>
      <el-select 
        v-model="filter.completerId" 
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
        v-model="filter.keyword" 
        placeholder="搜索"
        :prefix-icon="Search"
        clearable
        size="default"
        style="width: 180px"
      />
    </div>

    <!-- 表格 -->
    <el-table :data="workOrders" class="card-premium">
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
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="filter.page"
        v-model:page-size="filter.pageSize"
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
import { getCustomerDisplayName } from '@/utils/customer';

const baseDataStore = useBaseDataStore();

const props = defineProps<{
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
  'update:dateRange': [val: [string, string] | null];
}>();

const localDateRange = ref(props.dateRange);
watch(() => props.dateRange, v => localDateRange.value = v);
watch(localDateRange, v => emit('update:dateRange', v));
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

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.cell-info {
  display: flex;
  flex-direction: column;
}

.cell-info .time {
  font-size: 12px;
  color: #909399;
}

.text-muted {
  color: #c0c4cc;
}
</style>
