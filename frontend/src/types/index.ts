/**
 * 共享类型定义 - 前端专用
 */

// ==================== 枚举类型 ====================

export enum WorkOrderStatus {
    PENDING = 'PENDING',
    RECEIVED = 'RECEIVED',
    COMPLETED = 'COMPLETED',
}

export enum ScoreLevel {
    SIMPLE = 'SIMPLE',
    NORMAL = 'NORMAL',
    COMPLEX = 'COMPLEX',
}

export enum RoleCode {
    ADMIN = 'admin',
    BUSINESS = 'business',
    ENGINEER = 'engineer',
    PROJECT_MANAGER = 'project_manager',
    FINANCE = 'finance',
}

// ==================== 实体类型 ====================

export interface Role {
    id: string;
    name: string;
    code: RoleCode;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    username: string;
    name: string;
    avatar?: string;
    roleId: string;
    role?: Role;
    regionId?: string;
    region?: Region;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Customer {
    id: string;
    name: string;
    shortName?: string;
    contact?: string;
    phone?: string;
    address?: string;
    defaultRegionId?: string;
    region?: Region;
    createdAt: string;
    updatedAt: string;
}

export interface Region {
    id: string;
    name: string;
    sortOrder: number;
    dingtalkWebhook?: string;
    dingtalkSecret?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ServiceType {
    id: string;
    name: string;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface WorkOrderCollaborator {
    id: string;
    userId: string;
    user?: User;
    createdAt: string;
}

export interface WorkOrder {
    id: string;
    detail: string;
    status: WorkOrderStatus;
    scoreLevel: ScoreLevel;

    customerId: string;
    customer?: Customer;

    regionId: string;
    region?: Region;

    serviceTypeId: string;
    serviceType?: ServiceType;

    creatorId: string;
    creator?: User;
    createdAt: string;

    receiverId?: string;
    receiver?: User;
    receivedAt?: string;

    completerId?: string;
    completer?: User;
    completedAt?: string;

    collaborators?: WorkOrderCollaborator[];

    repairFee?: number;

    updatedAt: string;
}

// ==================== DTO 类型 ====================

export interface LoginDto {
    username: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
    /** 首次登录/默认密码需强制改密 */
    mustChangePassword?: boolean;
}

export interface CreateWorkOrderDto {
    detail: string;
    scoreLevel?: ScoreLevel;
    customerId: string;
    regionId: string;
    serviceTypeId: string;
}

export type UpdateWorkOrderDto = Partial<CreateWorkOrderDto>;

export interface CompleteWorkOrderDto {
    collaboratorIds?: string[];
    repairFee?: number;
}

export interface WorkOrderFilterParams {
    status?: WorkOrderStatus;
    statuses?: WorkOrderStatus[];
    regionId?: string;
    serviceTypeId?: string;
    customerId?: string;
    completerId?: string;
    startDate?: string;
    endDate?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface UserStats {
    completed: number;
    received: number;
    created: number;
    // 当月统计
    monthlyCompleted: number;
    monthlyReceived: number;
    monthlyCreated: number;
    // 维修费统计
    totalRepairFee: number;
    monthlyRepairFee: number;
}

export interface UpdateUserDto {
    name?: string;
    roleId?: string;
    regionId?: string;
    isActive?: boolean;
    password?: string;
}

// ==================== 工具常量 ====================

export const SCORE_VALUES: Record<ScoreLevel, number | null> = {
    [ScoreLevel.SIMPLE]: 0.5,
    [ScoreLevel.NORMAL]: 1,
    [ScoreLevel.COMPLEX]: null,
};

export const STATUS_LABELS: Record<WorkOrderStatus, string> = {
    [WorkOrderStatus.PENDING]: '待接收',
    [WorkOrderStatus.RECEIVED]: '已接收',
    [WorkOrderStatus.COMPLETED]: '已完成',
};

export const SCORE_LABELS: Record<ScoreLevel, string> = {
    [ScoreLevel.SIMPLE]: '简单',
    [ScoreLevel.NORMAL]: '一般',
    [ScoreLevel.COMPLEX]: '复杂',
};

export const STATUS_COLORS: Record<WorkOrderStatus, string> = {
    [WorkOrderStatus.PENDING]: '#F59E0B',
    [WorkOrderStatus.RECEIVED]: '#2563EB',
    [WorkOrderStatus.COMPLETED]: '#10B981',
};

// ==================== 通知类型 ====================

export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    content: string;
    workOrderId?: string;
    isRead: boolean;
    createdAt: string;
}

// ==================== 知识库类型 ====================

export interface WikiCategory {
    id: string;
    name: string;
    sortOrder: number;
    parentId?: string;
    articlesCount?: number;
    _count?: { articles: number };
    createdAt: string;
    updatedAt: string;
}

export interface WikiTag {
    id: string;
    name: string;
    _count?: { articles: number };
}

export interface WikiAttachment {
    id: string;
    filename: string;
    url: string;
    size: number;
    mimeType: string;
    articleId: string;
    createdAt: string;
}

export interface WikiArticle {
    id: string;
    title: string;
    content: string;
    viewCount: number;
    likeCount?: number;
    isLiked?: boolean;
    isPublic: boolean;
    categoryId: string;
    category?: WikiCategory;
    tags?: WikiTag[];
    authorId: string;
    author?: User;
    attachments?: WikiAttachment[];
    _count?: { attachments: number };
    createdAt: string;
    updatedAt: string;
}

export interface PaginationParams {
    page?: number;
    pageSize?: number;
    keyword?: string;
}

export interface WikiArticleFilterParams extends PaginationParams {
    categoryId?: string;
    tagName?: string;
    authorId?: string;
}

export interface CreateWikiArticleDto {
    title: string;
    content: string;
    categoryId: string;
    tagNames?: string[];
    isPublic?: boolean;
    attachments?: Omit<WikiAttachment, 'id' | 'articleId' | 'createdAt'>[];
}

export type UpdateWikiArticleDto = Partial<CreateWikiArticleDto>;

// ==================== 绩效统计类型 ====================
export {
    CalculationType,
    CALCULATION_TYPE_LABELS,
    RecordType,
    RECORD_TYPE_LABELS,
    StageTrackingMode,
    STAGE_TRACKING_MODE_LABELS,
    DEFAULT_STAGES,
    WorkUnit,
    WORK_UNIT_LABELS,
    HOURS_PER_DAY,
    formatWorkHours,
    convertToHours,
} from './performance';

export type {
    Project,
    WorkRecord,
    CustomerDevice,
    PerformanceResult,
    GlobalPerformanceResult,
    MyPerformanceStats,
    ProjectMember,
    CreateProjectDto,
    UpdateProjectDto,
    CreateWorkRecordDto,
    CreateWorkRecordsDto,
    UpdateWorkRecordDto,
    StageInput,
    ProjectStage,
    DeviceStageProgress,
    StageStat,
} from './performance';

// ==================== 产品管理类型 ====================
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
export type QuotationStatus = 'DRAFT' | 'SENT' | 'CLOSED' | 'CANCELLED';

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
    ACTIVE: '上架',
    INACTIVE: '下架',
    DISCONTINUED: '停产',
};

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
    DRAFT: '草稿',
    SENT: '已发送',
    CLOSED: '已成交',
    CANCELLED: '已作废',
};

export interface Brand {
    id: string;
    name: string;
    logo?: string | null;
    description?: string | null;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    _count?: { products: number };
}

export interface Category {
    id: string;
    name: string;
    parentId?: string | null;
    description?: string | null;
    sortOrder: number;
    productCount?: number;
    children: Category[];
}

export interface ProductTag {
    id: string;
    name: string;
    color?: string | null;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
    _count?: { products: number };
}

export interface ProductImage {
    id?: string;
    url: string;
    description?: string | null;
    displayOrder?: number;
}

export interface ProductCertificate {
    id?: string;
    url: string;
    name: string;
    description?: string | null;
    displayOrder?: number;
}

export interface Product {
    id: string;
    code: string;
    name: string;
    model?: string | null;
    description?: string | null;
    status: ProductStatus;
    isMarketProduct: boolean;
    unit: string;
    minOrderQty?: number | null;
    warranty?: string | null;
    /** 售后/备注说明（后端 Product.remark） */
    remark?: string | null;
    supplier?: string | null;
    marketUrl?: string | null;
    marketPrice?: number | null;
    salePrice?: number | null;
    costPrice?: number | null;
    lastPriceUpdateAt?: string | null;
    staleAcknowledgedAt?: string | null;
    viewCount: number;
    brandId: string;
    brand: Brand;
    categoryId: string;
    category: Category;
    images: ProductImage[];
    certificates: ProductCertificate[];
    tags: ProductTag[];
    isFavorite: boolean;
    isStale: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: string | null;
    updatedBy?: string | null;
}

export interface ProductFilterParams {
    page?: number;
    pageSize?: number;
    keyword?: string;
    brandIds?: string[];
    categoryId?: string;
    tagIds?: string[];
    status?: ProductStatus | 'ALL';
    minPrice?: number;
    maxPrice?: number;
    orderBy?: 'updatedAt' | 'staleFirst';
}

export interface ProductListResponse extends PaginatedResponse<Product> {
    staleThresholdDays: number;
}

export interface CreateProductDto {
    name: string;
    model?: string;
    description?: string;
    status?: ProductStatus;
    isMarketProduct?: boolean;
    unit?: string;
    minOrderQty?: number;
    warranty?: string;
    supplier?: string;
    marketUrl?: string;
    marketPrice?: number;
    salePrice?: number;
    costPrice?: number;
    brandId: string;
    categoryId: string;
    tagIds?: string[];
    images?: ProductImage[];
    certificates?: ProductCertificate[];
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface ProductChangeLog {
    id: string;
    productId: string;
    field: string;
    oldValue?: string | null;
    newValue?: string | null;
    changedBy?: string | null;
    changedByName?: string | null;
    createdAt: string;
}

export const PRODUCT_CHANGE_FIELD_LABELS: Record<string, string> = {
    name: '产品名称',
    model: '型号',
    description: '详细参数',
    status: '状态',
    isMarketProduct: '是否商城产品',
    unit: '单位',
    minOrderQty: '最小起订量',
    warranty: '保修期',
    supplier: '供应商',
    marketUrl: '商城链接',
    marketPrice: '商城价格',
    costPrice: '成本价',
};

export interface QuotationItem {
    id: string;
    productId?: string | null;
    productSnapshot: Record<string, unknown>;
    selectedImages?: string[] | null;
    selectedCerts?: string[] | null;
    quantity: number;
    unitPrice: number;
    discount?: number | null;
    subtotal: number;
    costPrice?: number | null;
    profit?: number | null;
    displayOrder: number;
}

export interface Quotation {
    id: string;
    code: string;
    customerId?: string | null;
    customerName: string;
    customerContact?: string | null;
    customerAddress?: string | null;
    remark?: string | null;
    templateId?: string | null;
    template?: QuotationTemplate | null;
    totalAmount: number;
    taxRate?: number | null;
    taxAmount?: number | null;
    finalAmount: number;
    estimatedProfit?: number | null;
    status: QuotationStatus;
    version: number;
    versionGroupId: string;
    parentQuotationId?: string | null;
    items: QuotationItem[];
    excelUrl?: string | null;
    pdfUrl?: string | null;
    deletedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy?: string | null;
    updatedBy?: string | null;
    /** 操作人用户名（列表接口映射，非 id） */
    createdByName?: string | null;
}

export interface QuotationFilterParams {
    page?: number;
    pageSize?: number;
    status?: QuotationStatus;
    customerId?: string;
    customerName?: string;
    versionGroupId?: string;
}

export interface CreateQuotationItemDto {
    productId?: string;
    productSnapshot: Record<string, unknown>;
    selectedImages?: string[];
    selectedCerts?: string[];
    quantity: number;
    unitPrice: number;
    discount?: number;
    costPrice?: number;
    profit?: number;
}

export interface CreateQuotationDto {
    customerId?: string;
    customerName: string;
    customerContact?: string;
    customerAddress?: string;
    remark?: string;
    templateId?: string;
    taxRate?: number;
    status?: QuotationStatus;
    items: CreateQuotationItemDto[];
}

export interface QuotationTemplateColumn {
    key: string;
    label: string;
    visible: boolean;
    /** field=直接取快照字段；formula=组合列（{字段} 占位符） */
    type?: 'field' | 'formula';
    /** type=field 时对应的字段 key */
    field?: string;
    /** type=formula 时的组合表达式，如 {brand} {model} */
    formula?: string;
    width?: number;
    align?: 'left' | 'center' | 'right';
}

/** 自由段落区块：固定套话（如项目背景），导出后可在文档中修改 */
export interface QuotationTemplateSection {
    id: string;
    /** 段落标题（可选） */
    title?: string;
    /** 段落正文（支持 {{customerName}} {{code}} 等占位符） */
    content: string;
    /** 相对报价表格的位置：before=表格之前，after=表格之后 */
    position: 'before' | 'after';
}

export type QuotationTemplateType = 'quotation';

/** 公司信息（保存在模板配置内，可用于页眉/页脚/标题的 {{companyName}} 等占位符） */
export interface QuotationTemplateCompany {
    name?: string;
    address?: string;
    phone?: string;
}

export interface QuotationTemplateConfig {
    columns: QuotationTemplateColumn[];
    title: string;
    showTax: boolean;
    header: string;
    footer: string;
    type?: QuotationTemplateType;
    /** 同名行纵向合并所依据的列 key，默认 'name' */
    mergeKey?: string;
    /** 自由段落区块（项目背景/商务条款等固定套话），可定义相对报价表格的位置 */
    sections?: QuotationTemplateSection[];
    /** 表格正上方的标题（如“报价明细一览表”），让表前段落与表格层次更清晰 */
    tableTitle?: string;
    /** 信息行格式：客户/联系人/地址/报价编号/日期/单位，支持 {{customerName}} 等占位符，段间用全角空格分隔；留空用默认 */
    infoFormat?: string;
    /** PDF 页面方向：portrait（默认）/ landscape */
    pageOrientation?: 'portrait' | 'landscape';
    /** 公司信息：名称/地址/电话，可在页眉页脚用占位符直接调用 */
    company?: QuotationTemplateCompany;
}

/**
 * 产品快照：报价单明细在生成时刻的产品数据定格。
 * 唯一键清单来源——新增字段时同步 quotationColumns.fieldValue / DOCX 服务 / seed。
 */
export interface ProductSnapshot {
    id?: string;
    code?: string;
    name?: string;
    model?: string;
    brand?: string;
    category?: string;
    unit?: string;
    isMarketProduct?: boolean;
    marketPrice?: number | null;
    salePrice?: number | null;
    costPrice?: number | null;
    marketUrl?: string;
    description?: string;
    /** 结构化参数（fieldValue 的 param/spec 兜底源） */
    param?: Record<string, unknown>;
    spec?: Record<string, unknown>;
    warranty?: string;
    supplier?: string;
    minOrderQty?: number | null;
    tags?: string[];
    remark?: string;
    images?: string[];
    certs?: string[];
    certNames?: string[];
}

export interface QuotationTemplate {
    id: string;
    name: string;
    description?: string | null;
    config: QuotationTemplateConfig;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: string | null;
}

export interface SystemSettings {
    staleThresholdDays?: number;
    defaultTaxRate?: number;
    defaultUnit?: string;
    quotationPrefix?: string;
    companyInfo?: Record<string, unknown>;
}

// ==================== 供应商 / 仓库 / 库存 ====================
export interface Supplier {
    id: string;
    name: string;
    namePinyin?: string | null;
    nameInitials?: string | null;
    contact?: string | null;
    phone?: string | null;
    address?: string | null;
    bankName?: string | null;
    bankAccount?: string | null;
    accountName?: string | null;
    paymentMethod?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSupplierDto {
    name: string;
    contact?: string;
    phone?: string;
    address?: string;
    bankName?: string;
    bankAccount?: string;
    accountName?: string;
    paymentMethod?: string;
}

export type UpdateSupplierDto = Partial<CreateSupplierDto>;

export interface SupplierFilterParams extends PaginationParams {
    orderBy?: 'createdAt' | 'name';
}

export interface Warehouse {
    id: string;
    name: string;
    regionId?: string | null;
    region?: Region | null;
    type?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateWarehouseDto {
    name: string;
    regionId?: string;
    type?: string;
}

export type UpdateWarehouseDto = Partial<CreateWarehouseDto>;

export interface WarehouseFilterParams extends PaginationParams {}

export interface InventoryBatch {
    id: string;
    productId: string;
    product?: Product | null;
    warehouseId?: string | null;
    warehouse?: Warehouse | null;
    storeName?: string | null;
    quantityIn: number | string;
    quantityRem: number | string;
    unitPrice: number | string;
    purchasePrice?: number | string | null;
    receivedAt: string;
    status: string;
    supplierId?: string | null;
    supplier?: Supplier | null;
    flag: string;
    createdAt: string;
    updatedAt: string;
}

export interface InventoryFilterParams extends PaginationParams {
    productId?: string;
    warehouseId?: string;
    supplierId?: string;
}

export interface StockItem {
    productId: string;
    product: Pick<Product, 'id' | 'code' | 'name' | 'unit'> | null;
    totalQuantity: number;
    totalAmount: number;
}

export interface StockQueryParams extends PaginationParams {
    productId?: string;
}

export interface BorrowOrder {
    id: string;
    code: string;
    status: string;
    borrowerId: string;
    productId: string;
    quantity: number;
    expectedReturnAt?: string | null;
    returnedAt?: string | null;
    remark?: string | null;
    createdAt: string;
    updatedAt: string;
}

// ==================== 销售出库 ====================
export type SaleStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | string;

export const SALE_STATUS_LABELS: Record<string, string> = {
    PENDING: '待审核',
    APPROVED: '已审核',
    REJECTED: '已驳回',
};

export function saleStatusTagType(status: string): 'warning' | 'success' | 'danger' | 'info' {
    if (status === 'PENDING') return 'warning';
    if (status === 'APPROVED') return 'success';
    if (status === 'REJECTED') return 'danger';
    return 'info';
}

export interface SaleDetail {
    id: string;
    saleOrderId: string;
    productId: string;
    product?: Product | null;
    quantity: number | string;
    unitPrice?: number | string | null;
    remark?: string | null;
    allocations?: SaleAllocation[];
}

export interface SaleAllocation {
    id: string;
    saleDetailId: string;
    batchId: string;
    batch?: InventoryBatch | null;
    quantity: number | string;
    unitCost: number | string;
    createdAt: string;
}

export interface SaleOrder {
    id: string;
    code: string;
    status: SaleStatus;
    customerId?: string | null;
    customer?: Customer | null;
    remark?: string | null;
    createdBy?: string | null;
    createdAt: string;
    updatedAt: string;
    details?: SaleDetail[];
    totalQuantity?: number | string | null;
    totalAmount?: number | string | null;
}

export interface SaleFilterParams extends PaginationParams {
    status?: string;
}

export interface CreateSaleDetailDto {
    productId: string;
    quantity: number;
    unitPrice?: number;
    remark?: string;
}

export interface CreateSaleOrderDto {
    customerId?: string;
    remark?: string;
    details: CreateSaleDetailDto[];
}

export interface ApproveSaleDto {
    remark?: string;
}

// ==================== 调拨 / 退货 / 盘点 ====================
export interface TransferOrder {
    id: string;
    code: string;
    productId: string;
    product?: Pick<Product, 'id' | 'code' | 'name'> | null;
    quantity: number | string;
    fromWarehouseId?: string | null;
    fromWarehouse?: Warehouse | null;
    toWarehouseId?: string | null;
    toWarehouse?: Warehouse | null;
    remark?: string | null;
    createdBy?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTransferDto {
    productId: string;
    quantity: number;
    fromWarehouseId?: string;
    toWarehouseId?: string;
    remark?: string;
}

export interface TransferFilterParams extends PaginationParams {
    productId?: string;
}

export interface ReturnOrder {
    id: string;
    code: string;
    productId: string;
    product?: Pick<Product, 'id' | 'code' | 'name'> | null;
    quantity: number | string;
    saleOrderId?: string | null;
    saleOrder?: Pick<SaleOrder, 'id' | 'code'> | null;
    remark?: string | null;
    createdBy?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateReturnDto {
    productId: string;
    quantity: number;
    saleOrderId?: string;
    remark?: string;
}

export interface ReturnFilterParams extends PaginationParams {
    productId?: string;
}

export interface StockCheckDetail {
    id: string;
    checkOrderId: string;
    productId: string;
    product?: Pick<Product, 'id' | 'code' | 'name'> | null;
    systemQuantity: number | string;
    actualQuantity: number | string;
    diffQuantity: number | string;
    remark?: string | null;
}

export interface StockCheckOrder {
    id: string;
    code: string;
    status: string;
    remark?: string | null;
    createdBy?: string | null;
    createdAt: string;
    updatedAt: string;
    details?: StockCheckDetail[];
}

export interface CreateStockCheckItemDto {
    productId: string;
    actualQuantity: number;
    remark?: string;
}

export interface CreateStockCheckDto {
    remark?: string;
    items: CreateStockCheckItemDto[];
}

export interface StockCheckFilterParams extends PaginationParams {}
