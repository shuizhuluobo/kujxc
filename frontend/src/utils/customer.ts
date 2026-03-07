import type { Customer } from '@/types';

/**
 * 获取客户显示名称
 * 优先使用简称，如果没有简称则使用全称
 */
export function getCustomerDisplayName(customer?: Customer | null): string {
  if (!customer) return '';
  return customer.shortName || customer.name;
}

/**
 * 获取客户显示名称，包含全称作为降级信息
 * 格式：简称 (全称) 或 全称
 */
export function getCustomerDisplayNameWithFallback(customer?: Customer | null): string {
  if (!customer) return '';
  if (customer.shortName && customer.shortName !== customer.name) {
    return `${customer.shortName} (${customer.name})`;
  }
  return customer.name;
}