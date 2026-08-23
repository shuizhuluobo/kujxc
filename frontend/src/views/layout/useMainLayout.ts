import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import gsap from 'gsap';
import { useAuthStore } from '@/stores/auth';
import { useBaseDataStore } from '@/stores/baseData';
import { useResponsive } from '@/composables';
import { usePermission } from '@/composables/usePermission';

export function useMainLayout() {
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();
    const baseDataStore = useBaseDataStore();
    const { isMobile } = useResponsive();
    const { has, hasAny } = usePermission();

    const sidebarCollapsed = ref(false);
    const showAdminMenu = ref(false);

    // 全屏（沉浸式）仅在移动端生效；桌面端默认保留侧边栏与顶栏以便滚动，
    // 除非路由显式声明 desktopFullscreen（如编辑器）。
    const isFullscreen = computed(() => {
        if (route.meta.fullscreen !== true) return false;
        if (isMobile.value) return true;
        return route.meta.desktopFullscreen === true;
    });

    // 权限检查
    const canAccessWorkOrder = computed(() => has('workOrder:list'));
    const canAccessWorkOrderHistory = computed(() => has('workOrder:list'));
    const canAccessWiki = computed(() => has('wiki:list'));
    const canAccessProjects = computed(() => has('fee:list'));
    const canAccessProfile = computed(() => has('profile:profile'));

    // 产品管理（并入“基础数据”菜单）
    const canAccessProducts = computed(() => hasAny([
        'product:list', 'product:view', 'product:create', 'product:edit',
        'product:delete', 'product:import', 'brand:manage', 'category:manage',
        'tag:manage',
    ]));
    const canAccessProductList = computed(() => hasAny(['product:list', 'product:view']));
    const canAccessBrandManage = computed(() => has('brand:manage'));
    const canAccessCategoryManage = computed(() => has('category:manage'));
    const canAccessTagManage = computed(() => has('tag:manage'));
    const canImport = computed(() => has('product:import'));

    // 报价管理（独立顶级菜单，与待办/知识库等同级）
    const canAccessQuotation = computed(() => hasAny([
        'quotation:list', 'quotation:view', 'quotation:create',
        'quotation:update', 'quotationTemplate:manage',
    ]));
    const canAccessQuotationList = computed(() => hasAny(['quotation:list', 'quotation:view']));
    const canAccessQuotationTemplate = computed(() => has('quotationTemplate:manage'));

    // 系统管理页面访问权 (UI 菜单入口)
    const canAccessUserManage = computed(() => has('system:user_manage'));
    const canAccessRoleManage = computed(() => has('system:role_manage'));
    const canAccessCustomer = computed(() => has('customer:manage'));
    const canAccessBaseData = computed(() => hasAny(['region:manage', 'serviceType:manage']));

    // 是否有任意管理权限 (决定侧边栏“基础数据”二级菜单是否显示)
    const canAccessAnyAdmin = computed(() => hasAny([
        'system:user_manage',
        'system:role_manage',
        'customer:manage',
        'region:manage',
        'serviceType:manage',
    ]));


    // Transition hooks
    const beforeEnter = (el: Element) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.opacity = '0';
        htmlEl.style.transform = 'translateY(20px)';
    };

    const enter = (el: Element, done: () => void) => {
        gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => {
                gsap.set(el, { clearProps: 'all' });
                done();
            },
        });
    };

    const leave = (el: Element, done: () => void) => {
        gsap.to(el, {
            opacity: 0,
            y: -20,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: done,
        });
    };

    function handleCommand(command: string) {
        if (command === 'logout') {
            void ElMessageBox.confirm('确定要退出登录吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                authStore.logout();
                void router.push('/login');
            });
        } else if (command === 'profile') {
            void router.push('/profile');
        }
    }

    function goTo(path: string) {
        showAdminMenu.value = false;
        void router.push(path);
    }

    onMounted(() => {
        void baseDataStore.fetchAll();
    });

    return {
        router,
        route,
        authStore,
        isMobile,
        sidebarCollapsed,
        showAdminMenu,
        isFullscreen,
        canAccessWorkOrder,
        canAccessWorkOrderHistory,
        canAccessWiki,
        canAccessProjects,
        canAccessProfile,
        canAccessProducts,
        canAccessProductList,
        canAccessQuotation,
        canAccessBrandManage,
        canAccessCategoryManage,
        canAccessTagManage,
        canAccessQuotationList,
        canAccessQuotationTemplate,
        canImport,
        canAccessUserManage,
        canAccessRoleManage,
        canAccessCustomer,
        canAccessBaseData,
        canAccessAnyAdmin,
        beforeEnter,
        enter,
        leave,
        handleCommand,
        goTo,
    };
}
