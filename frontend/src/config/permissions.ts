// ============================================
// 权限矩阵配置
// ============================================

/**
 * 权限模块定义
 * 每个模块包含页面访问权限和功能操作权限
 */
export const PermissionModules = {
    // 工单管理
    WORK_ORDER: {
        key: 'workOrder',
        name: '工单管理',
        icon: 'Document',
        pages: [
            { key: 'list', name: '工单列表', path: '/history' },
        ],
        actions: [
            { key: 'create', name: '创建工单', description: '允许创建新工单' },
            { key: 'view', name: '查看工单', description: '允许查看工单详情' },
            { key: 'update', name: '编辑工单', description: '允许编辑工单信息' },
            { key: 'delete', name: '删除工单', description: '允许删除工单' },
            { key: 'receive', name: '接收工单', description: '允许接收待办工单' },
            { key: 'complete', name: '完成工单', description: '允许标记工单为已完成' },
            { key: 'export', name: '导出工单', description: '允许导出工单数据' },
        ],
    },

    // 客户管理
    CUSTOMER: {
        key: 'customer',
        name: '客户管理',
        icon: 'User',
        pages: [
            { key: 'manage', name: '客户管理', path: '/admin/customers' },
        ],
        actions: [
            { key: 'list', name: '客户列表', description: '允许查看客户列表数据' },
            { key: 'view', name: '查看客户', description: '允许查看客户信息' },
            { key: 'create', name: '创建客户', description: '允许创建新客户' },
            { key: 'edit', name: '编辑客户', description: '允许编辑客户信息' },
            { key: 'delete', name: '删除客户', description: '允许删除客户' },
        ],
    },

    // 区域管理
    REGION: {
        key: 'region',
        name: '区域管理',
        icon: 'Location',
        pages: [
            { key: 'manage', name: '区域管理', path: '/admin/regions' },
        ],
        actions: [
            { key: 'list', name: '区域列表', description: '允许查看区域列表数据' },
            { key: 'view', name: '查看区域', description: '允许查看区域信息' },
            { key: '*', name: '管理区域', description: '允许创建/编辑/删除区域' },
        ],
    },

    // 服务类型
    SERVICE_TYPE: {
        key: 'serviceType',
        name: '服务类型',
        icon: 'Setting',
        pages: [
            { key: 'manage', name: '类型管理', path: '/admin/service-types' },
        ],
        actions: [
            { key: 'list', name: '类型列表', description: '允许查看类型列表数据' },
            { key: 'view', name: '查看类型', description: '允许查看服务类型' },
            { key: '*', name: '管理类型', description: '允许创建/编辑/删除类型' },
        ],
    },

    // 知识库
    WIKI: {
        key: 'wiki',
        name: '知识库',
        icon: 'Reading',
        pages: [
            { key: 'list', name: '知识库列表', path: '/wiki' },
        ],
        actions: [
            { key: 'view', name: '查看文章', description: '允许查看知识库文章' },
            { key: 'create', name: '创建文章', description: '允许创建新文章' },
            { key: 'edit', name: '编辑文章', description: '允许编辑文章' },
            { key: 'delete', name: '删除文章', description: '允许删除文章' },
        ],
    },

    // 项目记录
    FEE: {
        key: 'fee',
        name: '项目记录',
        icon: 'Wallet',
        pages: [
            { key: 'list', name: '项目记录', path: '/projects' },
        ],
        actions: [
            { key: 'view_project', name: '查看项目', description: '允许查看项目列表和详情' },
            { key: 'create_project', name: '创建项目', description: '允许创建新项目' },
            { key: 'calculate', name: '计算费用', description: '允许使用费用计算器' },
            { key: 'save_records', name: '保存费用', description: '允许保存费用记录' },
            { key: 'view_records', name: '查看记录', description: '允许查看费用记录' },
            { key: 'delete_records', name: '删除记录', description: '允许删除费用记录' },
            { key: 'settings', name: '费用设置', description: '允许修改费用设置' },
            { key: 'view_stats', name: '查看绩效', description: '允许查看绩效总览' },
            { key: 'view_amount', name: '查看金额', description: '允许查看项目单价和统计金额' },
            { key: 'export', name: '导出数据', description: '允许导出项目数据' },
        ],
    },

    // 系统管理
    SYSTEM: {
        key: 'system',
        name: '系统管理',
        icon: 'Tools',
        pages: [
            { key: 'user_manage', name: '用户管理管理', path: '/admin/users' },
            { key: 'role_manage', name: '角色管理管理', path: '/admin/roles' },
        ],
        actions: [
            { key: 'user_view', name: '查看用户', description: '允许查看用户信息' },
            { key: 'role_view', name: '查看角色', description: '允许查看角色信息' },
            { key: '*', name: '管理系统', description: '允许创建/编辑/删除用户和角色' },
        ],
    },

    // 个人中心
    PROFILE: {
        key: 'profile',
        name: '个人中心',
        icon: 'UserFilled',
        pages: [
            { key: 'profile', name: '个人信息', path: '/profile' },
        ],
        actions: [
            { key: 'view', name: '查看信息', description: '允许查看个人信息' },
            { key: 'edit', name: '编辑信息', description: '允许编辑个人信息' },
            { key: 'change_password', name: '修改密码', description: '允许修改密码' },
            { key: 'change_avatar', name: '更换头像', description: '允许更换头像' },
        ],
    },
} as const;

/**
 * 预定义角色权限模板
 */
export const RolePermissionTemplates = {
    // 管理员 - 拥有所有权限
    admin: {
        name: '管理员',
        code: 'admin',
        permissions: ['*'], // 通配符表示所有权限
    },

    // 商务人员
    business: {
        name: '商务人员',
        code: 'business',
        permissions: [
            'workOrder:create', 'workOrder:list', 'workOrder:view', 'workOrder:update', 'workOrder:delete',
            'customer:list', 'customer:view', 'customer:create', 'customer:edit',
            'region:list', 'region:view',
            'serviceType:list', 'serviceType:view',
            'fee:view_project', 'fee:create_project',
            'fee:calculate', 'fee:save_records', 'fee:view_records',
            'fee:view_stats', 'fee:view_amount',
            'system:user_view',
            'profile:profile', 'profile:view', 'profile:edit',
        ],
    },

    // 售后工程师
    engineer: {
        name: '售后工程师',
        code: 'engineer',
        permissions: [
            'workOrder:list',
            'workOrder:view',
            'workOrder:receive',
            'workOrder:complete',
            'workOrder:create',
            'workOrder:update',
            'workOrder:delete',
            'customer:view',
            'customer:list',
            'region:view',
            'region:list',
            'serviceType:view',
            'serviceType:list',
            'fee:view_project',
            'fee:calculate', 'fee:save_records', 'fee:view_records',
            'fee:view_stats',
            'wiki:list',
            'wiki:view',
            'wiki:create',
            'wiki:edit',
            'wiki:delete',
            'system:user_view',
            'profile:profile',
            'profile:view',
            'profile:edit',
            'profile:change_password',
            'profile:change_avatar',
        ],
    },
};

/**
 * 检查权限
 */
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    if (!userPermissions) return false;
    if (userPermissions.includes('*')) return true;
    if (userPermissions.includes(requiredPermission)) return true;

    const [module] = requiredPermission.split(':');
    if (userPermissions.includes(`${module}:*`)) return true;

    return false;
}

export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.some((perm) => hasPermission(userPermissions, perm));
}

/**
 * 检查是否拥有所有权限
 */
export function hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.every((perm) => hasPermission(userPermissions, perm));
}

// 导出类型
type PermissionModule = typeof PermissionModules[keyof typeof PermissionModules];
export type { PermissionModule };
