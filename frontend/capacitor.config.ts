import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.kworkorder.app',
    appName: '工单系统',
    webDir: 'dist',
    server: {
        androidScheme: 'https',
        // 允许明文流量（用于内网访问）
        cleartext: true,
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: '#409EFF',
            showSpinner: false,
        },
    },
};

export default config;
