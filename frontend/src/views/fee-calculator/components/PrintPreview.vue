<template>
  <el-dialog
    v-model="visible"
    width="900px"
    :close-on-click-modal="false"
    destroy-on-close
    @closed="onClosed"
  >
    <template #header>
      <div class="print-dialog-header">
        <span class="print-dialog-title">打印费用结算单</span>
        <div class="print-dialog-actions">
          <el-button :icon="Printer" type="primary" @click="handlePrint">打印</el-button>
          <el-button @click="visible = false">取消</el-button>
        </div>
      </div>
    </template>
    <div class="print-preview-layout">
      <!-- 左侧表单 -->
      <div class="form-panel">
        <div class="form-section">
          <h4>模板选择</h4>
          <el-radio-group v-model="templateType">
            <el-radio-button value="triplicate">三联纸</el-radio-button>
            <el-radio-button value="a4">A4纸</el-radio-button>
          </el-radio-group>
        </div>

        <div class="form-section">
          <h4>打印信息</h4>
          <el-form label-width="80px" size="small">
            <el-form-item label="委托单位">
              <el-input v-model="formData.clientName" placeholder="输入委托单位名称" />
            </el-form-item>
            <el-form-item label="联系人">
              <el-input v-model="formData.contactPerson" placeholder="输入联系人" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="formData.contactPhone" placeholder="输入联系电话" />
            </el-form-item>
          </el-form>
        </div>

        <div class="form-section">
          <h4>单据信息</h4>
          <div class="info-text">单据编号：{{ printData.documentNo }}</div>
          <div class="info-text">开单日期：{{ printData.date }}</div>
          <div class="info-text">操 作 人：{{ printData.creatorName }}</div>
        </div>
      </div>

      <!-- 右侧预览 -->
      <div class="preview-panel">
        <div class="preview-label">{{ templateType === 'triplicate' ? '三联纸' : 'A4纸' }}预览</div>
        <div class="preview-container" :class="templateType">
          <div class="preview-scaler" :style="scaleStyle">
            <PrintTemplateTriplicate v-if="templateType === 'triplicate'" :data="printData" />
            <PrintTemplateA4 v-else :data="printData" />
          </div>
        </div>
      </div>
    </div>

  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { Printer } from '@element-plus/icons-vue';
import PrintTemplateTriplicate from './PrintTemplateTriplicate.vue';
import PrintTemplateA4 from './PrintTemplateA4.vue';
import { usePrint, type PrintData, type PrintTemplateType } from '../composables/usePrint';

const props = defineProps<{
  data: PrintData | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const visible = ref(false);
const templateType = ref<PrintTemplateType>('triplicate');
const { print } = usePrint();

const formData = reactive({
  clientName: '',
  contactPerson: '',
  contactPhone: '',
});

const printData = computed<PrintData>(() => ({
  ...(props.data || {
    documentNo: '',
    date: '',
    clientName: '',
    contactPerson: '',
    contactPhone: '',
    items: [],
    subtotal: 0,
    discount: 0,
    actualAmount: 0,
    remark: '',
    creatorName: '',
  }),
  clientName: formData.clientName,
  contactPerson: formData.contactPerson,
  contactPhone: formData.contactPhone,
}));

const scaleStyle = computed(() => {
  return { transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%' };
});

const open = () => {
  if (props.data) {
    formData.clientName = props.data.clientName || '';
    formData.contactPerson = props.data.contactPerson || '';
    formData.contactPhone = props.data.contactPhone || '';
  }
  visible.value = true;
};

const handlePrint = () => {
  print(templateType.value, printData.value);
};

const onClosed = () => {
  formData.clientName = '';
  formData.contactPerson = '';
  formData.contactPhone = '';
};

defineExpose({ open });
</script>

<style scoped>
.print-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.print-dialog-title {
  font-size: 16px;
  font-weight: 500;
}

.print-dialog-actions {
  display: flex;
  gap: 8px;
}

.print-preview-layout {
  display: flex;
  gap: 20px;
  min-height: 400px;
}

.form-panel {
  width: 280px;
  flex-shrink: 0;
}

.form-section {
  margin-bottom: 20px;
}

.form-section h4 {
  font-size: 14px;
  margin: 0 0 12px;
  color: var(--text-primary);
}

.info-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.8;
}

.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.preview-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.preview-container {
  flex: 1;
  overflow: auto;
  background: #e8e8e8;
  border-radius: 4px;
  padding: 12px;
}

.preview-container.a4 {
  max-height: 500px;
}

.preview-container.triplicate {
  max-height: 500px;
}

.preview-scaler {
  margin: 0 auto;
}
</style>
