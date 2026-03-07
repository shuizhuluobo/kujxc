import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { hasPermission, hasAnyPermission, hasAllPermissions, PermissionModules, type PermissionModule } from '@/config/permissions';

// 当前用户权限缓存
const userPermissions = ref<string[]>([]);

export function usePermission() {
    const authStore = useAuthStore();
    
    // 从用户信息加载权限
    const loadPermissions = () => {
        if (authStore.user?.role?.permissions) {
            userPermissions.value = authStore.user.role.permissions;
        } else {
            userPermissions.value = [];
        }
    };
    
    // 检查单个权限
    const checkPermission = (permission: string): boolean => {
        return hasPermission(userPermissions.value, permission);
    };
    
    // 检查是否有任意权限
    const checkAnyPermission = (permissions: string[]): boolean => {
        return hasAnyPermission(userPermissions.value, permissions);
    };
    
    // 检查是否拥有所有权限
    const checkAllPermissions = (permissions: string[]): boolean => {
        return hasAllPermissions(userPermissions.value, permissions);
    };
    
    // 检查页面访问权限
    const canAccessPage = (moduleKey: string, pageKey: string): boolean => {
        return checkPermission(`${moduleKey}:${pageKey}`);
    };
    
    // 检查操作权限
    const canPerformAction = (moduleKey: string, actionKey: string): boolean => {
        return checkPermission(`${moduleKey}:${actionKey}`);
    };
    
    // 检查模块是否有任意权限（用于显示模块入口）
    const hasModuleAccess = (module: PermissionModule): boolean => {
        // 检查是否有任意页面权限
        const pagePermissions = module.pages.map(p => `${module.key}:${p.key}`);
        // 检查是否有任意操作权限
        const actionPermissions = module.actions.map(a => `${module.key}:${a.key}`);
        
        return checkAnyPermission([...pagePermissions, ...actionPermissions]);
    };
    
    // 获取模块的可见页面
    const getVisiblePages = (module: PermissionModule) => {
        return module.pages.filter(page => canAccessPage(module.key, page.key));
    };
    
    // 获取模块的可用操作
    const getAvailableActions = (module: PermissionModule) => {
        return module.actions.filter(action => canPerformAction(module.key, action.key));
    };
    
    // 是否是管理员
    const isAdmin = computed(() => {
        return userPermissions.value.includes('*') || authStore.user?.role?.code === 'admin';
    });
    
    // 初始化权限
    loadPermissions();
    
    return {
        // 权限检查
        has: checkPermission,
        hasAny: checkAnyPermission,
        hasAll: checkAllPermissions,
        
        // 页面和操作
        canAccessPage,
        canPerformAction,
        hasModuleAccess,
        getVisiblePages,
        getAvailableActions,
        
        // 状态
        isAdmin,
        userPermissions,
        loadPermissions,
        
        // 配置
        modules: PermissionModules,
    };
}

// 指令权限（用于v-permission指令）
export function usePermissionDirective() {
    const { has, hasAny } = usePermission();
    
    return {
        // v-permission="'workOrder:create'"
        // v-permission="['workOrder:create', 'workOrder:edit']"
        check: (value: string | string[]) => {
            if (Array.isArray(value)) {
                return hasAny(value);
            }
            return has(value);
        },
    };
}
