export enum CalculationType {
    QUANTITY = 'QUANTITY',
    DAILY = 'DAILY',
    WAREHOUSE = 'WAREHOUSE',
}

export const CALCULATION_TYPE_LABELS: Record<CalculationType, string> = {
    [CalculationType.QUANTITY]: '按数量计算',
    [CalculationType.DAILY]: '按工日计算',
    [CalculationType.WAREHOUSE]: '公物仓',
};

// 历史记录类型（仅用于展示旧记录；新记录统一使用 stageId 关联阶段）
export enum RecordType {
    DELIVERY = 'DELIVERY',
    INSTALL = 'INSTALL',
    DEBUG = 'DEBUG',
    CONSTRUCTION = 'CONSTRUCTION',
}

export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
    [RecordType.DELIVERY]: '送货',
    [RecordType.INSTALL]: '安装',
    [RecordType.DEBUG]: '调试',
    [RecordType.CONSTRUCTION]: '施工',
};

export enum StageTrackingMode {
    PROJECT = 'PROJECT',
    DEVICE = 'DEVICE',
}

export const STAGE_TRACKING_MODE_LABELS: Record<StageTrackingMode, string> = {
    [StageTrackingMode.PROJECT]: '按项目总量',
    [StageTrackingMode.DEVICE]: '按设备数量',
};

export enum WorkUnit {
    DAY = 'DAY',
    HOUR = 'HOUR',
}

export const WORK_UNIT_LABELS: Record<WorkUnit, string> = {
    [WorkUnit.DAY]: '工日',
    [WorkUnit.HOUR]: '小时',
};

export const HOURS_PER_DAY = 8;

// 阶段输入（创建/更新项目时配置）
export interface StageInput {
    id?: string;
    name: string;
    code: string;
    trackingMode: StageTrackingMode;
    unitPrice: number;
    sortOrder?: number;
}

// 默认三阶段模板（新建按量项目时预填）
export const DEFAULT_STAGES: StageInput[] = [
    { name: '送货', code: 'delivery', trackingMode: StageTrackingMode.DEVICE, unitPrice: 0, sortOrder: 0 },
    { name: '安装', code: 'install', trackingMode: StageTrackingMode.DEVICE, unitPrice: 0, sortOrder: 1 },
    { name: '调试', code: 'debug', trackingMode: StageTrackingMode.DEVICE, unitPrice: 0, sortOrder: 2 },
];

export interface ProjectStage {
    id: string;
    projectId: string;
    name: string;
    code: string;
    trackingMode: StageTrackingMode;
    unitPrice: number;
    sortOrder: number;
    createdAt: string;
}

export interface DeviceStageProgress {
    id: string;
    deviceId: string;
    stageId: string;
    quantity: number;
    createdAt: string;
    updatedAt: string;
    stage?: ProjectStage;
}

export interface StageStat {
    count: number;
    amount: number;
}

export interface Project {
    id: string;
    projectName: string;
    calculationType: CalculationType;
    totalQuantity?: number;
    remark?: string;
    createdAt: string;
    creatorId: string;
    creator?: { id: string; name: string };
    dailyPrice: number;
    stages?: ProjectStage[];
    records?: WorkRecord[];
    members?: ProjectMember[];
}

export interface ProjectMember {
    id: string;
    projectId: string;
    userId: string;
    role: 'OWNER' | 'MEMBER';
    joinedAt: string;
    user?: { id: string; name: string };
}

export interface WorkRecord {
    id: string;
    projectId: string;
    recordType?: RecordType;
    stageId?: string;
    stage?: { id: string; name: string; code: string; trackingMode: StageTrackingMode; unitPrice: number };
    quantity?: number;
    customerId?: string;
    customer?: { id: string; name: string };
    workHours?: number;
    description?: string;
    date: string;
    collaboratorIds: string[];
    collaborators?: Array<{ id: string; name: string }>;
    includeRecorder: boolean;
    remark?: string;
    createdAt: string;
    creatorId: string;
    creator?: { id: string; name: string };
    deviceId?: string;
}

export interface CustomerDevice {
    id: string;
    projectId: string;
    customerId: string;
    customer?: { id: string; name: string };
    deviceName: string;
    expectedQuantity: number;
    remark?: string;
    createdAt: string;
    creatorId: string;
    creator?: { id: string; name: string };
    stageProgress?: DeviceStageProgress[];
}

export interface PerformanceResult {
    userId: string;
    userName: string;
    stageStats: Record<string, StageStat>;
    totalWorkDays: number;
    workDaysAmount: number;
    totalAmount: number;
}

export interface GlobalPerformanceResult {
    userId: string;
    userName: string;
    projectCount: number;
    totalQuantity: number;
    totalWorkDays: number;
    workDaysAmount: number;
    totalAmount: number;
}

export interface MyPerformanceStats {
    stageStats: Record<string, StageStat>;
    totalWorkDays: number;
    totalAmount: number;
}

export interface CreateProjectDto {
    projectName: string;
    calculationType: CalculationType;
    totalQuantity?: number;
    remark?: string;
    dailyPrice: number;
    memberIds?: string[];
    stages?: StageInput[];
}

export interface UpdateProjectDto {
    projectName?: string;
    totalQuantity?: number;
    remark?: string;
    dailyPrice?: number;
    memberIds?: string[];
    stages?: StageInput[];
}

export interface CreateWorkRecordDto {
    stageId?: string;
    quantity?: number;
    customerId?: string;
    deviceId?: string;
    workHours?: number;
    description?: string;
    date: string;
    collaboratorIds: string[];
    includeRecorder?: boolean;
    remark?: string;
}

export interface UpdateWorkRecordDto {
    stageId?: string;
    quantity?: number;
    customerId?: string;
    deviceId?: string;
    workHours?: number;
    description?: string;
    date?: string;
    collaboratorIds?: string[];
    includeRecorder?: boolean;
    remark?: string;
}

// 批量记录（单设备 + 多选阶段，每个阶段单独数量）
export interface CreateWorkRecordsDto {
    deviceId: string;
    entries: { stageId: string; quantity: number }[];
    date: string;
    collaboratorIds: string[];
    includeRecorder: boolean;
    remark?: string;
}

export function formatWorkHours(hours: number): string {
    if (hours <= 0) return '0小时';
    // 先四舍五入到合理精度，避免浮点数精度问题（如 13.04 % 8 = 5.039999999999999）
    const rounded = Math.round(hours * 100) / 100;
    if (rounded % HOURS_PER_DAY === 0) {
        const days = rounded / HOURS_PER_DAY;
        return `${days}工日`;
    }
    const days = Math.floor(rounded / HOURS_PER_DAY);
    const remainingHours = Math.round((rounded % HOURS_PER_DAY) * 10) / 10;
    if (days > 0) {
        return `${days}工日${remainingHours}小时`;
    }
    return `${remainingHours}小时`;
}

export function convertToHours(value: number, unit: WorkUnit): number {
    return unit === WorkUnit.DAY ? value * HOURS_PER_DAY : value;
}
