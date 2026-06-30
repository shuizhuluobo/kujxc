<template>
  <div class="login-container">
    <div class="login-decoration" />
    <div class="login-content">
      <transition name="fade" appear>
        <div class="login-card">
          <div class="login-header">
            <img src="/ku_main_logo.png" alt="Logo" class="login-logo" />
            <h1>工单管理系统</h1>
            <p>Work Order Management System</p>
          </div>
          
          <el-form 
            ref="formRef"
            :model="form" 
            :rules="rules"
            @submit.prevent="handleLogin"
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="form.username"
                placeholder="用户名"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="密码"
                size="large"
                :prefix-icon="LockIcon"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                @click="handleLogin"
                class="login-btn"
              >
                登 录
              </el-button>
            </el-form-item>
          </el-form>
          
          <div class="login-footer">
            <span>&copy;Luobo 2026</span>
          </div>
        </div>
      </transition>
    </div>
    
    <ChangePasswordDialog
      v-model="showPasswordDialog"
      @success="handlePasswordChangeSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { User, Lock as LockIcon } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import { hasPermission } from '@/config/permissions';
import ChangePasswordDialog from '@/components/ChangePasswordDialog.vue';

const router = useRouter();
const authStore = useAuthStore();

const formRef = ref<FormInstance>();
const loading = ref(false);
const showPasswordDialog = ref(false);

const form = reactive({
  username: '',
  password: '',
});

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
  ],
};

// 根据用户权限确定跳转页面
function getRedirectPath(): string {
  const permissions = authStore.user?.role?.permissions || [];
  const isSuper = permissions.includes('*');
  
  if (isSuper) return '/';
  
  // 检查各页面权限，返回第一个有权限的页面
  if (hasPermission(permissions, 'workOrder:list')) return '/';
  if (hasPermission(permissions, 'wiki:list')) return '/wiki';

  if (hasPermission(permissions, 'customer:list')) return '/admin/customers';
  
  // 默认跳转到个人中心（这个页面应该总是允许访问）
  return '/profile';
}

async function handleLogin() {
  if (!formRef.value) return;
  
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  
  loading.value = true;
  try {
    await authStore.login(form);
    
    if (authStore.mustChangePassword) {
      showPasswordDialog.value = true;
    } else {
      ElMessage.success('登录成功');
      void router.push(getRedirectPath());
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    ElMessage.error(err.response?.data?.message || '登录失败');
  } finally {
    loading.value = false;
  }
}

function handlePasswordChangeSuccess() {
  authStore.mustChangePassword = false;
  void router.push(getRedirectPath());
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-color) 0%, var(--border-color) 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* 装饰背景 */
.login-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-image: 
    radial-gradient(at 0% 0%, hsla(var(--primary-h), 80%, 90%, 1) 0px, transparent 50%),
    radial-gradient(at 100% 100%, hsla(var(--primary-h), 60%, 90%, 1) 0px, transparent 50%);
  opacity: 0.6;
}

.login-content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
}

.login-card {
  background: var(--card-bg);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 0 0 1px var(--border-color-lighter) inset;
  transition: box-shadow 0.3s ease;
}

.login-card:hover {
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05),
    0 0 0 1px var(--border-color-lighter) inset;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-logo {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  margin: 0 auto 24px;
  object-fit: contain;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.login-header p {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 12px 16px;
  background-color: var(--bg-color);
  box-shadow: 0 0 0 1px var(--border-color) inset !important;
}

.login-form :deep(.el-input__wrapper:focus-within) {
  background-color: var(--card-bg);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2) inset, 0 0 0 1px var(--primary-color) inset !important;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-top: 8px;
  box-shadow: 0 4px 6px -1px rgba(var(--primary-rgb), 0.4);
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(var(--primary-rgb), 0.4);
}

.login-footer {
  text-align: center;
  margin-top: 32px;
  font-size: 12px;
  color: var(--text-tertiary);
}

@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
}
</style>
