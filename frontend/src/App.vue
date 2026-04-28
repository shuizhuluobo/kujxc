<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSSE } from '@/composables/useSSE';
import { useResponsive } from '@/composables';
import { ElNotification } from 'element-plus';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

const router = useRouter();
const authStore = useAuthStore();
const sse = useSSE();
const { isMobile } = useResponsive();

// 清理函数引用
let cleanupNotificationListener: (() => void) | null = null;

async function setupStatusBar() {
  if (Capacitor.isNativePlatform()) {
    try {
      await StatusBar.setOverlaysWebView({ overlaysWebView: true });
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#ffffff00' }); // Transparent to let app header show through
    } catch (e) {
      console.log('StatusBar not available', e);
    }
  }
}

function navigateToWorkOrder(workOrderId: string | undefined) {
  if (workOrderId) {
    router.push(`/work-orders/${workOrderId}`);
  }
}

watch(() => authStore.token, (newToken) => {
  if (newToken) {
    sse.connect();
  } else {
    sse.disconnect();
  }
});

function handleNotificationCreated(notification: any) {
  // 移动端使用ElNotification
  if (isMobile.value) {
    ElNotification({
      title: notification.title,
      message: notification.content,
      type: 'info',
      duration: 5000,
      offset: 50,
      onClick: () => {
        navigateToWorkOrder(notification.workOrderId);
      }
    });
    return; // 移动端只显示ElNotification，不显示浏览器原生通知
  }

  // 桌面端：浏览器原生通知（NotificationBell已经处理了面板显示）
  const notificationPref = localStorage.getItem('notification_preference');
  const isNotificationEnabled = notificationPref === null || notificationPref === 'enabled';

  if ('Notification' in window && Notification.permission === 'granted' && isNotificationEnabled) {
    try {
        const n = new Notification(notification.title, {
            body: notification.content,
            icon: '/pwa-192x192.png',
            tag: notification.id,
        });
        n.onclick = () => {
            window.focus();
            navigateToWorkOrder(notification.workOrderId);
            n.close();
        };
    } catch (e) {
        console.error('Notification error:', e);
    }
  }
}

onMounted(() => {
  setupStatusBar();
  if (authStore.token) {
    sse.connect();
  }
  // 在onMounted中注册监听器，避免重复注册
  cleanupNotificationListener = sse.on('notification.created', handleNotificationCreated);
});

onUnmounted(() => {
  // 清理监听器
  if (cleanupNotificationListener) {
    cleanupNotificationListener();
    cleanupNotificationListener = null;
  }
});
</script>

<style>
/* 全局样式已在 style.css 中定义 */
</style>
