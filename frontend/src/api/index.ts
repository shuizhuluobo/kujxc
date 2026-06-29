import api from './client';
import type {
    LoginDto,
    LoginResponse,
    User,
    WorkOrder,
    WorkOrderFilterParams,
    PaginatedResponse,
    CreateWorkOrderDto,
    UpdateWorkOrderDto,
    CompleteWorkOrderDto,
    Customer,
    Region,
    ServiceType,
    Role,
    UserStats,
    Notification,
    UpdateUserDto,
    WikiCategory,
    WikiTag,
    WikiArticle,
    PaginationParams,
    WikiArticleFilterParams,
    CreateWikiArticleDto,
    Project,
    WorkRecord,
    PerformanceResult,
    MyPerformanceStats,
    CreateProjectDto,
    UpdateProjectDto,
    CreateWorkRecordDto,
    UpdateWorkRecordDto,
    CustomerDevice,
    GlobalPerformanceResult,
    ProjectMember,
} from '@/types';

// ==================== 认证 ====================
export const authApi = {
    login: (data: LoginDto) => api.post<LoginResponse>('/auth/login', data),
    refresh: (refreshToken: string) => api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken }),
    getProfile: () => api.get<User>('/auth/profile'),
};

// ==================== 用户 ====================
export const usersApi = {
    getAll: (params?: PaginationParams) => api.get<PaginatedResponse<User>>('/users', { params }),
    getOne: (id: string) => api.get<User>(`/users/${id}`),
    create: (data: Partial<User> & { password: string }) => api.post<User>('/users', data),
    update: (id: string, data: UpdateUserDto) => api.patch<User>(`/users/${id}`, data),
    delete: (id: string) => api.delete(`/users/${id}`),
    getProfile: () => api.get<User>('/users/profile'),
    updateProfile: (data: Partial<User>) => api.patch<User>('/users/profile', data),
    changePassword: (data: { oldPassword: string; newPassword: string }) => api.patch('/users/password', data),
    getStats: () => api.get<UserStats>('/users/stats'),
    uploadAvatar: (file: File | Blob) => {
        const formData = new FormData();
        formData.append('file', file, 'avatar.png');
        return api.post<{ url: string }>('/uploads/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

export const uploadsApi = {
    uploadImage: (file: File | Blob) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post<{ url: string }>('/uploads/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    uploadWikiAttachment: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post<{ filename: string; url: string; size: number; mimeType: string }>('/uploads/wiki/attachment', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

// ==================== 角色 ====================
export const rolesApi = {
    getAll: () => api.get<Role[]>('/roles'),
    getOne: (id: string) => api.get<Role>(`/roles/${id}`),
    create: (data: { name: string; code: string }) => api.post<Role>('/roles', data),
    update: (id: string, data: { name?: string }) => api.patch<Role>(`/roles/${id}`, data),
    delete: (id: string) => api.delete(`/roles/${id}`),
};

// ==================== 工单 ====================
export const workOrdersApi = {
    getAll: (params?: WorkOrderFilterParams) => api.get<PaginatedResponse<WorkOrder>>('/work-orders', { params }),
    getPending: (regionId?: string) => api.get<WorkOrder[]>('/work-orders/pending', { params: { regionId } }),
    getOne: (id: string) => api.get<WorkOrder>(`/work-orders/${id}`),
    create: (data: CreateWorkOrderDto) => api.post<WorkOrder>('/work-orders', data),
    update: (id: string, data: UpdateWorkOrderDto) => api.patch<WorkOrder>(`/work-orders/${id}`, data),
    delete: (id: string) => api.delete(`/work-orders/${id}`),
    receive: (id: string) => api.post<WorkOrder>(`/work-orders/${id}/receive`),
    cancelReceive: (id: string) => api.patch<WorkOrder>(`/work-orders/${id}/cancel-receive`),
    complete: (id: string, data?: CompleteWorkOrderDto) => api.post<WorkOrder>(`/work-orders/${id}/complete`, data),
    export: (params?: WorkOrderFilterParams) => api.get('/work-orders/export', { params, responseType: 'blob' }),
    getStats: (regionId?: string) => api.get<{ pending: number; received: number; total: number }>('/work-orders/stats', { params: { regionId } }),
};

// ==================== 客户 ====================
export const customersApi = {
    getAll: (params?: PaginationParams) => api.get<PaginatedResponse<Customer>>('/customers', { params }),
    getOne: (id: string) => api.get<Customer>(`/customers/${id}`),
    create: (data: Partial<Customer>) => api.post<Customer>('/customers', data),
    update: (id: string, data: Partial<Customer>) => api.patch<Customer>(`/customers/${id}`, data),
    delete: (id: string) => api.delete(`/customers/${id}`),
};

// ==================== 区域 ====================
export const regionsApi = {
    getAll: () => api.get<Region[]>('/regions'),
    getOne: (id: string) => api.get<Region>(`/regions/${id}`),
    create: (data: Partial<Region>) => api.post<Region>('/regions', data),
    update: (id: string, data: Partial<Region>) => api.patch<Region>(`/regions/${id}`, data),
    delete: (id: string) => api.delete(`/regions/${id}`),
};

// ==================== 服务类型 ====================
export const serviceTypesApi = {
    getAll: () => api.get<ServiceType[]>('/service-types'),
    getOne: (id: string) => api.get<ServiceType>(`/service-types/${id}`),
    create: (data: Partial<ServiceType>) => api.post<ServiceType>('/service-types', data),
    update: (id: string, data: Partial<ServiceType>) => api.patch<ServiceType>(`/service-types/${id}`, data),
    delete: (id: string) => api.delete(`/service-types/${id}`),
};

// ==================== 通知 ====================
export const notificationsApi = {
    getAll: () => api.get<Notification[]>('/notifications/all'),
    getUnread: () => api.get<Notification[]>('/notifications'),
    getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
    markRead: (ids: string[]) => api.post('/notifications/mark-read', { ids }),
    markAllRead: () => api.post('/notifications/mark-all-read'),
};

// ==================== 知识库 ====================
export const wikiApi = {
    // 分类
    getCategories: () => api.get<WikiCategory[]>('/wiki/categories'),
    createCategory: (data: Partial<WikiCategory>) => api.post<WikiCategory>('/wiki/categories', data),
    updateCategory: (id: string, data: Partial<WikiCategory>) => api.patch<WikiCategory>(`/wiki/categories/${id}`, data),
    deleteCategory: (id: string) => api.delete(`/wiki/categories/${id}`),

    // 标签
    getTags: () => api.get<WikiTag[]>('/wiki/tags'),

    // 文章
    getArticles: (params?: WikiArticleFilterParams) => api.get<PaginatedResponse<WikiArticle>>('/wiki/articles', { params }),
    getArticle: (id: string) => api.get<WikiArticle>(`/wiki/articles/${id}`),
    createArticle: (data: CreateWikiArticleDto) => api.post<WikiArticle>('/wiki/articles', data),
    updateArticle: (id: string, data: Partial<CreateWikiArticleDto>) => api.patch<WikiArticle>(`/wiki/articles/${id}`, data),
    deleteArticle: (id: string) => api.delete(`/wiki/articles/${id}`),
    toggleLike: (id: string) => api.post<{ isLiked: boolean }>(`/wiki/articles/${id}/like`),
};

// ==================== 项目台账-费用计算 ====================
export interface FeeItem {
    category: string;
    item: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface FeeSetting {
    id: string;
    category: string;
    item: string;
    unit: string;
    price: number;
    description?: string;
    threshold?: number;
    sortOrder: number;
    isActive: boolean;
}

export interface FeeRecord {
    id: string;
    items: FeeItem[];
    subtotal: number;
    discount: number;
    actualAmount: number;
    remark?: string;
    projectId?: string;
    customerId?: string;
    customer?: { id: string; name: string };
    collaboratorIds?: string[];
    createdAt: string;
    creatorId?: string;
    creator?: { id?: string; name: string };
}

export interface FeeRecordsResult {
    data: FeeRecord[];
    total: number;
}

export interface FeeStatsResult {
    totalRecords: number;
    totalAmount: number;
    totalDiscount: number;
    totalActual: number;
    byCategory: Record<string, { count: number; amount: number }>;
}

export const feeApi = {
    getSettings: (category?: string, isActive?: boolean) => api.get<FeeSetting[]>('/fee/settings', { params: { category, isActive } }),
    getSetting: (id: string) => api.get<FeeSetting>(`/fee/settings/${id}`),
    updateSetting: (id: string, data: { price?: number; unit?: string; description?: string; isActive?: boolean; sortOrder?: number }) =>
        api.put<FeeSetting>(`/fee/settings/${id}`, data),
    createSetting: (data: { category: string; item: string; unit: string; price: number; description?: string; threshold?: number; sortOrder?: number }) =>
        api.post<FeeSetting>('/fee/settings', data),
    deleteSetting: (id: string) => api.delete(`/fee/settings/${id}`),
    calculate: (items: { category: string; item: string; quantity: number }[]) =>
        api.post<{ items: FeeItem[]; subtotal: number; discount: number; actualAmount: number }>('/fee/calculate', { items }),
    saveRecord: (data: { items: FeeItem[]; subtotal: number; discount: number; actualAmount: number; remark?: string; projectId?: string; customerId?: string }) =>
        api.post<FeeRecord>('/fee/records', data),
    getRecords: (params?: { limit?: number; offset?: number; startDate?: string; endDate?: string; creatorId?: string; projectId?: string; customerId?: string }) =>
        api.get<FeeRecordsResult>('/fee/records', { params }),
    deleteRecord: (id: string) => api.delete(`/fee/records/${id}`),
    getStats: (params?: { startDate?: string; endDate?: string }) =>
        api.get<FeeStatsResult>('/fee/stats', { params }),
    initSettings: () => api.post('/fee/settings/init'),
};

// ==================== 绩效统计 ====================
export const performanceApi = {
    getProjects: () => api.get<Project[]>('/performance/projects'),
    getProject: (id: string) => api.get<Project>(`/performance/projects/${id}`),
    createProject: (data: CreateProjectDto) => api.post<Project>('/performance/projects', data),
    updateProject: (id: string, data: UpdateProjectDto) => api.patch<Project>(`/performance/projects/${id}`, data),
    deleteProject: (id: string) => api.delete(`/performance/projects/${id}`),

    getRecords: (projectId: string) => api.get<WorkRecord[]>(`/performance/projects/${projectId}/records`),
    createRecord: (projectId: string, data: CreateWorkRecordDto) =>
        api.post<WorkRecord>(`/performance/projects/${projectId}/records`, data),
    updateRecord: (projectId: string, recordId: string, data: UpdateWorkRecordDto) =>
        api.patch<WorkRecord>(`/performance/projects/${projectId}/records/${recordId}`, data),
    deleteRecord: (projectId: string, recordId: string) =>
        api.delete(`/performance/projects/${projectId}/records/${recordId}`),

    getDevices: (projectId: string) => api.get<CustomerDevice[]>(`/performance/projects/${projectId}/devices`),
    createDevice: (projectId: string, data: { customerId: string; deviceName: string; expectedQuantity: number; remark?: string }) =>
        api.post<CustomerDevice>(`/performance/projects/${projectId}/devices`, data),
    updateDevice: (deviceId: string, data: { customerId?: string; deviceName?: string; expectedQuantity?: number; remark?: string }) =>
        api.patch<CustomerDevice>(`/performance/devices/${deviceId}`, data),
    deleteDevice: (deviceId: string) => api.delete(`/performance/devices/${deviceId}`),

    getStats: (projectId: string) => api.get<PerformanceResult[]>(`/performance/projects/${projectId}/stats`),
    getMyStats: (projectId: string) => api.get<MyPerformanceStats>(`/performance/projects/${projectId}/stats/me`),

    getGlobalStats: (params?: { startDate?: string; endDate?: string; userId?: string }) =>
        api.get<GlobalPerformanceResult[]>('/performance/global-stats', { params }),

    exportProject: (projectId: string) => api.get(`/performance/projects/${projectId}/export`, { responseType: 'blob' }),
    exportProjects: (projectIds?: string[]) => api.get('/performance/projects/export', { 
        params: projectIds?.length ? { ids: projectIds.join(',') } : {},
        responseType: 'blob' 
    }),

    getFeeRecords: (projectId: string) => api.get<FeeRecord[]>(`/performance/projects/${projectId}/fee-records`),
    saveFeeRecord: (projectId: string, data: { items: FeeItem[]; subtotal: number; discount: number; actualAmount: number; remark?: string; customerId?: string; collaboratorIds?: string[] }) =>
        api.post<FeeRecord>(`/performance/projects/${projectId}/fee-records`, data),
    deleteFeeRecord: (projectId: string, recordId: string) => api.delete(`/performance/projects/${projectId}/fee-records/${recordId}`),
    // 公物仓独立费用记录（无项目关联）
    getWarehouseFeeRecords: () => api.get<FeeRecord[]>(`/performance/warehouse/fee-records`),
    saveWarehouseFeeRecord: (data: { items: FeeItem[]; subtotal: number; discount: number; actualAmount: number; remark?: string; customerId?: string; collaboratorIds?: string[] }) =>
        api.post<FeeRecord>(`/performance/warehouse/fee-records`, data),
    deleteWarehouseFeeRecord: (recordId: string) => api.delete(`/performance/warehouse/fee-records/${recordId}`),
};
