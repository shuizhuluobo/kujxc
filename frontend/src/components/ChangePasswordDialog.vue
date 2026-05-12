<template>
  <el-dialog
    v-model="visible"
    title="修改初始密码"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    center
    append-to-body
  >
    <div class="dialog-content">
      <el-alert
        title="为了账号安全，请修改初始密码"
        type="warning"
        :closable="false"
        show-icon
        class="mb-4"
      />
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        status-icon
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input
            v-model="form.oldPassword"
            type="password"
            placeholder="请输入当前密码 (默认 123456)"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确认修改并登录
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { usersApi } from '@/api';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success'): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const validatePass2 = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== form.newPassword) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
};

const passwordComplexityValidator = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入新密码'));
  } else if (value.length < 8) {
    callback(new Error('密码长度至少8位'));
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value)) {
    callback(new Error('密码必须包含大小写字母、数字和特殊字符(@$!%*?&)'));
  } else {
    callback();
  }
};

const rules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, validator: passwordComplexityValidator, trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' },
  ],
};

async function handleSubmit() {
  if (!formRef.value) return;
  
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  if (form.oldPassword === form.newPassword) {
    ElMessage.warning('新密码不能与旧密码相同');
    return;
  }
  
  loading.value = true;
  try {
    await usersApi.changePassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
    });
    
    ElMessage.success('密码修改成功，请尽情使用');
    emit('success');
    visible.value = false;
  } catch {
    // Error handled by global interceptor
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.mb-4 {
  margin-bottom: 20px;
}
.dialog-footer {
  display: flex;
  justify-content: center;
}
</style>
