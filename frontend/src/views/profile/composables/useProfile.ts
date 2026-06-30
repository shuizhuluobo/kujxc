import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import type { UserStats } from '@/types';
import { usersApi } from '@/api';
import { useAuthStore } from '@/stores/auth';
import { useResponsive } from '@/composables';
import { useRouter } from 'vue-router';
import { resolveAssetUrl } from '@/utils/url';

interface CropperInstance {
    getCropBlob: (cb: (data: Blob) => void) => void;
}

interface CropperComponent {
    $refs?: { cropper?: CropperInstance };
}

export function useProfile() {
    const authStore = useAuthStore();
    const router = useRouter();
    const { isMobile } = useResponsive();

    const loading = ref(false);
    const submitting = ref(false);
    const savingAvatar = ref(false);
    const showPasswordDialog = ref(false);
    const showAvatarDialog = ref(false);
    const activeTab = ref('preset');
    const stats = ref<UserStats>({ 
    completed: 0, 
    received: 0, 
    created: 0,
    monthlyCompleted: 0,
    monthlyReceived: 0,
    monthlyCreated: 0,
    totalRepairFee: 0,
    monthlyRepairFee: 0,
});

    // 预设头像
    const presetAvatars = [
        '/assets/avatars/avatar1.png',
        '/assets/avatars/avatar2.png',
        '/assets/avatars/avatar3.png',
        '/assets/avatars/avatar4.png',
    ];
    const selectedPreset = ref('');

    // 剪裁相关
    const cropper = ref<CropperComponent | CropperInstance | null>(null);
    const fileInput = ref<HTMLInputElement | null>(null);
    const tempImageUrl = ref('');
    const options = reactive({
        outputSize: 1,
        outputType: 'png',
        full: false,
        canMove: true,
        canMoveBox: true,
        original: false,
        autoCrop: true,
        autoCropWidth: 200,
        autoCropHeight: 200,
        fixedBox: true,
        centerBox: true,
        infoTrue: true,
        fixed: true,
        fixedNumber: [1, 1],
    });

    // 密码表单
    const passwordForm = reactive({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    function getAvatarUrl(path?: string) {
        if (!path) return '';
        const url = resolveAssetUrl(path);
        if (url.includes('/uploads/')) {
            return `${url}?t=${new Date().getTime()}`;
        }
        return url;
    }

    function formatDate(date?: string) {
        return date ? dayjs(date).format('YYYY-MM-DD') : '--';
    }

    async function fetchStats() {
        loading.value = true;
        try {
            const response = await usersApi.getStats();
            stats.value = response.data;
        } catch (error) {
            console.error('[Profile] Failed to fetch stats:', error);
        } finally {
            loading.value = false;
        }
    }

    async function handleChangePassword() {
        submitting.value = true;
        try {
            await usersApi.changePassword({
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword,
            });
            ElMessage.success('密码修改成功');
            showPasswordDialog.value = false;
            Object.assign(passwordForm, { oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            ElMessage.error(err.response?.data?.message || '修改失败');
        } finally {
            submitting.value = false;
        }
    }

    async function handleLogout() {
        await authStore.logout();
        void router.push('/login');
    }

    function triggerFileInput() {
        fileInput.value?.click();
    }

    function onFileChange(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            return ElMessage.error('请选择图片文件');
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            tempImageUrl.value = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    }

    async function handleSaveAvatar() {
        savingAvatar.value = true;
        try {
            let avatarUrl = '';

            if (activeTab.value === 'preset') {
                if (!selectedPreset.value) {
                    return ElMessage.warning('请选择一个预设头像');
                }
                avatarUrl = selectedPreset.value;
            } else {
                if (!tempImageUrl.value) {
                    return ElMessage.warning('请先上传图片');
                }

                const blob: Blob = await new Promise((resolve, reject) => {
                    const raw = cropper.value;
                    const cropperInstance: CropperInstance | undefined =
                        (raw && typeof raw === 'object' && '$refs' in raw ? raw.$refs?.cropper : raw) as CropperInstance | undefined;
                    if (!cropperInstance || typeof cropperInstance.getCropBlob !== 'function') {
                        return reject(new Error('Cropper instance not ready'));
                    }
                    cropperInstance.getCropBlob((data: Blob) => {
                        resolve(data);
                    });
                });

                const file = new File([blob], 'avatar.png', { type: 'image/png' });
                const res = await usersApi.uploadAvatar(file);
                avatarUrl = res.data.url;
            }

            await usersApi.updateProfile({ avatar: avatarUrl });
            await authStore.fetchProfile();

            ElMessage.success('头像更换成功');
            showAvatarDialog.value = false;
        } catch (err: unknown) {
            console.error('Avatar upload error:', err);
            const message = err instanceof Error ? err.message : '更换失败，请重试';
            ElMessage.error(message);
        } finally {
            savingAvatar.value = false;
        }
    }

    function setCropper(val: CropperComponent | CropperInstance | null) { cropper.value = val; }
    function setFileInput(val: HTMLInputElement | null) { fileInput.value = val; }

    return {
        // State
        authStore,
        isMobile,
        loading,
        submitting,
        savingAvatar,
        showPasswordDialog,
        showAvatarDialog,
        activeTab,
        stats,
        presetAvatars,
        selectedPreset,
        cropper,
        fileInput,
        tempImageUrl,
        options,
        passwordForm,
        // Methods
        getAvatarUrl,
        formatDate,
        fetchStats,
        handleChangePassword,
        handleLogout,
        triggerFileInput,
        onFileChange,
        handleSaveAvatar,
        setCropper,
        setFileInput,
    };
}
