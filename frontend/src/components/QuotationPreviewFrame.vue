<template>
  <div class="qpf-pane">
    <iframe :srcdoc="scaledHtml" class="qpf-frame" />
    <div class="qpf-zoom-bar">
      <el-button-group>
        <el-button :icon="ZoomOut" size="small" :disabled="!previewFit && previewScale <= 0.3" title="缩小" @click="zoomBy(-0.1)" />
        <el-button size="small" class="qpf-zoom-label" :title="previewFit ? '宽度填满容器（点击切换百分比）' : '点击恢复宽度填满'" @click="resetFit">
          {{ previewFit ? '适应宽度' : `${Math.round(previewScale * 100)}%` }}
        </el-button>
        <el-button :icon="ZoomIn" size="small" :disabled="!previewFit && previewScale >= 2.5" title="放大" @click="zoomBy(0.1)" />
      </el-button-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ZoomIn, ZoomOut } from '@element-plus/icons-vue';

const props = defineProps<{
    html: string;
}>();

const previewFit = ref(true);
const previewScale = ref(1);

const scaledHtml = computed(() =>
    injectPreviewFit(props.html, previewFit.value ? 'fit' : previewScale.value),
);

function zoomBy(delta: number) {
    previewScale.value = Math.min(2.5, Math.max(0.3, previewScale.value + delta));
    previewFit.value = false;
}

function resetFit() {
    previewFit.value = true;
    previewScale.value = 1;
}

/** 预览 iframe 内按缩放模式渲染 A4 页：'fit' 宽度填满预览容器，数字为相对 100% 的缩放比例 */
function injectPreviewFit(html: string, mode: 'fit' | number): string {
    if (!html.includes('</body>')) return html;
    const fitScript = `<script>
(function () {
  var MODE = ${mode === 'fit' ? '"fit"' : String(mode)};
  function fit() {
    var page = document.querySelector('.page');
    if (!page) return;
    var baseW = page.offsetWidth;
    if (!baseW) { setTimeout(fit, 50); return; }
    var viewW = document.documentElement.clientWidth;
    var viewH = document.documentElement.clientHeight;
    var pad = 12;
    var baseH = page.offsetHeight;
    var s = MODE === 'fit' ? (viewW - pad * 2) / baseW : MODE;
    var scaleW = baseW * s;
    var scaleH = baseH * s;
    var x = Math.max(0, (viewW - scaleW) / 2);
    var y = pad;
    page.style.transformOrigin = 'top left';
    page.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + s + ')';
    page.style.margin = '0';
    document.body.style.width = Math.max(viewW, scaleW + pad * 2) + 'px';
    document.body.style.height = Math.max(viewH, scaleH + pad * 2) + 'px';
    var needH = scaleW + pad * 2 > viewW;
    var needV = scaleH + pad * 2 > viewH;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = needH || needV ? 'auto' : 'hidden';
  }
  window.addEventListener('resize', fit);
  fit();
})();
` + '</' + 'script>';
    return html.replace('</body>', `${fitScript}</body>`);
}
</script>

<style scoped>
.qpf-pane {
    flex: 1;
    min-width: 0;
    height: 100%;
    position: relative;
    background: #e9ecef;
    overflow: hidden;
}
.qpf-frame {
    width: 100%;
    height: 100%;
    border: none;
}
.qpf-zoom-bar {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 10;
    background: rgba(255, 255, 255, 0.85);
    border-radius: 6px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.15);
    padding: 2px;
}
.qpf-zoom-label {
    min-width: 64px;
    font-variant-numeric: tabular-nums;
}
</style>