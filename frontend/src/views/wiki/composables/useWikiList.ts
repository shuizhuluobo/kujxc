import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { wikiApi } from '@/api';
import { useResponsive, usePermission } from '@/composables';
import type { WikiArticle, WikiCategory, WikiArticleFilterParams } from '@/types';

export function useWikiList() {
    const router = useRouter();
    const { has } = usePermission();
    const { isMobile } = useResponsive();

    const loading = ref(false);
    const articles = ref<WikiArticle[]>([]);
    const categories = ref<WikiCategory[]>([]);
    const activeCategoryId = ref('all');
    const searchKeyword = ref('');
    const total = ref(0);

    // Mobile specific refs
    const refreshing = ref(false);
    const loadingMore = ref(false);
    const finished = ref(false);

    const pagination = reactive({
        page: 1,
        pageSize: 10,
    });

    function formatDate(d: string) {
        const date = new Date(d);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    function getSummary(content: string) {
        const tmp = document.createElement('DIV');
        tmp.textContent = content;
        const plainText = tmp.textContent?.trim() || '';
        return plainText.length > 120 ? plainText.slice(0, 120) + '...' : plainText;
    }

    function getCurrentCategoryName() {
        if (activeCategoryId.value === 'all') return '全部文章';
        const cat = categories.value.find(c => c.id === activeCategoryId.value);
        return cat?.name || '全部文章';
    }

    async function fetchCategories() {
        const res = await wikiApi.getCategories();
        categories.value = res.data;
    }

    async function fetchArticles(append = false) {
        if (!append) {
            loading.value = true;
        }
        try {
            const params: WikiArticleFilterParams = {
                page: pagination.page,
                pageSize: pagination.pageSize,
                keyword: searchKeyword.value || undefined,
                categoryId: activeCategoryId.value === 'all' ? undefined : activeCategoryId.value,
            };

            const cleanedParams = Object.fromEntries(
                Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined),
            ) as WikiArticleFilterParams;

            const res = await wikiApi.getArticles(cleanedParams);
            if (append) {
                articles.value.push(...res.data.data);
            } else {
                articles.value = res.data.data;
            }
            total.value = res.data.total;

            // Check if finished for mobile list
            if (articles.value.length >= total.value) {
                finished.value = true;
            } else {
                finished.value = false;
            }
        } finally {
            loading.value = false;
            loadingMore.value = false;
        }
    }

    // Mobile: pull refresh
    async function onRefresh() {
        finished.value = false;
        loadingMore.value = true;
        pagination.page = 1;
        await fetchArticles(false);
        refreshing.value = false;
    }

    // Mobile: infinite scroll load
    async function onLoad() {
        if (refreshing.value || loading.value) return;
        if (articles.value.length >= total.value) {
            finished.value = true;
            return;
        }
        pagination.page++;
        await fetchArticles(true);
    }

    function handlePageChange(page: number) {
        pagination.page = page;
        void fetchArticles();
    }

    function handleSearch() {
        pagination.page = 1;
        void fetchArticles();
    }

    function handleCategorySelect(id: string) {
        activeCategoryId.value = id;
        pagination.page = 1;
        void fetchArticles();
    }

    function handleCreate() {
        void router.push('/wiki/edit');
    }

    function viewDetail(id: string) {
        void router.push(`/wiki/${id}`);
    }

    return {
        // State
        loading,
        articles,
        categories,
        activeCategoryId,
        searchKeyword,
        total,
        refreshing,
        loadingMore,
        finished,
        pagination,
        isMobile,
        has,
        // Methods
        formatDate,
        getSummary,
        getCurrentCategoryName,
        fetchCategories,
        fetchArticles,
        onRefresh,
        onLoad,
        handlePageChange,
        handleSearch,
        handleCategorySelect,
        handleCreate,
        viewDetail,
    };
}

export function useWikiCategory(fetchCategories: () => Promise<void>) {
    const categoryDialogVisible = ref(false);
    const categoryForm = reactive({ name: '' });

    function handleManageCategories() {
        categoryDialogVisible.value = true;
    }

    async function saveCategory() {
        if (!categoryForm.name) return;
        try {
            await wikiApi.createCategory({ name: categoryForm.name });
            categoryForm.name = '';
            await fetchCategories();
            ElMessage.success('添加成功');
        } catch (e) {
            console.error('添加分类失败:', e);
            ElMessage.error('添加分类失败');
        }
    }

    async function deleteCategory(id: string) {
        try {
            await ElMessageBox.confirm('确定删除此分类吗？', '提示', { type: 'warning' });
        } catch { return; }
        try {
            await wikiApi.deleteCategory(id);
            await fetchCategories();
            ElMessage.success('已删除');
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            ElMessage.error(err.response?.data?.message || '删除分类失败');
        }
    }

    return {
        categoryDialogVisible,
        categoryForm,
        handleManageCategories,
        saveCategory,
        deleteCategory,
    };
}
