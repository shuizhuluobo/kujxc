import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Customer, Region, ServiceType, User } from '@/types';
import { customersApi, regionsApi, serviceTypesApi, usersApi } from '@/api';
import { useAuthStore } from './auth';


// 最大加载数量限制，避免内存问题
const MAX_LOAD_SIZE = 5000;

export const useBaseDataStore = defineStore('baseData', () => {
    // State
    const customers = ref<Customer[]>([]);
    const regions = ref<Region[]>([]);
    const serviceTypes = ref<ServiceType[]>([]);
    const users = ref<User[]>([]);
    const loading = ref(false);

    // Actions
    async function fetchCustomers() {
        const authStore = useAuthStore();
        if (!authStore.user?.role?.permissions?.includes('*') &&
            !authStore.user?.role?.permissions?.includes('customer:list') &&
            !authStore.user?.role?.permissions?.includes('customer:*')) {
            return;
        }
        const response = await customersApi.getAll({ page: 1, pageSize: MAX_LOAD_SIZE });
        customers.value = response.data.data;
    }

    async function fetchRegions() {
        const authStore = useAuthStore();
        if (!authStore.user?.role?.permissions?.includes('*') &&
            !authStore.user?.role?.permissions?.includes('region:list') &&
            !authStore.user?.role?.permissions?.includes('region:*')) {
            return;
        }
        const response = await regionsApi.getAll();
        regions.value = response.data;
    }

    async function fetchServiceTypes() {
        const authStore = useAuthStore();
        if (!authStore.user?.role?.permissions?.includes('*') &&
            !authStore.user?.role?.permissions?.includes('serviceType:list') &&
            !authStore.user?.role?.permissions?.includes('serviceType:*')) {
            return;
        }
        const response = await serviceTypesApi.getAll();
        serviceTypes.value = response.data;
    }

    async function fetchUsers() {
        const authStore = useAuthStore();
        if (!authStore.user?.role?.permissions?.includes('*') &&
            !authStore.user?.role?.permissions?.includes('system:user_view') &&
            !authStore.user?.role?.permissions?.includes('system:*')) {
            return;
        }
        const response = await usersApi.getAll({ page: 1, pageSize: MAX_LOAD_SIZE });
        users.value = response.data.data;
    }

    async function fetchAll() {
        loading.value = true;
        try {
            // 使用 Promise.allSettled 避免其中一个失败影响其他
            await Promise.allSettled([
                fetchCustomers(),
                fetchRegions(),
                fetchServiceTypes(),
                fetchUsers(),
            ]);
        } finally {
            loading.value = false;
        }
    }


    return {
        customers,
        regions,
        serviceTypes,
        users,
        loading,
        fetchCustomers,
        fetchRegions,
        fetchServiceTypes,
        fetchUsers,
        fetchAll,
    };
});
