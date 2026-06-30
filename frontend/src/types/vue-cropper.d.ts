declare module 'vue-cropper' {
    import { DefineComponent } from 'vue';
    export const VueCropper: DefineComponent<Record<string, never>, Record<string, never>, any>;
    const component: DefineComponent<Record<string, never>, Record<string, never>, any>;
    export default component;
}

declare module '*/vue-cropper.vue' {
    import { DefineComponent } from 'vue';
    const component: DefineComponent<Record<string, never>, Record<string, never>, any>;
    export default component;
}
