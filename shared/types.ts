/**
 * 共享类型定义 - 前后端通用
 * 确保类型安全和一致性
 */

// ==================== 枚举类型 ====================

/** 工单状态 */
export enum WorkOrderStatus {
    PENDING = 'PENDING',     // 待接收
    RECEIVED = 'RECEIVED',   // 已接收
    COMPLETED = 'COMPLETED', // 已完成
}

/** 分值等级 */
export enum ScoreLevel {
    SIMPLE = 'SIMPLE',   // 简单 0.5
    NORMAL = 'NORMAL',   // 一般 1
    COMPLEX = 'COMPLEX', // 复杂 空
}

/** 角色代码 */
export enum RoleCode {
    ADMIN = 'admin',       // 管理员
    BUSINESS = 'business', // 商务
    ENGINEER = 'engineer', // 售后工程师
}

// ==================== 基础实体类型 ====================

/** 角色 */
export interface Role {
    id: string;
    name: string;
    code: RoleCode;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
}

/** 用户 */
export interface User {
    id: string;
    username: string;
    name: string;
    avatar?: string;
    roleId: string;
    role?: Role;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/** 用户（不含密码，用于API响应） */
export type UserResponse = Omit<User, 'password'>;

/** 客户 */
export interface Customer {
    id: string;
    name: string;
    contact?: string;
    phone?: string;
    address?: string;
    defaultRegionId?: string;
    region?: Region;
    createdAt: string;
    updatedAt: string;
}

/** 区域 */
export interface Region {
    id: string;
    name: string;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

/** 服务类型 */
export interface ServiceType {
    id: string;
    name: string;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

/** 工单协作人 */
export interface WorkOrderCollaborator {
    id: string;
    userId: string;
    user?: User;
    createdAt: string;
}

/** 工单 */
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

    updatedAt: string;
}

// ==================== DTO 类型 ====================

/** 登录请求 */
export interface LoginDto {
    username: string;
    password: string;
}

/** 登录响应 */
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: UserResponse;
}

/** 创建工单 DTO */
export interface CreateWorkOrderDto {
    detail: string;
    scoreLevel: ScoreLevel;
    customerId: string;
    regionId: string;
    serviceTypeId: string;
}

/** 更新工单 DTO */
export interface UpdateWorkOrderDto {
    detail?: string;
    scoreLevel?: ScoreLevel;
    customerId?: string;
    regionId?: string;
    serviceTypeId?: string;
}

/** 完成工单 DTO */
export interface CompleteWorkOrderDto {
    collaboratorIds?: string[];
}

/** 分页参数 */
export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

/** 分页响应 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/** 工单筛选参数 */
export interface WorkOrderFilterParams extends PaginationParams {
    status?: WorkOrderStatus;
    regionId?: string;
    serviceTypeId?: string;
    customerId?: string;
    creatorId?: string;
    receiverId?: string;
    startDate?: string;
    endDate?: string;
    keyword?: string;
}

// ==================== 工具类型 ====================

/** 分值映射 */
export const SCORE_VALUES: Record<ScoreLevel, number | null> = {
    [ScoreLevel.SIMPLE]: 0.5,
    [ScoreLevel.NORMAL]: 1,
    [ScoreLevel.COMPLEX]: null,
};

/** 状态显示名称 */
export const STATUS_LABELS: Record<WorkOrderStatus, string> = {
    [WorkOrderStatus.PENDING]: '待接收',
    [WorkOrderStatus.RECEIVED]: '已接收',
    [WorkOrderStatus.COMPLETED]: '已完成',
};

/** 分值等级显示名称 */
export const SCORE_LABELS: Record<ScoreLevel, string> = {
    [ScoreLevel.SIMPLE]: '简单',
    [ScoreLevel.NORMAL]: '一般',
    [ScoreLevel.COMPLEX]: '复杂',
};

/** API 响应包装 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
