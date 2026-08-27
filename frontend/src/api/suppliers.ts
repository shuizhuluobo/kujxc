import api from './client';
import type { Supplier, CreateSupplierDto, UpdateSupplierDto, SupplierFilterParams, PaginatedResponse } from '@/types';

export const suppliersApi = {
    getAll: (params?: SupplierFilterParams) => api.get<PaginatedResponse<Supplier>>('/suppliers', { params }),
    getOne: (id: string) => api.get<Supplier>(`/suppliers/${id}`),
    create: (data: CreateSupplierDto) => api.post<Supplier>('/suppliers', data),
    update: (id: string, data: UpdateSupplierDto) => api.patch<Supplier>(`/suppliers/${id}`, data),
    remove: (id: string) => api.delete(`/suppliers/${id}`),
};
