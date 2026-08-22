import api from './client';
import type {
    Brand,
    Category,
    CreateProductDto,
    CreateQuotationDto,
    PaginatedResponse,
    Product,
    ProductChangeLog,
    ProductFilterParams,
    ProductListResponse,
    ProductStatus,
    ProductTag,
    Quotation,
    QuotationFilterParams,
    QuotationStatus,
    QuotationTemplate,
    UpdateProductDto,
} from '@/types';

// ==================== 产品 ====================
export const productsApi = {
    getAll: (params?: ProductFilterParams) =>
        api.get<ProductListResponse>('/products', { params }),
    getFavorites: (params?: ProductFilterParams) =>
        api.get<ProductListResponse>('/products/favorites', { params }),
    getOne: (id: string) => api.get<Product>(`/products/${id}`),
    create: (data: CreateProductDto) => api.post<Product>('/products', data),
    update: (id: string, data: UpdateProductDto) =>
        api.patch<Product>(`/products/${id}`, data),
    remove: (id: string) => api.delete(`/products/${id}`),
    recordView: (id: string) => api.post(`/products/${id}/view`),
    toggleFavorite: (id: string) =>
        api.post<{ isFavorite: boolean }>(`/products/${id}/favorite`),
    getChangeLogs: (id: string) =>
        api.get<ProductChangeLog[]>(`/products/${id}/change-logs`),
    batchStatus: (data: { ids: string[]; status: ProductStatus }) =>
        api.patch('/products/batch/status', data),
    batchDelete: (data: { ids: string[] }) =>
        api.patch('/products/batch/delete', data),
    acknowledgeStale: (id: string) =>
        api.patch<Product>(`/products/${id}/acknowledge-stale`),
    exportList: (params?: ProductFilterParams) =>
        api.get<Blob>('/products/export', {
            params,
            responseType: 'blob',
            timeout: 60000,
        }),
};

// ==================== 品牌 ====================
export const brandsApi = {
    getAll: () => api.get<Brand[]>('/brands'),
    create: (data: Partial<Brand>) => api.post<Brand>('/brands', data),
    update: (id: string, data: Partial<Brand>) =>
        api.patch<Brand>(`/brands/${id}`, data),
    remove: (id: string) => api.delete(`/brands/${id}`),
};

// ==================== 类型（分类树） ====================
export interface CreateCategoryDto {
    name: string;
    parentId?: string;
    description?: string;
    sortOrder?: number;
}

export const categoriesApi = {
    getTree: () => api.get<Category[]>('/categories'),
    create: (data: CreateCategoryDto) =>
        api.post<Category>('/categories', data),
    update: (id: string, data: Partial<CreateCategoryDto>) =>
        api.patch<Category>(`/categories/${id}`, data),
    remove: (id: string) => api.delete(`/categories/${id}`),
};

// ==================== 标签 ====================
export const productTagsApi = {
    getAll: () => api.get<ProductTag[]>('/product-tags'),
    create: (data: Partial<ProductTag>) =>
        api.post<ProductTag>('/product-tags', data),
    update: (id: string, data: Partial<ProductTag>) =>
        api.patch<ProductTag>(`/product-tags/${id}`, data),
    remove: (id: string) => api.delete(`/product-tags/${id}`),
};

// ==================== 报价 ====================
export const quotationsApi = {
    getAll: (params?: QuotationFilterParams) =>
        api.get<PaginatedResponse<Quotation>>('/quotations', { params }),
    getOne: (id: string) => api.get<Quotation>(`/quotations/${id}`),
    create: (data: CreateQuotationDto) =>
        api.post<Quotation>('/quotations', data),
    createVersion: (id: string, data: CreateQuotationDto) =>
        api.post<Quotation>(`/quotations/${id}/versions`, data),
    getVersions: (id: string) =>
        api.get<Quotation[]>(`/quotations/${id}/versions`),
    updateStatus: (id: string, status: QuotationStatus) =>
        api.patch<Quotation>(`/quotations/${id}/status`, { status }),
    remove: (id: string) => api.delete(`/quotations/${id}`),
    exportDocx: (
        id: string,
        options?: { templateId?: string; config?: Record<string, unknown> },
    ) =>
        api.post<Blob>(
            `/quotations/${id}/export-docx`,
            options || {},
            {
                responseType: 'blob',
                timeout: 60000,
            },
        ),
};

// ==================== 报价模板 ====================
export const quotationTemplatesApi = {
    getAll: () => api.get<QuotationTemplate[]>('/quotation-templates'),
    getDefault: () => api.get<QuotationTemplate>('/quotation-templates/default'),
    getOne: (id: string) =>
        api.get<QuotationTemplate>(`/quotation-templates/${id}`),
    create: (data: Partial<QuotationTemplate>) =>
        api.post<QuotationTemplate>('/quotation-templates', data),
    update: (id: string, data: Partial<QuotationTemplate>) =>
        api.patch<QuotationTemplate>(`/quotation-templates/${id}`, data),
    remove: (id: string) => api.delete(`/quotation-templates/${id}`),
};

// ==================== 系统设置（产品库相关） ====================
export const settingsApi = {
    get: (key: string) => api.get<unknown>(`/settings/${key}`),
    update: (key: string, value: unknown) =>
        api.patch<unknown>(`/settings/${key}`, { value }),
};

// ==================== 产品图片/证书上传 ====================

/** 单文件 multipart 上传的统一包装 */
function postFile<T>(url: string, file: File | Blob, config?: Parameters<typeof api.post>[2]) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<T>(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        ...config,
    });
}

export const productUploadsApi = {
    uploadProductImage: (file: File | Blob) =>
        postFile<{ url: string }>('/uploads/product/image', file),
    uploadProductCertificate: (file: File | Blob) =>
        postFile<{
            filename: string;
            url: string;
            size: number;
            mimeType: string;
        }>('/uploads/product/certificate', file),
};

// ==================== 产品批量导入 ====================
export interface ImportOptions {
    createMissingBrand?: boolean;
    createMissingCategory?: boolean;
    createMissingTags?: boolean;
    defaultStatus?: ProductStatus;
    duplicateStrategy?: 'skip' | 'overwrite' | 'create';
}

export interface ImportUploadResult {
    headers: string[];
    /** 全量解析行：preview/execute 时回传后端 */
    rows: Record<string, unknown>[];
    /** 仅用于界面展示的前几行 */
    previewRows: Record<string, unknown>[];
    totalRows: number;
    suggestion: Record<string, string>;
}

export interface ImportRowIssue {
    rowNumber: number;
    field?: string;
    level?: 'error' | 'warning';
    message: string;
    rawData?: Record<string, unknown>;
}

export interface ImportPreviewResult {
    totalRows: number;
    errorRows: number;
    warningRows: number;
    okRows: number;
    rows: Array<{
        rowNumber: number;
        mapped: Record<string, string>;
        status: 'error' | 'warning' | 'ok';
        issues: ImportRowIssue[];
    }>;
    issues: ImportRowIssue[];
}

export interface ImportExecuteResult {
    logId: string;
    totalRows: number;
    successRows: number;
    overwrittenRows: number;
    failedRows: number;
    skippedRows: number;
    createdBrands: string[];
    createdTags: string[];
    errors: ImportRowIssue[];
}

export interface ImportLog {
    id: string;
    fileName: string;
    totalRows: number;
    successRows: number;
    failedRows: number;
    skippedRows: number;
    status: string;
    createdAt: string;
    createdBy?: string | null;
}

export interface ImportTemplate {
    id: string;
    name: string;
    description?: string | null;
    mappingConfig: Record<string, string>;
    isGlobal: boolean;
    createdAt: string;
    updatedAt: string;
}

export const productImportApi = {
    upload: (file: File) =>
        postFile<ImportUploadResult>('/products/import/upload', file, { timeout: 60000 }),
    preview: (mappingConfig: Record<string, string>, rows: Record<string, unknown>[], options?: ImportOptions) =>
        api.post<ImportPreviewResult>('/products/import/preview', { mappingConfig, rows, options }),
    execute: (mappingConfig: Record<string, string>, rows: Record<string, unknown>[], options?: ImportOptions) =>
        api.post<ImportExecuteResult>('/products/import/execute', { mappingConfig, rows, options }),
    getLogs: (params?: { page?: number; pageSize?: number }) =>
        api.get<PaginatedResponse<ImportLog>>('/products/import/logs', { params }),
    getTemplates: () => api.get<ImportTemplate[]>('/products/import/templates'),
    saveTemplate: (data: { name: string; description?: string; mappingConfig: Record<string, string>; isGlobal?: boolean }) =>
        api.post<ImportTemplate>('/products/import/templates', data),
};