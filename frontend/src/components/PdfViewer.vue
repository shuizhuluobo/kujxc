<template>
  <div class="pdf-viewer-container" v-loading="loading">
    <div v-if="error" class="error-state">
      <el-result icon="error" title="无法加载文档" :sub-title="error">
        <template #extra>
          <el-button type="primary" @click="retry">重试</el-button>
        </template>
      </el-result>
    </div>
    
    <div v-if="isPasswordRequired" class="password-prompt">
       <el-input v-model="passwordInput" type="password" placeholder="请输入文档密码" @keyup.enter="loadDocument(passwordInput)">
         <template #append>
           <el-button @click="loadDocument(passwordInput)">打开</el-button>
         </template>
       </el-input>
       <p class="hint">如果是统一密码，系统会自动尝试。</p>
    </div>

    <!-- Canvas for PDF Pages -->
    <div ref="pdfContainer" class="pdf-pages" v-show="!isPasswordRequired && !error">
       <!-- We will render pages dynamically -->
       <div v-for="page in pages" :key="page.pageIndex" class="pdf-page-wrapper">
          <canvas :ref="(el) => { if(el) pageRefs[page.pageIndex] = el as HTMLCanvasElement }" class="pdf-page-canvas"></canvas>
          <div class="text-layer" :ref="(el) => { if(el) textLayerRefs[page.pageIndex] = el as HTMLElement }"></div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import * as pdfjsLib from 'pdfjs-dist';
// Worker setup is tricky in Vite. We use the CDN or local worker.
// Standard way: import worker from 'pdfjs-dist/build/pdf.worker.entry';
// But often needs explicit path setting.
import { GlobalWorkerOptions } from 'pdfjs-dist';

// Set worker source - adjust version to match package.json
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const props = defineProps<{
  url: string;
  searchKeyword?: string;
  defaultPassword?: string;
}>();

const loading = ref(false);
const error = ref('');
const isPasswordRequired = ref(false);
const passwordInput = ref('');
const pdfDoc = ref<any>(null);
const pages = ref<any[]>([]);
const pageRefs = ref<Record<number, HTMLCanvasElement>>({});
const textLayerRefs = ref<Record<number, HTMLElement>>({});

const loadDocument = async (password?: string) => {
  loading.value = true;
  error.value = '';
  isPasswordRequired.value = false;
  pages.value = [];

  try {
    const loadingTask = pdfjsLib.getDocument({
      url: props.url,
      password: password || props.defaultPassword,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true,
    });

    loadingTask.onPassword = (updatePassword: (password: string) => void, reason: number) => {
      loading.value = false;
      isPasswordRequired.value = true;
      // User must input password via UI which triggers this function again logic
      // Actually pdf.js keeps the task callback.
      // But for simplicity in Vue, we usually just re-call getDocument with new password.
      // Complex password flow omitted for MVP, assuming re-call works.
      error.value = 'Password required';
    };

    pdfDoc.value = await loadingTask.promise;
    
    // Render all pages (lazy loading is better for large docs, but linear for MVP)
    const numPages = pdfDoc.value.numPages;
    for (let i = 1; i <= numPages; i++) {
       pages.value.push({ pageIndex: i });
    }
    
    await nextTick();
    renderPages();

  } catch (err: any) {
    console.error(err);
    if (err.name === 'PasswordException') {
        isPasswordRequired.value = true;
    } else {
        error.value = err.message;
    }
  } finally {
    if (!isPasswordRequired.value) loading.value = false;
  }
};

const renderPages = async () => {
    if (!pdfDoc.value) return;

    for (const pageItem of pages.value) {
        const page = await pdfDoc.value.getPage(pageItem.pageIndex);
        const canvas = pageRefs.value[pageItem.pageIndex];
        const context = canvas?.getContext('2d');
        if (!canvas || !context) continue;

        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };
        await page.render(renderContext).promise;
        
        // TODO: Render Text Layer for search highlighting
    }
};

const retry = () => loadDocument();

onMounted(() => {
    if (props.url) loadDocument();
});

watch(() => props.url, () => {
    loadDocument();
});
</script>

<style scoped>
.pdf-viewer-container {
    height: 100%;
    overflow-y: auto;
    background: #f5f5f5;
    padding: 20px;
}
.pdf-page-wrapper {
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    display: flex;
    justify-content: center;
    position: relative;
}
.password-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 50px;
}
</style>
