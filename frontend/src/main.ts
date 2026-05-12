import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

// Vant 导入
import { Locale } from 'vant';
import zhCN from 'vant/es/locale/lang/zh-CN';
import 'vant/lib/index.css';

import App from './App.vue';
import router from './router';
import './style.css';
import './styles/element-overrides.css';
import './styles/vant-overrides.css';

// 抑制 Element Plus 内部字段验证产生的控制台警告
// Element Plus 在字段验证失败时通过 console.warn 输出 {fieldName: [error]} 对象
// 这是 Element Plus 的已知行为，参考: https://github.com/element-plus/element-plus/issues/13785
const _originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
    if (args.length === 1 && args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])) {
        const values = Object.values(args[0] as Record<string, unknown>);
        if (values.length > 0 && values.every(v => Array.isArray(v))) {
            return; // 过滤 Element Plus 表单验证警告
        }
    }
    _originalWarn.apply(console, args);
};

const app = createApp(App);

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

// 配置 Vant 语言
Locale.use('zh-CN', zhCN);

app.use(createPinia());
app.use(router);
app.use(ElementPlus, { locale: zhCn });

// Version: 202603062330
app.mount('#app');
