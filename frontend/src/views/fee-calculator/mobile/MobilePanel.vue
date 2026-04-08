<template>
  <div class="mobile-calculator">
    <div class="header">
      <h2>公务仓费用计算器</h2>
      <el-button type="primary" size="small" :icon="Setting" @click="showSettings = true">设置</el-button>
    </div>

    <el-collapse v-model="activePanels" class="service-collapse">
      <el-collapse-item title="计算机服务" name="computer">
        <div class="count-section">
          <span>数量：</span>
          <el-input-number v-model="computerCount" :min="0" :max="9999" size="small" />
          <span class="unit">台</span>
        </div>
        
        <div class="service-list">
          <div 
            v-for="name in computerServiceList" 
            :key="name"
            class="service-item"
            :class="{ disabled: computerServiceMap[name]?.disabled }"
          >
            <el-checkbox 
              v-model="computerServiceMap[name].selected" 
              :disabled="computerServiceMap[name]?.disabled"
              @change="onComputerServiceChange(computerServiceMap[name])"
            >
              {{ name }}
            </el-checkbox>
            <span class="price-tag">{{ getComputerPriceText(name) }}</span>
          </div>
        </div>
      </el-collapse-item>

      <el-collapse-item title="附加费用" name="additional">
        <el-checkbox v-model="additionalFeeEnabled" @change="onItemChange">启用附加费用</el-checkbox>
        <div v-if="additionalFeeEnabled" class="additional-inputs">
          <div class="input-row">
            <span>金额：</span>
            <el-input-number v-model="additionalFeeAmount" :min="0" :precision="2" size="small" />
            <span>元</span>
          </div>
          <el-input v-model="additionalFeeRemark" placeholder="说明" size="small" />
        </div>
      </el-collapse-item>

      <el-collapse-item title="外设服务" name="peripheral">
        <div class="sub-section">
          <h4>安装</h4>
          <div v-for="item in peripheralInstallServices" :key="item.id" class="service-item">
            <el-checkbox v-model="item.selected" @change="onPeripheralChange(item)">
              {{ item.item }}
            </el-checkbox>
            <span class="price-tag">{{ item.price }}元/{{ item.unit }}</span>
            <div v-if="item.selected" class="qty-control">
              <el-input-number v-model="item.quantity" :min="1" size="small" />
              <span>台</span>
            </div>
          </div>
        </div>
        <div class="sub-section">
          <h4>回收</h4>
          <div v-for="item in peripheralRecycleServices" :key="item.id" class="service-item">
            <el-checkbox v-model="item.selected" @change="onPeripheralChange(item)">
              {{ item.item }}
            </el-checkbox>
            <span class="price-tag">{{ item.price }}元/{{ item.unit }}</span>
            <div v-if="item.selected" class="qty-control">
              <el-input-number v-model="item.quantity" :min="1" size="small" />
              <span>台</span>
            </div>
          </div>
        </div>
      </el-collapse-item>

      <el-collapse-item title="服务时段" name="timeslot">
        <div class="option-list">
          <div 
            v-for="item in timeSlotServices" 
            :key="item.id"
            class="option-item"
            :class="{ selected: selectedTimeSlot === item.id }"
            @click="selectTimeSlot(item.id)"
          >
            <el-radio v-model="selectedTimeSlot" :label="item.id">
              {{ item.item }}
            </el-radio>
            <span class="price-tag">{{ item.price === 0 ? '免费' : '+' + item.price + '元' }}</span>
          </div>
        </div>
      </el-collapse-item>

      <el-collapse-item title="响应时效" name="response">
        <div class="option-list">
          <div 
            v-for="item in responseServices" 
            :key="item.id"
            class="option-item"
            :class="{ selected: selectedResponse === item.id }"
            @click="selectResponse(item.id)"
          >
            <el-radio v-model="selectedResponse" :label="item.id">
              {{ item.item }}
            </el-radio>
            <span class="price-tag">{{ item.price === 0 ? '免费' : item.price + '元' }}</span>
          </div>
        </div>
      </el-collapse-item>

      <el-collapse-item title="交通费" name="transport">
        <div class="option-list">
          <div 
            v-for="item in transportServices" 
            :key="item.id"
            class="option-item"
            :class="{ selected: item.selected }"
          >
            <el-checkbox v-model="item.selected" @change="onItemChange">
              {{ item.item }}
            </el-checkbox>
            <span class="price-tag">{{ item.price }}元</span>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>

    <div class="result-bar">
      <div class="result-info">
        <span class="label">实收：</span>
        <span class="amount">{{ actualAmount }}元</span>
      </div>
      <div class="bar-actions">
        <el-button type="primary" @click="showDetail = true">明细</el-button>
        <el-button type="primary" @click="saveRecord" :disabled="selectedItems.length === 0">保存</el-button>
      </div>
    </div>

    <el-drawer v-model="showSettings" title="费用设置" size="80%" direction="btt">
      <div class="settings-panel">
        <h4>单价设置</h4>
        <el-table :data="allSettings" stripe size="small" max-height="60vh">
          <el-table-column prop="category" label="类别" width="80" />
          <el-table-column prop="item" label="项目" />
          <el-table-column label="价格" width="80">
            <template #default="{ row }">
              <el-input-number v-model="row.price" :min="0" size="small" @change="updateSetting(row)" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>

    <el-drawer v-model="showDetail" title="费用明细" size="80%" direction="btt">
      <div class="detail-panel">
        <div v-for="item in selectedItems" :key="item.id" class="detail-item">
          <span>{{ item.displayText }}</span>
          <span>{{ item.total }}元</span>
        </div>
        <el-divider />
        <div class="detail-summary">
          <div class="summary-row">
            <span>小计：</span>
            <span>{{ subtotal }}元</span>
          </div>
          <div class="summary-row">
            <span>折扣：</span>
            <el-input-number v-model="discount" :min="0" :max="subtotal" size="small" />
          </div>
          <div class="summary-row total">
            <span>实收：</span>
            <el-input-number v-model="actualAmount" :min="0" size="small" />
          </div>
        </div>
        <el-input v-model="remark" type="textarea" :rows="2" placeholder="备注" />
        <el-button type="primary" @click="resetCalculator" class="reset-btn">重置</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Setting } from '@element-plus/icons-vue';
import { useFeeCalculator } from '../composables/useFeeCalculator';

const activePanels = ref(['computer']);

const showSettings = ref(false);
const showDetail = ref(false);

const computerServiceList = ['出库送货', '安装就位', '回收转运', '脱密入库', '出库到就位', '回收到入库', '全流程服务'];

const {
  computerCount,
  discount,
  actualAmount,
  remark,
  records,
  allSettings,
  selectedResponse,
  selectedTimeSlot,
  additionalFeeEnabled,
  additionalFeeAmount,
  additionalFeeRemark,
  peripheralInstallServices,
  peripheralRecycleServices,
  responseServices,
  timeSlotServices,
  transportServices,
  computerServiceMap,
  selectedItems,
  subtotal,
  getComputerPrice,
  onItemChange,
  onComputerServiceChange,
  onPeripheralChange,
  selectResponse,
  selectTimeSlot,
  updateSetting,
  saveRecord,
  resetCalculator,
  loadRecords,
  formatDate,
  init,
} = useFeeCalculator();

const getComputerPriceText = (name: string) => {
  const item = computerServiceMap.value[name];
  if (!item) return '';
  if (name === '出库到就位') {
    return `≤5台${item.priceSmall || 150}元/次,>5台${item.priceLarge || 40}元/台`;
  }
  if (name === '出库送货' || name === '回收转运') {
    return `≤5台${item.priceSmall || 100}元/次,>5台${item.priceLarge || 20}元/台`;
  }
  if (name === '全流程服务' || name === '回收到入库') {
    return `${item.priceSmall || 200}元/台`;
  }
  return `${item.priceSmall || 20}元/台`;
};

init();
</script>

<style scoped>
.mobile-calculator {
  padding: 12px;
  padding-bottom: 80px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header h2 {
  font-size: 18px;
  margin: 0;
}

.service-collapse {
  margin-bottom: 12px;
}

.count-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px;
  background: var(--bg-color-page);
  border-radius: 4px;
}

.count-section .unit {
  color: var(--text-secondary);
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--bg-color-page);
  border-radius: 4px;
}

.service-item.disabled {
  opacity: 0.5;
}

.price-tag {
  font-size: 12px;
  color: var(--primary-color);
  margin-left: auto;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
}

.qty-control .unit {
  font-size: 12px;
  color: var(--text-secondary);
}

.sub-section {
  margin-bottom: 12px;
}

.sub-section h4 {
  font-size: 14px;
  margin: 8px 0;
  color: var(--text-secondary);
}

.option-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: var(--bg-color-page);
  border-radius: 4px;
}

.option-item.selected {
  background: var(--primary-color-light);
}

.history-section {
  margin-bottom: 60px;
}

.history-section h3 {
  font-size: 16px;
  margin: 0 0 12px;
}

.result-bar {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.result-info .label {
  font-size: 14px;
}

.result-info .amount {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-color);
}

.bar-actions {
  display: flex;
  gap: 8px;
}

.settings-panel h4, .detail-panel h4 {
  margin: 0 0 12px;
}

.detail-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed var(--border-color-lighter);
}

.detail-summary .summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detail-summary .total {
  font-weight: 600;
  font-size: 16px;
}

.reset-btn {
  margin-top: 12px;
}

.additional-inputs {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.additional-inputs .input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>