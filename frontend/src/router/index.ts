import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { hasPermission, hasAnyPermission } from '@/config/permissions';

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
                    path: 'admin/suppliers',
                    name: 'suppliers',
                    component: () => import('@/views/admin/SuppliersView.vue'),
                    meta: { permission: 'supplier:manage' },
                },
                {
                    path: 'admin/warehouses',
                    name: 'warehouses',
                    component: () => import('@/views/admin/WarehousesView.vue'),
                    meta: { permission: 'warehouse:manage' },
                },
                {
                    path: 'inventory/stock',
                    name: 'inventoryStock',
                    component: () => import('@/views/inventory/StockQueryView.vue'),
                    meta: { permission: 'inventory:view' },
                },
                {
                    path: 'inventory/batches',
                    name: 'inventoryBatches',
                    component: () => import('@/views/inventory/InventoryBatchView.vue'),
                    meta: { permission: 'inventory:view' },
                },
                {
                    path: 'inventory/sales',
                    name: 'inventorySales',
                    component: () => import('@/views/inventory/SaleListView.vue'),
                    meta: { permission: 'inventory:view' },
                },
                {
                    path: 'inventory/sales/create',
                    name: 'inventorySaleCreate',
                    component: () => import('@/views/inventory/SaleCreateView.vue'),
                    meta: { permission: 'inventory:create' },
                },
                {
                    path: 'inventory/transfers',
                    name: 'inventoryTransfers',
                    component: () => import('@/views/inventory/TransferListView.vue'),
                    meta: { permission: 'inventory:transfer' },
                },
                {
                    path: 'inventory/returns',
                    name: 'inventoryReturns',
                    component: () => import('@/views/inventory/ReturnListView.vue'),
                    meta: { permission: 'inventory:return' },
                },
                {
                    path: 'inventory/checks',
                    name: 'inventoryChecks',
                    component: () => import('@/views/inventory/CheckListView.vue'),
                    meta: { permission: 'inventory:check' },
                },
                {
                    path: 'inventory/borrow',
                    name: 'inventoryBorrow',
                    component: () => import('@/views/inventory/BorrowView.vue'),
                    meta: { permission: 'borrow:manage' },
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
                    path: 'products',
                    name: 'productList',
                    component: () => import('@/views/products/ProductListView.vue'),
                    // 与侧边栏 canAccessProducts 的入口语义一致：列表或查看任一权限即可进入
                    meta: { permission: ['product:list', 'product:view'] },
                },
                {
                    path: 'products/new',
                    name: 'productCreate',
                    component: () => import('@/views/products/ProductEditView.vue'),
                    meta: { permission: 'product:create' },
                },
                {
                    path: 'products/:id',
                    name: 'productDetail',
                    component: () => import('@/views/products/ProductDetailView.vue'),
                    meta: { permission: 'product:view' },
                },
                {
                    path: 'products/:id/edit',
                    name: 'productEdit',
                    component: () => import('@/views/products/ProductEditView.vue'),
                    meta: { permission: 'product:edit' },
                },
                {
                    path: 'products/brands',
                    name: 'productBrands',
                    component: () => import('@/views/products/BrandsView.vue'),
                    meta: { permission: 'brand:manage' },
                },
                {
                    path: 'products/categories',
                    name: 'productCategories',
                    component: () => import('@/views/products/CategoriesView.vue'),
                    meta: { permission: 'category:manage' },
                },
                {
                    path: 'products/tags',
                    name: 'productTags',
                    component: () => import('@/views/products/TagsView.vue'),
                    meta: { permission: 'tag:manage' },
                },
                {
                    path: 'products/quotations',
                    name: 'quotationList',
                    component: () => import('@/views/products/QuotationHistoryView.vue'),
                    // 与侧边栏 canAccessQuotation 的入口语义一致：列表或查看任一权限即可进入
                    meta: { permission: ['quotation:list', 'quotation:view'] },
                },
                {
                    path: 'products/quotations/new',
                    name: 'quotationCreate',
                    component: () => import('@/views/products/QuotationGeneratorView.vue'),
                    meta: { permission: 'quotation:create' },
                },
                {
                    path: 'products/quotations/:id',
                    name: 'quotationDetail',
                    component: () => import('@/views/products/QuotationDetailView.vue'),
                    meta: { permission: 'quotation:view' },
                },
                {
                    path: 'products/quotations/templates',
                    name: 'quotationTemplates',
                    component: () => import('@/views/products/QuotationTemplatesView.vue'),
                    meta: { permission: 'quotationTemplate:manage' },
                },
                {
                    path: 'products/import',
                    name: 'productImport',
                    component: () => import('@/views/products/ProductImportView.vue'),
                    meta: { permission: 'product:import' },
                },
                {
                    path: 'products/settings',
                    name: 'productSettings',
                    component: () => import('@/views/products/ProductSettingsView.vue'),
                    meta: { permission: 'product:view' },
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
        // 支持单权限或任一命中（数组）：与侧边栏 hasAny 的导航可见性语义保持一致
        const required = to.meta.permission as string | string[];
        const hasAccess = Array.isArray(required)
            ? hasAnyPermission(permissions, required)
            : hasPermission(permissions, required) || permissions.includes('*');

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
