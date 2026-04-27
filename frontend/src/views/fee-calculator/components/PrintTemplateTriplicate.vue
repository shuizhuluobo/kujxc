<template>
  <div class="triplicate-preview" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PrintData } from '../composables/usePrint';
import { renderTriplicateTemplate } from '../composables/usePrint';

const props = defineProps<{ data: PrintData }>();

const renderedHtml = computed(() => renderTriplicateTemplate(props.data));
</script>

<style scoped>
.triplicate-preview {
  font-family: SimSun, serif;
  background: #fff;
  color: #000;
  font-size: 8pt;
  line-height: 1.4;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 8px;
  border: 1px solid #ddd;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.triplicate-preview :deep(table) {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
}

.triplicate-preview :deep(th),
.triplicate-preview :deep(td) {
  border: 1px solid #000;
  padding: 1px 4px;
  text-align: center;
}

.triplicate-preview :deep(th) {
  background: #f0f0f0;
  font-weight: bold;
}

.triplicate-preview :deep(.item-name) {
  text-align: left;
  padding-left: 6px;
}

.triplicate-preview :deep(.amount) {
  text-align: right;
  padding-right: 6px;
  font-family: 'Courier New', monospace;
}

.triplicate-preview :deep(.sign-line) {
  display: inline-block;
  width: 80px;
  border-bottom: 1px solid #000;
}

.triplicate-preview :deep(.value) {
  border-bottom: 1px solid #333;
}
</style>
