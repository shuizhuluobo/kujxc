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
      <div class="summary-card highlight">
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
      <el-table-column label="送货" align="center">
        <el-table-column label="数量" width="80" align="right">
          <template #default="{ row }">{{ row.deliveryCount }}</template>
        </el-table-column>
        <el-table-column label="金额" width="100" align="right">
          <template #default="{ row }">{{ row.deliveryAmount.toFixed(2) }}</template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="安装" align="center">
        <el-table-column label="数量" width="80" align="right">
          <template #default="{ row }">{{ row.installCount }}</template>
        </el-table-column>
        <el-table-column label="金额" width="100" align="right">
          <template #default="{ row }">{{ row.installAmount.toFixed(2) }}</template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="调试" align="center">
        <el-table-column label="数量" width="80" align="right">
          <template #default="{ row }">{{ row.debugCount }}</template>
        </el-table-column>
        <el-table-column label="金额" width="100" align="right">
          <template #default="{ row }">{{ row.debugAmount.toFixed(2) }}</template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="按工日" align="center">
        <el-table-column label="工日数" width="80" align="right">
          <template #default="{ row }">{{ row.totalWorkDays }}</template>
        </el-table-column>
        <el-table-column label="金额" width="100" align="right">
          <template #default="{ row }">{{ row.workDaysAmount.toFixed(2) }}</template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="合计金额" width="120" align="right">
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
    const params: any = {};
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

const getSummary = ({ columns, data }: any) => {
  const sums: string[] = [];
  columns.forEach((column: any, index: number) => {
    if (index === 0) {
      sums[index] = '合计';
      return;
    }
    if (index === 1 || index === 2) {
      sums[index] = '';
      return;
    }
    const values = data.map((item: any) => Number(column.property ? item[column.property] : 0));
    if (!values.every((value: number) => Number.isNaN(value))) {
      sums[index] = values.reduce((prev: number, curr: number) => {
        const value = Number(curr);
        if (!Number.isNaN(value)) {
          return prev + value;
        }
        return prev;
      }, 0).toFixed(2);
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
