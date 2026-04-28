import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import api from '@/api/client';
import { useAuthStore } from '@/stores/auth';
import type { FeeSetting, FeeRecord } from '@/api';

export interface ServiceItem {
  id: string;
  category: string;
  item: string;
  unit: string;
  price: number;
  priceSmall: number;
  priceLarge: number;
  unitSmall: string;
  unitLarge: string;
  quantity: number;
  total: number;
  selected: boolean;
  disabled: boolean;
  description?: string;
  terminalCount?: number;
}

export interface SelectedItem {
  id: string;
  displayText: string;
  total: number;
  item: string;
  quantity: number;
}

const serviceInclusionMap: Record<string, string[]> = {
  '出库到就位': ['出库送货', '安装就位'],
  '回收到入库': ['回收转运', '脱密入库'],
  '全流程服务': ['出库送货', '安装就位', '回收转运', '脱密入库'],
};

export function useFeeCalculator() {
  const authStore = useAuthStore();

  // 基础状态
  const computerCount = ref(0);
  const discount = ref(0);
  const actualAmount = ref(0);
  const remark = ref('');
  const records = ref<FeeRecord[]>([]);
  const allSettings = ref<FeeSetting[]>([]);
  const showSettings = ref(false);
  const selectedResponse = ref<string>('');
  const selectedTimeSlot = ref<string>('');

  // 附加费用
  const additionalFeeEnabled = ref(false);
  const additionalFeeAmount = ref(0);
  const additionalFeeRemark = ref('');

  // 服务数据
  const computerServices = ref<ServiceItem[]>([]);
  const peripheralInstallServices = ref<ServiceItem[]>([]);
  const peripheralRecycleServices = ref<ServiceItem[]>([]);
  const responseServices = ref<ServiceItem[]>([]);
  const timeSlotServices = ref<ServiceItem[]>([]);
  const transportServices = ref<ServiceItem[]>([]);

  // 计算机服务状态存储
  const computerServiceState = ref<Record<string, { selected: boolean; disabled: boolean }>>({});

  const maxPeripheralRows = computed(() => {
    return Math.max(peripheralInstallServices.value.length, peripheralRecycleServices.value.length, 4);
  });

  const computerServiceMap = computed(() => {
    const map: Record<string, ServiceItem> = {};
    computerServices.value.forEach(s => {
      map[s.item] = s;
    });
    ['出库送货', '安装就位', '回收转运', '脱密入库', '出库到就位', '回收到入库', '全流程服务'].forEach(name => {
      if (!map[name]) {
        map[name] = {
          id: '',
          category: '',
          item: name,
          unit: '',
          price: 0,
          priceSmall: 0,
          priceLarge: 0,
          unitSmall: '',
          unitLarge: '',
          quantity: 0,
          total: 0,
          selected: computerServiceState.value[name]?.selected || false,
          disabled: computerServiceState.value[name]?.disabled || false,
        };
      } else {
        map[name].selected = computerServiceState.value[name]?.selected || false;
        map[name].disabled = computerServiceState.value[name]?.disabled || false;
      }
    });
    return map;
  });

  const getComputerPrice = (item: ServiceItem) => {
    if (!item) return 0;
    
    let priceSmall = item.priceSmall;
    let priceLarge = item.priceLarge;
    
    if ((!priceSmall || priceSmall === 0) && (!priceLarge || priceLarge === 0)) {
      if (item.item === '出库到就位') {
        priceSmall = 150;
        priceLarge = 40;
      } else if (item.item === '回收到入库') {
        priceSmall = 170;
        priceLarge = 170;
      } else if (item.item === '全流程服务') {
        priceSmall = 200;
        priceLarge = 200;
      } else {
        return 0;
      }
    }
    
    if (item.item === '全流程服务' || item.item === '回收到入库') {
      return priceSmall * computerCount.value;
    }
    
    if (computerCount.value <= 5 && (item.item === '出库送货' || item.item === '回收转运' || item.item === '出库到就位')) {
      return priceSmall;
    }
    
    return priceLarge * computerCount.value;
  };

  watch(computerCount, () => {
    onItemChange();
  });

  const selectedItems = computed((): SelectedItem[] => {
    const items: SelectedItem[] = [];
    
    const currentMap = computerServiceMap.value;
    const serviceNames = ['出库送货', '安装就位', '回收转运', '脱密入库', '出库到就位', '回收到入库', '全流程服务'];
    
    serviceNames.forEach(name => {
      const s = currentMap[name];
      if (s && s.selected) {
        const price = getComputerPrice(s);
        const qty = computerCount.value <= 5 && (s.item === '出库送货' || s.item === '回收转运' || s.item === '出库到就位') ? 1 : computerCount.value;
        items.push({
          id: s.id || name,
          displayText: s.item,
          total: price,
          item: s.item,
          quantity: qty,
        });
      }
    });

    peripheralInstallServices.value.filter(s => s.selected && s.quantity > 0).forEach(s => {
      let basePrice = s.price * s.quantity;
      let terminalFee = 0;
      let terminalCount = s.terminalCount || 0;
      
      if (s.item.includes('复印机') && terminalCount > 5) {
        terminalFee = (terminalCount - 5) * 10 * s.quantity;
      } else if (s.item.includes('打印机') && terminalCount > 3) {
        terminalFee = (terminalCount - 3) * 10 * s.quantity;
      }
      
      items.push({
        id: s.id,
        displayText: s.item,
        total: basePrice,
        item: s.item,
        quantity: s.quantity,
      });
      
      if (terminalFee > 0) {
        items.push({
          id: s.id + '-terminal',
          displayText: `${s.item}终端连接费`,
          total: terminalFee,
          item: s.item + '终端连接费',
          quantity: terminalCount > 5 ? terminalCount - 5 : terminalCount - 3,
        });
      }
    });

    peripheralRecycleServices.value.filter(s => s.selected && s.quantity > 0).forEach(s => {
      items.push({
        id: s.id,
        displayText: s.item,
        total: s.price * s.quantity,
        item: s.item,
        quantity: s.quantity,
      });
    });

    responseServices.value.filter(s => s.id === selectedResponse.value).forEach(s => {
      items.push({
        id: s.id,
        displayText: s.item,
        total: s.price,
        item: s.item,
        quantity: 1,
      });
    });

    timeSlotServices.value.filter(s => s.id === selectedTimeSlot.value).forEach(s => {
      items.push({
        id: s.id,
        displayText: s.item,
        total: s.price,
        item: s.item,
        quantity: 1,
      });
    });

    transportServices.value.filter(s => s.selected).forEach(s => {
      items.push({
        id: s.id,
        displayText: s.item,
        total: s.price,
        item: s.item,
        quantity: 1,
      });
    });

    if (additionalFeeEnabled.value && additionalFeeAmount.value > 0) {
      items.push({
        id: 'additional-fee',
        displayText: additionalFeeRemark.value || '附加费用',
        total: additionalFeeAmount.value,
        item: '附加费用',
        quantity: 1,
      });
    }

    return items;
  });

  const subtotal = computed(() => {
    return selectedItems.value.reduce((sum, item) => sum + item.total, 0);
  });

  const onItemChange = () => {
    actualAmount.value = subtotal.value - discount.value;
  };

  watch(discount, () => {
    actualAmount.value = subtotal.value - discount.value;
  });

  const updateComputerServiceDisabledState = () => {
    const currentMap = computerServiceMap.value;
    const serviceNames = ['出库送货', '安装就位', '回收转运', '脱密入库', '出库到就位', '回收到入库', '全流程服务'];
    
    serviceNames.forEach(name => {
      if (!computerServiceState.value[name]) {
        computerServiceState.value[name] = {
          selected: currentMap[name]?.selected || false,
          disabled: false
        };
      } else {
        computerServiceState.value[name].disabled = false;
      }
    });
    
    const selectedCombo = serviceNames.find(name => {
      const service = currentMap[name];
      return service && service.selected && ['出库到就位', '回收到入库', '全流程服务'].includes(name);
    });
    
    if (selectedCombo) {
      const includedItems = serviceInclusionMap[selectedCombo] || [];
      serviceNames.forEach(name => {
        if (includedItems.includes(name)) {
          computerServiceState.value[name].disabled = true;
        } else if (['出库到就位', '回收到入库', '全流程服务'].includes(name) && name !== selectedCombo) {
          computerServiceState.value[name].disabled = true;
        }
      });
    } else {
      const selectedSingleItems = serviceNames.filter(name => {
        const service = currentMap[name];
        return service && service.selected && !['出库到就位', '回收到入库', '全流程服务'].includes(name);
      });
      
      if (selectedSingleItems.length > 0) {
        serviceNames.forEach(name => {
          if (['出库到就位', '回收到入库', '全流程服务'].includes(name)) {
            const includedItems = serviceInclusionMap[name] || [];
            const hasConflict = selectedSingleItems.some(single => includedItems.includes(single));
            computerServiceState.value[name].disabled = hasConflict;
          }
        });
      }
    }
  };

  const onComputerServiceChange = (changedItem: ServiceItem) => {
    computerServiceState.value[changedItem.item] = {
      selected: changedItem.selected,
      disabled: changedItem.disabled
    };
    
    updateComputerServiceDisabledState();
    onItemChange();
  };

  const onPeripheralChange = (item: ServiceItem) => {
    if (item.selected && item.quantity === 0) {
      item.quantity = 1;
    }
    if (!item.selected) {
      item.quantity = 0;
    }
    onItemChange();
  };

  const selectResponse = (id: string) => {
    selectedResponse.value = id;
    onItemChange();
  };

  const selectTimeSlot = (id: string) => {
    selectedTimeSlot.value = id;
    onItemChange();
  };

  const updateSetting = async (item: FeeSetting) => {
    try {
      await api.put(`/fee/settings/${item.id}`, { price: item.price, isActive: item.isActive });
      ElMessage.closeAll();
      ElMessage.success('设置已更新');
    } catch (e: any) {
      ElMessage.closeAll();
      ElMessage.error('更新失败');
    }
  };

  const saveRecord = async () => {
    if (selectedItems.value.length === 0) {
      ElMessage.closeAll();
      ElMessage.warning('请选择服务项目');
      return;
    }
    const creatorId = authStore.user?.id;
    if (!creatorId) {
      ElMessage.closeAll();
      ElMessage.warning('无法获取用户信息，请重新登录');
      return;
    }
    try {
      const items = selectedItems.value.map(s => ({
        category: '',
        item: s.item,
        quantity: s.quantity,
        unitPrice: s.quantity > 0 ? s.total / s.quantity : s.total,
        total: s.total,
      }));
      await api.post('/fee/records', {
        items,
        subtotal: subtotal.value,
        discount: discount.value,
        actualAmount: actualAmount.value,
        remark: remark.value,
        creatorId,
      });
      ElMessage.closeAll();
      ElMessage.success('记录已保存');
      loadRecords();
      resetCalculator();
    } catch (e: any) {
      ElMessage.closeAll();
      ElMessage.error('保存失败');
    }
  };

  const resetCalculator = () => {
    computerCount.value = 0;
    computerServices.value.forEach(s => {
      s.selected = false;
      s.disabled = false;
    });
    peripheralInstallServices.value.forEach(s => {
      s.selected = false;
      s.quantity = 0;
      s.terminalCount = 0;
    });
    peripheralRecycleServices.value.forEach(s => {
      s.selected = false;
      s.quantity = 0;
      s.terminalCount = 0;
    });
    responseServices.value.forEach(s => s.selected = false);
    timeSlotServices.value.forEach(s => s.selected = false);
    transportServices.value.forEach(s => s.selected = false);
    selectedResponse.value = '';
    selectedTimeSlot.value = '';
    discount.value = 0;
    actualAmount.value = 0;
    remark.value = '';
    additionalFeeEnabled.value = false;
    additionalFeeAmount.value = 0;
    additionalFeeRemark.value = '';
  };

  const loadRecords = async () => {
    try {
      const res = await api.get('/fee/records');
      records.value = res.data as FeeRecord[];
    } catch (e: any) {
      console.error('Load records error:', e);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      await api.delete(`/fee/records/${id}`);
      ElMessage.closeAll();
      ElMessage.success('记录已删除');
      loadRecords();
    } catch (e: any) {
      ElMessage.closeAll();
      ElMessage.error('删除失败');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const loadSettings = async () => {
    try {
      const res = await api.get('/fee/settings');
      const data = res.data as FeeSetting[];
      allSettings.value = data;

      const computerItems: ServiceItem[] = [];
      
      const deliverySmall = data.find(s => s.item.includes('出库送货') && s.item.includes('≤5台'));
      const deliveryLarge = data.find(s => s.item.includes('出库送货') && s.item.includes('>5台'));
      if (deliverySmall && deliveryLarge) {
        computerItems.push({
          id: deliverySmall.id,
          category: '计算机单项服务',
          item: '出库送货',
          unit: deliverySmall.unit,
          priceSmall: deliverySmall.price,
          priceLarge: deliveryLarge.price,
          unitSmall: '次',
          unitLarge: '台',
          price: deliverySmall.price,
          quantity: 0,
          total: 0,
          selected: false,
          disabled: false,
          description: deliverySmall.description || deliveryLarge.description,
        });
      }
      
      const install = data.find(s => s.item.includes('安装就位'));
      if (install) {
        computerItems.push({
          id: install.id,
          category: '计算机单项服务',
          item: '安装就位',
          unit: install.unit,
          priceSmall: install.price,
          priceLarge: install.price,
          unitSmall: '台',
          unitLarge: '台',
          price: install.price,
          quantity: 0,
          total: 0,
          selected: false,
          disabled: false,
          description: install.description,
        });
      }
      
      const recycleSmall = data.find(s => s.item.includes('回收转运') && s.item.includes('≤5台'));
      const recycleLarge = data.find(s => s.item.includes('回收转运') && s.item.includes('>5台'));
      if (recycleSmall && recycleLarge) {
        computerItems.push({
          id: recycleSmall.id,
          category: '计算机单项服务',
          item: '回收转运',
          unit: recycleSmall.unit,
          priceSmall: recycleSmall.price,
          priceLarge: recycleLarge.price,
          unitSmall: '次',
          unitLarge: '台',
          price: recycleSmall.price,
          quantity: 0,
          total: 0,
          selected: false,
          disabled: false,
          description: recycleSmall.description || recycleLarge.description,
        });
      }
      
      const secure = data.find(s => s.item.includes('脱密装箱入库'));
      if (secure) {
        computerItems.push({
          id: secure.id,
          category: '计算机单项服务',
          item: '脱密入库',
          unit: secure.unit,
          priceSmall: secure.price,
          priceLarge: secure.price,
          unitSmall: '台',
          unitLarge: '台',
          price: secure.price,
          quantity: 0,
          total: 0,
          selected: false,
          disabled: false,
          description: secure.description,
        });
      }

      const deliveryInstallSmall = data.find(s => s.category === '计算机设备组合服务' && s.item.includes('出库到就位') && !s.item.includes('>5台'));
      const deliveryInstallLarge = data.find(s => s.category === '计算机设备组合服务' && s.item.includes('出库到就位') && s.item.includes('>5台'));
      if (deliveryInstallSmall && deliveryInstallLarge) {
        computerItems.push({
          id: deliveryInstallSmall.id,
          category: '计算机组合服务',
          item: '出库到就位',
          unit: deliveryInstallSmall.unit,
          priceSmall: deliveryInstallSmall.price,
          priceLarge: deliveryInstallLarge.price,
          unitSmall: '次',
          unitLarge: '台',
          price: deliveryInstallSmall.price,
          quantity: 0,
          total: 0,
          selected: false,
          disabled: false,
          description: deliveryInstallSmall.description || deliveryInstallLarge.description,
        });
      }
      
      const recycleSecure = data.find(s => s.category === '计算机设备组合服务' && s.item.includes('回收到入库'));
      if (recycleSecure) {
        computerItems.push({
          id: recycleSecure.id,
          category: '计算机组合服务',
          item: '回收到入库',
          unit: recycleSecure.unit,
          priceSmall: recycleSecure.price,
          priceLarge: recycleSecure.price,
          unitSmall: '台',
          unitLarge: '台',
          price: recycleSecure.price,
          quantity: 0,
          total: 0,
          selected: false,
          disabled: false,
          description: recycleSecure.description,
        });
      }
      
      const fullService = data.find(s => s.category === '计算机设备组合服务' && s.item.includes('全流程服务'));
      if (fullService) {
        computerItems.push({
          id: fullService.id,
          category: '计算机组合服务',
          item: '全流程服务',
          unit: fullService.unit,
          priceSmall: fullService.price,
          priceLarge: fullService.price,
          unitSmall: '台',
          unitLarge: '台',
          price: fullService.price,
          quantity: 0,
          total: 0,
          selected: false,
          disabled: false,
          description: fullService.description,
        });
      }

      computerServices.value = computerItems;

      peripheralInstallServices.value = data
        .filter(s => s.category === '外设安装')
        .map(s => ({
          id: s.id,
          category: s.category,
          item: s.item,
          unit: s.unit,
          price: s.price,
          priceSmall: s.price,
          priceLarge: s.price,
          unitSmall: s.unit,
          unitLarge: s.unit,
          quantity: 0,
          total: 0,
          selected: false,
          disabled: false,
          terminalCount: 0,
        }));

      peripheralRecycleServices.value = data
        .filter(s => s.category === '外设回收')
        .map(s => ({
          id: s.id,
          category: s.category,
          item: s.item,
          unit: s.unit,
          price: s.price,
          priceSmall: s.price,
          priceLarge: s.price,
          unitSmall: s.unit,
          unitLarge: s.unit,
          quantity: 0,
          total: 0,
          selected: false,
          disabled: false,
          terminalCount: 0,
        }));

      responseServices.value = data
        .filter(s => s.category === '响应时效')
        .map(s => {
          let description = s.description;
          if (s.item.includes('加急')) {
            description = '当前工作日响应';
          } else if (s.item.includes('立即')) {
            description = '2小时内响应';
          }
          return {
            id: s.id,
            category: s.category,
            item: s.item,
            unit: s.unit,
            price: s.price,
            priceSmall: s.price,
            priceLarge: s.price,
            unitSmall: s.unit,
            unitLarge: s.unit,
            quantity: 0,
            total: 0,
            selected: false,
            disabled: false,
            description: description,
          };
        });
      const defaultResponse = responseServices.value.find(s => s.price === 0);
      if (defaultResponse) {
        selectedResponse.value = defaultResponse.id;
      }

      timeSlotServices.value = data
        .filter(s => s.category === '服务时段')
        .map(s => ({
          id: s.id,
          category: s.category,
          item: s.item,
          unit: s.unit,
          price: s.price,
          priceSmall: s.price,
          priceLarge: s.price,
          unitSmall: s.unit,
          unitLarge: s.unit,
          quantity: 0,
          total: 0,
          selected: false,
          disabled: false,
          description: s.description,
        }));
      const defaultTimeSlot = timeSlotServices.value.find(s => s.price === 0);
      if (defaultTimeSlot) {
        selectedTimeSlot.value = defaultTimeSlot.id;
      }

      transportServices.value = data
        .filter(s => s.category === '交通费')
        .map(s => ({
          id: s.id,
          category: s.category,
          item: s.item,
          unit: s.unit,
          price: s.price,
          priceSmall: s.price,
          priceLarge: s.price,
          unitSmall: s.unit,
          unitLarge: s.unit,
          quantity: 0,
          total: 0,
          selected: false,
          disabled: false,
          description: s.description,
        }));

    } catch (e: any) {
      console.error('Load settings error:', e);
      try {
        await api.post('/fee/settings/init');
        loadSettings();
      } catch (err: any) {
        ElMessage.closeAll();
        ElMessage.error('加载费用设置失败');
      }
    }
  };

  const init = async () => {
    await loadSettings();
    await loadRecords();
  };

  return {
    // 状态
    computerCount,
    discount,
    actualAmount,
    remark,
    records,
    allSettings,
    showSettings,
    selectedResponse,
    selectedTimeSlot,
    additionalFeeEnabled,
    additionalFeeAmount,
    additionalFeeRemark,
    // 服务数据
    computerServices,
    peripheralInstallServices,
    peripheralRecycleServices,
    responseServices,
    timeSlotServices,
    transportServices,
    // 计算属性
    maxPeripheralRows,
    computerServiceMap,
    selectedItems,
    subtotal,
    // 方法
    getComputerPrice,
    onItemChange,
    updateComputerServiceDisabledState,
    onComputerServiceChange,
    onPeripheralChange,
    selectResponse,
    selectTimeSlot,
    updateSetting,
    saveRecord,
    deleteRecord,
    resetCalculator,
    loadRecords,
    formatDate,
    loadSettings,
    init,
  };
}