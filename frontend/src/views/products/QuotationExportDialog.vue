<template>
  <el-dialog
    :model-value="modelValue"
    title="导出报价单"
    width="1180px"
    top="6vh"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:modelValue', $event)"
    @open="onOpen"
    @closed="onDialogClosed"
  >
    <div v-loading="loading" class="export-dialog">
      <!-- 左侧：实时预览 -->
      <div class="preview-pane">
        <QuotationPreviewFrame :html="previewHtml" />
      </div>

      <!-- 右侧：配置面板 -->
      <div class="control-pane">
        <div class="ctrl-group">
          <div class="ctrl-label">报价模板</div>
          <div class="template-row">
            <el-select v-model="templateId" placeholder="选择报价模板" filterable style="flex: 1">
              <el-option
                v-for="t in templates"
                :key="t.id"
                :label="t.isDefault ? `${t.name}（默认）` : t.name"
                :value="t.id"
              />
            </el-select>
            <el-tooltip content="另存为新模板" placement="top">
              <el-button :icon="Files" @click="saveAsNewVisible = true" />
            </el-tooltip>
          </div>
        </div>

        <div class="ctrl-group">
          <div class="ctrl-label">标题</div>
          <el-input v-model="workingTitle" size="small" placeholder="支持 {{customerName}}/{{code}}/{{date}}" />
        </div>

        <div class="ctrl-group">
          <div class="ctrl-label">显示列（拖动调整顺序）</div>
          <div class="col-strip" ref="colStripEl">
            <div class="col-chip" v-for="col in visibleCols" :key="col.key" :data-key="col.key">
              <el-icon class="chip-drag" title="拖动调整顺序"><Rank /></el-icon>
              <span class="chip-label" :title="colFormulaHint(col)">{{ col.label }}</span>
              <el-button text size="small" class="chip-btn" @click="setColVisible(col.key, false)">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            <el-empty v-if="!visibleCols.length" description="暂无显示列" :image-size="40" />
          </div>
          <div class="add-row">
            <el-select v-model="addFieldKey" placeholder="添加字段列..." size="small" style="flex: 1" @change="addField">
              <el-option v-for="f in hiddenFields" :key="f.key" :label="f.label" :value="f.key" />
            </el-select>
            <el-select v-model="addFormulaKey" placeholder="添加组合列..." size="small" style="flex: 1" @change="addFormula">
              <el-option v-for="f in FORMULA_POOL" :key="f.key" :label="f.label" :value="f.key" />
            </el-select>
          </div>
        </div>

        <div class="ctrl-group footer-hint" v-if="!quotation?.template && !selectedTemplate && !hasUnsavedTemplate">
          <el-alert type="info" :closable="false" show-icon>
            <template #title>该报价单暂无关联模板，已使用默认模板。可在下方「保存为默认」或「另存为新模板」固化。</template>
          </el-alert>
        </div>

        <div class="actions">
          <el-button @click="$emit('update:modelValue', false)">取消</el-button>
          <el-tooltip content="将当前列配置保存到所选模板（覆盖原列）" placement="top">
            <el-button :loading="saving" :icon="Rank" @click="saveAsDefault">保存为默认</el-button>
          </el-tooltip>
          <el-button :loading="saving" :icon="Files" @click="saveAsNewVisible = true">另存为新模板</el-button>
          <el-divider direction="vertical" />
          <el-button :loading="exporting" :icon="DocumentIcon" type="primary" plain @click="doExport('excel')">Excel</el-button>
          <el-button :loading="exporting" :icon="Reading" type="success" plain @click="doExport('pdf')">PDF</el-button>
          <el-button :loading="exporting" :icon="Notebook" type="warning" plain @click="doExport('docx')">Word</el-button>
          <el-button :loading="exporting" :icon="Printer" type="info" plain @click="doExport('print')">打印</el-button>
        </div>
      </div>
    </div>

    <!-- 另存为新模板 -->
    <el-dialog v-model="saveAsNewVisible" title="另存为新模板" width="420px" append-to-body>
      <el-form label-position="top" @submit.prevent="saveAsNew">
        <el-form-item label="模板名称" required>
          <el-input v-model="newTemplateName" placeholder="如：报价单-标准" maxlength="40" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="saveAsNewVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" :disabled="!newTemplateName.trim()" @click="saveAsNew">
          保存
        </el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import Sortable from 'sortablejs';
import { Close, Files, Rank, Document as DocumentIcon, Reading, Notebook, Printer } from '@element-plus/icons-vue';
import type { Quotation, QuotationTemplate, QuotationTemplateColumn, QuotationTemplateConfig } from '@/types';
import { quotationsApi, quotationTemplatesApi } from '@/api';
import { exportQuotationToExcel, exportQuotationToPdf } from '@/utils/quotationExport';
import { renderQuotationHtml, printQuotationHtml } from '@/utils/quotationPreview';
import { deepClone, QUOTATION_FIELD_POOL, QUOTATION_FORMULA_POOL, defaultTemplateColumns } from '@/utils/quotationColumns';
import { downloadBlob } from '@/utils/download';
import QuotationPreviewFrame from '@/components/QuotationPreviewFrame.vue';

const FIELD_POOL = QUOTATION_FIELD_POOL;
const FORMULA_POOL = QUOTATION_FORMULA_POOL;

const props = defineProps<{
    modelValue: boolean;
    quotation: Quotation | null;
}>();

defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
}>();

const loading = ref(false);
const exporting = ref(false);
const saving = ref(false);
const templates = ref<QuotationTemplate[]>([]);
const templateId = ref<string>('');
const workingColumns = ref<QuotationTemplateColumn[]>([]);
const workingTitle = ref('');
const addFieldKey = ref('');
const addFormulaKey = ref('');
const saveAsNewVisible = ref(false);
const newTemplateName = ref('');

const hasUnsavedTemplate = computed(() => !!selectedTemplate.value);

const selectedTemplate = computed(() =>
    templates.value.find((t) => t.id === templateId.value) ?? null,
);

/** 当前选中的有效模板配置来源：我的模板优先，其次报价单自带模板 */
const baseConfigSource = computed<Partial<QuotationTemplateConfig>>(() => {
    if (selectedTemplate.value) return selectedTemplate.value.config;
    return props.quotation?.template?.config ?? {};
});

const visibleCols = computed(() => workingColumns.value.filter((c) => c.visible));

// ==================== 列拖动排序 ====================
const colStripEl = ref<HTMLElement>();
let colSortable: Sortable | null = null;

function initColumnSort() {
    const el = colStripEl.value;
    if (!el || el.querySelectorAll('.col-chip').length === 0 || colSortable) return;
    colSortable = Sortable.create(el, {
        animation: 150,
        ghostClass: 'col-chip-ghost',
        draggable: '.col-chip',
        handle: '.chip-drag',
        onEnd: () => {
            const orderedKeys = Array.from(el.querySelectorAll('.col-chip'))
                .map((child) => (child as HTMLElement).dataset.key)
                .filter(Boolean) as string[];
            applyColumnOrder(orderedKeys);
        },
    });
}

function destroyColumnSort() {
    colSortable?.destroy();
    colSortable = null;
}

function applyColumnOrder(orderedKeys: string[]) {
    const byKey = new Map(workingColumns.value.filter((c) => c.visible).map((c) => [c.key, c]));
    const reordered = orderedKeys.map((k) => byKey.get(k)).filter(Boolean) as QuotationTemplateColumn[];
    if (reordered.length !== workingColumns.value.filter((c) => c.visible).length) return;
    let vi = 0;
    workingColumns.value = workingColumns.value.map((c) => (c.visible ? reordered[vi++] : c));
}

watch(workingColumns, async () => {
    await nextTick();
    destroyColumnSort();
    initColumnSort();
});

onBeforeUnmount(destroyColumnSort);

const hiddenFields = computed(() => {
    const present = new Set(workingColumns.value.map((c) => c.field));
    return FIELD_POOL.filter((f) => !present.has(f.key) && !present.has(f.field));
});

const effectiveConfig = computed<QuotationTemplateConfig>(() => {
    const base = baseConfigSource.value;
    return {
        columns: workingColumns.value,
        title: workingTitle.value,
        showTax: base.showTax ?? true,
        header: base.header ?? '',
        footer: base.footer ?? '',
        type: base.type ?? 'quotation',
        mergeKey: base.mergeKey,
        sections: base.sections ?? [],
        tableTitle: base.tableTitle ?? '',
        infoFormat: base.infoFormat ?? '',
        company: base.company ?? undefined,
        // 页面方向必须透传，否则横向模板经对话框导出会回退纵向
        pageOrientation: (base as QuotationTemplateConfig).pageOrientation ?? 'portrait',
    };
});

const previewHtml = computed(() => {
    if (!props.quotation) return '';
    try {
        return renderQuotationHtml(props.quotation, effectiveConfig.value);
    } catch {
        return '<div style="padding:20px;color:#999;text-align:center;">预览生成失败，请检查列配置</div>';
    }
});

async function onOpen() {
    if (!props.quotation) return;
    loading.value = true;
    try {
        const [{ data }] = await Promise.all([
            quotationTemplatesApi.getAll(),
        ]);
        templates.value = data;
        const current = props.quotation.template;
        if (current) {
            templateId.value = current.id;
        } else {
            const def = data.find((t) => t.isDefault) ?? data[0];
            templateId.value = def?.id ?? '';
        }
        applyTemplate(templateId.value);
    } catch {
        // 模板读取失败不影响基本使用：退回默认模板的基础列
        templateId.value = '';
        applyTemplate(templateId.value);
    } finally {
        loading.value = false;
    }
    await nextTick();
    initColumnSort();
}

function onDialogClosed() {
    destroyColumnSort();
}

function applyTemplate(id: string) {
    const t = templates.value.find((x) => x.id === id);
    const cols = t?.config?.columns?.length ? t.config.columns : [];
    workingColumns.value = deepClone(cols);
    workingTitle.value = t?.config?.title ?? '';
    // 若模板无列配置（如空模板），给一份默认字段列
    if (!workingColumns.value.length) {
        // 空模板兜底列与模板编辑器「新建默认」同源
        workingColumns.value = deepClone(defaultTemplateColumns());
    }
}

watch(templateId, (id) => applyTemplate(id));

function setColVisible(key: string, visible: boolean) {
    workingColumns.value = workingColumns.value.map((c) =>
        c.key === key ? { ...c, visible } : c,
    );
}

function addField(key: string) {
    const def = FIELD_POOL.find((f) => f.key === key);
    if (!def) return;
    if (workingColumns.value.some((c) => c.key === key || c.field === key)) {
        ElMessage.warning('该字段已存在');
        addFieldKey.value = '';
        return;
    }
    workingColumns.value = [
        ...workingColumns.value,
        { key: def.key, label: def.label, visible: true, type: 'field', field: def.field },
    ];
    addFieldKey.value = '';
}

function addFormula(key: string) {
    const def = FORMULA_POOL.find((f) => f.key === key);
    if (!def) return;
    if (workingColumns.value.some((c) => c.key === key)) {
        ElMessage.warning('该组合列已存在');
        addFormulaKey.value = '';
        return;
    }
    workingColumns.value = [
        ...workingColumns.value,
        { key: def.key, label: def.label, visible: true, type: 'formula', formula: def.formula },
    ];
    addFormulaKey.value = '';
}

function colFormulaHint(col: QuotationTemplateColumn): string {
    return col.type === 'formula' ? col.formula || '' : col.field ? `字段：${col.field}` : '';
}

function targetTemplate(): QuotationTemplate | null {
    return selectedTemplate.value;
}

async function saveAsDefault() {
    const t = targetTemplate();
    if (!t) {
        ElMessage.warning('请先选择一个报价模板');
        return;
    }
    saving.value = true;
    try {
        await quotationTemplatesApi.update(t.id, {
            config: effectiveConfig.value as QuotationTemplate['config'],
        });
        ElMessage.success('已保存为默认列配置');
        // 同步到本地模板对象，保持预览一致
        const idx = templates.value.findIndex((x) => x.id === t.id);
        if (idx >= 0) {
            templates.value[idx] = { ...templates.value[idx], config: effectiveConfig.value as QuotationTemplate['config'] };
        }
    } catch {
        ElMessage.error('保存失败');
    } finally {
        saving.value = false;
    }
}

async function saveAsNew() {
    const name = newTemplateName.value.trim();
    if (!name) return;
    saving.value = true;
    try {
        const { data } = await quotationTemplatesApi.create({
            name,
            description: '从导出对话框另存',
            config: effectiveConfig.value as QuotationTemplate['config'],
        });
        templates.value = [data, ...templates.value];
        templateId.value = data.id;
        saveAsNewVisible.value = false;
        newTemplateName.value = '';
        ElMessage.success('新模板已保存');
    } catch {
        ElMessage.error('保存新模板失败');
    } finally {
        saving.value = false;
    }
}

async function doExport(kind: 'excel' | 'pdf' | 'docx' | 'print') {
    if (!props.quotation) return;
    if (!props.quotation.items || props.quotation.items.length === 0) {
        ElMessage.warning('该报价单没有明细数据，无法导出');
        return;
    }
    const tpl = targetTemplate();
    const override = {
        config: effectiveConfig.value as QuotationTemplate['config'],
    };
    exporting.value = true;
    try {
        if (kind === 'excel') {
            await exportQuotationToExcel(props.quotation, override);
            ElMessage.success('Excel 已导出');
        } else if (kind === 'pdf') {
            const ok = await exportQuotationToPdf(props.quotation, 'download', override);
            if (ok) {
                ElMessage.success('PDF 已导出');
            } else {
                ElMessage.warning('中文字体加载失败，请在打印对话框中选择「另存为 PDF」');
                window.print();
            }
        } else if (kind === 'docx') {
            const resp = await quotationsApi.exportDocx(props.quotation.id, {
                templateId: tpl?.id,
                config: effectiveConfig.value as QuotationTemplate['config'],
            });
            downloadBlob(
                resp.data as Blob,
                `报价单_${props.quotation.code || props.quotation.id}.docx`,
                resp.headers,
            );
            ElMessage.success('Word 已导出');
        } else {
            printQuotationHtml(props.quotation, effectiveConfig.value);
            ElMessage.success('已打开打印预览');
        }
    } catch (err: unknown) {
        console.error('[导出失败]', kind, err);
        const detail = err instanceof Error ? err.message : String(err);
        if (kind === 'docx') {
            ElMessage.error(`Word 导出失败：${detail}`);
        } else if (kind === 'excel') {
            ElMessage.error(`Excel 导出失败：${detail}`);
        } else {
            ElMessage.error(`导出失败：${detail}`);
        }
    } finally {
        exporting.value = false;
    }
}
</script>

<style scoped>
.export-dialog { display: flex; gap: 16px; height: 68vh; }
.preview-pane { flex: 1; min-width: 0; display: flex; flex-direction: column; border: 1px solid var(--el-border-color); border-radius: 6px; overflow: hidden; background: #e9ecef; }
.control-pane { width: 340px; flex-shrink: 0; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; padding-right: 4px; }
.ctrl-group { }
.ctrl-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; font-weight: 600; }
.template-row { display: flex; gap: 6px; }
.col-strip { display: flex; flex-wrap: wrap; gap: 6px; border: 1px dashed var(--el-border-color); border-radius: 6px; padding: 8px; min-height: 40px; }
.col-chip { display: inline-flex; align-items: center; gap: 2px; border: 1px solid var(--el-border-color); border-radius: 4px; background: #f5f7fa; padding: 1px 4px; }
.col-chip-ghost { opacity: 0.4; }
.chip-drag { cursor: grab; color: var(--text-tertiary); padding: 2px; }
.chip-drag:active { cursor: grabbing; }
.chip-btn { margin: 0; padding: 3px; }
.chip-label { font-size: 12px; padding: 0 2px; white-space: nowrap; }
.add-row { display: flex; gap: 6px; margin-top: 8px; }
.footer-hint { margin-top: auto; }
.actions { display: flex; align-items: center; gap: 8px; padding-top: 12px; border-top: 1px solid var(--el-border-color); flex-wrap: wrap; }
</style>