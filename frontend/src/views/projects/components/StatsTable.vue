<template>
  <div class="stats-table-wrap">
    <el-table
      v-if="calculationType === 'QUANTITY' && data.length > 0"
      :data="data"
      stripe
      size="small"
      :cell-style="cellStyle"
      class="stats-table"
    >
      <el-table-column label="#" type="index" width="45" align="center" />
      <el-table-column label="姓名" prop="userName" min-width="90" align="left" />
      <el-table-column
        v-for="stage in stages"
        :key="stage.id"
        :label="stage.name"
        width="100"
        align="right"
      >
        <template #default="{ row }">
          <div class="align-right-cell" :style="{ textAlign: 'right', width: '100%', display: 'block' }">{{ getStageCount(row, stage.id) }}台</div>
          <div v-if="canViewAmount" class="align-right-cell amount" :style="{ textAlign: 'right', width: '100%', display: 'block' }">¥{{ getStageAmount(row, stage.id).toFixed(2) }}</div>
        </template>
      </el-table-column>
      <el-table-column v-if="canViewAmount" label="合计金额" width="100" align="right">
        <template #default="{ row }">
          <strong>¥{{ (row.totalAmount || 0).toFixed(2) }}</strong>
        </template>
      </el-table-column>
    </el-table>

    <el-table
      v-else-if="calculationType === 'DAILY' && data.length > 0"
      :data="data"
      stripe
      size="small"
      :cell-style="cellStyle"
      class="stats-table"
    >
      <el-table-column label="#" type="index" width="45" align="center" />
      <el-table-column label="姓名" prop="userName" width="90" align="left" />
      <el-table-column label="工作时长" width="100" align="right">
        <template #default="{ row }">
          {{ formatWorkHours((row.totalWorkDays || 0) * HOURS_PER_DAY) }}
        </template>
      </el-table-column>
      <el-table-column v-if="canViewAmount" label="合计金额" min-width="110" align="right">
        <template #default="{ row }">
          <strong>¥{{ (row.totalAmount || 0).toFixed(2) }}</strong>
        </template>
      </el-table-column>
    </el-table>

    <div v-else class="empty-tip">
      <p>暂无汇总数据</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HOURS_PER_DAY, formatWorkHours } from '@/types';
import type { PerformanceResult, ProjectStage } from '@/types';

const props = defineProps<{
  data: PerformanceResult[];
  calculationType: string;
  canViewAmount?: boolean;
  stages?: ProjectStage[];
}>();

const getStageCount = (row: PerformanceResult, stageId: string) =>
  row?.stageStats?.[stageId]?.count ?? 0;
const getStageAmount = (row: PerformanceResult, stageId: string) =>
  row?.stageStats?.[stageId]?.amount ?? 0;

const cellStyle = ({ column }: any) => {
  if (column.type === 'index') return { textAlign: 'center' };
  if (column.property === 'userName') return { textAlign: 'left' };
  return { textAlign: 'right' };
};
</script>

<style scoped>
.amount {
  color: #909399;
  font-size: 12px;
}

.empty-tip {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 13px;
}

/* 强制右对齐的单元格内容 */
.align-right-cell {
  width: 100%;
  text-align: right;
  display: block;
}

/* 解决 Element Plus 表格右对齐问题 - 终极方案 */
.stats-table :deep(td.is-right) {
  padding: 0 !important;
}

.stats-table :deep(td.is-right .cell) {
  padding: 16px 8px 16px 0 !important;
  text-align: right !important;
  display: block !important;
  width: 100% !important;
}

.stats-table :deep(td.is-right .cell > *) {
  text-align: right !important;
  display: block !important;
  width: 100% !important;
}

/* 防止任何全局样式干扰 */
.stats-table :deep(td.is-right .cell .align-right-cell) {
  text-align: right !important;
  width: 100% !important;
  display: block !important;
  margin: 0 !important;
  padding: 0 !important;
  float: none !important;
  direction: ltr !important;
}
</style>