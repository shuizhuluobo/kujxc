<template>
  <div class="product-import-page">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" text @click="goBack">返回</el-button>
        <h2>产品批量导入</h2>
      </div>
    </div>

    <el-steps :active="step" align-center finish-status="success" class="steps">
      <el-step title="上传文件" />
      <el-step title="列映射" />
      <el-step title="预览校验" />
      <el-step title="导入结果" />
    </el-steps>

    <!-- Step 1: 上传 -->
    <el-card v-if="step === 0" class="card-premium">
      <div class="upload-zone">
        <el-upload
          drag
          :auto-upload="false"
          :show-file-list="false"
          accept=".xlsx,.xls,.csv"
          :on-change="handleFileChange"
        >
          <el-icon class="upload-icon"><UploadFilled /></el-icon>
          <div class="el-upload__text">将 Excel/CSV 文件拖到此处，或<em>点击选择</em></div>
          <div class="el-upload__tip">支持 .xlsx / .xls / .csv，最大 20MB。表头需含列名，如：品牌型号、品牌、类型、价格、成本</div>
        </el-upload>
        <el-button v-if="selectedFile" type="primary" :loading="uploading" @click="doUpload">
          上传并解析「{{ selectedFile.name }}」
        </el-button>
      </div>
    </el-card>

    <!-- Step 2: 映射 -->
    <el-card v-else-if="step === 1" class="card-premium">
      <template #header>
        <div class="card-header">
          <span class="card-title-text">列映射（识别到 {{ headers.length }} 列 · {{ totalRows }} 行数据）</span>
          <div>
            <el-dropdown v-if="importTemplates.length" @command="applyTemplate">
              <el-button size="small">加载模板</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="t in importTemplates" :key="t.id" :command="t">{{ t.name }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button size="small" @click="applySuggestion">应用自动推荐</el-button>
            <el-button size="small" type="primary" @click="openSaveTemplate">保存为模板</el-button>
          </div>
        </div>
      </template>
      <el-table :data="mappingRows" class="card-premium">
        <el-table-column label="目标字段" prop="label" width="140" />
        <el-table-column label="必填" width="60" align="center">
          <template #default="{ row }">{{ row.required ? '是' : '' }}</template>
        </el-table-column>
        <el-table-column label="源列" min-width="220">
          <template #default="{ row }">
            <el-select v-model="mapping[row.field]" clearable placeholder="请选择源列" style="width: 100%">
              <el-option v-for="h in headers" :key="h" :label="h" :value="h" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="示例值" min-width="200">
          <template #default="{ row }">
            <span v-if="mapping[row.field]">{{ sampleValue(mapping[row.field]) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <el-divider content-position="left">导入选项</el-divider>
      <div class="options-row">
        <el-checkbox v-model="options.createMissingBrand">自动创建品牌</el-checkbox>
        <el-checkbox v-model="options.createMissingCategory">自动创建类型</el-checkbox>
        <el-checkbox v-model="options.createMissingTags">自动创建标签</el-checkbox>
        <el-select v-model="options.defaultStatus" style="width: 140px">
          <el-option v-for="(label, key) in PRODUCT_STATUS_LABELS" :key="key" :label="label" :value="key" />
        </el-select>
        <el-select v-model="options.duplicateStrategy" style="width: 150px">
          <el-option label="重复则跳过" value="skip" />
          <el-option label="重复则覆盖" value="overwrite" />
          <el-option label="重复则新建" value="create" />
        </el-select>
      </div>

      <div class="footer-actions">
        <el-button @click="step = 0">上一步</el-button>
        <el-button type="primary" :loading="previewing" @click="doPreview">下一步：预览校验</el-button>
      </div>
    </el-card>

    <!-- Step 3: 预览 -->
    <el-card v-else-if="step === 2" class="card-premium">
      <template #header>
        <div class="card-header">
          <span class="card-title-text">预览与校验</span>
          <div class="preview-stats">
            <el-tag type="success">正常 {{ previewResult?.okRows ?? 0 }}</el-tag>
            <el-tag type="warning">警告 {{ previewResult?.warningRows ?? 0 }}</el-tag>
            <el-tag type="danger">错误 {{ previewResult?.errorRows ?? 0 }}</el-tag>
          </div>
        </div>
      </template>

      <el-table :data="previewResult?.rows || []" class="card-premium" :row-class-name="previewRowClass">
        <el-table-column label="行号" width="80">
          <template #default="{ row }">第 {{ row.rowNumber }} 行</template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'error' ? 'danger' : row.status === 'warning' ? 'warning' : 'success'" size="small">
              {{ row.status === 'error' ? '错误' : row.status === 'warning' ? '警告' : '正常' }}
            </el-tag>
            <el-tag
              v-if="row.issues.some((i: { field?: string }) => i.field === 'duplicate')"
              type="warning"
              size="small"
              effect="plain"
              class="dup-tag"
            >重复</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="品牌型号" min-width="160">
          <template #default="{ row }">{{ row.mapped.name }}</template>
        </el-table-column>
        <el-table-column label="型号" min-width="110">
          <template #default="{ row }">{{ row.mapped.model }}</template>
        </el-table-column>
        <el-table-column label="品牌" min-width="110">
          <template #default="{ row }">{{ row.mapped.brandName }}</template>
        </el-table-column>
        <el-table-column label="类型" min-width="110">
          <template #default="{ row }">{{ row.mapped.categoryPath }}</template>
        </el-table-column>
        <el-table-column label="价格" width="100">
          <template #default="{ row }">{{ row.mapped.marketPrice }}</template>
        </el-table-column>
        <el-table-column label="问题" min-width="260">
          <template #default="{ row }">
            <div v-for="issue in row.issues" :key="issue.message" class="issue-item">
              <el-icon :class="issue.level"><WarningFilled v-if="issue.level === 'error'" /><Warning v-else /></el-icon>
              {{ issue.message }}
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="footer-actions">
        <el-button @click="step = 1">上一步</el-button>
        <el-button @click="runPreview">重新校验</el-button>
        <el-button type="primary" :loading="executing" :disabled="!!previewResult?.errorRows" @click="doExecute">
          执行导入
        </el-button>
      </div>
    </el-card>

    <!-- Step 4: 结果 -->
    <el-card v-else-if="step === 3" class="card-premium">
      <template #header><span class="card-title-text">导入结果</span></template>
      <div class="result-grid">
        <div class="result-stat">
          <div class="stat-num">{{ result?.totalRows ?? 0 }}</div>
          <div class="stat-label">总行数</div>
        </div>
        <div class="result-stat success">
          <div class="stat-num">{{ result?.successRows ?? 0 }}</div>
          <div class="stat-label">成功</div>
        </div>
        <div class="result-stat warning">
          <div class="stat-num">{{ result?.overwrittenRows ?? 0 }}</div>
          <div class="stat-label">覆盖</div>
        </div>
        <div class="result-stat">
          <div class="stat-num">{{ result?.skippedRows ?? 0 }}</div>
          <div class="stat-label">跳过</div>
        </div>
        <div class="result-stat danger">
          <div class="stat-num">{{ result?.failedRows ?? 0 }}</div>
          <div class="stat-label">失败</div>
        </div>
      </div>
      <div class="result-extra" v-if="result?.createdBrands?.length || result?.createdTags?.length">
        <el-tag v-for="b in result.createdBrands" :key="`b-${b}`" size="small" class="tag-chip">新品牌：{{ b }}</el-tag>
        <el-tag v-for="t in result.createdTags" :key="`t-${t}`" size="small" class="tag-chip">新标签：{{ t }}</el-tag>
      </div>
      <el-alert v-if="result?.errors?.length" type="error" :closable="true" class="error-alert">
        <div v-for="err in result.errors" :key="`${err.rowNumber}-${err.message}`" class="error-row">
          <div class="error-row-head">
            <span class="error-row-no">第 {{ err.rowNumber }} 行：{{ err.message }}</span>
          </div>
          <pre v-if="err.rawData" class="error-row-raw">{{ formatRawRow(err.rawData) }}</pre>
        </div>
      </el-alert>
      <div class="footer-actions">
        <el-button type="primary" @click="resetAll">再导入一批</el-button>
        <el-button @click="router.push('/products')">查看产品管理</el-button>
      </div>
    </el-card>

    <!-- 历史记录 -->
    <el-card class="card-premium log-card">
      <template #header><span class="card-title-text">导入记录</span></template>
      <el-table :data="logs" size="small" empty-text="暂无导入记录">
        <el-table-column label="文件名" prop="fileName" min-width="160" />
        <el-table-column label="总行数" prop="totalRows" width="90" />
        <el-table-column label="成功" width="80">
          <template #default="{ row }"><span class="ok-text">{{ row.successRows }}</span></template>
        </el-table-column>
        <el-table-column label="失败" width="80">
          <template #default="{ row }"><span :class="{ 'fail-text': row.failedRows > 0 }">{{ row.failedRows }}</span></template>
        </el-table-column>
        <el-table-column label="跳过" prop="skippedRows" width="80" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作人" prop="createdBy" width="110">
          <template #default="{ row }">{{ row.createdBy || '-' }}</template>
        </el-table-column>
        <el-table-column label="时间" width="140">
          <template #default="{ row }">{{ fmtDate(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" v-if="logTotal > 0">
        <el-pagination
          v-model:current-page="logPage"
          :page-size="10"
          :total="logTotal"
          layout="prev, pager, next"
          small
          @current-change="fetchLogs"
        />
      </div>
    </el-card>

    <el-dialog v-model="saveTemplateVisible" title="保存映射模板" width="420px">
      <el-form label-width="80px">
        <el-form-item label="模板名称" required>
          <el-input v-model="templateName" maxlength="100" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="templateDescription" maxlength="200" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="saveTemplateVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTemplate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, UploadFilled, Warning, WarningFilled } from '@element-plus/icons-vue';
import type {
    ImportPreviewResult,
    ImportExecuteResult,
    ImportLog,
    ImportOptions,
    ImportTemplate,
    ImportUploadResult,
} from '@/api/products';
import { productImportApi } from '@/api';
import { PRODUCT_STATUS_LABELS } from '@/types';
import { getApiErrorMessage, formatDateTime as fmtDate } from '@/utils/format';

const router = useRouter();

// 返回：优先回退历史；直链进入（无上一页）时兜底到产品列表，避免退出站点
function goBack() {
    const state = window.history.state as { back?: string | null } | null;
    if (state?.back != null) {
        void router.back();
    } else {
        void router.push('/products');
    }
}


const step = ref(0);
const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const previewing = ref(false);
const executing = ref(false);

const uploadResult = ref<ImportUploadResult | null>(null);
/** preview/execute 回传全量解析行（旧响应无 rows 时回退预览行） */
const importRows = (): Record<string, unknown>[] =>
    uploadResult.value?.rows ?? uploadResult.value?.previewRows ?? [];
const previewResult = ref<ImportPreviewResult | null>(null);
const result = ref<ImportExecuteResult | null>(null);

const headers = ref<string[]>([]);
const totalRows = ref(0);
const mapping = reactive<Record<string, string>>({});
const options = reactive<ImportOptions>({
    createMissingBrand: true,
    createMissingCategory: true,
    createMissingTags: true,
    defaultStatus: 'ACTIVE',
    duplicateStrategy: 'skip',
});

const logs = ref<ImportLog[]>([]);
const logTotal = ref(0);
const logPage = ref(1);

const saveTemplateVisible = ref(false);
const templateName = ref('');
const templateDescription = ref('');
const importTemplates = ref<ImportTemplate[]>([]);

const TARGET_FIELDS = [
    { field: 'name', label: '品牌型号', required: true },
    { field: 'model', label: '型号', required: false },
    { field: 'brandName', label: '品牌', required: false },
    { field: 'categoryPath', label: '类型', required: false },
    { field: 'description', label: '详细参数', required: false },
    { field: 'unit', label: '单位', required: false },
    { field: 'marketPrice', label: '商城价格', required: false },
    { field: 'costPrice', label: '成本价', required: false },
    { field: 'marketUrl', label: '商城链接', required: false },
    { field: 'warranty', label: '保修期', required: false },
    { field: 'supplier', label: '供应商', required: false },
    { field: 'tags', label: '标签', required: false },
    { field: 'minOrderQty', label: '最小起订量', required: false },
    { field: 'imageUrls', label: '图片链接', required: false },
];

const mappingRows = TARGET_FIELDS.map((f) => ({
    field: f.field,
    label: f.label,
    required: f.required,
}));

function handleFileChange(file: { raw: File }) {
    selectedFile.value = file.raw;
}

async function doUpload() {
    if (!selectedFile.value) return;
    uploading.value = true;
    try {
        const { data } = await productImportApi.upload(selectedFile.value);
        uploadResult.value = data;
        headers.value = data.headers;
        totalRows.value = data.totalRows;
        Object.keys(mapping).forEach((k) => delete mapping[k]);
        applyMapping(data.suggestion);
        void loadImportTemplates();
        step.value = 1;
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '文件解析失败'));
    } finally {
        uploading.value = false;
    }
}

async function loadImportTemplates() {
    try {
        const { data } = await productImportApi.getTemplates();
        importTemplates.value = data;
    } catch {
        importTemplates.value = [];
    }
}

function applyTemplate(template: ImportTemplate) {
    applyMapping(template.mappingConfig);
    ElMessage.success(`已应用模板「${template.name}」`);
}

function applyMapping(suggestion: Record<string, string>) {
    Object.keys(mapping).forEach((k) => delete mapping[k]);
    Object.assign(mapping, suggestion);
}

function applySuggestion() {
    if (!uploadResult.value) return;
    applyMapping(uploadResult.value.suggestion);
    ElMessage.success('已应用自动推荐映射');
}

function sampleValue(sourceCol: string): string {
    const row = uploadResult.value?.previewRows?.[0];
    if (!row) return '';
    const value = row[sourceCol];
    return value == null ? '' : String(value);
}

async function runPreview() {
    if (!uploadResult.value) return;
    previewing.value = true;
    try {
        const { data } = await productImportApi.preview(
            { ...mapping },
            importRows(),
            { ...options },
        );
        previewResult.value = data;
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '校验失败'));
    } finally {
        previewing.value = false;
    }
}

async function doPreview() {
    const required = TARGET_FIELDS.filter((f) => f.required);
    const missing = required.filter((f) => !mapping[f.field]);
    if (missing.length) {
        ElMessage.warning(`请为必填字段「${missing.map((f) => f.label).join('、')}」选择源列`);
        return;
    }
    await runPreview();
    step.value = 2;
}

async function doExecute() {
    if (!uploadResult.value) return;
    executing.value = true;
    try {
        const { data } = await productImportApi.execute(
            { ...mapping },
            importRows(),
            { ...options },
        );
        result.value = data;
        step.value = 3;
        void fetchLogs();
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '导入失败'));
    } finally {
        executing.value = false;
    }
}

function previewRowClass({ row }: { row: ImportPreviewResult['rows'][number] }) {
    if (row.status === 'error') return 'preview-error-row';
    if (row.status === 'warning') return 'preview-warning-row';
    return '';
}

function openSaveTemplate() {
    saveTemplateVisible.value = true;
}

async function saveTemplate() {
    if (!templateName.value.trim()) {
        ElMessage.warning('请输入模板名称');
        return;
    }
    try {
        await productImportApi.saveTemplate({
            name: templateName.value,
            description: templateDescription.value || undefined,
            mappingConfig: { ...mapping },
        });
        ElMessage.success('模板已保存');
        saveTemplateVisible.value = false;
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '保存失败'));
    }
}

async function fetchLogs() {
    const { data } = await productImportApi.getLogs({ page: logPage.value, pageSize: 10 });
    logs.value = data.data;
    logTotal.value = data.total;
}

function resetAll() {
    step.value = 0;
    selectedFile.value = null;
    uploadResult.value = null;
    previewResult.value = null;
    result.value = null;
    headers.value = [];
    totalRows.value = 0;
    Object.keys(mapping).forEach((k) => delete mapping[k]);
}


/** 将失败行的原始数据格式化为可读文本，便于用户定位具体单元格内容 */
function formatRawRow(raw: Record<string, unknown>): string {
    return Object.entries(raw)
        .map(([k, v]) => `${k}: ${v ?? ''}`)
        .join(' | ');
}

onMounted(fetchLogs);
</script>

<style scoped>
.product-import-page { max-width: 1100px; margin: 0 auto; }
.page-header { margin-bottom: 20px; }
.header-left { display: flex; align-items: center; gap: 12px; }
.header-left h2 { margin: 0; }
.steps { margin-bottom: 24px; }
.upload-zone { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 24px 0; }
.upload-icon { font-size: 48px; color: var(--el-color-primary); }
.card-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.card-title-text { font-weight: 600; }
.options-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.footer-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
.preview-stats { display: flex; gap: 8px; }
.dup-tag { margin-left: 4px; }
.preview-error-row { background-color: rgba(245, 108, 108, 0.08); }
.preview-warning-row { background-color: rgba(230, 162, 60, 0.08); }
.issue-item { display: flex; align-items: center; gap: 4px; color: var(--text-secondary); font-size: 13px; }
.issue-item .el-icon { flex-shrink: 0; }
.issue-item .el-icon.warning { color: var(--el-color-warning); }
.result-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; text-align: center; }
.result-stat { padding: 20px; border-radius: 12px; background: var(--bg-color); }
.result-stat .stat-num { font-size: 28px; font-weight: 700; }
.result-stat.success .stat-num { color: var(--el-color-success); }
.result-stat.warning .stat-num { color: var(--el-color-warning); }
.result-stat.danger .stat-num { color: var(--el-color-danger); }
.result-stat .stat-label { color: var(--text-secondary); font-size: 13px; margin-top: 4px; }
.result-extra { margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap; }
.error-alert { margin-top: 16px; }
.tag-chip { margin-right: 4px; }
.ok-text { color: var(--el-color-success); }
.fail-text { color: var(--el-color-danger); }
.log-card { margin-top: 24px; }
.pagination-container { margin-top: 12px; display: flex; justify-content: flex-end; }
</style>