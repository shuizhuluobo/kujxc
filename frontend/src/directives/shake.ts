import type { Directive } from 'vue';

declare module 'vue' {
  interface ComponentCustomProperties {
    __shake?: () => void;
  }
}

interface ShakeElement extends HTMLElement {
  __shake?: () => void;
}

const SHAKE_CLASS = 'v-shake-active';

const shake: Directive<ShakeElement> = {
  mounted(el) {
    el.__shake = () => {
      if (el.classList.contains(SHAKE_CLASS)) return;
      el.classList.add(SHAKE_CLASS);
      setTimeout(() => {
        el.classList.remove(SHAKE_CLASS);
      }, 600);
    };
  },
  unmounted(el) {
    el.classList.remove(SHAKE_CLASS);
    delete el.__shake;
  },
};

export default shake;
