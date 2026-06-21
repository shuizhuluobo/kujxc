import type { Directive } from 'vue';

/**
 * v-shake 指令：通过 ref 引用，调用 el.__shake() 触发摇晃+高亮闪烁动画
 * 用法：
 *   <el-form-item v-shake ref="dateItem">...</el-form-item>
 *   // 校验失败时：
 *   dateItem.value?.__shake?.()
 */
const SHAKE_CLASS = 'v-shake-active';

const shake: Directive = {
  mounted(el) {
    el.__shake = () => {
      // 防止重复触发
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
