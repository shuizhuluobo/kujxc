<template>
  <div class="quotation-generator-page">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" text @click="goBack">返回</el-button>
        <h2>{{ isVersion ? `报价新版本（V${baseVersion + 1}）` : '新建报价单' }}</h2>
      </div>
    </div>

    <el-alert
      v-if="staleItems.length"
      type="warning"
      :closable="false"
      show-icon
      class="stale-alert"
      :title="`检测到 ${staleItems.length} 个超期产品`"
      :description="`以下产品已超过更新时效，请确认规格/价格是否仍有效：${staleItems.map((i) => snapshotName(i)).join('、')}`"
    />

    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-card class="card-premium">
        <template #header>
          <div class="card-header">
            <span class="card-title-text">客户信息</span>
          </div>
        </template>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="客户名称" prop="customerName">
              <el-select
                v-model="form.customerName"
                filterable
                remote
                clearable
                reserve-keyword
                placeholder="输入关键字从客户库搜索"
                :remote-method="searchCustomers"
                :loading="customerSearching"
                style="width: 100%"
                @change="onCustomerPicked"
              >
                <el-option
                  v-for="c in customerOptions"
                  :key="c.id"
                  :label="c.name"
                  :value="c.name"
                >
                  <span style="float: left">{{ c.name }}</span>
                  <span style="float: right; color: var(--el-text-color-secondary); font-size: 12px">{{ c.contact || '' }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系人">
              <el-input v-model="form.customerContact" maxlength="100" />
            </el-form-item>
          </el-col>
          <!-- 税率/税额留待财务管理模块设计，产品报价单直接显示含税总额，暂不开放税率输入 -->
        </el-row>
        <el-form-item label="客户地址">
          <el-input v-model="form.customerAddress" maxlength="300" />
        </el-form-item>
        <el-form-item label="报价备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            maxlength="2000"
            show-word-limit
            placeholder="添加商城产品时自动备注「商城产品」"
          />
        </el-form-item>
        <el-form-item label="报价模板">
          <span class="template-hint">新建报价不选模板，导出时再选择并调整列配置</span>
        </el-form-item>
      </el-card>

      <el-card class="card-premium">
        <template #header>
          <div class="card-header">
            <span class="card-title-text">报价明细</span>
            <div>
              <el-input v-model="searchKeyword" placeholder="搜索产品" :prefix-icon="Search" clearable class="search-box" @keyup.enter="openProductPicker" />
              <el-button type="primary" :icon="Plus" @click="openProductPicker">添加产品</el-button>
            </div>
          </div>
        </template>

        <el-table :data="form.items" empty-text="请先添加产品" class="card-premium">
          <el-table-column label="#" width="45" type="index" />
          <el-table-column label="产品" min-width="200">
            <template #default="{ row }">
              <div class="item-product">
                <el-image v-if="row.selectedImages?.length" :src="resolveAssetUrl(row.selectedImages[0])" fit="cover" class="item-thumb" />
                <div v-else class="item-thumb placeholder-thumb"><el-icon><Picture /></el-icon></div>
                <div class="item-product-info">
                  <div class="item-name">
                    {{ snapshotName(row) }}
                    <el-tag v-if="row.isStale" size="small" type="warning" effect="plain" class="stale-tag">超期</el-tag>
                  </div>
                  <div class="item-code">{{ snapshotField(row, 'code') }}{{ snapshotField(row, 'model') ? ' · ' + snapshotField(row, 'model') : '' }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="140">
            <template #default="{ row }">
              <el-input-number v-model="row.quantity" :min="1" :precision="0" size="small" @change="recalcItem(row)" />
            </template>
          </el-table-column>
          <el-table-column label="单价" width="140">
            <template #default="{ row }">
              <el-input-number v-model="row.unitPrice" :min="0" :precision="2" size="small" @change="recalcItem(row)" />
            </template>
          </el-table-column>
          <el-table-column label="折扣(%)" width="130">
            <template #default="{ row }">
              <el-input-number v-model="row.discount" :min="0" :max="100" :precision="0" size="small" @change="recalcItem(row)" />
            </template>
          </el-table-column>
          <el-table-column label="小计" width="120">
            <template #default="{ row }">{{ fmtPrice(row.subtotal) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="90">
            <template #default="{ row }">
              <el-button size="small" text @click="openImagePicker(row)">图片</el-button>
              <el-button size="small" text type="danger" @click="form.items.splice(form.items.indexOf(row), 1)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="summary">
          <div class="summary-line"><span>含税总额：</span><strong class="final">{{ fmtPrice(finalAmount) }}</strong></div>
        </div>
      </el-card>

      <div class="form-footer">
        <el-button @click="goBack">取消</el-button>
        <el-button :loading="submitting" @click="handleSave(false)">保存草稿</el-button>
        <el-button type="primary" :loading="submitting" v-if="isVersion" @click="handleSave(true)">生成新版本</el-button>
        <el-button type="primary" :loading="submitting" v-else @click="handleSave(true)">保存报价</el-button>
      </div>
    </el-form>

    <!-- 产品选择抽屉 -->
    <el-drawer v-model="pickerVisible" title="选择产品" size="520px" class="product-picker-drawer">
      <div class="picker-tags">
        <span class="picker-tags-label">快捷筛选</span>
        <div class="picker-tags-list">
          <el-tag
            class="picker-tag-chip"
            :type="activePickerTagIds.length ? 'info' : 'primary'"
            effect="plain"
            round
            @click="selectPickerTag(null)"
          >全部</el-tag>
          <el-tag
            v-for="t in visiblePickerTags"
            :key="t.id"
            class="picker-tag-chip"
            :effect="activePickerTagIds.includes(t.id) ? 'dark' : 'plain'"
            :color="activePickerTagIds.includes(t.id) ? t.color || undefined : undefined"
            round
            @click="selectPickerTag(t)"
          >
            {{ t.name }}<span class="picker-tag-count">{{ t._count?.products ?? 0 }}</span>
          </el-tag>
          <el-button
            v-if="pickerTags.length > PICKER_TAG_LIMIT"
            text
            size="small"
            type="primary"
            class="picker-tags-toggle"
            @click="pickerTagsExpanded = !pickerTagsExpanded"
          >{{ pickerTagsExpanded ? '收起' : `展开 ${pickerTags.length - PICKER_TAG_LIMIT}` }}</el-button>
          <span class="picker-tags-hint" title="多选标签为「且」关系，产品需同时包含所有已选标签">多选=且</span>
        </div>
      </div>
      <div class="picker-search">
        <el-input v-model="pickerKeyword" :prefix-icon="Search" clearable placeholder="搜索品牌型号/编号/参数（实时）" @input="queuePickerSearch" @keyup.enter="loadPickerProducts(1)" @clear="loadPickerProducts(1)" />
      </div>
      <div class="picker-list" v-loading="pickerLoading">
        <label v-for="p in pickerProducts" :key="p.id" class="picker-item" :class="{ selected: isPicked(p.id) }">
          <el-checkbox :model-value="isPicked(p.id)" @change="(v: boolean) => togglePick(p, v)" />
          <el-image v-if="p.images[0]" :src="resolveAssetUrl(p.images[0].url)" fit="cover" class="picker-thumb" />
          <div v-else class="picker-thumb placeholder-thumb"><el-icon><Picture /></el-icon></div>
          <div class="picker-info">
            <div class="picker-name">{{ p.name }}<el-tag v-if="p.isStale" size="small" type="warning" effect="plain" class="stale-tag">超期</el-tag></div>
            <div class="picker-meta">
              <span v-if="p.description" class="picker-param" :title="p.description">{{ p.description }}</span>
              <span v-else class="picker-empty">暂无参数</span>
            </div>
            <div class="picker-price" :title="priceTip(p)">
              <span>单价：{{ fmtPrice(p.isMarketProduct ? p.marketPrice : p.salePrice) }}</span>
              <span v-if="p.isMarketProduct" class="price-tag">商城</span>
              <span class="picker-cost">成本价：{{ fmtPrice(p.costPrice) }}</span>
            </div>
          </div>
        </label>
        <el-empty v-if="!pickerLoading && !pickerProducts.length" description="无匹配产品" />
      </div>
      <template #footer>
        <div class="picker-footer">
          <el-pagination
            v-model:current-page="pickerPage"
            :page-size="pickerPageSize"
            :total="pickerTotal"
            layout="prev, pager, next"
            small
            @current-change="loadPickerProducts"
          />
          <el-button type="primary" @click="addPickedToItems">添加选中产品</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 单品图片选择 -->
    <el-dialog v-model="imagePickerVisible" :title="`选择展示图片 - ${snapshotName(imagePickerTarget)}`" width="600px">
      <div v-if="imagePickerTarget" class="image-pick-grid">
        <div
          v-for="img in imagePickerTarget.snapshotImages"
          :key="img"
          class="image-pick-item"
          :class="{ active: (imagePickerTarget.selectedImages || []).includes(img) }"
          @click="toggleSelectedImage(img)"
        >
          <el-image :src="resolveAssetUrl(img)" fit="cover" class="image-pick-thumb" />
        </div>
      </div>
      <template #footer>
        <el-button @click="imagePickerVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { ArrowLeft, Plus, Search, Picture } from '@element-plus/icons-vue';
import type { Product, CreateQuotationItemDto, Customer, ProductTag, ProductSnapshot } from '@/types';
import { productsApi, quotationsApi, customersApi, productTagsApi } from '@/api';
import { resolveAssetUrl } from '@/utils/url';
import { computeItemSubtotal, computeTotals } from '@/utils/quotationMath';
import { buildProductSnapshot } from '@/utils/quotationColumns';
import { getApiErrorMessage, formatPrice as fmtPrice } from '@/utils/format';

const route = useRoute();
const router = useRouter();

interface GeneratorItem extends CreateQuotationItemDto {
    isStale?: boolean;
    snapshotImages: string[];
    snapshotCerts: string[];
    subtotal: number;
}

const formRef = ref<FormInstance>();
const submitting = ref(false);
const baseVersion = ref(0);

const isVersion = computed(() => !!route.query.base);

// 客户库快捷选择（远程搜索，自动填充联系人/地址）
const customerOptions = ref<Customer[]>([]);
const customerSearching = ref(false);
let customerSearchSeq = 0;
let customerSearchTimer: ReturnType<typeof setTimeout> | null = null;

function searchCustomers(keyword: string) {
    if (customerSearchTimer) clearTimeout(customerSearchTimer);
    if (!keyword) {
        customerOptions.value = [];
        return;
    }
    const seq = ++customerSearchSeq;
    customerSearchTimer = setTimeout(async () => {
        customerSearching.value = true;
        try {
            const { data } = await customersApi.getAll({ keyword, pageSize: 20, page: 1 });
            if (seq !== customerSearchSeq) return;
            customerOptions.value = data.data;
        } catch {
            customerOptions.value = [];
        } finally {
            customerSearching.value = false;
        }
    }, 300);
}

function onCustomerPicked(name: string) {
    const c = customerOptions.value.find((x) => x.name === name);
    if (c) {
        form.customerName = c.name;
        form.customerContact = c.contact || '';
        form.customerAddress = c.address || '';
    }
}

const form = reactive<{
    customerName: string;
    customerContact: string;
    customerAddress: string;
    remark: string;
    taxRate?: number;
    items: GeneratorItem[];
}>({
    customerName: '',
    customerContact: '',
    customerAddress: '',
    remark: '',
    taxRate: 0,
    items: [],
});

const rules: FormRules = {
    customerName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
};

const totals = computed(() =>
    computeTotals(
        form.items.map((item) => ({ subtotal: item.subtotal, profit: item.profit })),
        form.taxRate,
    ),
);
const finalAmount = computed(() => totals.value.finalAmount);

function recalcItem(item: GeneratorItem) {
    item.subtotal = computeItemSubtotal(item.quantity, item.unitPrice, item.discount);
}

// ==================== 产品选择 ====================
const pickerVisible = ref(false);
const pickerLoading = ref(false);
const pickerProducts = ref<Product[]>([]);
const pickerTotal = ref(0);
const pickerPage = ref(1);
const pickerPageSize = 12;
const pickerKeyword = ref('');
const pickerTags = ref<ProductTag[]>([]);
const activePickerTagIds = ref<string[]>([]);
const PICKER_TAG_LIMIT = 6;
const pickerTagsExpanded = ref(false);
const visiblePickerTags = computed(() =>
    pickerTagsExpanded.value ? pickerTags.value : pickerTags.value.slice(0, PICKER_TAG_LIMIT),
);
const searchKeyword = ref('');
const pickerSelection = ref<Set<string>>(new Set());

function appendMarketRemark(p: Product) {
    if (!p.isMarketProduct) return;
    const token = '商城产品';
    if (!form.remark.includes(token)) {
        form.remark = form.remark
            ? `${form.remark.replace(/[；;]?\s*$/, '')}；${token}`
            : token;
    }
}

function openProductPicker() {
    pickerKeyword.value = searchKeyword.value;
    pickerPage.value = 1;
    activePickerTagIds.value = [];
    pickerSelection.value = new Set();
    pickerTagsExpanded.value = false;
    pickerVisible.value = true;
    void loadPickerTags();
    void loadPickerProducts(1);
}

async function loadPickerTags() {
    try {
        const { data } = await productTagsApi.getAll();
        pickerTags.value = data;
    } catch {
        pickerTags.value = [];
    }
}

function selectPickerTag(tag: ProductTag | null) {
    if (!tag) {
        activePickerTagIds.value = [];
    } else if (activePickerTagIds.value.includes(tag.id)) {
        activePickerTagIds.value = activePickerTagIds.value.filter((id) => id !== tag.id);
    } else {
        activePickerTagIds.value = [...activePickerTagIds.value, tag.id];
    }
    pickerPage.value = 1;
    void loadPickerProducts(1);
}

/** 请求序号：丢弃过期响应 */
let pickerSeq = 0;
async function loadPickerProducts(page: number) {
    const seq = ++pickerSeq;
    pickerLoading.value = true;
    try {
        const { data } = await productsApi.getAll({
            page,
            pageSize: pickerPageSize,
            keyword: pickerKeyword.value || undefined,
            status: 'ACTIVE',
            tagIds: activePickerTagIds.value.length ? activePickerTagIds.value : undefined,
        });
        if (seq !== pickerSeq) return;
        pickerProducts.value = data.data;
        pickerTotal.value = data.total;
        pickerPage.value = page;
    } finally {
        if (seq === pickerSeq) pickerLoading.value = false;
    }
}

// 关键词实时过滤（防抖 300ms）
let pickerSearchTimer: ReturnType<typeof setTimeout> | undefined;
function queuePickerSearch() {
    if (pickerSearchTimer) clearTimeout(pickerSearchTimer);
    pickerSearchTimer = setTimeout(() => {
        pickerSearchTimer = undefined;
        void loadPickerProducts(1);
    }, 300);
}

function isPicked(id: string): boolean {
    return pickerSelection.value.has(id);
}

function togglePick(product: Product, checked: boolean) {
    if (checked) pickerSelection.value.add(product.id);
    else pickerSelection.value.delete(product.id);
}

function addPickedToItems() {
    const picked = pickerProducts.value.filter((p) => pickerSelection.value.has(p.id));
    for (const p of picked) {
        if (form.items.some((i) => i.productId === p.id)) {
            const existing = form.items.find((i) => i.productId === p.id);
            if (existing) {
                existing.quantity += 1;
                recalcItem(existing);
            }
            continue;
        }
        form.items.push(createItemFromProduct(p));
        appendMarketRemark(p);
    }
    pickerVisible.value = false;
}

function createItemFromProduct(p: Product): GeneratorItem {
    const images = p.images.map((img) => img.url);
    const certs = p.certificates.map((c) => c.url);
    // 快照唯一构建点：键清单见 ProductSnapshot（含 warranty/supplier/minOrderQty/tags，
    // 此前漏装导致相关导出列恒为空）
    const item: GeneratorItem = {
        productId: p.id,
        productSnapshot: buildProductSnapshot(p) as unknown as Record<string, unknown>,
        selectedImages: [...images],
        selectedCerts: [...certs],
        snapshotImages: images,
        snapshotCerts: certs,
        quantity: 1,
        unitPrice: (p.isMarketProduct ? p.marketPrice : p.salePrice) || 0,
        costPrice: p.costPrice ?? undefined,
        discount: undefined,
        subtotal: (p.isMarketProduct ? p.marketPrice : p.salePrice) || 0,
        isStale: p.isStale,
    };
    return item;
}

// 超期产品行内提醒
const staleItems = computed(() => form.items.filter((i) => i.isStale));

// ==================== 图片选择 ====================
const imagePickerVisible = ref(false);
const imagePickerTarget = ref<GeneratorItem | null>(null);

function openImagePicker(item: GeneratorItem) {
    imagePickerTarget.value = item;
    imagePickerVisible.value = true;
}

function toggleSelectedImage(url: string) {
    if (!imagePickerTarget.value) return;
    const list = imagePickerTarget.value.selectedImages || [];
    const index = list.indexOf(url);
    if (index >= 0) list.splice(index, 1);
    else list.push(url);
}

function snapshotName(item: GeneratorItem | null | undefined): string {
    const snap = item?.productSnapshot as Partial<ProductSnapshot> | undefined;
    return snap?.name || snap?.code || '未知产品';
}

function snapshotField(item: GeneratorItem | null | undefined, key: string): string {
    const snap = item?.productSnapshot;
    if (!snap) return '';
    const value = (snap as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : '';
}

// ==================== 保存 ====================
async function loadBaseQuotation() {
    const base = route.query.base as string;
    if (!base) return;
    try {
        const { data } = await quotationsApi.getOne(base);
        baseVersion.value = data.version;
        form.customerName = data.customerName;
        form.customerContact = data.customerContact || '';
        form.customerAddress = data.customerAddress || '';
        form.remark = data.remark || '';
        form.taxRate = data.taxRate ?? 0;
        form.items = data.items.map((item) => {
            const snap = item.productSnapshot ?? { name: '未知产品', code: '', images: [], certs: [] };
            const snapImages = snap.images;
            const snapCerts = snap.certs;
            const snapshotImages = Array.isArray(snapImages) ? (snapImages as string[]).filter((u) => typeof u === 'string') : [];
            const snapshotCerts = Array.isArray(snapCerts) ? (snapCerts as string[]).filter((u) => typeof u === 'string') : [];
            const selectedImages = item.selectedImages && item.selectedImages.length ? item.selectedImages : snapshotImages;
            const selectedCerts = item.selectedCerts && item.selectedCerts.length ? item.selectedCerts : snapshotCerts;
            return {
                productId: item.productId || undefined,
                productSnapshot: {
                    ...snap,
                    images: snapshotImages.length ? snapshotImages : selectedImages,
                    certs: snapshotCerts.length ? snapshotCerts : selectedCerts,
                },
                selectedImages,
                selectedCerts,
                snapshotImages: snapshotImages.length ? snapshotImages : selectedImages,
                snapshotCerts: snapshotCerts.length ? snapshotCerts : selectedCerts,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                costPrice: item.costPrice ?? undefined,
                discount: item.discount ?? undefined,
                subtotal: item.subtotal,
            };
        });
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '加载基础报价失败'));
    }
}

async function handleSave(submit: boolean) {
    if (!formRef.value) return;
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) return;
    if (!form.items.length) {
        ElMessage.warning('请先添加报价产品');
        return;
    }
    submitting.value = true;
    try {
        const payload = {
            customerName: form.customerName,
            customerContact: form.customerContact || undefined,
            customerAddress: form.customerAddress || undefined,
            remark: form.remark.trim() || undefined,
            taxRate: form.taxRate || undefined,
            status: (submit ? 'SENT' : 'DRAFT') as 'SENT' | 'DRAFT',
            items: form.items.map((item) => ({
                productId: item.productId,
                productSnapshot: item.productSnapshot,
                selectedImages: item.selectedImages?.length ? item.selectedImages : undefined,
                selectedCerts: item.selectedCerts?.length ? item.selectedCerts : undefined,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount,
            })),
        };
        let quotation;
        if (isVersion.value) {
            const base = route.query.base as string;
            const { data } = await quotationsApi.createVersion(base, payload);
            quotation = data;
        } else {
            const { data } = await quotationsApi.create(payload);
            quotation = data;
        }
        ElMessage.success('保存成功');
        // replace 覆盖当前编辑页历史记录，避免保存后浏览器后退回到残留的编辑表单
        void router.replace(`/products/quotations/${quotation.id}`);
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '保存失败'));
    } finally {
        submitting.value = false;
    }
}

// 返回：优先回退历史；直链进入（无上一页）时兜底到报价列表
function goBack() {
    const state = window.history.state as { back?: string | null } | null;
    if (state?.back != null) {
        void router.back();
    } else {
        void router.push('/products/quotations');
    }
}


function priceTip(p: Product): string {
    const sale = `售价：${fmtPrice(p.salePrice)}`;
    const market = `商城价：${fmtPrice(p.marketPrice)}`;
    const cost = `成本价：${fmtPrice(p.costPrice)}`;
    return p.isMarketProduct ? `${market}\n${cost}` : `${sale}\n${cost}`;
}

onMounted(async () => {
    await loadBaseQuotation();

    const ids = route.query.ids as string | undefined;
    if (ids) {
        const idList = ids.split(',');
        const { data } = await productsApi.getAll({ pageSize: idList.length });
        const picked = data.data.filter((p) => idList.includes(p.id));
        for (const p of picked) {
            form.items.push(createItemFromProduct(p));
        }
    }
});
</script>

<style scoped>
.quotation-generator-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; align-items: center; margin-bottom: 16px; }
.header-left { display: flex; align-items: center; gap: 12px; }
.header-left h2 { margin: 0; }
.stale-alert { margin-bottom: 16px; }
.stale-tag { margin-left: 6px; }
.card-premium { margin-bottom: 16px; }
.card-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.template-hint { font-size: 12px; color: var(--text-secondary); }
.card-title-text { font-weight: 600; }
.search-box { width: 220px; margin-right: 8px; }
.item-product { display: flex; align-items: center; gap: 10px; }
.item-thumb { width: 44px; height: 44px; border-radius: 6px; flex-shrink: 0; }
.placeholder-thumb { display: flex; align-items: center; justify-content: center; background: var(--bg-color); color: var(--text-tertiary); }
.item-name { font-weight: 500; }
.item-code { font-size: 12px; color: var(--text-secondary); }
.negative { color: var(--el-color-danger); }
.summary { margin-top: 16px; display: flex; justify-content: flex-end; gap: 32px; flex-wrap: wrap; }
.summary-line strong.final { color: var(--primary-color); font-size: 18px; }
.form-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 0; }
.picker-search { margin-bottom: 12px; }
.picker-tags { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.picker-tags-label { font-size: 12px; color: var(--text-tertiary); flex-shrink: 0; }
.picker-tags-list { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; flex: 1; }
.picker-tag-chip { cursor: pointer; flex-shrink: 0; }
.picker-tag-count { font-size: 11px; margin-left: 2px; opacity: 0.7; }
.picker-tags-toggle { padding: 0 4px; }
.picker-tags-hint { font-size: 11px; color: var(--text-tertiary); flex-shrink: 0; }
.product-picker-drawer :deep(.el-drawer__body) { display: flex; flex-direction: column; overflow: hidden; }
.product-picker-drawer :deep(.el-drawer__footer) { border-top: 1px solid var(--border-color-lighter); padding-top: 12px; }
.picker-list { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
.picker-item { display: flex; align-items: center; gap: 12px; padding: 10px; border: 1px solid var(--border-color-lighter); border-radius: 8px; cursor: pointer; }
.picker-item:hover { background: var(--el-color-primary-light-9); }
.picker-item.selected { border-color: var(--primary-color); background: var(--el-color-primary-light-9); }
.picker-thumb { width: 56px; height: 56px; border-radius: 6px; flex-shrink: 0; }
.picker-info { flex: 1; min-width: 0; }
.picker-name { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.picker-meta { font-size: 12px; color: var(--text-secondary); overflow: hidden; }
.picker-param { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.picker-empty { opacity: 0.6; }
.picker-price { color: var(--primary-color); font-weight: 600; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.picker-cost { color: var(--text-secondary); font-weight: 400; font-size: 12px; }
.price-tag { background: var(--el-color-warning-light-9); color: var(--el-color-warning); border-radius: 4px; padding: 0 6px; font-size: 12px; font-weight: 500; }
.picker-footer { display: flex; align-items: center; justify-content: space-between; }
.image-pick-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
.image-pick-item { border: 2px solid transparent; border-radius: 8px; cursor: pointer; overflow: hidden; }
.image-pick-item.active { border-color: var(--primary-color); }
.image-pick-thumb { width: 100%; height: 100px; object-fit: cover; }
</style>
