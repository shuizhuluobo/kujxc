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

    const isFullscreen = computed(() => route.meta.fullscreen === true);

    // 权限检查
    const canAccessWorkOrder = computed(() => has('workOrder:list'));
    const canAccessWorkOrderHistory = computed(() => has('workOrder:list'));
    const canAccessWiki = computed(() => has('wiki:list'));
    const canAccessFeeCalculator = computed(() => has('fee:list'));
    const canAccessProfile = computed(() => has('profile:profile'));

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
    const beforeEnter = (el: any) => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
    };

    const enter = (el: any, done: any) => {
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

    const leave = (el: any, done: any) => {
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
            ElMessageBox.confirm('确定要退出登录吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                authStore.logout();
                router.push('/login');
            });
        } else if (command === 'profile') {
            router.push('/profile');
        }
    }

    function goTo(path: string) {
        showAdminMenu.value = false;
        router.push(path);
    }

    onMounted(() => {
        baseDataStore.fetchAll();
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
        canAccessFeeCalculator,
        canAccessProfile,
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
