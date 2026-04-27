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
            @click.stop="showCompleteBubble = true"
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
            @click.stop="showDeleteConfirm = true"
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
            @click.stop="showCancelReceiveConfirm = true"
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
  
  <!-- 完成工单气泡弹窗 -->
  <div 
    v-if="showCompleteBubble" 
    class="confirm-bubble"
    @click.self="showCompleteBubble = false"
  >
    <div class="bubble-arrow"></div>
    <div class="bubble-content">
      <div class="bubble-header">
        <span>完成工单</span>
        <span class="close-btn" @click="showCompleteBubble = false">×</span>
      </div>
      <div class="bubble-body">
        <div class="form-item">
          <label>协作人 (可选)</label>
          <el-select 
            v-model="collaboratorIds" 
            multiple 
            filterable 
            :reserve-keyword="false"
            placeholder="请选择协作人"
            style="width: 100%"
            size="small"
          >
            <el-option 
              v-for="u in engineers" 
              :key="u.id" 
              :label="u.name" 
              :value="u.id"
            />
          </el-select>
        </div>
      </div>
      <div class="bubble-footer">
        <button class="btn btn-cancel" @click="showCompleteBubble = false">取消</button>
        <button class="btn btn-confirm" @click="handleComplete">确认完成</button>
      </div>
    </div>
  </div>
  
  <!-- 删除确认气泡弹窗 -->
  <div 
    v-if="showDeleteConfirm" 
    class="confirm-bubble"
    @click.self="showDeleteConfirm = false"
  >
    <div class="bubble-content">
      <div class="bubble-header">
        <span>确认删除</span>
        <span class="close-btn" @click="showDeleteConfirm = false">×</span>
      </div>
      <div class="bubble-body">
        <p class="confirm-message">确定要删除此工单吗？此操作不可撤销。</p>
      </div>
      <div class="bubble-footer">
        <button class="btn btn-cancel" @click="showDeleteConfirm = false">取消</button>
        <button class="btn btn-danger" @click="handleDelete">确认删除</button>
      </div>
    </div>
  </div>
  
  <!-- 取消接收确认气泡弹窗 -->
  <div 
    v-if="showCancelReceiveConfirm" 
    class="confirm-bubble"
    @click.self="showCancelReceiveConfirm = false"
  >
    <div class="bubble-content">
      <div class="bubble-header">
        <span>取消接收</span>
        <span class="close-btn" @click="showCancelReceiveConfirm = false">×</span>
      </div>
      <div class="bubble-body">
        <p class="confirm-message">确定要取消接收此工单吗？工单将重新进入待接收队列。</p>
      </div>
      <div class="bubble-footer">
        <button class="btn btn-cancel" @click="showCancelReceiveConfirm = false">取消</button>
        <button class="btn btn-warning" @click="handleCancelReceive">确认取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import { User } from '@element-plus/icons-vue';
import type { WorkOrder, User as UserType } from '@/types';
import { STATUS_LABELS, SCORE_LABELS, SCORE_VALUES, WorkOrderStatus } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { usePermission } from '@/composables';
import { useBaseDataStore } from '@/stores/baseData';
import { getCustomerDisplayName } from '@/utils/customer';

const props = defineProps<{
  workOrder: WorkOrder;
  showActions?: boolean;
}>();

const { has: hasPermission } = usePermission();
const baseDataStore = useBaseDataStore();

const emit = defineEmits<{
  (e: 'receive', workOrder: WorkOrder): void;
  (e: 'complete', workOrder: WorkOrder, collaboratorIds: string[]): void;
  (e: 'edit', workOrder: WorkOrder): void;
  (e: 'delete', workOrder: WorkOrder): void;
  (e: 'cancel-receive', workOrder: WorkOrder): void;
}>();

const authStore = useAuthStore();
const expanded = ref(false);
const showCompleteBubble = ref(false);
const showDeleteConfirm = ref(false);
const showCancelReceiveConfirm = ref(false);
const collaboratorIds = ref<string[]>([]);

const engineers = computed<UserType[]>(() => {
  return baseDataStore.users.filter(u => u.role?.code === 'engineer');
});

function handleComplete() {
  emit('complete', props.workOrder, collaboratorIds.value);
  showCompleteBubble.value = false;
  collaboratorIds.value = [];
}

function handleDelete() {
  emit('delete', props.workOrder);
  showDeleteConfirm.value = false;
}

function handleCancelReceive() {
  emit('cancel-receive', props.workOrder);
  showCancelReceiveConfirm.value = false;
}

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

/* 确认气泡弹窗 */
.confirm-bubble {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.confirm-bubble .bubble-content {
  position: relative;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 340px;
  overflow: hidden;
  animation: bubbleFadeIn 0.2s ease;
}

.confirm-bubble .bubble-arrow {
  position: absolute;
  top: -8px;
  right: 24px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid white;
}

@keyframes bubbleFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.confirm-bubble .bubble-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 16px 14px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(180deg, #fafafa 0%, white 100%);
  border-radius: 16px 16px 0 0;
}

.confirm-bubble .close-btn {
  font-size: 24px;
  color: #999;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.confirm-bubble .close-btn:hover {
  color: #666;
  background: #f0f0f0;
}

.confirm-bubble .bubble-body {
  padding: 16px;
}

.confirm-bubble .form-item {
  margin-bottom: 0;
}

.confirm-bubble .form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.confirm-bubble .confirm-message {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  text-align: center;
  margin: 0;
}

.confirm-bubble .bubble-footer {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
}

.confirm-bubble .btn {
  flex: 1;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-bubble .btn:active {
  transform: scale(0.98);
}

.confirm-bubble .btn-cancel {
  background: #f0f2f5;
  color: var(--text-secondary);
  border: 1px solid #e5e6eb;
}

.confirm-bubble .btn-cancel:hover {
  background: #e8eaef;
}

.confirm-bubble .btn-confirm {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.confirm-bubble .btn-confirm:hover {
  background: linear-gradient(135deg, var(--primary-color-dark) 0%, #1e40af 100%);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.confirm-bubble .btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.confirm-bubble .btn-danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.confirm-bubble .btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.confirm-bubble .btn-warning:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

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
