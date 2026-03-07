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
