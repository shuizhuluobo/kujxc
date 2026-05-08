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
}

export interface CreateWorkOrderDto {
    detail: string;
    scoreLevel?: ScoreLevel;
    customerId: string;
    regionId: string;
    serviceTypeId: string;
}

export interface UpdateWorkOrderDto extends Partial<CreateWorkOrderDto> { }

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

export interface UpdateWikiArticleDto extends Partial<CreateWikiArticleDto> { }
