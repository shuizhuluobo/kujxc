<template>
  <div class="notification-bell">
    <el-popover
      placement="bottom-end"
      :width="360"
      trigger="manual"
      v-model:visible="popoverVisible"
      @show="loadNotifications"
      @hide="handleHide"
    >
      <template #reference>
        <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
          <el-button :icon="Bell" circle @click="togglePopover" />
        </el-badge>
      </template>

      <div class="notification-panel">
        <div class="panel-header">
          <span class="title">消息通知</span>
          <div class="header-actions" v-if="notifications.length > 0">
            <el-button link type="primary" size="small" @click="handleMarkAllRead">
              全部已读
            </el-button>
            <el-button link type="danger" size="small" @click="handleClearAll">
              清空
            </el-button>
          </div>
        </div>

        <el-scrollbar max-height="340px">
          <div v-if="loading" class="loading-container">
            <el-icon class="is-loading"><Loading /></el-icon>
          </div>
          <div v-else-if="notifications.length === 0" class="empty-container">
            <el-empty description="暂无通知" :image-size="60" />
          </div>
          <div v-else class="notification-list">
            <div
              v-for="item in notifications"
              :key="item.id"
              :class="['notification-item', { unread: !item.isRead }]"
              @click="handleClick(item)"
            >
              <div class="item-body">
                <div class="item-header">
                  <span class="item-title">{{ item.title }}</span>
                  <span class="item-time">{{ formatTime(item.createdAt) }}</span>
                </div>
                <div class="item-content">{{ item.content }}</div>
              </div>
              <el-button
                class="item-delete"
                type="danger"
                text
                :icon="Close"
                size="small"
                title="忽略此通知"
                @click.stop="handleDelete(item)"
              />
            </div>
          </div>
        </el-scrollbar>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessageBox } from 'element-plus';
import { Bell, Loading, Close } from '@element-plus/icons-vue';
import { notificationsApi } from '@/api';
import type { Notification } from '@/types';
import { useSSE } from '@/composables/useSSE';

const notifications = ref<Notification[]>([]);
const unreadCount = ref(0);
const loading = ref(false);
const popoverVisible = ref(false);

// 加载未读数量
const loadUnreadCount = async () => {
  try {
    const res = await notificationsApi.getUnreadCount();
    unreadCount.value = res.data.count;
  } catch {
    // Silent fail in production
  }
};

// 加载通知列表
const loadNotifications = async () => {
  loading.value = true;
  try {
    const res = await notificationsApi.getUnread();
    notifications.value = res.data;
  } catch {
    // Silent fail in production
  } finally {
    loading.value = false;
  }
};

// 切换气泡显示
const togglePopover = () => {
  popoverVisible.value = !popoverVisible.value;
};

// 点击通知项：仅标记该条为已读，不触发全量操作
const handleClick = async (item: Notification) => {
  if (!item.isRead) {
    await notificationsApi.markRead([item.id]);
    item.isRead = true;
    unreadCount.value = Math.max(0, unreadCount.value - 1);
  }
};

// 单条忽略（删除）
const handleDelete = async (item: Notification) => {
  await notificationsApi.deleteNotification([item.id]);
  notifications.value = notifications.value.filter(n => n.id !== item.id);
  if (!item.isRead) {
    unreadCount.value = Math.max(0, unreadCount.value - 1);
  }
};

// 全部已读
const handleMarkAllRead = async () => {
  await notificationsApi.markAllRead();
  notifications.value.forEach(n => n.isRead = true);
  unreadCount.value = 0;
};

// 清空全部通知
const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm('确定清空全部通知吗？此操作不可撤销。', '提示', {
      type: 'warning',
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }
  await notificationsApi.clearAll();
  notifications.value = [];
  unreadCount.value = 0;
};

// 格式化时间
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  return date.toLocaleDateString('zh-CN');
};

// 清理函数引用
let cleanupSSE: (() => void) | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;

// 定时刷新未读数量
onMounted(() => {
  void loadUnreadCount();
  // SSE 实时监听
  const sse = useSSE();
  // 监听通知创建（仅更新未读计数，不自动弹出气泡）
  cleanupSSE = sse.on('notification.created', () => {
    unreadCount.value++;
  });
  
  // 30秒兜底轮询
  pollTimer = setInterval(loadUnreadCount, 30000);
});

onUnmounted(() => {
  if (cleanupSSE) {
    cleanupSSE();
    cleanupSSE = null;
  }
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
});

// 气泡关闭时仅刷新未读计数，不再自动全部已读
const handleHide = () => {
  void loadUnreadCount();
};
</script>

<style scoped>
.notification-panel {
  margin: -12px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color-lighter);
}

.panel-header .title {
  font-weight: 600;
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.loading-container,
.empty-container {
  padding: 24px;
  text-align: center;
}

.notification-list {
  padding: 8px 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-left: 3px solid transparent;
}

.notification-item:hover {
  background-color: var(--bg-color);
}

.notification-item:hover .item-delete {
  opacity: 1;
}

.notification-item.unread {
  border-left-color: var(--primary-color);
  background-color: rgba(var(--primary-rgb), 0.06);
}

.item-body {
  flex: 1;
  min-width: 0;
}

.item-delete {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.item-title {
  font-weight: 500;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.item-time {
  font-size: 11px;
  color: var(--text-tertiary);
}

.item-content {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
