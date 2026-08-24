<template>
  <div class="product-page">
    <div class="page-header">
      <div>
        <h2>产品管理</h2>
        <div class="entry-actions">
          <el-button size="small" text bg @click="router.push('/products/brands')" v-if="canManageBrand">
            <el-icon><Goods /></el-icon><span style="margin-left: 4px">品牌管理</span>
          </el-button>
          <el-button size="small" text bg @click="router.push('/products/categories')" v-if="canManageCategory">
            <el-icon><Menu /></el-icon><span style="margin-left: 4px">类型管理</span>
          </el-button>
          <el-button size="small" text bg @click="router.push('/products/tags')" v-if="canManageTag">
            <el-icon><CollectionTag /></el-icon><span style="margin-left: 4px">标签管理</span>
          </el-button>
          <el-button size="small" text bg @click="openStaleSetting" v-if="canManageProduct">
            <el-icon><AlarmClock /></el-icon><span style="margin-left: 4px">过期提醒设置</span>
          </el-button>
        </div>
      </div>
      <div class="header-actions">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="list">列表</el-radio-button>
          <el-radio-button value="card">卡片</el-radio-button>
        </el-radio-group>
        <el-button :type="favoritesOnly ? 'warning' : 'default'" @click="toggleFavorites">
          <el-icon><StarFilled v-if="favoritesOnly" /><Star v-else /></el-icon>
          <span style="margin-left: 4px">仅看收藏</span>
        </el-button>
        <el-input
          v-model="filters.keyword"
          placeholder="搜索品牌型号/编号/参数"
          :prefix-icon="Search"
          clearable
          class="search-box"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button :icon="DocumentChecked" :loading="exporting" @click="exportExcel">导出 Excel</el-button>
        <el-button :icon="Download" v-if="canImport" @click="downloadTemplate">下载模板</el-button>
        <el-button type="primary" :icon="Upload" v-if="canImport" @click="goImport">导入</el-button>
        <el-button type="primary" :icon="Plus" v-if="canEdit" @click="goCreate">新增产品</el-button>
      </div>
    </div>

    <!-- 过期提醒设置 -->
    <el-dialog v-model="staleSettingVisible" title="过期提醒设置" width="420px">
      <el-form label-width="120px">
        <el-form-item label="超期阈值(天)">
          <el-input-number v-model="staleThresholdDays" :min="1" :max="3650" />
        </el-form-item>
        <el-alert
          type="info"
          :closable="false"
          show-icon
          title="说明"
          description="产品超过该天数未更新时标记为「超期」，新建报价单选用超期产品将行内提醒。"
        />
      </el-form>
      <template #footer>
        <el-button @click="staleSettingVisible = false">取消</el-button>
        <el-button type="primary" :loading="staleSaving" @click="saveStaleSetting">保存</el-button>
      </template>
    </el-dialog>

    <!-- 筛选区 -->
    <el-card class="filter-card">
      <div class="filter-row">
        <el-select v-model="filters.brandIds" multiple collapse-tags filterable :filter-method="filterBrandOptions" placeholder="品牌（可输入拼音）" clearable class="filter-item" @change="handleSearch">
          <el-option v-for="b in filteredBrandOptions" :key="b.id" :label="b.name" :value="b.id" />
        </el-select>
        <el-select v-model="filters.categoryId" filterable :filter-method="filterCategoryOptions" placeholder="类型（可输入拼音）" clearable class="filter-item" @change="handleSearch">
          <el-option v-for="c in filteredCategoryOptions" :key="c.id" :label="c.path" :value="c.id" />
        </el-select>
        <el-select v-model="filters.tagIds" multiple collapse-tags filterable :filter-method="filterTagOptions" placeholder="标签（可输入拼音）" clearable class="filter-item" @change="handleSearch">
          <el-option v-for="t in filteredTagOptions" :key="t.id" :label="t.name" :value="t.id" />
        </el-select>
        <el-select v-model="filters.status" filterable :filter-method="filterStatusOptions" placeholder="状态" clearable class="filter-item" @change="handleSearch">
          <el-option v-for="s in filteredStatusOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-input-number v-model="filters.minPrice" :min="0" placeholder="最低价" controls-position="right" class="price-input" @change="handleSearch" />
        <span class="price-sep">-</span>
        <el-input-number v-model="filters.maxPrice" :min="0" placeholder="最高价" controls-position="right" class="price-input" @change="handleSearch" />
        <el-select v-model="filters.orderBy" class="filter-item" @change="handleSearch">
          <el-option label="最近更新" value="updatedAt" />
          <el-option label="超期优先" value="staleFirst" />
        </el-select>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>
      <div class="toolbar-row" v-if="selected.length > 0">
        <el-button size="small" :icon="DocumentChecked" @click="addToQuotation">加入报价 ({{ selected.length }})</el-button>
        <el-button size="small" v-if="canEdit" @click="batchStatus('ACTIVE')">批量上架</el-button>
        <el-button size="small" v-if="canEdit" @click="batchStatus('INACTIVE')">批量下架</el-button>
        <el-button size="small" type="danger" v-if="canDelete" @click="batchDelete">批量删除</el-button>
      </div>
    </el-card>

    <!-- 列表视图 -->
    <el-table
      v-if="viewMode === 'list'"
      :data="products"
      v-loading="loading"
      class="card-premium"
      empty-text="暂无产品数据"
      @selection-change="handleSelectionChange"
      :row-class-name="rowClassName"
    >
      <el-table-column type="selection" width="45" />
      <el-table-column label="收藏" width="60" align="center">
        <template #default="{ row }">
          <el-icon class="fav-icon" :class="{ active: row.isFavorite }" @click="toggleFavorite(row)">
            <StarFilled v-if="row.isFavorite" />
            <Star v-else />
          </el-icon>
        </template>
      </el-table-column>
      <el-table-column label="品牌型号" min-width="280">
        <template #default="{ row }">
          <div class="product-name-cell">
            <span class="product-name" @click="goDetail(row)">{{ row.name }}</span>
            <el-tag v-if="row.isStale" type="warning" size="small" effect="dark" class="stale-badge">超期</el-tag>
          </div>
          <div v-if="row.isStale" class="stale-row-actions">
            <el-tooltip content="确认无需更新" placement="top">
              <el-button
                size="small"
                type="warning"
                plain
                :icon="Check"
                :loading="ackMap[row.id]"
                @click="acknowledgeStale(row)"
              />
            </el-tooltip>
            <el-tooltip content="立即更新" placement="top">
              <el-button
                size="small"
                type="primary"
                :icon="Edit"
                :disabled="!canEdit"
                @click="router.push(`/products/${row.id}/edit`)"
              />
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="类型" min-width="120">
        <template #default="{ row }">{{ row.category?.name || '-' }}</template>
      </el-table-column>
      <el-table-column label="品牌" min-width="110">
        <template #default="{ row }">{{ row.brand?.name || '-' }}</template>
      </el-table-column>
      <el-table-column label="标签" min-width="130">
        <template #default="{ row }">
          <el-tag v-for="t in row.tags" :key="t.id" size="small" class="tag-chip">{{ t.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="单位" prop="unit" width="70" />
      <el-table-column label="价格" width="110">
        <template #default="{ row }">
          {{ fmtPrice(row.isMarketProduct ? row.marketPrice : row.salePrice) }}
          <span v-if="row.isMarketProduct" class="price-tag">商城</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button size="small" type="primary" @click="goDetail(row)">详情</el-button>
            <el-button size="small" v-if="canEdit" @click="goEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" v-if="canDelete" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 卡片视图 -->
    <div v-else-if="viewMode === 'card'" class="card-grid" v-loading="loading">
      <div v-for="row in products" :key="row.id" class="product-card" :class="{ 'stale-card': row.isStale }">
        <div class="card-thumb" @click="goDetail(row)">
          <img v-if="row.images?.[0]" :src="resolveAssetUrl(row.images[0].url)" class="thumb-img" alt="product" loading="lazy" />
          <div v-else class="thumb-placeholder"><el-icon><Picture /></el-icon></div>
          <el-tag v-if="row.isStale" type="warning" size="small" effect="dark" class="stale-badge-abs">超期未更新</el-tag>
        </div>
        <div class="card-body">
          <div class="card-title" @click="goDetail(row)">{{ row.name }}</div>
          <div class="card-meta">
            <span>{{ row.brand?.name || '-' }}</span>
            <span class="dot">·</span>
            <span>{{ row.category?.name || '-' }}</span>
          </div>
          <div class="card-tags">
            <el-tag v-for="t in row.tags" :key="t.id" size="small" class="tag-chip">{{ t.name }}</el-tag>
          </div>
          <div class="card-footer">
            <span class="card-price">{{ fmtPrice(row.isMarketProduct ? row.marketPrice : row.salePrice) }}</span>
            <span class="card-actions">
              <el-icon class="fav-icon" :class="{ active: row.isFavorite }" @click="toggleFavorite(row)">
                <StarFilled v-if="row.isFavorite" />
                <Star v-else />
              </el-icon>
            </span>
          </div>
          <div v-if="row.isStale" class="stale-actions">
            <el-button
              size="small"
              type="warning"
              plain
              :loading="ackMap[row.id]"
              @click="acknowledgeStale(row)"
            >
              <el-icon><Check /></el-icon> 确认无需更新
            </el-button>
            <el-button
              size="small"
              type="primary"
              :disabled="!canEdit"
              @click="router.push(`/products/${row.id}/edit`)"
            >
              <el-icon><Edit /></el-icon> 立即更新
            </el-button>
          </div>
        </div>
      </div>
      <el-empty v-if="!loading && products.length === 0" description="暂无产品数据" class="card-empty" />
    </div>

    <div class="pagination-container" v-if="total > 0">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search, Star, StarFilled, Picture, DocumentChecked, Check, Edit, Goods, Menu, CollectionTag, AlarmClock, Upload, Download } from '@element-plus/icons-vue';
import type { Product, ProductStatus, Brand, ProductTag } from '@/types';
import { PRODUCT_STATUS_LABELS } from '@/types';
import { productsApi, brandsApi, categoriesApi, productTagsApi, settingsApi } from '@/api';
import { usePermission } from '@/composables/usePermission';
import { resolveAssetUrl } from '@/utils/url';
import { downloadBlob } from '@/utils/download';
import { getApiErrorMessage, flattenCategories, formatPrice as fmtPrice } from '@/utils/format';
import { matchPinyin } from '@/utils/pinyinFilter';

const router = useRouter();
const { has, hasAny } = usePermission();

const canEdit = computed(() => hasAny(['product:create', 'product:edit', 'product:manage']));
const canDelete = computed(() => hasAny(['product:delete', 'product:manage']));
const canManageProduct = computed(() => hasAny(['product:create', 'product:edit', 'product:manage']));
const canManageBrand = computed(() => has('brand:manage'));
const canManageCategory = computed(() => has('category:manage'));
const canManageTag = computed(() => has('tag:manage'));
const canImport = computed(() => has('product:import'));


const loading = ref(false);
const viewMode = ref<'list' | 'card'>('list');
const products = ref<Product[]>([]);
/** 记录各产品确认续期请求的 loading 态 */
const ackMap = ref<Record<string, boolean>>({});
const brands = ref<Brand[]>([]);
const tags = ref<ProductTag[]>([]);
const categoryOptions = ref<Array<{ id: string; path: string }>>([]);
const total = ref(0);
const selected = ref<Product[]>([]);
const favoritesOnly = ref(false);

// ==================== 筛选下拉拼音模糊过滤（原文/全拼/首字母任一命中） ====================
const statusOptions: Array<{ label: string; value: string }> = [
    { label: '全部状态', value: 'ALL' },
    ...Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => ({ label, value })),
];
function makePinyinFilter<T>(getSource: () => T[], getLabel: (o: T) => string) {
    const query = ref('');
    const filtered = computed(() =>
        query.value ? getSource().filter((o) => matchPinyin(getLabel(o), query.value)) : getSource(),
    );
    return { filtered, setQuery: (q: string) => (query.value = q.trim()) };
}
const { filtered: filteredBrandOptions, setQuery: filterBrandOptions } = makePinyinFilter(
    () => brands.value,
    (b) => b.name,
);
const { filtered: filteredCategoryOptions, setQuery: filterCategoryOptions } = makePinyinFilter(
    () => categoryOptions.value,
    (c) => c.path,
);
const { filtered: filteredTagOptions, setQuery: filterTagOptions } = makePinyinFilter(
    () => tags.value,
    (t) => t.name,
);
const { filtered: filteredStatusOptions, setQuery: filterStatusOptions } = makePinyinFilter(
    () => statusOptions,
    (s) => s.label,
);


const pagination = reactive({ page: 1, pageSize: 20 });
const filters = reactive<{
    keyword: string;
    brandIds: string[];
    categoryId: string;
    tagIds: string[];
    status: ProductStatus | 'ALL' | '';
    minPrice?: number;
    maxPrice?: number;
    orderBy: 'updatedAt' | 'staleFirst';
}>({
    keyword: '',
    brandIds: [],
    categoryId: '',
    tagIds: [],
    status: '',
    minPrice: undefined,
    maxPrice: undefined,
    orderBy: 'updatedAt',
});

/** 请求序号：丢弃过期响应，避免快速输入时旧结果覆盖新结果 */
let fetchSeq = 0;
async function fetchData() {
    const seq = ++fetchSeq;
    loading.value = true;
    try {
        const params = {
            page: pagination.page,
            pageSize: pagination.pageSize,
            keyword: filters.keyword || undefined,
            brandIds: filters.brandIds.length ? filters.brandIds : undefined,
            categoryId: filters.categoryId || undefined,
            tagIds: filters.tagIds.length ? filters.tagIds : undefined,
            status: filters.status || undefined,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            orderBy: filters.orderBy,
        };
        const { data } = favoritesOnly.value ? await productsApi.getFavorites(params) : await productsApi.getAll(params);
        if (seq !== fetchSeq) return;
        products.value = data.data;
        total.value = data.total;
    } finally {
        if (seq === fetchSeq) loading.value = false;
    }
}

// ==================== 实时过滤 ====================
let searchTimer: ReturnType<typeof setTimeout> | undefined;

/** 防抖触发搜索（关键词输入实时过滤） */
function queueSearch(delay = 350) {
    if (searchTimer) clearTimeout(searchTimer);
    const skip = restorePending;
    searchTimer = setTimeout(() => {
        searchTimer = undefined;
        if (skip) return;
        pagination.page = 1;
        void fetchData();
    }, delay);
}

watch(() => filters.keyword, () => queueSearch());

function handleSearch() {
    if (searchTimer) {
        clearTimeout(searchTimer);
        searchTimer = undefined;
    }
    pagination.page = 1;
    void fetchData();
}

function toggleFavorites() {
    favoritesOnly.value = !favoritesOnly.value;
    pagination.page = 1;
    void fetchData();
}

const exporting = ref(false);
async function exportExcel() {
    exporting.value = true;
    try {
        // 复用当前筛选条件，导出全部匹配产品（后端忽略分页字段）
        const params = {
            keyword: filters.keyword || undefined,
            brandIds: filters.brandIds.length ? filters.brandIds : undefined,
            categoryId: filters.categoryId || undefined,
            tagIds: filters.tagIds.length ? filters.tagIds : undefined,
            status: filters.status || undefined,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            orderBy: filters.orderBy,
        };
        const res = await productsApi.exportList(params);
        const blob = new Blob([res.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        downloadBlob(blob, `产品列表_${new Date().toISOString().slice(0, 10)}.xlsx`);
        ElMessage.success('导出成功');
    } catch {
        ElMessage.error('导出失败，请重试');
    } finally {
        exporting.value = false;
    }
}

function goImport() {
    void router.push('/products/import');
}

const TEMPLATE_COLUMNS = [
    '产品型号',
    '品牌',
    '类型',
    '参数',
    '单位',
    '价格',
    '成本',
    '链接',
    '保修',
    '供应商',
    '标签（逗号分隔）',
    '起订量',
    '图片链接',
];

async function downloadTemplate() {
    try {
        // 按需加载 exceljs（~1MB），与导出保持一致
        const { default: ExcelJS } = await import('exceljs');
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('产品导入模板');
        sheet.columns = TEMPLATE_COLUMNS.map((header) => ({
            header,
            key: header,
            width: 18,
        }));
        // 示例行，帮助用户理解填写格式
        const example = sheet.addRow({
            产品型号: '示例-ThinkPad T14',
            品牌: '联想 (ThinkPad)',
            类型: '计算机设备 / 笔记本电脑 / 商用笔记本',
            参数: 'i5/16G/512G',
            单位: '台',
            价格: 5999,
            成本: 4600,
            链接: '',
            保修: '3年',
            供应商: '',
            '标签（逗号分隔）': '商用,办公,Windows',
            起订量: 1,
            图片链接: '',
        });
        example.font = { color: { argb: 'FF999999' } };
        sheet.getRow(1).font = { bold: true };
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        downloadBlob(blob, '产品导入模板.xlsx');
        ElMessage.success('模板已下载');
    } catch (e) {
        console.error(e);
        ElMessage.error('模板下载失败');
    }
}

async function loadFilters() {
    const [brandRes, tagRes, catRes] = await Promise.all([
        brandsApi.getAll(),
        productTagsApi.getAll(),
        categoriesApi.getTree(),
    ]);
    brands.value = brandRes.data;
    tags.value = tagRes.data;
    categoryOptions.value = flattenCategories(catRes.data);
}


function rowClassName({ row }: { row: Product }) {
    return row.isStale ? 'stale-row' : '';
}

function handleSelectionChange(rows: Product[]) {
    selected.value = rows;
}

function handleReset() {
    Object.assign(filters, {
        keyword: '',
        brandIds: [],
        categoryId: '',
        tagIds: [],
        status: '',
        minPrice: undefined,
        maxPrice: undefined,
        orderBy: 'updatedAt',
    });
    pagination.page = 1;
    void fetchData();
}

function handlePageChange() {
    void fetchData();
}

function handleSizeChange() {
    pagination.page = 1;
    void fetchData();
}

async function toggleFavorite(row: Product) {
    try {
        const { data } = await productsApi.toggleFavorite(row.id);
        row.isFavorite = data.isFavorite;
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '操作失败'));
    }
}

/** 列表中的「确认无需更新」：乐观更新该行，消除超期标记 */
async function acknowledgeStale(row: Product) {
    ackMap.value[row.id] = true;
    try {
        const { data } = await productsApi.acknowledgeStale(row.id);
        Object.assign(row, data);
        ElMessage.success('已确认无需更新，提醒已消除');
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '操作失败'));
    } finally {
        ackMap.value[row.id] = false;
    }
}

function goDetail(row: Product) {
    void router.push(`/products/${row.id}`);
}

function goCreate() {
    void router.push('/products/new');
}

function goEdit(row: Product) {
    void router.push(`/products/${row.id}/edit`);
}

// 过期提醒设置（模态框）
const staleSettingVisible = ref(false);
const staleSaving = ref(false);
const staleThresholdDays = ref(180);

async function openStaleSetting() {
    staleSettingVisible.value = true;
    staleSaving.value = false;
    try {
        const { data } = await settingsApi.get('staleThresholdDays');
        if (typeof data === 'number' && data > 0) staleThresholdDays.value = data;
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '读取设置失败'));
    }
}

async function saveStaleSetting() {
    staleSaving.value = true;
    try {
        await settingsApi.update('staleThresholdDays', staleThresholdDays.value);
        ElMessage.success('保存成功');
        staleSettingVisible.value = false;
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '保存失败'));
    } finally {
        staleSaving.value = false;
    }
}

function addToQuotation(ids?: string[]) {
    const target = ids || selected.value.map((p) => p.id);
    if (!target.length) return;
    void router.push({ path: '/products/quotations/new', query: { ids: target.join(',') } });
}

async function handleDelete(row: Product) {
    await ElMessageBox.confirm(`确定删除产品「${row.name}」吗？`, '提示', { type: 'warning' });
    try {
        await productsApi.remove(row.id);
        ElMessage.success('删除成功');
        void fetchData();
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '删除失败'));
    }
}

async function batchStatus(status: ProductStatus) {
    if (!selected.value.length) return;
    await ElMessageBox.confirm(`确定将选中的 ${selected.value.length} 个产品设为${PRODUCT_STATUS_LABELS[status]}吗？`, '提示', { type: 'warning' });
    try {
        await productsApi.batchStatus({ ids: selected.value.map((p) => p.id), status });
        ElMessage.success('操作成功');
        void fetchData();
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '操作失败'));
    }
}

async function batchDelete() {
    if (!selected.value.length) return;
    await ElMessageBox.confirm(`确定删除选中的 ${selected.value.length} 个产品吗？`, '提示', { type: 'warning' });
    try {
        await productsApi.batchDelete({ ids: selected.value.map((p) => p.id) });
        ElMessage.success('删除成功');
        void fetchData();
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '操作失败'));
    }
}




// ==================== 列表状态记忆（从详情返回时保持页码/筛选） ====================
const LIST_STATE_KEY = 'kworkorder:product-list-state';
/** 恢复期间为 true，抑制搜索防抖与视图切换副作用 */
let restorePending = false;

function saveListState() {
    try {
        sessionStorage.setItem(
            LIST_STATE_KEY,
            JSON.stringify({
                filters: { ...filters },
                pagination: { ...pagination },
                viewMode: viewMode.value,
                favoritesOnly: favoritesOnly.value,
            }),
        );
    } catch {
        // sessionStorage 不可用时忽略
    }
}

function restoreListState() {
    try {
        const raw = sessionStorage.getItem(LIST_STATE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw) as {
            filters?: Partial<typeof filters>;
            pagination?: { page: number; pageSize: number };
            viewMode?: 'list' | 'card';
            favoritesOnly?: boolean;
        };
        if (saved.filters) Object.assign(filters, saved.filters);
        if (saved.pagination) {
            pagination.page = saved.pagination.page || 1;
            pagination.pageSize = saved.pagination.pageSize || 20;
        }
        if (saved.favoritesOnly !== undefined) favoritesOnly.value = saved.favoritesOnly;
        if (saved.viewMode) viewMode.value = saved.viewMode;
    } catch {
        // 解析失败时忽略
    }
}

onMounted(async () => {
    restorePending = true;
    restoreListState();
    // 筛选数据与列表并行加载，列表不再被筛选请求阻塞
    await Promise.all([loadFilters(), fetchData()]);
    restorePending = false;
});

onBeforeUnmount(() => {
    saveListState();
});

watch(viewMode, () => {
    if (restorePending) return;
    if (viewMode.value === 'card') pagination.pageSize = 24;
    else pagination.pageSize = 20;
    pagination.page = 1;
    void fetchData();
});
</script>

<style scoped>
.action-buttons {
  display: flex;
  gap: 2px;
  flex-wrap: nowrap;
}
/* 抵消 el-button 相邻默认 margin-left:12px（与 gap 叠加导致列宽不足、按钮被裁） */
.action-buttons :deep(.el-button + .el-button) {
  margin-left: 0;
}

.product-page { max-width: 1400px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.header-actions { display: flex; align-items: center; gap: 12px; }
.entry-actions { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.search-box { width: 260px; }
.filter-card { margin-bottom: 16px; }
.filter-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.filter-item { width: 150px; }
.price-input { width: 110px; }
.price-sep { color: var(--text-tertiary); }
.toolbar-row { margin-top: 12px; display: flex; gap: 8px; }

.product-name-cell { display: flex; align-items: center; gap: 6px; }
.product-name { cursor: pointer; color: var(--text-primary); font-weight: 500; }
.product-name:hover { color: var(--primary-color); }
.tag-chip { margin-right: 4px; }
.fav-icon { cursor: pointer; color: var(--text-tertiary); font-size: 16px; }
.fav-icon.active { color: #f5b50a; }
.stale-badge { flex-shrink: 0; }

.stale-row { background-color: rgba(230, 162, 60, 0.08); }

/* 超期行内操作按钮 */
.stale-row-actions { display: flex; gap: 6px; margin-top: 6px; }

/* 卡片底部超期操作区 */
.stale-actions {
  display: flex;
  gap: 8px;
  padding: 0 12px 12px;
  margin-top: -4px;
}
.stale-actions .el-button { flex: 1; }

.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.product-card { background: var(--card-bg); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color-lighter); transition: box-shadow 0.3s, transform 0.3s; }
.product-card:hover { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); transform: translateY(-2px); }
.product-card.stale-card { border-color: var(--el-color-warning); }
.card-thumb { position: relative; height: 150px; background: var(--bg-color); cursor: pointer; }
.thumb-img { width: 100%; height: 100%; object-fit: contain; }
.thumb-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-tertiary); font-size: 32px; }
.stale-badge-abs { position: absolute; top: 8px; left: 8px; }
.card-body { padding: 12px; }
.card-title { font-weight: 600; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-meta { font-size: 12px; color: var(--text-secondary); margin: 4px 0; }
.dot { margin: 0 4px; }
.card-tags { min-height: 22px; }
.card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
.card-price { font-size: 16px; font-weight: 600; color: var(--primary-color); }
.card-actions { display: flex; align-items: center; gap: 4px; }
.card-empty { grid-column: 1 / -1; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; background: var(--card-bg); padding: 12px; border-radius: 8px; }
</style>
