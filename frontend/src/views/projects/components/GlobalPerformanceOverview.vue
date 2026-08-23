<template>
  <div class="global-performance">
    <div class="filter-bar">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 280px"
        @change="loadData"
      />
      <el-select
        v-model="selectedUserId"
        placeholder="筛选人员"
        clearable
        filterable
        :filter-method="filterByPinyin"
        style="width: 160px"
        @change="loadData"
      >
        <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
      </el-select>
      <el-button type="primary" @click="loadData">刷新</el-button>
    </div>

    <div v-if="globalStats.length > 0" class="stats-summary">
      <div class="summary-card">
        <span class="summary-label">参与人数</span>
        <span class="summary-value">{{ globalStats.length }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">涉及项目</span>
        <span class="summary-value">{{ totalProjectCount }}</span>
      </div>
      <div class="summary-card highlight" v-if="canViewAmount">
        <span class="summary-label">总金额</span>
        <span class="summary-value">{{ totalAmount.toFixed(2) }} 元</span>
      </div>
    </div>

    <el-table v-if="globalStats.length > 0" :data="globalStats" stripe size="small" show-summary :summary-method="getSummary">
      <el-table-column label="序号" type="index" width="60" />
      <el-table-column prop="userName" label="姓名" width="100" />
      <el-table-column label="项目数" width="80">
        <template #default="{ row }">{{ row.projectCount }}</template>
      </el-table-column>
      <el-table-column label="按量总量" prop="totalQuantity" width="100" align="right">
        <template #default="{ row }">{{ row.totalQuantity }} 台</template>
      </el-table-column>
      <el-table-column label="按工日" align="center">
        <el-table-column label="工日数" prop="totalWorkDays" width="80" align="right">
          <template #default="{ row }">{{ row.totalWorkDays }}</template>
        </el-table-column>
        <el-table-column v-if="canViewAmount" label="金额" prop="workDaysAmount" width="100" align="right">
          <template #default="{ row }">{{ row.workDaysAmount.toFixed(2) }}</template>
        </el-table-column>
      </el-table-column>
      <el-table-column v-if="canViewAmount" label="合计金额" prop="totalAmount" width="120" align="right">
        <template #default="{ row }">
          <strong>{{ row.totalAmount.toFixed(2) }}</strong>
        </template>
      </el-table-column>
    </el-table>
    <div v-else class="empty-state">
      <p>暂无绩效数据</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { performanceApi, usersApi } from '@/api';
import type { GlobalPerformanceResult, User } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { hasPermission } from '@/config/permissions';
import { matchPinyin } from '@/utils/pinyinFilter';

// el-select filterable 拼音过滤：按选项渲染 label 匹配
function filterByPinyin(query: string, item: unknown) {
  const label = String((item as { label?: unknown })?.label ?? '');
  return matchPinyin(label, query);
}

const authStore = useAuthStore();
const canViewAmount = computed(() =>
  hasPermission(authStore.user?.role?.permissions || [], 'fee:view_amount') || authStore.isAdmin,
);

const globalStats = ref<GlobalPerformanceResult[]>([]);
const users = ref<User[]>([]);
const dateRange = ref<[string, string] | null>(null);
const selectedUserId = ref<string>('');

const totalProjectCount = computed(() => {
  const set = new Set<string>();
  globalStats.value.forEach(s => {
    for (let i = 0; i < s.projectCount; i++) set.add(`${s.userId}-${i}`);
  });
  return new Set(globalStats.value.map(s => s.projectCount)).size;
});

const totalAmount = computed(() => {
  return globalStats.value.reduce((sum, s) => sum + s.totalAmount, 0);
});

const loadData = async () => {
  try {
    const params: { startDate?: string; endDate?: string; userId?: string } = {};
    if (dateRange.value) {
      params.startDate = dateRange.value[0];
      params.endDate = dateRange.value[1];
    }
    if (selectedUserId.value) {
      params.userId = selectedUserId.value;
    }
    const response = await performanceApi.getGlobalStats(params);
    globalStats.value = response.data || [];
  } catch (error) {
    console.error('Failed to load global stats:', error);
  }
};

const loadUsers = async () => {
  try {
    const response = await usersApi.getAll({ page: 1, pageSize: 10000 });
    users.value = response.data.data || [];
  } catch (error) {
    console.error('Failed to load users:', error);
  }
};

interface TableColumn {
  property?: string;
}

interface SummaryContext {
  columns: TableColumn[];
  data: Record<string, unknown>[];
}

const getSummary = ({ columns, data }: SummaryContext) => {
  const sums: string[] = [];
  const numericFields = ['totalQuantity', 'totalWorkDays', 'workDaysAmount', 'totalAmount'];
  columns.forEach((column: TableColumn, index: number) => {
    if (index === 0) {
      sums[index] = '合计';
      return;
    }
    if (index === 1 || index === 2) {
      sums[index] = index === 2 ? String(data.length) : '';
      return;
    }
    const field = column.property;
    if (field && numericFields.includes(field)) {
      const total = data.reduce((sum: number, item: Record<string, unknown>) => sum + (Number(item[field]) || 0), 0);
      sums[index] = total.toFixed(2);
    } else {
      sums[index] = '';
    }
  });
  return sums;
};

onMounted(async () => {
  await loadUsers();
  await loadData();
});
</script>

<style scoped>
.global-performance {
  padding: 16px 0;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.stats-summary {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.summary-card {
  background: var(--bg-color);
  border-radius: 8px;
  padding: 16px 24px;
  text-align: center;
  min-width: 120px;
}

.summary-card.highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.summary-card.highlight .summary-label {
  color: rgba(255, 255, 255, 0.8);
}

.summary-card.highlight .summary-value {
  color: white;
}

.summary-label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.summary-value {
  display: block;
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: var(--text-secondary);
}
</style>
