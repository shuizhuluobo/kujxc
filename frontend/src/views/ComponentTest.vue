<template>
  <div class="test-page">
    <div class="test-header">
      <h1>组件库混合测试</h1>
      <p>当前平台: <strong>{{ platform }}</strong></p>
      <p>屏幕宽度: <strong>{{ screenWidth }}px</strong></p>
    </div>

    <div class="test-section">
      <h2>1. 抽屉组件测试</h2>
      <div class="button-group">
        <!-- 桌面端使用 Element Plus Drawer -->
        <el-button 
          v-if="!isMobileDevice" 
          type="primary" 
          @click="elDrawerVisible = true"
        >
          打开 Element Plus 抽屉 (桌面端)
        </el-button>

        <!-- 移动端使用 Vant Popup -->
        <van-button 
          v-if="isMobileDevice" 
          type="primary" 
          @click="vanDrawerVisible = true"
        >
          打开 Vant 抽屉 (移动端)
        </van-button>

        <!-- 通用按钮 - 自动选择 -->
        <el-button type="success" @click="autoDrawerVisible = true">
          自动选择抽屉组件
        </el-button>
      </div>

      <!-- Element Plus Drawer -->
      <el-drawer
        v-model="elDrawerVisible"
        title="Element Plus 抽屉"
        direction="ltr"
        size="300px"
      >
        <div class="drawer-content">
          <p>这是 Element Plus 的抽屉组件</p>
          <p>适合桌面端使用</p>
          <el-button type="primary" @click="elDrawerVisible = false">关闭</el-button>
        </div>
      </el-drawer>

      <!-- Vant Popup (作为抽屉) -->
      <van-popup
        v-model:show="vanDrawerVisible"
        position="left"
        :style="{ width: '80%', height: '100%' }"
      >
        <div class="van-drawer-content">
          <div class="van-drawer-header">
            <h3>Vant 抽屉</h3>
            <van-icon name="cross" @click="vanDrawerVisible = false" />
          </div>
          <div class="van-drawer-body">
            <p>这是 Vant 的 Popup 组件</p>
            <p>适合移动端使用，支持触摸手势</p>
            <van-button type="primary" block @click="vanDrawerVisible = false">
              关闭
            </van-button>
          </div>
        </div>
      </van-popup>

      <!-- 自动选择的抽屉 -->
      <component 
        :is="isMobileDevice ? 'van-popup' : 'el-drawer'"
        v-bind="autoDrawerProps"
        v-model="autoDrawerVisible"
        v-model:show="autoDrawerVisible"
      >
        <div :class="isMobileDevice ? 'van-drawer-content' : 'drawer-content'">
          <div v-if="isMobileDevice" class="van-drawer-header">
            <h3>自动选择的抽屉</h3>
            <van-icon name="cross" @click="autoDrawerVisible = false" />
          </div>
          <div :class="isMobileDevice ? 'van-drawer-body' : ''">
            <p>当前使用: {{ isMobileDevice ? 'Vant Popup' : 'Element Plus Drawer' }}</p>
            <p>根据设备类型自动选择最合适的组件</p>
            <component
              :is="isMobileDevice ? 'van-button' : 'el-button'"
              type="primary"
              :block="isMobileDevice"
              @click="autoDrawerVisible = false"
            >
              关闭
            </component>
          </div>
        </div>
      </component>
    </div>

    <div class="test-section">
      <h2>2. 按钮组件测试</h2>
      <div class="button-group">
        <el-button type="primary">Element Plus 按钮</el-button>
        <van-button type="primary">Vant 按钮</van-button>
      </div>
    </div>

    <div class="test-section">
      <h2>3. 消息提示测试</h2>
      <div class="button-group">
        <el-button @click="showElMessage">Element Plus 消息</el-button>
        <van-button @click="showVanToast">Vant 轻提示</van-button>
      </div>
    </div>

    <div class="test-section">
      <h2>4. 对话框测试</h2>
      <div class="button-group">
        <el-button @click="elDialogVisible = true">Element Plus 对话框</el-button>
        <van-button @click="vanDialogVisible = true">Vant 对话框</van-button>
      </div>

      <el-dialog v-model="elDialogVisible" title="Element Plus 对话框" width="400px">
        <p>这是 Element Plus 的对话框</p>
        <template #footer>
          <el-button @click="elDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="elDialogVisible = false">确定</el-button>
        </template>
      </el-dialog>

      <van-dialog
        v-model:show="vanDialogVisible"
        title="Vant 对话框"
        show-cancel-button
      >
        <div style="padding: 20px;">
          <p>这是 Vant 的对话框</p>
        </div>
      </van-dialog>
    </div>

    <div class="test-section">
      <h2>5. 性能信息</h2>
      <div class="info-card">
        <p><strong>Bundle 信息:</strong></p>
        <ul>
          <li>Element Plus: 已加载</li>
          <li>Vant: 已加载</li>
          <li>按需引入: 是</li>
        </ul>
        <p><strong>建议:</strong></p>
        <ul>
          <li>桌面端优先使用 Element Plus</li>
          <li>移动端优先使用 Vant</li>
          <li>通过动态组件实现自动切换</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  Button as VanButton, 
  Popup as VanPopup, 
  Icon as VanIcon,
  Dialog as VanDialog,
  showToast 
} from 'vant';
import { shouldUseMobileUI } from '@/utils/platform';

const elDrawerVisible = ref(false);
const vanDrawerVisible = ref(false);
const autoDrawerVisible = ref(false);
const elDialogVisible = ref(false);
const vanDialogVisible = ref(false);

const screenWidth = ref(window.innerWidth);
const isMobileDevice = computed(() => shouldUseMobileUI());
const platform = computed(() => isMobileDevice.value ? '移动端' : '桌面端');

// 自动选择抽屉的属性
const autoDrawerProps = computed(() => {
  if (isMobileDevice.value) {
    return {
      position: 'left',
      style: { width: '80%', height: '100%' }
    };
  } else {
    return {
      title: '自动选择的抽屉',
      direction: 'ltr',
      size: '300px'
    };
  }
});

const showElMessage = () => {
  ElMessage.success('这是 Element Plus 的消息提示');
};

const showVanToast = () => {
  showToast('这是 Vant 的轻提示');
};

const handleResize = () => {
  screenWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.test-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.test-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.test-header h1 {
  margin: 0 0 16px;
  font-size: 28px;
}

.test-header p {
  margin: 8px 0;
  font-size: 16px;
}

.test-section {
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-section h2 {
  margin: 0 0 20px;
  font-size: 20px;
  color: #333;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.drawer-content,
.van-drawer-body {
  padding: 20px;
}

.van-drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.van-drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.van-drawer-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.van-drawer-header .van-icon {
  font-size: 20px;
  color: #666;
  cursor: pointer;
}

.van-drawer-body {
  flex: 1;
  overflow-y: auto;
}

.info-card {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  line-height: 1.8;
}

.info-card ul {
  margin: 8px 0;
  padding-left: 24px;
}

.info-card li {
  margin: 4px 0;
}

@media (max-width: 768px) {
  .test-page {
    padding: 16px;
  }

  .test-header {
    padding: 20px 16px;
  }

  .test-header h1 {
    font-size: 24px;
  }

  .test-header p {
    font-size: 14px;
  }

  .test-section {
    padding: 16px;
  }

  .test-section h2 {
    font-size: 18px;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .el-button,
  .button-group .van-button {
    width: 100%;
  }
}
</style>
