import api from './client';
import type { InventoryBatch, InventoryFilterParams, StockItem, StockQueryParams, PaginatedResponse } from '@/types';

export const inventoryApi = {
    // 批次
    getBatches: (params?: InventoryFilterParams) => api.get<PaginatedResponse<InventoryBatch>>('/inventory/batches', { params }),
    getBatch: (id: string) => api.get<InventoryBatch>(`/inventory/batches/${id}`),
    createBatch: (data: Record<string, unknown>) => api.post<InventoryBatch>('/inventory/batches', data),
    updateBatch: (id: string, data: Record<string, unknown>) => api.patch<InventoryBatch>(`/inventory/batches/${id}`, data),
    deleteBatch: (id: string) => api.delete(`/inventory/batches/${id}`),
    // kccx 全局库存
    getStock: (params?: StockQueryParams) => api.get<PaginatedResponse<StockItem>>('/inventory/stock', { params }),
    // FIFO
    getFifo: (productId: string) => api.get<InventoryBatch[]>(`/inventory/fifo/${productId}`),
};
