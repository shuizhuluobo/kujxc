import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { hasPermission } from '@/config/permissions';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/LoginView.vue'),
            meta: { guest: true },
        },
        {
            path: '/',
            component: () => import('@/views/MainLayout.vue'),
            meta: { requiresAuth: true },
            children: [
                {
                    path: '',
                    name: 'pending',
                    component: () => import('@/views/PendingWorkOrders.vue'),
                    meta: { permission: 'workOrder:list' },
                },
                {
                    path: 'history',
                    name: 'history',
                    component: () => import('@/views/HistoryWorkOrders.vue'),
                    meta: { permission: 'workOrder:list' },
                },
                {
                    path: 'profile',
                    name: 'profile',
                    component: () => import('@/views/ProfileView.vue'),
                    meta: { permission: null }, // 个人中心无需特定权限
                },
                {
                    path: 'admin/users',
                    name: 'users',
                    component: () => import('@/views/admin/UsersView.vue'),
                    meta: { permission: 'system:user_manage' },
                },
                {
                    path: 'admin/roles',
                    name: 'roles',
                    component: () => import('@/views/admin/RolesView.vue'),
                    meta: { permission: 'system:role_manage' },
                },
                {
                    path: 'admin/customers',
                    name: 'customers',
                    component: () => import('@/views/admin/CustomersView.vue'),
                    meta: { permission: 'customer:manage' },
                },
                {
                    path: 'admin/regions',
                    name: 'regions',
                    component: () => import('@/views/admin/RegionsView.vue'),
                    meta: { permission: 'region:manage' },
                },
                {
                    path: 'admin/service-types',
                    name: 'serviceTypes',
                    component: () => import('@/views/admin/ServiceTypesView.vue'),
                    meta: { permission: 'serviceType:manage' },
                },
                {
                    path: 'wiki',
                    name: 'wikiList',
                    component: () => import('@/views/wiki/WikiList.vue'),
                    meta: { permission: 'wiki:list' },
                },
                {
                    path: 'projects',
                    name: 'projects',
                    component: () => import('@/views/projects/ProjectsView.vue'),
                    meta: { permission: null },
                },
                {
                    path: 'wiki/:id',
                    name: 'wikiDetail',
                    component: () => import('@/views/wiki/WikiDetail.vue'),
                    meta: { permission: 'wiki:view', fullscreen: true },
                },
                {
                    path: 'wiki/edit',
                    name: 'wikiEditor',
                    component: () => import('@/views/wiki/WikiEditor.vue'),
                    meta: { permission: 'wiki:create', fullscreen: true, desktopFullscreen: true },
                },
                {
                    path: 'test/components',
                    name: 'componentTest',
                    component: () => import('@/views/ComponentTest.vue'),
                    meta: { permission: null }, // 测试页面无需权限
                },
            ],
        },
    ],
});

// 路由守卫
let lastRedirectTime = 0;
let redirectCount = 0;

router.beforeEach((to) => {
    const authStore = useAuthStore();
    const now = Date.now();

    // 重置重定向计数器
    if (now - lastRedirectTime > 1000) {
        redirectCount = 0;
    }
    lastRedirectTime = now;

    if (to.meta.requiresAuth && !authStore.token) {
        return { path: '/login' };
    }

    if (to.meta.guest && authStore.token) {
        return { path: '/' };
    }

    if (to.meta.requiresAdmin && !authStore.isAdmin) {
        return { path: '/' };
    }

    if (to.meta.permission && authStore.token) {
        const permissions = authStore.user?.role?.permissions || [];
        const hasAccess = hasPermission(permissions, to.meta.permission as string) || permissions.includes('*');

        if (!hasAccess) {
            redirectCount++;
            if (redirectCount > 5) {
                // 避免无限循环，且目标不是个人中心时才重定向到个人中心
                if (to.path === '/profile') {
                    // 如果个人中心也没权访问（理论上不应该，因为我们已经去掉了权限要求），则停止
                    return false;
                } else {
                    return { path: '/profile' };
                }
            } else {
                // 避免原地重定向
                if (to.path === '/') {
                    return { path: '/profile' };
                } else {
                    return { path: '/' };
                }
            }
        }
    }

    // 默认允许导航
    return true;
});

export default router;
