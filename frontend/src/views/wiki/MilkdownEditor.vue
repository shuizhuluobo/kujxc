<template>
  <div class="milkdown-editor" :class="{ 'fullscreen': isFullscreen }">
    <div ref="editorRef" class="milkdown-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { history } from '@milkdown/plugin-history';

const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const editorRef = ref<HTMLElement | null>(null);
const editor = ref<Editor | null>(null);
const isFullscreen = ref(false);

onMounted(() => {
  if (!editorRef.value) return;

  editor.value = await Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, editorRef.value);
      ctx.set(defaultValueCtx, props.modelValue || '');
      
      // 监听内容变化
      ctx.get(listenerCtx).markdownUpdated((ctx, markdown, prevMarkdown) => {
        emit('update:modelValue', markdown);
      });
      
      // 设置占位符
      if (props.placeholder) {
        // Milkdown 占位符配置
      }
    })
    .config(nord)
    .use(commonmark)
    .use(gfm)
    .use(listener)
    .use(history)
    .create();
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});

watch(() => props.modelValue, (newValue) => {
  if (editor.value && newValue !== undefined) {
    const currentContent = editor.value.get();
    if (currentContent !== newValue) {
      editor.value.set(newValue);
    }
  }
});
</script>

<style scoped>
.milkdown-editor {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.milkdown-container {
  min-height: 400px;
}

.milkdown-container :deep(.milkdown) {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.milkdown-container :deep(.milkdown) {
  padding: 16px;
}

.milkdown-container :deep(.milkdown) {
  outline: none;
}

.milkdown-container :deep(.milkdown .paragraph) {
  margin: 8px 0;
}

.milkdown-container :deep(.milkdown h1) {
  font-size: 28px;
  font-weight: 700;
  margin: 24px 0 16px;
}

.milkdown-container :deep(.milkdown h2) {
  font-size: 22px;
  font-weight: 600;
  margin: 20px 0 14px;
}

.milkdown-container :deep(.milkdown h3) {
  font-size: 18px;
  font-weight: 600;
  margin: 16px 0 12px;
}

.milkdown-container :deep(.milkdown code) {
  background: var(--bg-color-page);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9em;
}

.milkdown-container :deep(.milkdown pre) {
  background: var(--bg-color-page);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  margin: 16px 0;
}

.milkdown-container :deep(.milkdown pre code) {
  background: none;
  padding: 0;
}

.milkdown-container :deep(.milkdown blockquote) {
  border-left: 4px solid var(--primary-color);
  margin: 16px 0;
  padding: 8px 16px;
  background: var(--bg-color);
  color: var(--text-secondary);
}

.milkdown-container :deep(.milkdown ul),
.milkdown-container :deep(.milkdown ol) {
  padding-left: 24px;
  margin: 12px 0;
}

.milkdown-container :deep(.milkdown table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}

.milkdown-container :deep(.milkdown th),
.milkdown-container :deep(.milkdown td) {
  border: 1px solid var(--border-color);
  padding: 8px 12px;
  text-align: left;
}

.milkdown-container :deep(.milkdown img) {
  max-width: 100%;
  border-radius: 6px;
}
</style>
