import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Customer, Region, ServiceType, User } from '@/types';
import { customersApi, regionsApi, serviceTypesApi, usersApi } from '@/api';
import { useAuthStore } from './auth';

// 最大加载数量限制
const MAX_LOAD_SIZE = 2000;

// 本地缓存配置
const CACHE_KEY = 'base_data_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface BaseDataCache {
  customers: CacheEntry<Customer[]> | null;
  regions: CacheEntry<Region[]> | null;
  serviceTypes: CacheEntry<ServiceType[]> | null;
  users: CacheEntry<User[]> | null;
}

function loadCache(): BaseDataCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BaseDataCache;
  } catch {
    return null;
  }
}

function saveCache(cache: BaseDataCache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage 满或不可用，忽略
  }
}

function isCacheValid<T>(entry: CacheEntry<T> | null | undefined): entry is CacheEntry<T> {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL;
}

export const useBaseDataStore = defineStore('baseData', () => {
    // State
    const customers = ref<Customer[]>([]);
    const regions = ref<Region[]>([]);
    const serviceTypes = ref<ServiceType[]>([]);
    const users = ref<User[]>([]);
    const loading = ref(false);

    // Actions
    async function fetchCustomers(forceRefresh = false) {
        const authStore = useAuthStore();
        if (!authStore.user?.role?.permissions?.includes('*') &&
            !authStore.user?.role?.permissions?.includes('customer:list') &&
            !authStore.user?.role?.permissions?.includes('customer:*')) {
            return;
        }

        // 尝试使用缓存
        if (!forceRefresh) {
          const cache = loadCache();
          if (isCacheValid(cache?.customers)) {
            customers.value = cache!.customers!.data;
            return;
          }
        }

        const response = await customersApi.getAll({ page: 1, pageSize: MAX_LOAD_SIZE });
        customers.value = response.data.data;

        // 更新缓存
        const cache = loadCache() || { customers: null, regions: null, serviceTypes: null, users: null };
        cache.customers = { data: response.data.data, timestamp: Date.now() };
        saveCache(cache);
    }

    async function fetchRegions(forceRefresh = false) {
        const authStore = useAuthStore();
        if (!authStore.user?.role?.permissions?.includes('*') &&
            !authStore.user?.role?.permissions?.includes('region:list') &&
            !authStore.user?.role?.permissions?.includes('region:*')) {
            return;
        }

        if (!forceRefresh) {
          const cache = loadCache();
          if (isCacheValid(cache?.regions)) {
            regions.value = cache!.regions!.data;
            return;
          }
        }

        const response = await regionsApi.getAll();
        regions.value = response.data;

        const cache = loadCache() || { customers: null, regions: null, serviceTypes: null, users: null };
        cache.regions = { data: response.data, timestamp: Date.now() };
        saveCache(cache);
    }

    async function fetchServiceTypes(forceRefresh = false) {
        const authStore = useAuthStore();
        if (!authStore.user?.role?.permissions?.includes('*') &&
            !authStore.user?.role?.permissions?.includes('serviceType:list') &&
            !authStore.user?.role?.permissions?.includes('serviceType:*')) {
            return;
        }

        if (!forceRefresh) {
          const cache = loadCache();
          if (isCacheValid(cache?.serviceTypes)) {
            serviceTypes.value = cache!.serviceTypes!.data;
            return;
          }
        }

        const response = await serviceTypesApi.getAll();
        serviceTypes.value = response.data;

        const cache = loadCache() || { customers: null, regions: null, serviceTypes: null, users: null };
        cache.serviceTypes = { data: response.data, timestamp: Date.now() };
        saveCache(cache);
    }

    async function fetchUsers(forceRefresh = false) {
        const authStore = useAuthStore();
        // 管理员和工程师都可以获取用户列表（工程师用于选择协作人）
        if (!authStore.user?.role?.permissions?.includes('*') &&
            !authStore.user?.role?.permissions?.includes('system:user_view') &&
            !authStore.user?.role?.permissions?.includes('system:*') &&
            authStore.user?.role?.code !== 'engineer') {
            return;
        }

        if (!forceRefresh) {
          const cache = loadCache();
          if (isCacheValid(cache?.users)) {
            users.value = cache!.users!.data;
            return;
          }
        }

        const response = await usersApi.getAll({ page: 1, pageSize: MAX_LOAD_SIZE });
        users.value = response.data.data;

        const cache = loadCache() || { customers: null, regions: null, serviceTypes: null, users: null };
        cache.users = { data: response.data.data, timestamp: Date.now() };
        saveCache(cache);
    }

    async function fetchAll(forceRefresh = false) {
        loading.value = true;
        try {
            // 使用 Promise.allSettled 避免其中一个失败影响其他
            await Promise.allSettled([
                fetchCustomers(forceRefresh),
                fetchRegions(forceRefresh),
                fetchServiceTypes(forceRefresh),
                fetchUsers(forceRefresh),
            ]);
        } finally {
            loading.value = false;
        }
    }

    function clearCache() {
      localStorage.removeItem(CACHE_KEY);
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
        clearCache,
    };
});
