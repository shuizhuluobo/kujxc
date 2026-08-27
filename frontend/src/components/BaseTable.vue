<template>
  <div class="base-table-wrapper">
    <el-table
      :data="data"
      v-loading="loading"
      class="card-premium"
      :empty-text="emptyText"
      v-bind="$attrs"
    >
      <slot />
    </el-table>
    <div v-if="total > 0" class="pagination-container">
      <el-pagination
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @update:current-page="(v: number) => emit('update:page', v)"
        @update:page-size="(v: number) => emit('update:pageSize', v)"
        @size-change="(v: number) => emit('size-change', v)"
        @current-change="(v: number) => emit('current-change', v)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    data: unknown[];
    total: number;
    loading?: boolean;
    page: number;
    pageSize: number;
    pageSizes?: number[];
    emptyText?: string;
  }>(),
  {
    loading: false,
    pageSizes: () => [10, 20, 50, 100],
    emptyText: '暂无数据',
  },
);

const emit = defineEmits<{
  'update:page': [val: number];
  'update:pageSize': [val: number];
  'size-change': [val: number];
  'current-change': [val: number];
}>();
</script>

<style scoped>
.base-table-wrapper { width: 100%; }
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  background: var(--card-bg);
  padding: 12px;
  border-radius: 8px;
}
</style>
