import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/api/client';

// 全局单例状态，确保多个组件使用时共享同一个连接
interface SSEEvent {
    type: string;
    payload: unknown;
}

const eventSource = ref<EventSource | null>(null);
const isConnected = ref(false);
const lastEvent = ref<SSEEvent | null>(null);

// 重连相关状态
let retryCount = 0;
const MAX_RETRY_COUNT = 10;
const BASE_RETRY_DELAY = 1000; // 1秒
const MAX_RETRY_DELAY = 30000; // 30秒
let retryTimer: ReturnType<typeof setTimeout> | null = null;

// 简单的事件总线，用于分发业务事件
type EventHandler = (payload: unknown) => void;
const listeners = new Map<string, Set<EventHandler>>();

export function useSSE() {
    const authStore = useAuthStore();

    function clearRetryTimer() {
        if (retryTimer) {
            clearTimeout(retryTimer);
            retryTimer = null;
        }
    }

    function scheduleReconnect() {
        if (retryCount >= MAX_RETRY_COUNT) {
            console.warn('[SSE] Max retry count reached, giving up reconnection');
            return;
        }

        // 指数退避：1s, 2s, 4s, 8s, 16s, 30s, 30s...
        const delay = Math.min(BASE_RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY);
        retryCount++;

        console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${retryCount}/${MAX_RETRY_COUNT})`);

        clearRetryTimer();
        retryTimer = setTimeout(() => {
            connect();
        }, delay);
    }

    async function connect() {
        if (eventSource.value?.readyState === EventSource.OPEN) return;
        if (!authStore.token) return;

        // 关闭旧连接
        disconnect(false);

        try {
            // 获取SSE专用token（60秒有效期）
            const response = await api.get('/events/token');
            const sseToken = response.data.token;

            // 始终使用相对路径，通过 nginx 反向代理
            const sseUrl = `/api/events/sse?token=${encodeURIComponent(sseToken)}`;

            const es = new EventSource(sseUrl);

            es.onopen = () => {
                isConnected.value = true;
                // 连接成功后重置重连计数
                retryCount = 0;
            };

            es.onerror = () => {
                if (es.readyState === EventSource.CLOSED) {
                    isConnected.value = false;
                    eventSource.value = null;
                    // 自动重连
                    scheduleReconnect();
                }
                // CONNECTING 状态下 EventSource 会自动重试，无需手动处理
            };

            // 监听通用消息
            es.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data) as SSEEvent;
                    // 忽略心跳消息
                    if (data.type === 'heartbeat') return;
                    // 数据结构: { type: 'work-order.created', payload: { ... } }
                    if (data.type && data.payload) {
                        lastEvent.value = data;
                        dispatch(data.type, data.payload);
                    }
                } catch {
                    // JSON解析失败，静默处理
                }
            };

            eventSource.value = es;
        } catch (error) {
            console.error('[SSE] Failed to connect:', error);
            // 连接失败也尝试重连
            scheduleReconnect();
        }
    }

    function disconnect(clearListeners = true) {
        clearRetryTimer();
        retryCount = 0;
        if (eventSource.value) {
            eventSource.value.close();
            eventSource.value = null;
            isConnected.value = false;
        }
        // 清理所有监听器，防止内存泄漏
        if (clearListeners) {
            listeners.clear();
        }
    }

    // 注册事件监听
    function on(eventType: string, handler: EventHandler) {
        if (!listeners.has(eventType)) {
            listeners.set(eventType, new Set());
        }
        listeners.get(eventType)!.add(handler);

        // 返回清理函数
        return () => off(eventType, handler);
    }

    function off(eventType: string, handler: EventHandler) {
        const set = listeners.get(eventType);
        if (set) {
            set.delete(handler);
            // 如果没有监听器了，清理Map
            if (set.size === 0) {
                listeners.delete(eventType);
            }
        }
    }

    function dispatch(eventType: string, payload: unknown) {
        const set = listeners.get(eventType);
        if (set) {
            set.forEach(handler => handler(payload));
        }

        // 如果是工单相关事件且不是通用的 change 事件，则触发通用的 'work-order.change'
        if (eventType.startsWith('work-order.') && eventType !== 'work-order.change') {
            dispatch('work-order.change', payload);
        }
    }

    return {
        connect,
        disconnect,
        isConnected,
        on,
        off,
    };
}
