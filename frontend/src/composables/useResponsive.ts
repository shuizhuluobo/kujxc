import { ref, onMounted, onUnmounted } from 'vue';
import { Capacitor } from '@capacitor/core';

export function useResponsive() {
    const isNative = Capacitor.isNativePlatform();

    // Default to mobile if native, otherwise check width
    const isMobile = ref(isNative || window.innerWidth < 768);
    const isTablet = ref(!isNative && window.innerWidth >= 768 && window.innerWidth < 1024);
    const isDesktop = ref(!isNative && window.innerWidth >= 1024);

    function update() {
        if (isNative) {
            isMobile.value = true;
            isTablet.value = false;
            isDesktop.value = false;
            return;
        }
        isMobile.value = window.innerWidth < 768;
        isTablet.value = window.innerWidth >= 768 && window.innerWidth < 1024;
        isDesktop.value = window.innerWidth >= 1024;
    }

    onMounted(() => {
        window.addEventListener('resize', update);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', update);
    });

    return { isMobile, isTablet, isDesktop };
}
