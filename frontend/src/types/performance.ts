export enum CalculationType {
    QUANTITY = 'QUANTITY',
    DAILY = 'DAILY',
    WAREHOUSE = 'WAREHOUSE',
}

export const CALCULATION_TYPE_LABELS: Record<CalculationType, string> = {
    [CalculationType.QUANTITY]: '按量计算',
    [CalculationType.DAILY]: '按天计算',
    [CalculationType.WAREHOUSE]: '公物仓',
};

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

export const QUANTITY_RECORD_TYPES: RecordType[] = [
    RecordType.DELIVERY,
    RecordType.INSTALL,
    RecordType.DEBUG,
];

export const DAILY_RECORD_TYPES: RecordType[] = [
    RecordType.CONSTRUCTION,
];

export enum WorkUnit {
    DAY = 'DAY',
    HOUR = 'HOUR',
}

export const WORK_UNIT_LABELS: Record<WorkUnit, string> = {
    [WorkUnit.DAY]: '天',
    [WorkUnit.HOUR]: '小时',
};

export const HOURS_PER_DAY = 8;

export interface Project {
    id: string;
    projectName: string;
    calculationType: CalculationType;
    totalQuantity?: number;
    remark?: string;
    createdAt: string;
    creatorId: string;
    creator?: { id: string; name: string };
    deliveryUnitPrice: number;
    installUnitPrice: number;
    debugUnitPrice: number;
    dailyPrice: number;
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
    
    deliveryQuantity: number;
    deliveryBy?: string;
    deliveryAt?: string;
    deliveryCollaborators: string[];
    
    installQuantity: number;
    installBy?: string;
    installAt?: string;
    installCollaborators: string[];
    
    debugQuantity: number;
    debugBy?: string;
    debugAt?: string;
    debugCollaborators: string[];
    
    isCompleted: boolean;
    completedAt?: string;
    
    remark?: string;
    createdAt: string;
    creatorId: string;
    creator?: { id: string; name: string };
}

export interface PerformanceResult {
    userId: string;
    userName: string;
    deliveryCount: number;
    deliveryAmount: number;
    installCount: number;
    installAmount: number;
    debugCount: number;
    debugAmount: number;
    totalWorkDays: number;
    workDaysAmount: number;
    totalAmount: number;
}

export interface GlobalPerformanceResult {
    userId: string;
    userName: string;
    projectCount: number;
    deliveryCount: number;
    deliveryAmount: number;
    installCount: number;
    installAmount: number;
    debugCount: number;
    debugAmount: number;
    totalWorkDays: number;
    workDaysAmount: number;
    totalAmount: number;
}

export interface MyPerformanceStats {
    deliveryCount: number;
    installCount: number;
    debugCount: number;
    totalWorkDays: number;
    totalAmount: number;
}

export interface CreateProjectDto {
    projectName: string;
    calculationType: CalculationType;
    totalQuantity?: number;
    remark?: string;
    deliveryUnitPrice?: number;
    installUnitPrice?: number;
    debugUnitPrice?: number;
    dailyPrice?: number;
    memberIds?: string[];
}

export interface UpdateProjectDto {
    projectName?: string;
    totalQuantity?: number;
    remark?: string;
    deliveryUnitPrice?: number;
    installUnitPrice?: number;
    debugUnitPrice?: number;
    dailyPrice?: number;
    memberIds?: string[];
}

export interface CreateWorkRecordDto {
    recordType?: RecordType;
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
    recordType?: RecordType;
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

export function formatWorkHours(hours: number): string {
    if (hours <= 0) return '0小时';
    if (hours % HOURS_PER_DAY === 0) {
        const days = hours / HOURS_PER_DAY;
        return `${days}天`;
    }
    const days = Math.floor(hours / HOURS_PER_DAY);
    const remainingHours = hours % HOURS_PER_DAY;
    if (days > 0) {
        return `${days}天${remainingHours}小时`;
    }
    return `${remainingHours}小时`;
}

export function convertToHours(value: number, unit: WorkUnit): number {
    return unit === WorkUnit.DAY ? value * HOURS_PER_DAY : value;
}
