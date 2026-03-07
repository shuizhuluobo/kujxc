declare module 'vue-cropper' {
    import { DefineComponent } from 'vue';
    export const VueCropper: DefineComponent<{}, {}, any>;
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare module '*/vue-cropper.vue' {
    import { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export default component;
}
