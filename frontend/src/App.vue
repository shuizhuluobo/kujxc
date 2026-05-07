<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useSSE } from '@/composables/useSSE';

const authStore = useAuthStore();
const sse = useSSE();

watch(() => authStore.token, (newToken) => {
  if (newToken) {
    sse.connect();
  } else {
    sse.disconnect();
  }
});

onMounted(() => {
  if (authStore.token) {
    sse.connect();
  }
});

onUnmounted(() => {
  sse.disconnect();
});
</script>

<style>
/* 全局样式已在 style.css 中定义 */
</style>
