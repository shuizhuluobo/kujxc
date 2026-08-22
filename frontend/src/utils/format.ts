import dayjs from 'dayjs';
import type { ProductStatus, QuotationStatus } from '@/types';
import type { Category } from '@/types';

// ==================== 价格 / 日期 ====================

/** 金额：¥1,234.00；空值显示 '-' */
export function formatPrice(value?: number | null): string {
    return value != null ? `¥${value.toFixed(2)}` : '-';
}

/** 日期：2026-08-22；空值显示 '-' */
export function formatDate(value?: string | Date | null): string {
    if (!value) return '-';
    return dayjs(value).format('YYYY-MM-DD');
}

/** 日期时间：2026-08-22 14:30；空值显示 '-' */
export function formatDateTime(value?: string | Date | null): string {
    if (!value) return '-';
    return dayjs(value).format('YYYY-MM-DD HH:mm');
}

// ==================== 状态标签 ====================

/** 产品状态 → el-tag type */
export function productStatusTagType(status: ProductStatus): 'success' | 'info' | 'danger' {
    if (status === 'ACTIVE') return 'success';
    if (status === 'INACTIVE') return 'info';
    return 'danger';
}

/** 报价状态 → el-tag type */
export function quotationStatusTagType(status: QuotationStatus): 'info' | 'primary' | 'success' | 'danger' {
    if (status === 'DRAFT') return 'info';
    if (status === 'SENT') return 'primary';
    if (status === 'CLOSED') return 'success';
    return 'danger';
}

// ==================== 类别树 ====================

export interface FlatCategory {
    id: string;
    path: string;
}

/** 类别树拍平为「路径」选项列表（父/子 以 " / " 连接） */
export function flattenCategories(tree: Category[], prefix = ''): FlatCategory[] {
    const result: FlatCategory[] = [];
    for (const node of tree) {
        const path = prefix ? `${prefix} / ${node.name}` : node.name;
        result.push({ id: node.id, path });
        if (node.children?.length) {
            result.push(...flattenCategories(node.children, path));
        }
    }
    return result;
}

// ==================== API 错误信息 ====================

type ApiErrorLike = { response?: { data?: { message?: string } }; message?: string };

/** 从 axios 错误中提取后端 message，取不到时用 fallback */
export function getApiErrorMessage(e: unknown, fallback = '操作失败'): string {
    const err = e as ApiErrorLike;
    return err?.response?.data?.message || err?.message || fallback;
}
