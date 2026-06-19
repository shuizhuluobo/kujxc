<template>
  <component :is="isMobile ? MobileProjects : DesktopProjects" />
</template>

<script setup lang="ts">
import { useResponsive } from '@/composables';
import DesktopProjects from './DesktopProjects.vue';
import MobileProjects from './MobileProjects.vue';

const { isMobile } = useResponsive();
</script>
