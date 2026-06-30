<template>
  <el-form
    ref="formRef"
    :model="localModelValue"
    :rules="rules"
    :label-position="labelPosition"
    :label-width="labelWidth"
  >
    <el-form-item label="客户" prop="customerId">
      <el-select
        v-model="localModelValue.customerId"
        filterable
        remote
        :remote-method="onSearch"
        placeholder="搜索客户(支持拼音)"
        style="width: 100%"
        class="customer-select"
      >
        <el-option
          v-for="c in customers"
          :key="c.id"
          :label="c.shortName ? `${c.shortName} (${c.name})` : c.name"
          :value="c.id"
        >
          <div class="customer-option">
            <span>{{ c.shortName ? `${c.shortName} (${c.name})` : c.name }}</span>
          </div>
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="区域" prop="regionId">
      <el-radio-group v-model="localModelValue.regionId" :class="{ 'radio-group-inline': isMobile }">
        <el-radio
          v-for="r in baseDataStore.regions"
          :key="r.id"
          :value="r.id"
          :class="{ 'radio-item-inline': isMobile }"
        >
          {{ r.name }}
        </el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="服务类型" prop="serviceTypeId">
      <el-select v-model="localModelValue.serviceTypeId" placeholder="选择服务类型" style="width: 100%">
        <el-option
          v-for="s in baseDataStore.serviceTypes"
          :key="s.id"
          :label="s.name"
          :value="s.id"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="详情" prop="detail">
      <el-input
        v-model="localModelValue.detail"
        type="textarea"
        :rows="4"
        placeholder="请输入工单详情"
        :maxlength="500"
        show-word-limit
      />
    </el-form-item>

    <el-form-item label="分值" prop="scoreLevel">
      <el-radio-group v-model="localModelValue.scoreLevel" :class="{ 'radio-group-inline': isMobile }">
        <el-radio value="SIMPLE" :class="{ 'radio-item-inline': isMobile }">
          简单 {{ !isMobile ? '(0.5)' : '' }}
        </el-radio>
        <el-radio value="NORMAL" :class="{ 'radio-item-inline': isMobile }">
          一般 {{ !isMobile ? '(1)' : '' }}
        </el-radio>
        <el-radio value="COMPLEX" :class="{ 'radio-item-inline': isMobile }">
          复杂 {{ !isMobile ? '(-)' : '' }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { CreateWorkOrderDto, Customer } from '@/types';
import { useBaseDataStore } from '@/stores/baseData';

interface Props {
  modelValue: CreateWorkOrderDto;
  rules: FormRules;
  customers: Customer[];
  onSearch: (query: string) => void;
  isMobile?: boolean; // To adjust styling if needed
}

const props = withDefaults(defineProps<Props>(), {
  isMobile: false,
});

const baseDataStore = useBaseDataStore();
const formRef = ref<FormInstance>();
// Alias the reactive modelValue so v-model binds to a local name (parent holds the same reactive object by reference)
const localModelValue = props.modelValue;

const labelPosition = props.isMobile ? 'top' : 'right';
const labelWidth = props.isMobile ? 'auto' : '80px';

// Expose validate methods
type FormValidateCallback = (isValid: boolean) => void;
type FormItemProp = string | string[];

defineExpose({
  validate: (callback?: FormValidateCallback) => formRef.value?.validate(callback),
  validateField: (props?: FormItemProp, callback?: FormValidateCallback) => formRef.value?.validateField(props, callback),
  resetFields: () => formRef.value?.resetFields(),
  clearValidate: (props?: FormItemProp) => formRef.value?.clearValidate(props),
});
</script>

<style scoped>
.radio-group-inline {
  display: flex;
  flex-wrap: wrap;
}

.radio-item-inline {
  margin-right: 16px;
  margin-bottom: 8px;
}

.customer-option {
  display: flex;
  align-items: center;
  width: 100%;
}

.customer-option span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  /* Mobile safety: ensure it doesn't exceed screen width even if dropdown tries to grow */
  max-width: 70vw; 
}

@media (min-width: 768px) {
  .customer-option span {
    max-width: 100%; /* Context is usually safer on desktop, but explicit limit helps */
  }
}
</style>
