<template>
  <div class="product-edit-page" v-loading="loading">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" text @click="goBack">返回</el-button>
        <h2>{{ isEdit ? '编辑产品' : '新增产品' }}</h2>
        <el-tag v-if="isEdit && product" size="small">{{ product.code }}</el-tag>
      </div>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" class="edit-form">
      <el-card class="card-premium">
        <template #header><span class="card-title-text">基本信息</span></template>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="品牌" prop="brandId">
              <el-select v-model="form.brandId" style="width: 100%" filterable placeholder="选择品牌" @visible-change="loadBrands">
                <el-option v-for="b in brands" :key="b.id" :label="b.name" :value="b.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="型号">
              <el-input v-model="form.model" maxlength="100" placeholder="如：MateBook 14" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="产品名称" prop="name">
          <div class="name-sync-row">
            <el-input
              v-model="form.name"
              maxlength="200"
              show-word-limit
              placeholder="如：华为 MateBook 14"
              :disabled="form.nameSync"
            />
            <el-switch
              v-model="form.nameSync"
              inline-prompt
              active-text="自动"
              inactive-text="手动"
              class="name-sync-switch"
              @change="onNameSyncChange"
            />
          </div>
        </el-form-item>
        <el-form-item label="类型" prop="categoryId">
          <el-select v-model="form.categoryId" style="width: 100%" filterable placeholder="选择类型" @visible-change="loadCategories">
            <el-option v-for="c in categoryOptions" :key="c.id" :label="c.path" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="form.tagIds" multiple collapse-tags style="width: 100%" filterable placeholder="选择标签" @visible-change="loadTags">
            <el-option v-for="t in tags" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="详细参数">
          <MdEditor v-model="form.description" class="md-editor" />
        </el-form-item>
      </el-card>

      <el-card class="card-premium">
        <template #header><span class="card-title-text">价格与库存</span></template>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="是否为商城产品">
              <el-switch v-model="form.isMarketProduct" active-text="商城产品" inactive-text="普通产品" inline-prompt />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="售价">
              <el-input-number v-model="form.salePrice" :min="0" :precision="2" style="width: 100%" />
              <div class="field-hint">普通（非商城）产品的销售单价</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商城价格">
              <el-input-number v-model="form.marketPrice" :min="0" :precision="2" style="width: 100%" />
              <div class="field-hint">勾选“商城产品”时生效的销售单价</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="成本价">
              <el-input-number v-model="form.costPrice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="单位">
              <el-input v-model="form.unit" maxlength="20" placeholder="如：台 / 个" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最小起订量">
              <el-input-number v-model="form.minOrderQty" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="保修期">
              <el-input v-model="form.warranty" maxlength="100" placeholder="如：一年质保" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商">
              <el-input v-model="form.supplier" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="商城链接">
          <el-input v-model="form.marketUrl" maxlength="500" />
        </el-form-item>
        <el-form-item label="状态" v-if="isEdit">
          <el-radio-group v-model="form.status">
            <el-radio-button v-for="(label, key) in PRODUCT_STATUS_LABELS" :key="key" :value="key">{{ label }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-card>

      <el-card class="card-premium">
        <template #header><span class="card-title-text">产品图片</span></template>
        <div class="upload-list">
          <div v-for="(img, index) in form.images" :key="img.url" class="upload-item">
            <el-image :src="resolveAssetUrl(img.url)" fit="cover" class="upload-thumb" :preview-src-list="form.images.map(i => resolveAssetUrl(i.url))" preview-teleported :initial-index="index" />
            <div class="upload-item-body">
              <el-input v-model="img.description" placeholder="图片说明（可选）" size="small" maxlength="200" />
              <div class="upload-item-actions">
                <el-button size="small" text :disabled="index === 0" @click="moveImage(index, -1)"><el-icon><Top /></el-icon></el-button>
                <el-button size="small" text :disabled="index === form.images.length - 1" @click="moveImage(index, 1)"><el-icon><Bottom /></el-icon></el-button>
                <el-button size="small" text type="danger" @click="form.images.splice(index, 1)">移除</el-button>
              </div>
            </div>
          </div>
          <el-upload
            :show-file-list="false"
            :before-upload="beforeUpload"
            accept="image/jpeg,image/png,image/gif,image/webp"
            :multiple="true"
          >
            <el-button :icon="Plus" :loading="uploadingImage">上传图片</el-button>
          </el-upload>
        </div>
      </el-card>

      <el-card class="card-premium">
        <template #header><span class="card-title-text">产品证书</span></template>
        <div class="upload-list">
          <div v-for="(cert, index) in form.certificates" :key="cert.url" class="upload-item">
            <el-icon class="cert-file-icon"><Document /></el-icon>
            <div class="upload-item-body">
              <el-input v-model="cert.name" placeholder="证书名称（必填）" size="small" maxlength="100" />
              <div class="upload-item-actions">
                <el-button size="small" text :disabled="index === 0" @click="moveCert(index, -1)"><el-icon><Top /></el-icon></el-button>
                <el-button size="small" text :disabled="index === form.certificates.length - 1" @click="moveCert(index, 1)"><el-icon><Bottom /></el-icon></el-button>
                <el-button size="small" text type="danger" @click="form.certificates.splice(index, 1)">移除</el-button>
              </div>
            </div>
          </div>
          <el-upload
            :show-file-list="false"
            :before-upload="beforeCertUpload"
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
            :multiple="true"
          >
            <el-button :icon="Plus" :loading="uploadingCert">上传证书</el-button>
          </el-upload>
        </div>
      </el-card>

      <div class="form-footer">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { ArrowLeft, Plus, Top, Bottom, Document } from '@element-plus/icons-vue';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import type { Product, ProductImage, ProductCertificate, Brand, ProductTag } from '@/types';
import { PRODUCT_STATUS_LABELS } from '@/types';
import { productsApi, brandsApi, categoriesApi, productTagsApi, productUploadsApi } from '@/api';
import { resolveAssetUrl } from '@/utils/url';
import { getApiErrorMessage, flattenCategories } from '@/utils/format';

const route = useRoute();
const router = useRouter();

const isEdit = computed(() => !!route.params.id && route.params.id !== 'new');
const productId = computed(() => route.params.id as string);

const loading = ref(false);
const submitting = ref(false);
const uploadingImage = ref(false);
const uploadingCert = ref(false);
const brands = ref<Brand[]>([]);
const tags = ref<ProductTag[]>([]);
const categoryOptions = ref<Array<{ id: string; path: string }>>([]);

const formRef = ref<FormInstance>();
const form = reactive({
    name: '',
    model: '',
    nameSync: true,
    description: '',
    status: 'ACTIVE' as Product['status'],
    isMarketProduct: false,
    unit: '',
    minOrderQty: undefined as number | undefined,
    warranty: '',
    supplier: '',
    marketUrl: '',
    marketPrice: undefined as number | undefined,
    salePrice: undefined as number | undefined,
    costPrice: undefined as number | undefined,
    brandId: '',
    categoryId: '',
    tagIds: [] as string[],
    images: [] as ProductImage[],
    certificates: [] as ProductCertificate[],
});

const nameSyncGuard = ref(false);

/** 名称 = 品牌 + 型号（自动拼装） */
function composeName(): string {
    return [selectedBrandName.value, form.model].filter(Boolean).join(' ');
}

const selectedBrandName = computed(() => brands.value.find((b) => b.id === form.brandId)?.name || '');

watch([() => form.brandId, () => form.model], () => {
    if (nameSyncGuard.value || !form.nameSync) return;
    form.name = composeName();
});

function onNameSyncChange() {
    if (form.nameSync) form.name = composeName();
}

const rules: FormRules = {
    name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
    brandId: [{ required: true, message: '请选择品牌', trigger: 'change' }],
    categoryId: [{ required: true, message: '请选择类型', trigger: 'change' }],
};

async function loadBrands() {
    if (!brands.value.length) {
        const { data } = await brandsApi.getAll();
        brands.value = data;
    }
}

async function loadTags() {
    if (!tags.value.length) {
        const { data } = await productTagsApi.getAll();
        tags.value = data;
    }
}

async function loadCategories() {
    if (!categoryOptions.value.length) {
        const { data } = await categoriesApi.getTree();
        categoryOptions.value = flattenCategories(data);
    }
}


function beforeUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) {
        ElMessage.error('图片不能超过 5MB');
        return false;
    }
    uploadingImage.value = true;
    productUploadsApi
        .uploadProductImage(file)
        .then(({ data }) => {
            form.images.push({ url: data.url, description: '', displayOrder: form.images.length });
        })
        .catch((e: unknown) => {
            ElMessage.error(getApiErrorMessage(e, '图片上传失败'));
        })
        .finally(() => {
            uploadingImage.value = false;
        });
    return false;
}

function beforeCertUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) {
        ElMessage.error('证书文件不能超过 5MB');
        return false;
    }
    uploadingCert.value = true;
    productUploadsApi
        .uploadProductCertificate(file)
        .then(({ data }) => {
            form.certificates.push({
                url: data.url,
                name: file.name.replace(/\.[^.]+$/, ''),
                description: '',
                displayOrder: form.certificates.length,
            });
        })
        .catch((e: unknown) => {
            ElMessage.error(getApiErrorMessage(e, '证书上传失败'));
        })
        .finally(() => {
            uploadingCert.value = false;
        });
    return false;
}

function moveImage(index: number, delta: number) {
    moveItem(form.images, index, delta);
}

function moveCert(index: number, delta: number) {
    moveItem(form.certificates, index, delta);
}

function moveItem<T>(arr: T[], index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= arr.length) return;
    const temp = arr[index];
    arr[index] = arr[target];
    arr[target] = temp;
}

async function fetchDetail() {
    if (!isEdit.value) return;
    loading.value = true;
    try {
        const { data } = await productsApi.getOne(productId.value);
        const autoName = [data.brand?.name || '', data.model || ''].filter(Boolean).join(' ');
        nameSyncGuard.value = true;
        Object.assign(form, {
            name: data.name,
            model: data.model || '',
            nameSync: !!(data.model && data.name === autoName),
            description: data.description || '',
            status: data.status,
            isMarketProduct: !!data.isMarketProduct,
            unit: data.unit,
            minOrderQty: data.minOrderQty ?? undefined,
            warranty: data.warranty || '',
            supplier: data.supplier || '',
            marketUrl: data.marketUrl || '',
            marketPrice: data.marketPrice ?? undefined,
            salePrice: data.salePrice ?? undefined,
            costPrice: data.costPrice ?? undefined,
            brandId: data.brandId,
            categoryId: data.categoryId,
            tagIds: data.tags.map((t) => t.id),
            images: data.images.map((img) => ({ ...img })),
            certificates: data.certificates.map((c) => ({ ...c })),
        });
        nameSyncGuard.value = false;
        await Promise.all([loadBrands(), loadTags(), loadCategories()]);
    } finally {
        loading.value = false;
    }
}

function goBack() {
    // 优先真正回退，避免把当前编辑页再次压入历史栈；直链进入时用 replace 兜底
    const state = window.history.state as { back?: string | null } | null;
    if (state?.back != null) {
        void router.back();
        return;
    }
    if (isEdit.value) {
        void router.replace(`/products/${productId.value}`);
    } else {
        void router.replace('/products');
    }
}

async function handleSubmit() {
    if (!formRef.value) return;
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) return;
    submitting.value = true;
    try {
        const payload = {
            name: form.name,
            model: form.model || undefined,
            description: form.description || undefined,
            status: form.status,
            isMarketProduct: form.isMarketProduct,
            unit: form.unit || undefined,
            minOrderQty: form.minOrderQty,
            warranty: form.warranty || undefined,
            supplier: form.supplier || undefined,
            marketUrl: form.marketUrl || undefined,
            marketPrice: form.marketPrice,
            salePrice: form.salePrice,
            costPrice: form.costPrice,
            brandId: form.brandId,
            categoryId: form.categoryId,
            tagIds: form.tagIds,
            images: form.images.map((img, index) => ({
                url: img.url,
                description: img.description || undefined,
                displayOrder: index,
            })),
            certificates: form.certificates.map((cert, index) => ({
                url: cert.url,
                name: cert.name,
                description: cert.description || undefined,
                displayOrder: index,
            })),
        };
        if (isEdit.value) {
            await productsApi.update(productId.value, payload);
            ElMessage.success('更新成功');
            // replace：把编辑页从历史栈中替换掉，详情页「返回」才不会退回编辑页
            void router.replace(`/products/${productId.value}`);
        } else {
            const { data } = await productsApi.create(payload);
            ElMessage.success('创建成功');
            void router.replace(`/products/${data.id}`);
        }
    } catch (e: unknown) {
        ElMessage.error(getApiErrorMessage(e, '保存失败'));
    } finally {
        submitting.value = false;
    }
}

onMounted(async () => {
    await Promise.all([loadBrands(), loadTags(), loadCategories()]);
    await fetchDetail();
});
</script>

<style scoped>
.product-edit-page { max-width: 1000px; margin: 0 auto; }
.page-header { display: flex; align-items: center; margin-bottom: 16px; }
.header-left { display: flex; align-items: center; gap: 12px; }
.header-left h2 { margin: 0; }
.edit-form .card-premium { margin-bottom: 16px; }
.card-title-text { font-weight: 600; }
.name-sync-row { display: flex; align-items: center; gap: 12px; width: 100%; }
.name-sync-switch { flex-shrink: 0; }
.md-editor { width: 100%; }
.upload-list { display: flex; flex-direction: column; gap: 12px; }
.upload-item { display: flex; align-items: center; gap: 16px; padding: 12px; border: 1px solid var(--border-color-lighter); border-radius: 8px; background: var(--bg-color); }
.upload-thumb { width: 80px; height: 80px; border-radius: 8px; flex-shrink: 0; }
.upload-item-body { flex: 1; }
.upload-item-actions { display: flex; margin-top: 4px; }
.cert-file-icon { font-size: 40px; color: var(--el-color-primary); flex-shrink: 0; }
.form-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 0; }
</style>
