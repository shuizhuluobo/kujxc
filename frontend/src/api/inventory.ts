import api from './client';
import type {
    InventoryBatch,
    InventoryFilterParams,
    StockItem,
    StockQueryParams,
    PaginatedResponse,
    SaleOrder,
    SaleFilterParams,
    CreateSaleOrderDto,
    ApproveSaleDto,
    TransferOrder,
    CreateTransferDto,
    TransferFilterParams,
    ReturnOrder,
    CreateReturnDto,
    ReturnFilterParams,
    StockCheckOrder,
    CreateStockCheckDto,
    StockCheckFilterParams,
} from '@/types';

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
    // 销售出库
    listSales: (params?: SaleFilterParams) => api.get<PaginatedResponse<SaleOrder>>('/inventory/sales', { params }),
    getSale: (id: string) => api.get<SaleOrder>(`/inventory/sales/${id}`),
    createSale: (data: CreateSaleOrderDto) => api.post<SaleOrder>('/inventory/sales', data),
    approveSale: (id: string, data?: ApproveSaleDto) => api.post<SaleOrder>(`/inventory/sales/${id}/approve`, data ?? {}),
    // 调拨
    listTransfers: (params?: TransferFilterParams) => api.get<PaginatedResponse<TransferOrder>>('/inventory/transfers', { params }),
    getTransfer: (id: string) => api.get<TransferOrder>(`/inventory/transfers/${id}`),
    createTransfer: (data: CreateTransferDto) => api.post<TransferOrder>('/inventory/transfers', data),
    // 退货
    listReturns: (params?: ReturnFilterParams) => api.get<PaginatedResponse<ReturnOrder>>('/inventory/returns', { params }),
    getReturn: (id: string) => api.get<ReturnOrder>(`/inventory/returns/${id}`),
    createReturn: (data: CreateReturnDto) => api.post<ReturnOrder>('/inventory/returns', data),
    // 盘点
    listChecks: (params?: StockCheckFilterParams) => api.get<PaginatedResponse<StockCheckOrder>>('/inventory/checks', { params }),
    getCheck: (id: string) => api.get<StockCheckOrder>(`/inventory/checks/${id}`),
    createCheck: (data: CreateStockCheckDto) => api.post<StockCheckOrder>('/inventory/checks', data),
};
