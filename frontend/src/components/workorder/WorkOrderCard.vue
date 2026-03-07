<template>
  <div class="work-order-card" :class="{ expanded }">
    <div class="card-header" @click="expanded = !expanded">
      <div class="main-info">
        <div class="customer-name" :class="{ expanded }">{{ customerDisplayName }}</div>
        <div class="detail-preview" :class="{ expanded }">{{ workOrder.detail }}</div>
      </div>
      
      <div class="header-right">
        <div class="status-tag" :class="statusClass">
          {{ STATUS_LABELS[workOrder.status] }}
        </div>
        
        <!-- Primary Actions (Always Visible) -->
        <div class="primary-actions" v-if="showActions">
          <el-button 
            v-if="workOrder.status === 'PENDING'" 
            type="primary" 
            size="small" 
            @click.stop="$emit('receive', workOrder)"
          >
            接收
          </el-button>
          
          <el-button 
            v-if="canComplete && workOrder.status === 'RECEIVED'" 
            type="success" 
            size="small" 
            @click.stop="$emit('complete', workOrder)"
          >
            完成
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 展开后的详细信息 -->
    <el-collapse-transition>
      <div v-if="expanded" class="expanded-content">
        <div class="meta-info-expanded">
          <el-icon><User /></el-icon>
          <span>{{ formatMeta }}</span>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <span class="label">区域：</span>
            <span>{{ workOrder.region?.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">服务类型：</span>
            <span>{{ workOrder.serviceType?.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">分值：</span>
            <span>{{ SCORE_LABELS[workOrder.scoreLevel] }} ({{ SCORE_VALUES[workOrder.scoreLevel] ?? '-' }})</span>
          </div>
          <div class="info-item">
            <span class="label">创建人：</span>
            <span>{{ workOrder.creator?.name }} · {{ formatDate(workOrder.createdAt) }}</span>
          </div>
          <div class="info-item" v-if="workOrder.receiver">
            <span class="label">接收人：</span>
            <span>{{ workOrder.receiver.name }} · {{ formatDate(workOrder.receivedAt) }}</span>
          </div>
          <div class="info-item" v-if="workOrder.completer">
            <span class="label">完成人：</span>
            <span>{{ workOrder.completer.name }} · {{ formatDate(workOrder.completedAt) }}</span>
          </div>
          <div class="info-item" v-if="workOrder.collaborators?.length">
            <span class="label">协作人：</span>
            <span>{{ workOrder.collaborators.map(c => c.user?.name).join(', ') }}</span>
          </div>
        </div>
      </div>
    </el-collapse-transition>
    
    <!-- 二级操作按钮 (仅展开时显示) -->
    <div class="actions" v-if="showActions && expanded && hasSecondaryActions">
      <!-- 左侧：最新流转人信息 -->
      <div class="flow-info">
        <el-avatar 
          :size="24" 
          :src="flowUser?.avatar"
        >
          {{ flowUser?.name?.charAt(0) }}
        </el-avatar>
        <span class="flow-text">{{ flowInfo }}</span>
      </div>
      
      <!-- 右侧：操作按钮 -->
      <div class="action-buttons">
        <template v-if="workOrder.status === 'PENDING'">
          <el-button 
            v-if="canEdit" 
            size="small" 
            @click.stop="$emit('edit', workOrder)"
          >
            编辑
          </el-button>
          <el-button 
            v-if="canEdit" 
            type="danger" 
            size="small" 
            @click.stop="$emit('delete', workOrder)"
          >
            删除
          </el-button>
        </template>
        
        <template v-else-if="workOrder.status === 'RECEIVED'">
          <!-- 取消接收按钮 (本人已接收的任务) -->
          <el-button 
            v-if="canComplete"
            type="warning" 
            size="small" 
            @click.stop="$emit('cancel-receive', workOrder)"
          >
            取消接收
          </el-button>
          <!-- 转接按钮 (Mobile) -->
          <el-button
            v-else-if="hasPermission('workOrder:receive')"
            type="warning"
            size="small"
            @click.stop="$emit('receive', workOrder)"
          >
            转接
          </el-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import { Document, User } from '@element-plus/icons-vue';
import type { WorkOrder } from '@/types';
import { STATUS_LABELS, SCORE_LABELS, SCORE_VALUES, WorkOrderStatus } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { usePermission } from '@/composables';
import { getCustomerDisplayName } from '@/utils/customer';

const props = defineProps<{
  workOrder: WorkOrder;
  showActions?: boolean;
}>();

const { has: hasPermission } = usePermission();

defineEmits<{
  (e: 'receive', workOrder: WorkOrder): void;
  (e: 'complete', workOrder: WorkOrder): void;
  (e: 'edit', workOrder: WorkOrder): void;
  (e: 'delete', workOrder: WorkOrder): void;
  (e: 'cancel-receive', workOrder: WorkOrder): void;
}>();

const authStore = useAuthStore();
const expanded = ref(false);

const customerDisplayName = computed(() => getCustomerDisplayName(props.workOrder.customer));

const statusClass = computed(() => ({
  pending: props.workOrder.status === WorkOrderStatus.PENDING,
  received: props.workOrder.status === WorkOrderStatus.RECEIVED,
  completed: props.workOrder.status === WorkOrderStatus.COMPLETED,
}));

const canEdit = computed(() => {
  return String(props.workOrder.creatorId) === String(authStore.user?.id) || authStore.isAdmin;
});
const canComplete = computed(() => String(props.workOrder.receiverId) === String(authStore.user?.id));

const flowUser = computed(() => {
  const wo = props.workOrder;
  if (wo.status === WorkOrderStatus.RECEIVED && wo.receiver) {
    return wo.receiver;
  } else {
    return wo.creator;
  }
});

const flowInfo = computed(() => {
  const wo = props.workOrder;
  if (wo.status === WorkOrderStatus.RECEIVED && wo.receiver) {
    return `${wo.receiver.name} · ${formatDate(wo.receivedAt)}`;
  } else {
    return `${wo.creator?.name} · ${formatDate(wo.createdAt)}`;
  }
});

const formatMeta = computed(() => {
  const wo = props.workOrder;
  if (wo.status === WorkOrderStatus.COMPLETED) {
    return `完成人: ${wo.completer?.name} · ${formatDate(wo.completedAt)}`;
  } else if (wo.status === WorkOrderStatus.RECEIVED) {
    return `接收人: ${wo.receiver?.name} · ${formatDate(wo.receivedAt)}`;
  } else {
    return `创建人: ${wo.creator?.name} · ${formatDate(wo.createdAt)}`;
  }
});

function formatDate(date?: string) {
  return date ? dayjs(date).format('MM-DD HH:mm') : '';
}
const hasSecondaryActions = computed(() => {
  const wo = props.workOrder;
  if (wo.status === WorkOrderStatus.PENDING) {
    return canEdit.value; // Edit, Delete
  } else if (wo.status === WorkOrderStatus.RECEIVED) {
    if (canComplete.value) return true; // Cancel Receive
    if (hasPermission('workOrder:receive')) return true; // Transfer
  }
  return false;
});
</script>

<style scoped>
/* 基础样式继承自全局 .work-order-card，这里仅做微调 */

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}

.main-info {
  flex: 1;
  min-width: 0;
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.primary-actions {
  display: flex;
  gap: 4px;
}

.detail-preview {
  /* 收起时显示2行 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

.detail-preview.expanded {
  /* 展开时显示全部内容 */
  display: block;
  -webkit-line-clamp: unset;
  overflow: visible;
}

.customer-name {
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
}

.customer-name.expanded {
  -webkit-line-clamp: unset;
  display: block;
  overflow: visible;
  white-space: normal;
}

/* 文本样式已在全局定义，这里无需重复，除非有特定覆盖 */

/* 状态标签样式已在全局定义 */

.meta-info-expanded {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-color);
  padding: 6px 10px;
  border-radius: 6px;
}

.expanded-content {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-color-lighter);
}

.info-grid {
  display: grid;
  gap: 12px;
}

.info-item {
  font-size: 14px;
  display: flex;
  line-height: 1.5;
}

.info-item .label {
  color: var(--text-secondary);
  width: 70px;
  flex-shrink: 0;
}

.info-item span {
  color: var(--text-primary);
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color-lighter);
  justify-content: space-between;
  align-items: center;
}

.flow-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  flex: 1;
  min-width: 0;
}

.flow-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
</style>
