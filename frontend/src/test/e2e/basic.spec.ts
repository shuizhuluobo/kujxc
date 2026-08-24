/**
 * 权限体系基础 E2E 测试（vitest + jsdom）
 *
 * 直接针对真实模块 @/config/permissions 验证：
 * - 通配符权限（全局 * 与模块级 module:*）解析
 * - hasAnyPermission / hasAllPermissions 组合语义
 * - 内置角色模板（admin/business/engineer）的权限边界
 *
 * 运行：pnpm --filter frontend test:e2e
 */
import { describe, it, expect } from 'vitest';
import {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    PermissionModules,
    RolePermissionTemplates,
} from '@/config/permissions';

describe('权限校验：hasPermission', () => {
    it('精确匹配', () => {
        const perms = ['workOrder:create', 'workOrder:list'];
        expect(hasPermission(perms, 'workOrder:create')).toBe(true);
        expect(hasPermission(perms, 'workOrder:delete')).toBe(false);
    });

    it('模块级通配符 module:* 覆盖模块内全部动作', () => {
        const perms = ['region:*'];
        expect(hasPermission(perms, 'region:create')).toBe(true);
        expect(hasPermission(perms, 'region:delete')).toBe(true);
        expect(hasPermission(perms, 'customer:view')).toBe(false);
    });

    it('全局通配符 * 拥有一切权限', () => {
        const perms = ['*'];
        expect(hasPermission(perms, 'system:user_manage')).toBe(true);
        expect(hasPermission(perms, 'fee:view_amount')).toBe(true);
        expect(hasPermission(perms, 'anything:anything')).toBe(true);
    });

    it('空权限列表返回 false', () => {
        expect(hasPermission([], 'workOrder:view')).toBe(false);
        expect(hasPermission(undefined as unknown as string[], 'workOrder:view')).toBe(false);
    });
});

describe('权限校验：组合语义', () => {
    it('hasAnyPermission：任一满足即通过', () => {
        const perms = ['customer:view'];
        expect(hasAnyPermission(perms, ['customer:view', 'customer:delete'])).toBe(true);
        expect(hasAnyPermission(perms, ['customer:delete', 'customer:edit'])).toBe(false);
    });

    it('hasAllPermissions：必须全部满足', () => {
        const perms = ['workOrder:view', 'workOrder:receive'];
        expect(hasAllPermissions(perms, ['workOrder:view', 'workOrder:receive'])).toBe(true);
        expect(hasAllPermissions(perms, ['workOrder:view', 'workOrder:complete'])).toBe(false);
        // 通配符可同时满足多个要求
        expect(hasAllPermissions(['*'], ['wiki:create', 'wiki:delete'])).toBe(true);
    });
});

describe('内置角色模板权限边界', () => {
    const admin = RolePermissionTemplates.admin.permissions;
    const business = RolePermissionTemplates.business.permissions;
    const engineer = RolePermissionTemplates.engineer.permissions;

    it('管理员拥有所有权限', () => {
        expect(admin).toContain('*');
        for (const key of Object.keys(PermissionModules)) {
            expect(hasPermission(admin, `${key}:anything`)).toBe(true);
        }
    });

    it('售后工程师：可接收/完成工单，不可管理系统', () => {
        expect(hasPermission(engineer, 'workOrder:receive')).toBe(true);
        expect(hasPermission(engineer, 'workOrder:complete')).toBe(true);
        expect(hasPermission(engineer, 'system:user_view')).toBe(true);
        expect(hasPermission(engineer, 'system:user_manage')).toBe(false);
        expect(hasPermission(engineer, 'system:*')).toBe(false);
    });

    it('商务人员：可管理客户与查看绩效金额，不可写知识库', () => {
        expect(hasPermission(business, 'customer:create')).toBe(true);
        expect(hasPermission(business, 'customer:delete')).toBe(false);
        expect(hasPermission(business, 'fee:view_amount')).toBe(true);
        expect(hasPermission(business, 'wiki:create')).toBe(false);
    });

    it('模板中的权限码格式合法（module:action 或 *）', () => {
        const moduleKeys = new Set<string>(Object.keys(PermissionModules).map(
            (k) => PermissionModules[k as keyof typeof PermissionModules].key,
        ));
        for (const template of [business, engineer]) {
            for (const perm of template) {
                if (perm === '*') continue;
                const [moduleKey] = perm.split(':');
                expect(moduleKeys.has(moduleKey)).toBe(true);
            }
        }
    });
});
