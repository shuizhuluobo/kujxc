<template>
  <div class="a4-preview" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PrintData } from '../composables/usePrint';
import { renderA4Template } from '../composables/usePrint';

const props = defineProps<{ data: PrintData }>();

const renderedHtml = computed(() => renderA4Template(props.data));
</script>

<style scoped>
.a4-preview {
  font-family: SimSun, serif;
  background: #fff;
  color: #000;
  font-size: 11pt;
  line-height: 1.6;
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  padding: 15mm;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform-origin: top left;
}

.a4-preview :deep(table) {
  border-collapse: collapse;
  width: 100%;
}

.a4-preview :deep(th),
.a4-preview :deep(td) {
  border: 1px solid #000;
  padding: 4px 8px;
  text-align: center;
}

.a4-preview :deep(th) {
  background: #f0f0f0;
  font-weight: bold;
}

.a4-preview :deep(.item-name) {
  text-align: left;
  padding-left: 12px;
}

.a4-preview :deep(.amount) {
  text-align: right;
  padding-right: 12px;
  font-family: 'Courier New', monospace;
}

.a4-preview :deep(.sign-line) {
  display: inline-block;
  width: 120px;
  border-bottom: 1px solid #000;
}

.a4-preview :deep(.value) {
  border-bottom: 1px solid #333;
}
</style>
