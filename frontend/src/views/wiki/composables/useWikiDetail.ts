import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { ElMessage, ElMessageBox } from 'element-plus';
import { wikiApi } from '@/api';
import { useAuthStore } from '@/stores/auth';
import { useResponsive } from '@/composables';
import { useDark } from '@vueuse/core';
import type { WikiArticle } from '@/types';

export function useWikiDetail() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    const { isMobile } = useResponsive();
    const isDark = useDark();

    const loading = ref(true);
    const article = ref<WikiArticle | null>(null);

    const canEdit = computed(() => {
        if (!article.value) return false;
        return authStore.isAdmin || authStore.user?.id === article.value.authorId;
    });

    const canDelete = computed(() => {
        if (!article.value) return false;
        return authStore.isAdmin || authStore.user?.id === article.value.authorId;
    });

    function formatDate(d: string) {
        return dayjs(d).format('YYYY年M月D日 HH:mm');
    }

    async function fetchArticle() {
        const id = route.params.id as string;
        try {
            const res = await wikiApi.getArticle(id);
            article.value = res.data;
        } catch (e) {
            console.error('加载文章失败:', e);
            ElMessage.error('加载文章失败');
        } finally {
            loading.value = false;
        }
    }

    function goToEdit() {
        if (article.value) {
            router.push(`/wiki/edit?id=${article.value.id}`);
        }
    }

    async function handleDelete() {
        if (!article.value) return;

        try {
            await ElMessageBox.confirm('确定要删除这篇文章吗？此操作不可恢复。', '确认删除', {
                type: 'warning',
                confirmButtonText: '删除',
                cancelButtonText: '取消',
            });

            await wikiApi.deleteArticle(article.value.id);
            ElMessage.success('删除成功');
            router.push('/wiki');
        } catch (e: any) {
            if (e !== 'cancel') {
                ElMessage.error('删除失败');
            }
        }
    }

    function goBack() {
        router.back();
    }

    async function handleLike() {
        if (!article.value) return;

        try {
            const res = await wikiApi.toggleLike(article.value.id);
            if (res.data.isLiked) {
                article.value.likeCount = (article.value.likeCount || 0) + 1;
                article.value.isLiked = true;
                ElMessage.success('点赞成功');
            } else {
                article.value.likeCount = Math.max(0, (article.value.likeCount || 1) - 1);
                article.value.isLiked = false;
                ElMessage.success('已取消点赞');
            }
        } catch (e: any) {
            ElMessage.error('操作失败');
        }
    }

    onMounted(fetchArticle);

    return {
        isMobile,
        isDark,
        loading,
        article,
        canEdit,
        canDelete,
        formatDate,
        goToEdit,
        handleDelete,
        handleLike,
        goBack,
    };
}
