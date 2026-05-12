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

// 连接锁，防止并发调用 connect() 导致重复连接
let isConnecting = false;

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
        // 防止重复并发连接
        if (isConnecting) return;
        isConnecting = true;

        try {
            // 关闭旧连接
            disconnect(false);

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
                // EventSource 遇到错误时，浏览器会自动用原 URL 重连
                // 但如果 token 过期会导致无限 401 循环
                // 因此我们需要：关闭旧连接 -> 用新 token 重新连接
                isConnected.value = false;
                
                // 保存引用后清空全局变量，防止 scheduleReconnect 时重复关闭
                const currentEs = es;
                eventSource.value = null;
                
                // 立即关闭，阻止浏览器自动重连（使用过期token）
                if (currentEs.readyState !== EventSource.CLOSED) {
                    currentEs.close();
                }
                
                // 用新的 token 重连
                scheduleReconnect();
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
        } finally {
            isConnecting = false;
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
