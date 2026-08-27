import api from './client';
import type { Warehouse, CreateWarehouseDto, UpdateWarehouseDto, WarehouseFilterParams, PaginatedResponse } from '@/types';

export const warehousesApi = {
    getAll: (params?: WarehouseFilterParams) => api.get<PaginatedResponse<Warehouse>>('/warehouses', { params }),
    getOne: (id: string) => api.get<Warehouse>(`/warehouses/${id}`),
    create: (data: CreateWarehouseDto) => api.post<Warehouse>('/warehouses', data),
    update: (id: string, data: UpdateWarehouseDto) => api.patch<Warehouse>(`/warehouses/${id}`, data),
    remove: (id: string) => api.delete(`/warehouses/${id}`),
};
