<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, DocumentCopy, Star, Delete, View, Check, ArrowLeft } from '@element-plus/icons-vue';
import {
    quotationTemplatesApi,
} from '@/api';
import type {
    QuotationTemplate,
    QuotationTemplateColumn,
    QuotationTemplateConfig,
} from '@/types';
import { deepClone, defaultTemplateColumns, fieldDefToColumn, QUOTATION_FIELD_POOL, QUOTATION_FORMULA_POOL, QUOTATION_MERGE_KEY_OPTIONS, QUOTATION_ALIGNMENT_OPTIONS } from '@/utils/quotationColumns';
import { renderQuotationHtml, type PreviewConfig } from '@/utils/quotationPreview';
import { sampleQuotation } from '@/utils/sampleQuotation';
import QuotationPreviewFrame from '@/components/QuotationPreviewFrame.vue';

const router = useRouter();

// 可选字段 + 公式列构造工具（与导出对话框共用同一份字段池，保证两处可添加字段一致）
const FIELD_OPTIONS = [...QUOTATION_FIELD_POOL, ...QUOTATION_FORMULA_POOL];
const MERGE_KEY_OPTIONS = QUOTATION_MERGE_KEY_OPTIONS;
const alignmentOptions = QUOTATION_ALIGNMENT_OPTIONS;

// 信息行输入提示：用 JS 字符串承载示例，避免模板把 {{...}} 当插值表达式求值
const INFO_FORMAT_PLACEHOLDER = '如 客户：{{customerName}}\u3000报价编号：{{code}}\u3000日期：{{date}}\u3000单位：元（留空用默认）';
const INFO_FORMAT_HINT = '变量：{{customerName}} {{customerContact}} {{customerAddress}} {{code}} {{date}}；段间用全角空格「\u3000」分隔，空值段自动省略。';

const templates = ref<QuotationTemplate[]>([]);
const loading = ref(false);
const saving = ref(false);

// 当前编辑的模板（副本）
const editing = reactive<{
    id: string | null;
    name: string;
    description: string;
    isDefault: boolean;
    config: QuotationTemplateConfig;
}>({
    id: null,
    name: '',
    description: '',
    isDefault: false,
    config: defaultConfig(),
});

const previewHtml = ref('');
const activeTab = ref<'columns' | 'layout' | 'company'>('layout');
const addFieldKey = ref<string>('');

function goBack() {
    if (window.history.length > 1) void router.back();
    else void router.push({ name: 'quotationList' });
}

function defaultConfig(): QuotationTemplateConfig {
    return {
        columns: defaultTemplateColumns(),
        title: '{{customerName}} 报价单',
        showTax: true,
        header: '',
        footer: '本报价单有效期 30 天，最终价格以合同为准。\n{{companyName}}｜{{companyPhone}}',
        mergeKey: 'brandModel',
        sections: [],
        tableTitle: '报价明细一览表',
        company: {
            name: '示例科技有限公司',
            address: '',
            phone: '400-000-0000',
        },
    };
}

// ---- 预览（所见即所得，使用内置示例报价数据）----
function updatePreview() {
    const cfg = editing.config;
    previewHtml.value = renderQuotationHtml(sampleQuotation, {
        ...cfg,
        companyName: cfg.company?.name,
    } as unknown as PreviewConfig);
}
watch(() => deepClone(editing.config), updatePreview, { deep: true });

// ---- 加载模板列表 ----
async function loadTemplates() {
    loading.value = true;
    try {
        const res = await quotationTemplatesApi.getAll();
        templates.value = (res as unknown as { data: QuotationTemplate[] }).data ?? (res as unknown as QuotationTemplate[]);
    } catch (e) {
        ElMessage.error('加载模板失败：' + (e as Error).message);
    } finally {
        loading.value = false;
    }
}

// ---- 编辑某个模板 ----
function editTemplate(t: QuotationTemplate) {
    editing.id = t.id;
    editing.name = t.name;
    editing.description = t.description ?? '';
    editing.isDefault = t.isDefault;
    editing.config = deepClone(stripProposal(t.config)) as QuotationTemplateConfig;
    activeTab.value = 'columns';
    void nextTick(updatePreview);
}

function stripProposal(config: QuotationTemplateConfig | undefined): QuotationTemplateConfig {
    if (!config) return defaultConfig();
    // 历史 proposal 模板不再暴露类型，渲染时一律按 quotation 处理
    // 同时补齐新增字段（sections / title），保证旧模板结构完整
    const migrated: QuotationTemplateConfig = {
        ...defaultConfig(),
        ...config,
        type: undefined,
        sections: config.sections ?? [],
        company: config.company ?? defaultConfig().company,
    };
    // 旧字段 titleFormat 迁移到 title
    if (!migrated.title && (config as { titleFormat?: string }).titleFormat) {
        migrated.title = (config as { titleFormat?: string }).titleFormat as string;
    }
    return migrated;
}

function newTemplate() {
    editing.id = null;
    editing.name = '未命名模板';
    editing.description = '';
    editing.isDefault = false;
    editing.config = defaultConfig();
    activeTab.value = 'columns';
    void nextTick(updatePreview);
}

function copyTemplate(t: QuotationTemplate) {
    editing.id = null;
    editing.name = `${t.name} 副本`;
    editing.description = t.description ?? '';
    editing.isDefault = false;
    editing.config = deepClone(stripProposal(t.config)) as QuotationTemplateConfig;
    activeTab.value = 'columns';
    ElMessage.success('已复制为副本，可编辑后保存');
    void nextTick(updatePreview);
}

async function setDefault(t: QuotationTemplate) {
    try {
        await quotationTemplatesApi.update(t.id, { isDefault: true });
        ElMessage.success(`已将「${t.name}」设为默认`);
        await loadTemplates();
        if (editing.id === t.id) editing.isDefault = true;
    } catch (e) {
        ElMessage.error('操作失败：' + (e as Error).message);
    }
}

async function removeTemplate(t: QuotationTemplate) {
    try {
        await ElMessageBox.confirm(
            `确认删除模板「${t.name}」？${t.isDefault ? '（该模板为默认模板）' : ''}`,
            '删除确认',
            { type: 'warning' },
        );
    } catch {
        return;
    }
    try {
        await quotationTemplatesApi.remove(t.id);
        ElMessage.success('已删除');
        if (editing.id === t.id) newTemplate();
        await loadTemplates();
    } catch (e) {
        ElMessage.error('删除失败：' + (e as Error).message);
    }
}

async function save() {
    if (!editing.name.trim()) {
        ElMessage.warning('请填写模板名称');
        return;
    }
    saving.value = true;
    try {
        const payload = {
            name: editing.name.trim(),
            description: editing.description,
            isDefault: editing.isDefault,
            config: editing.config,
        };
        if (editing.id) {
            await quotationTemplatesApi.update(editing.id, payload);
            ElMessage.success('已保存');
        } else {
            const created = await quotationTemplatesApi.create(payload);
            const createdData = (created as unknown as { data: QuotationTemplate }).data ?? (created as unknown as QuotationTemplate);
            editing.id = createdData.id;
            ElMessage.success('已创建');
        }
        await loadTemplates();
    } catch (e) {
        ElMessage.error('保存失败：' + (e as Error).message);
    } finally {
        saving.value = false;
    }
}

// ---- 列编辑 ----
function toggleVisible(col: QuotationTemplateColumn) {
    col.visible = !col.visible;
    updatePreview();
}

function moveCol(index: number, dir: -1 | 1) {
    const list = editing.config.columns;
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    updatePreview();
}

function addField(colKey: string) {
    const opt = FIELD_OPTIONS.find((f) => f.key === colKey);
    if (!opt) return;
    if (editing.config.columns.some((c) => c.key === colKey)) {
        ElMessage.warning('该字段已存在');
        return;
    }
    editing.config.columns.push(fieldDefToColumn(opt));
    updatePreview();
}

function onAddField(key: string) {
    if (!key) return;
    addField(key);
    addFieldKey.value = '';
}

function addFormulaColumn() {
    const key = `formula_${Date.now()}`;
    editing.config.columns.push({
        key,
        label: '自定义列',
        visible: true,
        type: 'formula',
        formula: '{name}',
    });
    updatePreview();
}

function removeCol(col: QuotationTemplateColumn) {
    editing.config.columns = editing.config.columns.filter((c) => c.key !== col.key);
    updatePreview();
}

// ---- 段落区块（固定套话，可定义在表格前/后）----
function addSection() {
    if (!editing.config.sections) editing.config.sections = [];
    editing.config.sections.push({
        id: `sec_${Date.now()}`,
        title: '',
        content: '',
        position: 'before',
    });
    updatePreview();
}

function moveSection(idx: number, dir: -1 | 1) {
    const list = editing.config.sections;
    if (!list) return;
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    [list[idx], list[target]] = [list[target], list[idx]];
    updatePreview();
}

function removeSection(sec: { id: string }) {
    editing.config.sections = (editing.config.sections ?? []).filter((s) => s.id !== sec.id);
    updatePreview();
}

// 可选添加字段（排除已添加）
const availableFields = computed(() =>
    FIELD_OPTIONS.filter((f) => !editing.config.columns.some((c) => c.key === f.key)),
);

onMounted(async () => {
    await loadTemplates();
    if (templates.value.length) editTemplate(templates.value[0]);
    else newTemplate();
    updatePreview();
});
</script>

<template>
    <div class="tpl-page">
        <div class="tpl-header">
            <div class="tpl-header-left">
                <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
                <div>
                    <h2 class="tpl-title">报价模板</h2>
                    <p class="tpl-sub">所见即所得：左侧实时预览，右侧编辑排版。做模板只有这一处入口。</p>
                </div>
            </div>
            <div class="tpl-actions">
                <el-button :icon="Plus" @click="newTemplate">新建模板</el-button>
                <el-button type="primary" :loading="saving" :icon="Check" @click="save">
                    {{ editing.id ? '保存修改' : '创建模板' }}
                </el-button>
            </div>
        </div>

        <div class="tpl-body">
            <!-- 列表 -->
            <aside class="tpl-list">
                <div class="tpl-list-title">我的模板 ({{ templates.length }})</div>
                <div v-if="loading" class="tpl-list-empty">加载中…</div>
                <ul v-else class="tpl-list-ul">
                    <li
                        v-for="t in templates"
                        :key="t.id"
                        :class="['tpl-item', { active: editing.id === t.id }]"
                        @click="editTemplate(t)"
                    >
                        <div class="tpl-item-main">
                            <span class="tpl-item-name">
                                {{ t.name }}
                                <el-tag v-if="t.isDefault" size="small" type="warning">默认</el-tag>
                            </span>
                            <span class="tpl-item-desc">{{ t.description || '—' }}</span>
                        </div>
                        <div class="tpl-item-ops" @click.stop>
                            <el-tooltip content="复制为副本">
                                <el-button :icon="DocumentCopy" circle size="small" text @click="copyTemplate(t)" />
                            </el-tooltip>
                            <el-tooltip v-if="!t.isDefault" content="设为默认">
                                <el-button :icon="Star" circle size="small" text @click="setDefault(t)" />
                            </el-tooltip>
                            <el-tooltip content="删除">
                                <el-button :icon="Delete" circle size="small" text type="danger" @click="removeTemplate(t)" />
                            </el-tooltip>
                        </div>
                    </li>
                </ul>
            </aside>

            <!-- 编辑器 -->
            <section class="tpl-editor" v-if="editing.id !== undefined">
                <div class="tpl-editor-meta">
                    <el-input v-model="editing.name" placeholder="模板名称" class="tpl-name-input" />
                    <el-input
                        v-model="editing.description"
                        placeholder="模板说明（可选）"
                        class="tpl-desc-input"
                    />
                    <el-checkbox v-model="editing.isDefault">设为默认模板</el-checkbox>
                </div>

                <div class="tpl-editor-split">
                    <!-- 编辑面板 -->
                    <div class="tpl-panel">
                        <el-tabs v-model="activeTab">
                            <el-tab-pane label="版式设置" name="layout">
                                <div class="tpl-form">
                                    <div class="tpl-form-item">
                                        <label>标题</label>
                                        <el-input
                                            v-model="editing.config.title"
                                            placeholder="如 {{customerName}} 报价单"
                                            @input="updatePreview"
                                        />
                                        <span class="tpl-hint">变量：{{customerName}} {{code}} {{date}}</span>
                                    </div>
                                    <div class="tpl-form-item">
                                        <label>合并依据</label>
                                        <el-select v-model="editing.config.mergeKey" @change="updatePreview">
                                            <el-option
                                                v-for="m in MERGE_KEY_OPTIONS"
                                                :key="m.value"
                                                :label="m.label"
                                                :value="m.value"
                                            />
                                        </el-select>
                                        <span class="tpl-hint">同名相邻行自动合并该列</span>
                                    </div>
                                    <div class="tpl-form-item">
                                        <label>表格标题</label>
                                        <el-input
                                            v-model="editing.config.tableTitle"
                                            placeholder="如 报价明细一览表（留空则不显示）"
                                            @input="updatePreview"
                                        />
                                        <span class="tpl-hint">显示在报价表格正上方，与表前段落形成清晰层次。</span>
                                    </div>
                                    <div class="tpl-form-item">
                                        <label>页眉</label>
                                        <el-input
                                            v-model="editing.config.header"
                                            type="textarea"
                                            :rows="2"
                                            placeholder="留空不显示"
                                            @input="updatePreview"
                                        />
                                        <span class="tpl-hint">支持变量：{{companyName}} {{companyAddress}} {{companyPhone}}</span>
                                    </div>
                                    <div class="tpl-form-item">
                                        <label>页脚</label>
                                        <el-input
                                            v-model="editing.config.footer"
                                            type="textarea"
                                            :rows="2"
                                            @input="updatePreview"
                                        />
                                        <span class="tpl-hint">支持变量：{{companyName}} {{companyAddress}} {{companyPhone}}</span>
                                    </div>
                                    <div class="tpl-form-item">
                                        <label>信息行</label>
                                        <el-input
                                            v-model="editing.config.infoFormat"
                                            type="textarea"
                                            :rows="2"
                                            :placeholder="INFO_FORMAT_PLACEHOLDER"
                                            @input="updatePreview"
                                        />
                                        <span class="tpl-hint" v-text="INFO_FORMAT_HINT" />
                                    </div>
                                    <div class="tpl-form-item tpl-form-inline">
                                        <el-checkbox v-model="editing.config.showTax" @change="updatePreview">显示税额</el-checkbox>
                                    </div>
                                </div>
                            </el-tab-pane>

                            <el-tab-pane label="公司信息" name="company">
                                <div class="tpl-form">
                                    <div class="tpl-form-item">
                                        <label>公司名称</label>
                                        <el-input
                                            v-model="editing.config.company.name"
                                            placeholder="如 示例科技有限公司"
                                            @input="updatePreview"
                                        />
                                        <span class="tpl-hint">页眉/页脚可用 {{ '{' }}{{ '}' }}companyName 调用</span>
                                    </div>
                                    <div class="tpl-form-item">
                                        <label>公司地址</label>
                                        <el-input
                                            v-model="editing.config.company.address"
                                            placeholder="如 北京市朝阳区 XX 路 1 号"
                                            @input="updatePreview"
                                        />
                                        <span class="tpl-hint">页眉/页脚可用 {{ '{' }}{{ '}' }}companyAddress 调用</span>
                                    </div>
                                    <div class="tpl-form-item">
                                        <label>联系电话</label>
                                        <el-input
                                            v-model="editing.config.company.phone"
                                            placeholder="如 400-000-0000"
                                            @input="updatePreview"
                                        />
                                        <span class="tpl-hint">页眉/页脚可用 {{ '{' }}{{ '}' }}companyPhone 调用</span>
                                    </div>
                                    <div class="tpl-form-item">
                                        <span class="tpl-hint" v-html="'调用代码（直接粘贴到页眉/页脚即可）：<br />{{companyName}} 公司名称 · {{companyAddress}} 地址 · {{companyPhone}} 电话'"></span>
                                    </div>
                                </div>
                            </el-tab-pane>

                            <el-tab-pane label="段落区块" name="sections">
                                <div class="tpl-form">
                                    <div class="tpl-form-item">
                                        <div class="tpl-sections-head">
                                            <label>段落区块（固定套话，如表前背景说明 / 表后商务条款）</label>
                                            <el-button size="small" plain @click="addSection">+ 添加段落</el-button>
                                        </div>
                                        <div v-if="!editing.config.sections?.length" class="tpl-hint">
                                            暂无段落。可添加如“项目背景”放在表格前，“付款与交付”放在表格后。表格正上方另有“表格标题”设置（见版式设置）。
                                        </div>
                                        <div
                                            v-for="(sec, idx) in (editing.config.sections ?? [])"
                                            :key="sec.id"
                                            class="tpl-section-row"
                                        >
                                            <div class="tpl-section-row-head">
                                                <el-input
                                                    v-model="sec.title"
                                                    size="small"
                                                    class="tpl-section-title"
                                                    placeholder="段落标题（可选）"
                                                    @input="updatePreview"
                                                />
                                                <el-select
                                                    v-model="sec.position"
                                                    size="small"
                                                    class="tpl-section-pos"
                                                    @change="updatePreview"
                                                >
                                                    <el-option label="表格之前" value="before" />
                                                    <el-option label="表格之后" value="after" />
                                                </el-select>
                                                <div class="tpl-section-move">
                                                    <el-button size="small" text :disabled="idx === 0" @click="moveSection(idx, -1)">↑</el-button>
                                                    <el-button size="small" text :disabled="idx === (editing.config.sections?.length ?? 0) - 1" @click="moveSection(idx, 1)">↓</el-button>
                                                </div>
                                                <el-button size="small" text type="danger" @click="removeSection(sec)">×</el-button>
                                            </div>
                                            <el-input
                                                v-model="sec.content"
                                                type="textarea"
                                                :rows="3"
                                                placeholder="段落正文，支持 {{customerName}} {{code}} 占位符"
                                                @input="updatePreview"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </el-tab-pane>

                            <el-tab-pane label="列与字段" name="columns">
                                <div class="tpl-col-toolbar">
                                    <el-select
                                        v-if="availableFields.length"
                                        v-model="addFieldKey"
                                        placeholder="添加字段"
                                        size="small"
                                        style="width: 160px"
                                        @change="onAddField"
                                    >
                                        <el-option
                                            v-for="f in availableFields"
                                            :key="f.key"
                                            :label="f.label"
                                            :value="f.key"
                                        />
                                    </el-select>
                                    <el-button size="small" plain @click="addFormulaColumn">+ 公式列</el-button>
                                    <span class="tpl-hint">↑↓ 排序 · 勾选显示 · 可改名/调宽/对齐/写公式</span>
                                </div>

                                <div class="tpl-col-list">
                                    <div
                                        v-for="(col, idx) in editing.config.columns"
                                        :key="col.key"
                                        class="tpl-col-row"
                                    >
                                        <span class="tpl-col-handle">⋮⋮</span>
                                        <el-checkbox
                                            :model-value="col.visible"
                                            @change="() => toggleVisible(col)"
                                        />
                                        <el-input
                                            v-model="col.label"
                                            size="small"
                                            class="tpl-col-label"
                                            @input="updatePreview"
                                        />
                                        <template v-if="col.type === 'formula'">
                                            <el-input
                                                v-model="col.formula"
                                                size="small"
                                                class="tpl-col-formula"
                                                placeholder="如 {brand} {model}"
                                                @input="updatePreview"
                                            />
                                        </template>
                                        <el-input
                                            v-model.number="col.width"
                                            size="small"
                                            type="number"
                                            class="tpl-col-width"
                                            title="列宽(px)"
                                            placeholder="宽"
                                            @input="updatePreview"
                                        />
                                        <el-select
                                            v-model="col.align"
                                            size="small"
                                            class="tpl-col-align"
                                            placeholder="对齐"
                                            clearable
                                            @change="updatePreview"
                                        >
                                            <el-option
                                                v-for="a in alignmentOptions"
                                                :key="a.value"
                                                :label="a.label"
                                                :value="a.value"
                                            />
                                        </el-select>
                                        <div class="tpl-col-move">
                                            <el-button size="small" text :disabled="idx === 0" @click="moveCol(idx, -1)">↑</el-button>
                                            <el-button size="small" text :disabled="idx === editing.config.columns.length - 1" @click="moveCol(idx, 1)">↓</el-button>
                                        </div>
                                        <el-button
                                            size="small"
                                            text
                                            type="danger"
                                            :disabled="editing.config.columns.length <= 1"
                                            @click="removeCol(col)"
                                        >×</el-button>
                                    </div>
                                </div>
                            </el-tab-pane>
                        </el-tabs>
                    </div>

                    <!-- 实时预览 -->
                    <div class="tpl-preview-wrap">
                        <div class="tpl-preview-bar">
                            <el-icon><View /></el-icon>
                            <span>实时预览（内置示例数据）</span>
                        </div>
                        <QuotationPreviewFrame :html="previewHtml" />
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<style scoped>
.tpl-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    box-sizing: border-box;
}
.tpl-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}
.tpl-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}
.tpl-title {
    margin: 0;
    font-size: 20px;
}
.tpl-sub {
    margin: 4px 0 0;
    color: #888;
    font-size: 13px;
}
.tpl-actions {
    display: flex;
    gap: 8px;
}
.tpl-body {
    flex: 1;
    display: flex;
    gap: 12px;
    min-height: 0;
}
.tpl-list {
    width: 240px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    background: #fff;
    overflow: auto;
    flex-shrink: 0;
}
.tpl-list-title {
    padding: 10px 12px;
    font-weight: 600;
    border-bottom: 1px solid #f0f0f0;
}
.tpl-list-empty {
    padding: 20px;
    color: #aaa;
    text-align: center;
}
.tpl-list-ul {
    list-style: none;
    margin: 0;
    padding: 0;
}
.tpl-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    border-bottom: 1px solid #f5f5f5;
    cursor: pointer;
}
.tpl-item:hover {
    background: #f5f8ff;
}
.tpl-item.active {
    background: #eaf1fb;
    border-left: 3px solid #409eff;
}
.tpl-item-main {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}
.tpl-item-name {
    font-size: 14px;
    font-weight: 500;
}
.tpl-item-desc {
    font-size: 12px;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 150px;
}
.tpl-item-ops {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
}
.tpl-editor {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    background: #fff;
    min-width: 0;
}
.tpl-editor-meta {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
}
.tpl-name-input {
    width: 220px;
}
.tpl-desc-input {
    flex: 1;
}
.tpl-editor-split {
    flex: 1;
    display: flex;
    min-height: 0;
}
.tpl-panel {
    width: 46%;
    border-right: 1px solid #f0f0f0;
    padding: 8px 12px;
    overflow: auto;
}
.tpl-col-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    flex-wrap: wrap;
}
.tpl-hint {
    color: #aaa;
    font-size: 12px;
}
.tpl-col-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.tpl-col-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
}
.tpl-col-handle {
    color: #ccc;
    user-select: none;
}
.tpl-col-label {
    width: 110px;
}
.tpl-col-formula {
    width: 130px;
}
.tpl-col-width {
    width: 64px;
}
.tpl-col-align {
    width: 90px;
}
.tpl-col-move {
    display: flex;
    flex-direction: column;
    gap: 0;
}
.tpl-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
}
.tpl-form-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.tpl-form-item > label {
    font-size: 13px;
    color: #555;
    font-weight: 500;
}
.tpl-form-inline {
    flex-direction: row;
    gap: 20px;
}
.tpl-sections-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
}
.tpl-section-row {
    border: 1px solid #eaeaea;
    border-radius: 6px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 6px;
}
.tpl-section-row-head {
    display: flex;
    align-items: center;
    gap: 6px;
}
.tpl-section-title {
    flex: 1;
}
.tpl-section-pos {
    width: 110px;
}
.tpl-section-move {
    display: flex;
    flex-direction: column;
    gap: 0;
}
.tpl-preview-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: #f7f8fa;
}
.tpl-preview-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    font-size: 13px;
    color: #666;
    border-bottom: 1px solid #eee;
    background: #fff;
}
</style>
