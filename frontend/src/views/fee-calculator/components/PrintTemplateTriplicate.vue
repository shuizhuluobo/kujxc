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
/* A4纵向纸张: 210mm x 297mm，比例约 1:1.414 */
.triplicate-preview {
  font-family: SimSun, serif;
  background: #fff;
  color: #000;
  font-size: 8pt;
  line-height: 1.4;
  width: 210mm;
  height: 297mm;
  margin: 0 auto;
  padding: 5mm 6mm;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.triplicate-preview :deep(.trip-template) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.triplicate-preview :deep(.trip-title) {
  font-size: 11pt;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2mm;
  letter-spacing: 1px;
}

.triplicate-preview :deep(.trip-info) {
  font-size: 7pt;
  margin-bottom: 1.5mm;
}

.triplicate-preview :deep(.trip-info-row) {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2mm;
  margin-bottom: 1mm;
}

.triplicate-preview :deep(.trip-info-row .label) {
  font-weight: normal;
}

.triplicate-preview :deep(.trip-info-row .value) {
  border-bottom: 1px solid #333;
  padding: 0 1px;
  min-width: 40px;
  display: inline-block;
}

.triplicate-preview :deep(table) {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
}

.triplicate-preview :deep(th),
.triplicate-preview :deep(td) {
  border: 1px solid #000;
  padding: 0.5px 1px;
  text-align: center;
  font-size: 7pt;
}

.triplicate-preview :deep(th) {
  background: #f0f0f0;
  font-weight: bold;
}

.triplicate-preview :deep(.item-name) {
  text-align: left;
  padding-left: 2px;
}

.triplicate-preview :deep(.amount) {
  text-align: right;
  padding-right: 2px;
  font-family: 'Courier New', monospace;
}

.triplicate-preview :deep(.trip-summary) {
  font-size: 7pt;
  margin-bottom: 1mm;
}

.triplicate-preview :deep(.trip-summary-row) {
  display: flex;
  justify-content: flex-end;
  gap: 3mm;
  margin-bottom: 0.5mm;
}

.triplicate-preview :deep(.trip-summary-row .label) {
  min-width: 30px;
}

.triplicate-preview :deep(.trip-summary-row .value) {
  min-width: 50px;
  text-align: right;
  border-bottom: 1px solid #333;
}

.triplicate-preview :deep(.trip-summary-total) {
  font-weight: bold;
  border-top: 1px solid #000;
  padding-top: 0.5mm;
}

.triplicate-preview :deep(.trip-chinese) {
  text-align: right;
  font-size: 6pt;
  color: #666;
}

.triplicate-preview :deep(.trip-remark) {
  font-size: 7pt;
  margin: 1mm 0;
}

.triplicate-preview :deep(.trip-remark .label) {
  font-weight: bold;
}

.triplicate-preview :deep(.trip-sign) {
  font-size: 7pt;
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 2mm;
}

.triplicate-preview :deep(.trip-sign-item) {
  min-width: 60px;
}

.triplicate-preview :deep(.trip-sign-item .sign-line) {
  display: inline-block;
  width: 50px;
  border-bottom: 1px solid #000;
}

.triplicate-preview :deep(.trip-footer) {
  font-size: 6pt;
  text-align: center;
  color: #888;
  margin-top: 1mm;
}
</style>
