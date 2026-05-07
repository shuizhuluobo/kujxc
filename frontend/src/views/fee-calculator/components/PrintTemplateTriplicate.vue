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
/* 边距: 左侧1.5cm, 右侧1.5cm, 上下5mm */
/* 字体优化: 使用高对比度字体适合针式打印机 */
.triplicate-preview {
  font-family: 'SimHei', 'Microsoft YaHei', 'Courier New', monospace;
  background: #fff;
  color: #000;
  font-size: 9pt;
  line-height: 1.4;
  width: 210mm;
  height: 297mm;
  margin: 0 auto;
  padding: 5mm 1.5mm 5mm 1.5mm;
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
  font-size: 14pt;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2mm;
  letter-spacing: 2px;
}

.triplicate-preview :deep(.trip-info) {
  font-size: 8pt;
  margin-bottom: 1.5mm;
}

.triplicate-preview :deep(.trip-info-row) {
  display: flex;
  justify-content: flex-start;
  flex-wrap: nowrap;
  gap: 1.5mm;
  margin-bottom: 0.8mm;
  align-items: baseline;
}

.triplicate-preview :deep(.trip-info-row:first-child) {
  justify-content: space-between;
}

.triplicate-preview :deep(.trip-info-row .label) {
  font-weight: normal;
  white-space: nowrap;
}

.triplicate-preview :deep(.trip-info-row .value) {
  border-bottom: 1px solid #000;
  padding: 0 1px;
  min-width: 30px;
  display: inline-block;
}

.triplicate-preview :deep(.trip-info-row .value.wide) {
  min-width: 60px;
}

.triplicate-preview :deep(.trip-info-row .client-name) {
  font-size: 10pt;
  font-weight: bold;
  border-bottom: 2px solid #000;
}

.triplicate-preview :deep(.trip-info-row .contact-info) {
  display: inline-flex;
  gap: 2mm;
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
  font-size: 8pt;
}

.triplicate-preview :deep(th) {
  background: #fff;
  font-weight: bold;
  border-bottom: 2px solid #000;
}

.triplicate-preview :deep(.item-name) {
  text-align: left;
  padding-left: 2px;
}

.triplicate-preview :deep(.amount),
.triplicate-preview :deep(.qty),
.triplicate-preview :deep(.price) {
  text-align: right;
  padding-right: 2px;
  font-family: 'Courier New', monospace;
}

.triplicate-preview :deep(.trip-summary) {
  font-size: 8pt;
  margin-bottom: 1mm;
}

.triplicate-preview :deep(.trip-summary-row) {
  display: flex;
  justify-content: flex-end;
  gap: 2mm;
  margin-bottom: 0.5mm;
}

.triplicate-preview :deep(.trip-summary-row .label) {
  min-width: 28px;
}

.triplicate-preview :deep(.trip-summary-row .value) {
  min-width: 50px;
  text-align: right;
  border-bottom: 1px solid #000;
  font-family: 'Courier New', monospace;
}

.triplicate-preview :deep(.trip-summary-total) {
  font-weight: bold;
  font-size: 9pt;
  border-top: 1.5px solid #000;
  padding-top: 0.8mm;
}

.triplicate-preview :deep(.trip-chinese) {
  text-align: right;
  font-size: 7pt;
  color: #000;
}

.triplicate-preview :deep(.trip-remark) {
  font-size: 8pt;
  margin-bottom: 1mm;
}

.triplicate-preview :deep(.trip-remark .label) {
  font-weight: bold;
}

.triplicate-preview :deep(.trip-sign) {
  font-size: 8pt;
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
  width: 55px;
  border-bottom: 1px solid #000;
}

.triplicate-preview :deep(.trip-sign-item .client-sign-line) {
  width: 90px;
  border-bottom-width: 1.5px;
}

.triplicate-preview :deep(.trip-footer) {
  font-size: 7pt;
  text-align: center;
  color: #000;
  margin-top: 1mm;
}
</style>
