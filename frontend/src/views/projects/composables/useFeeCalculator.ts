import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import api from '@/api/client';
import { performanceApi } from '@/api';
import type { FeeSetting, FeeRecord, FeeRecordsResult } from '@/api';

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
  // 当前所属项目与客户（公物仓计费场景必填）
  const currentProjectId = ref<string>('');
  const selectedCustomerId = ref<string>('');

  // 附加费用
  const additionalFeeEnabled = ref(false);
  const additionalFeeAmount = ref(0);
  const additionalFeeRemark = ref('');

  // 服务数据
  const computerServices = ref<ServiceItem[]>([]);
  const peripheralInstallServices = ref<ServiceItem[]>([]);
  const peripheralRecycleServices = ref<ServiceItem[]>([]);
  const peripheralDeliveryServices = ref<ServiceItem[]>([]);
  const responseServices = ref<ServiceItem[]>([]);
  const timeSlotServices = ref<ServiceItem[]>([]);
  const transportServices = ref<ServiceItem[]>([]);

  // 计算机服务状态存储
  const computerServiceState = ref<Record<string, { selected: boolean; disabled: boolean }>>({});

  // 外设服务状态存储（按设备类型）
  const peripheralServiceState = ref<Record<string, { selected: boolean; disabled: boolean }>>({});

  const maxPeripheralRows = computed(() => {
    return Math.max(
      peripheralInstallServices.value.length, 
      peripheralRecycleServices.value.length,
      peripheralDeliveryServices.value.length, 
      4
    );
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
    // 计算机服务名称到显示文本的映射（更明确的服务描述）
    const computerDisplayNames: Record<string, string> = {
      '出库送货': '计算机出库送货',
      '安装就位': '计算机安装就位',
      '回收转运': '计算机回收转运',
      '脱密入库': '计算机脱密入库',
      '出库到就位': '计算机出库送货安装',
      '回收到入库': '计算机回收到入库',
      '全流程服务': '计算机全流程服务',
    };
    const serviceNames = ['出库送货', '安装就位', '回收转运', '脱密入库', '出库到就位', '回收到入库', '全流程服务'];
    
    serviceNames.forEach(name => {
      const s = currentMap[name];
      if (s && s.selected) {
        const price = getComputerPrice(s);
        const qty = computerCount.value <= 5 && (s.item === '出库送货' || s.item === '回收转运' || s.item === '出库到就位') ? 1 : computerCount.value;
        items.push({
          id: s.id || name,
          displayText: computerDisplayNames[s.item] || s.item,
          total: price,
          item: computerDisplayNames[s.item] || s.item,
          quantity: qty,
        });
      }
    });

    // 外设安装服务（安装包含送货）
    peripheralInstallServices.value.filter(s => s.selected && s.quantity > 0).forEach(s => {
      let basePrice = s.price * s.quantity;
      let terminalFee = 0;
      let terminalCount = s.terminalCount || 0;
      
      if (s.item.includes('复印机') && terminalCount > 5) {
        terminalFee = (terminalCount - 5) * 10 * s.quantity;
      } else if (s.item.includes('打印机') && terminalCount > 3) {
        terminalFee = (terminalCount - 3) * 10 * s.quantity;
      }
      
      // 根据设备类型生成显示名称（安装含送货）
      let displayName = s.item;
      if (s.item.includes('复印机')) {
        displayName = '复印机出库送货安装';
      } else if (s.item.includes('打印机')) {
        displayName = '打印机出库送货安装';
      } else if (s.item.includes('扫描仪')) {
        displayName = '扫描仪出库送货安装';
      } else if (s.item.includes('碎纸机')) {
        displayName = '碎纸机出库送货安装';
      } else if (s.item.includes('投影机')) {
        displayName = '投影机出库送货安装';
      }
      
      items.push({
        id: s.id,
        displayText: displayName,
        total: basePrice,
        item: displayName,
        quantity: s.quantity,
      });
      
      if (terminalFee > 0) {
        items.push({
          id: s.id + '-terminal',
          displayText: `额外：${s.item}终端连接费`,
          total: terminalFee,
          item: s.item + '终端连接费',
          quantity: terminalCount > 5 ? terminalCount - 5 : terminalCount - 3,
        });
      }
    });

    // 外设回收服务（单项回收）
    peripheralRecycleServices.value.filter(s => s.selected && s.quantity > 0).forEach(s => {
      // 跳过全流程服务项，这些在下面单独处理
      if (s.item.includes('全流程')) return;
      
      // 为单项回收服务生成更明确的显示名称
      let displayName = s.item;
      if (s.item.includes('复印机') && !s.item.includes('全流程')) {
        displayName = '复印机回收转运';
      } else if (s.item.includes('打印机') && !s.item.includes('全流程')) {
        displayName = '打印机回收转运';
      } else if (s.item.includes('扫描仪') && !s.item.includes('全流程')) {
        displayName = '扫描仪回收转运';
      } else if (s.item.includes('碎纸机') && !s.item.includes('全流程')) {
        displayName = '碎纸机回收转运';
      } else if (s.item.includes('投影机') && !s.item.includes('全流程')) {
        displayName = '投影机回收转运';
      } else if (s.item.includes('其他外设')) {
        displayName = '其他外设回收转运';
      }
      
      items.push({
        id: s.id,
        displayText: displayName,
        total: s.price * s.quantity,
        item: displayName,
        quantity: s.quantity,
      });
    });
    
    // 外设全流程服务
    peripheralRecycleServices.value.filter(s => s.selected && s.quantity > 0).forEach(s => {
      if (!s.item.includes('全流程')) return;
      
      let basePrice = s.price * s.quantity;
      let terminalFee = 0;
      let terminalCount = s.terminalCount || 0;
      
      // 复印机全流程：基础含≤5台终端，超过按10元/台
      if (s.item.includes('复印机') && terminalCount > 5) {
        terminalFee = (terminalCount - 5) * 10 * s.quantity;
      } 
      // 打印机全流程：基础含≤3台终端，超过按10元/台
      else if (s.item.includes('打印机') && terminalCount > 3) {
        terminalFee = (terminalCount - 3) * 10 * s.quantity;
      }
      
      // 为全流程服务生成显示名称（设备名称+全流程服务）
      let displayName = s.item;
      if (s.item.includes('复印机')) {
        displayName = '复印机全流程服务';
      } else if (s.item.includes('打印机')) {
        displayName = '打印机全流程服务';
      } else if (s.item.includes('扫描仪')) {
        displayName = '扫描仪全流程服务';
      } else if (s.item.includes('碎纸机')) {
        displayName = '碎纸机全流程服务';
      } else if (s.item.includes('投影机')) {
        displayName = '投影机全流程服务';
      }
      
      items.push({
        id: s.id,
        displayText: displayName,
        total: basePrice + terminalFee,
        item: displayName,
        quantity: s.quantity,
      });
      
      // 添加终端连接费用明细
      if (terminalFee > 0) {
        items.push({
          id: s.id + '-terminal',
          displayText: `额外：${s.item}终端连接费`,
          total: terminalFee,
          item: s.item + '终端连接费',
          quantity: terminalCount > 5 ? terminalCount - 5 : terminalCount - 3,
        });
      }
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

  // 更新外设服务禁用状态（单项与全流程互斥）
  const updatePeripheralServiceDisabledState = () => {
    const deviceTypes = ['复印机', '打印机', '扫描仪', '碎纸机', '投影机'];
    
    deviceTypes.forEach(deviceType => {
      // 初始化状态
      if (!peripheralServiceState.value[deviceType]) {
        peripheralServiceState.value[deviceType] = { selected: false, disabled: false };
      }
      
      // 获取该设备类型的服务状态
      const installService = peripheralInstallServices.value.find(s => s.item.includes(deviceType));
      const recycleService = peripheralRecycleServices.value.find(s => !s.item.includes('全流程') && s.item.includes(deviceType));
      const otherRecycle = peripheralRecycleServices.value.find(s => s.item.includes('其他外设'));
      const comboService = peripheralRecycleServices.value.find(s => s.item.includes('全流程') && s.item.includes(deviceType));
      
      // 判断是否有全流程服务被选中
      const comboSelected = comboService?.selected;
      
      // 判断是否有单项服务被选中（安装或回收）
      const singleSelected = (installService?.selected && installService.quantity > 0) || 
                            (recycleService?.selected && recycleService.quantity > 0) ||
                            (deviceType === '打印机' && otherRecycle?.selected && otherRecycle.quantity > 0);
      
      // 全流程选中时，禁用单项；单项选中时，禁用全流程
      if (installService) {
        installService.disabled = !!comboSelected;
      }
      if (recycleService) {
        recycleService.disabled = !!comboSelected;
      }
      if (deviceType === '打印机' && otherRecycle) {
        otherRecycle.disabled = !!comboSelected;
      }
      if (comboService) {
        comboService.disabled = !!singleSelected;
      }
    });
  };

  const onPeripheralChange = (item: ServiceItem) => {
    if (item.selected && item.quantity === 0) {
      item.quantity = 1;
    }
    if (!item.selected) {
      item.quantity = 0;
    }
    updatePeripheralServiceDisabledState();
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

  const saveRecord = async (): Promise<boolean> => {
    if (selectedItems.value.length === 0) {
      ElMessage.closeAll();
      ElMessage.warning('请选择服务项目');
      return false;
    }
    // 公物仓项目场景下客户为必填
    if (currentProjectId.value && !selectedCustomerId.value) {
      ElMessage.closeAll();
      ElMessage.warning('请选择客户');
      return false;
    }
    try {
      const items = selectedItems.value.map(s => ({
        category: '',
        item: s.item,
        quantity: s.quantity,
        unitPrice: s.quantity > 0 ? s.total / s.quantity : s.total,
        total: s.total,
      }));
      const payload = {
        items,
        subtotal: subtotal.value,
        discount: discount.value,
        actualAmount: actualAmount.value,
        remark: remark.value,
        customerId: currentProjectId.value ? selectedCustomerId.value : undefined,
      };
      if (currentProjectId.value) {
        await performanceApi.saveFeeRecord(currentProjectId.value, payload);
      } else {
        await performanceApi.saveWarehouseFeeRecord(payload);
      }
      ElMessage.closeAll();
      ElMessage.success('记录已保存');
      loadRecords();
      resetCalculator();
      return true;
    } catch (e: any) {
      ElMessage.closeAll();
      ElMessage.error(e?.response?.data?.message || '保存失败');
      return false;
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
    peripheralDeliveryServices.value.forEach(s => {
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
    selectedCustomerId.value = '';
  };

  const loadRecords = async () => {
    try {
      // 公物仓项目场景按项目拉取，否则拉取全局
      if (currentProjectId.value) {
        const res = await performanceApi.getFeeRecords(currentProjectId.value);
        const data = res.data as FeeRecord[] | FeeRecordsResult;
        records.value = Array.isArray(data) ? data : data.data;
        return;
      }
      const res = await performanceApi.getWarehouseFeeRecords();
      records.value = Array.isArray(res.data) ? res.data : [];
    } catch (e: any) {
      console.error('Load records error:', e);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const loadSettings = async (isRetrying = false) => {
    try {
      const res = await api.get('/fee/settings');
      const data = res.data as FeeSetting[];
      allSettings.value = data;

      const computerItems: ServiceItem[] = [];
      
      // 计算机服务 - 按数据库实际类别名加载
      const computerOutSmall = data.find(s => s.category === '计算机出库' && s.item.includes('≤5台'));
      const computerOutLarge = data.find(s => s.category === '计算机出库' && s.item.includes('>5台'));
      computerItems.push({
        id: computerOutSmall?.id || 'cs-out',
        category: '计算机服务',
        item: '出库送货',
        unit: computerOutSmall?.unit || '次',
        priceSmall: computerOutSmall?.price ?? 100,
        priceLarge: computerOutLarge?.price ?? 20,
        unitSmall: '次',
        unitLarge: '台',
        price: computerOutSmall?.price ?? 100,
        quantity: 0,
        total: 0,
        selected: false,
        disabled: false,
        description: computerOutSmall?.description || computerOutLarge?.description,
      });
      
      const computerInstall = data.find(s => s.category === '计算机安装' && s.item.includes('安装'));
      computerItems.push({
        id: computerInstall?.id || 'cs-install',
        category: '计算机服务',
        item: '安装就位',
        unit: computerInstall?.unit || '台',
        priceSmall: computerInstall?.price ?? 20,
        priceLarge: computerInstall?.price ?? 20,
        unitSmall: '台',
        unitLarge: '台',
        price: computerInstall?.price ?? 20,
        quantity: 0,
        total: 0,
        selected: false,
        disabled: false,
        description: computerInstall?.description,
      });
      
      const computerRecycleSmall = data.find(s => s.category === '计算机回收' && s.item.includes('≤5台'));
      const computerRecycleLarge = data.find(s => s.category === '计算机回收' && s.item.includes('>5台'));
      computerItems.push({
        id: computerRecycleSmall?.id || 'cs-recycle',
        category: '计算机服务',
        item: '回收转运',
        unit: computerRecycleSmall?.unit || '次',
        priceSmall: computerRecycleSmall?.price ?? 100,
        priceLarge: computerRecycleLarge?.price ?? 20,
        unitSmall: '次',
        unitLarge: '台',
        price: computerRecycleSmall?.price ?? 100,
        quantity: 0,
        total: 0,
        selected: false,
        disabled: false,
        description: computerRecycleSmall?.description || computerRecycleLarge?.description,
      });
      
      const computerSecure = data.find(s => s.category === '脱密入库');
      computerItems.push({
        id: computerSecure?.id || 'cs-secure',
        category: '计算机服务',
        item: '脱密入库',
        unit: computerSecure?.unit || '台',
        priceSmall: computerSecure?.price ?? 150,
        priceLarge: computerSecure?.price ?? 150,
        unitSmall: '台',
        unitLarge: '台',
        price: computerSecure?.price ?? 150,
        quantity: 0,
        total: 0,
        selected: false,
        disabled: false,
        description: computerSecure?.description,
      });

      // 计算机组合服务（使用实际数据库类别名）
      const computerOutInstall = data.find(s => s.category === '计算机设备组合服务' && s.item.includes('出库到就位'));
      const computerOutInstallLarge = data.find(s => s.category === '计算机设备组合服务' && s.item.includes('>5台'));
      computerItems.push({
        id: computerOutInstall?.id || 'cs-out-install',
        category: '计算机组合服务',
        item: '出库到就位',
        unit: computerOutInstall?.unit || '台',
        priceSmall: computerOutInstall?.price ?? 150,
        priceLarge: computerOutInstallLarge?.price ?? 40,
        unitSmall: '次',
        unitLarge: '台',
        price: computerOutInstall?.price ?? 150,
        quantity: 0,
        total: 0,
        selected: false,
        disabled: false,
        description: computerOutInstall?.description,
      });
      
      const computerRecycleSecure = data.find(s => s.category === '计算机设备组合服务' && s.item.includes('回收到入库'));
      computerItems.push({
        id: computerRecycleSecure?.id || 'cs-recycle-secure',
        category: '计算机组合服务',
        item: '回收到入库',
        unit: computerRecycleSecure?.unit || '台',
        priceSmall: computerRecycleSecure?.price ?? 150,
        priceLarge: computerRecycleSecure?.price ?? 150,
        unitSmall: '台',
        unitLarge: '台',
        price: computerRecycleSecure?.price ?? 150,
        quantity: 0,
        total: 0,
        selected: false,
        disabled: false,
        description: computerRecycleSecure?.description,
      });
      
      const computerFullService = data.find(s => s.category === '计算机设备组合服务' && s.item.includes('全流程服务'));
      computerItems.push({
        id: computerFullService?.id || 'cs-full',
        category: '计算机组合服务',
        item: '全流程服务',
        unit: computerFullService?.unit || '台',
        priceSmall: computerFullService?.price ?? 180,
        priceLarge: computerFullService?.price ?? 180,
        unitSmall: '台',
        unitLarge: '台',
        price: computerFullService?.price ?? 180,
        quantity: 0,
        total: 0,
        selected: false,
        disabled: false,
        description: computerFullService?.description,
      });

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
          description: s.description,
        }));

      // 外设回收（单项）+ 外设全流程服务一起加载
      const recycleAndComboItems = data
        .filter(s => s.category === '外设回收' || s.category === '外设全流程服务')
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

      peripheralRecycleServices.value = recycleAndComboItems;

      // 送货服务现在为空，安装已包含送货
      peripheralDeliveryServices.value = [];

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
      // 仅在首次失败时尝试初始化，避免无限递归
      if (!isRetrying) {
        try {
          await api.post('/fee/settings/init');
          // init 成功后重新加载一次，标记 isRetrying 防止再次进入此分支
          await loadSettings(true);
          return;
        } catch (err: any) {
          ElMessage.closeAll();
          ElMessage.error('加载费用设置失败');
        }
      } else {
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
    currentProjectId,
    selectedCustomerId,
    // 服务数据
    computerServices,
    peripheralInstallServices,
    peripheralRecycleServices,
    peripheralDeliveryServices,
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
    updatePeripheralServiceDisabledState,
    onComputerServiceChange,
    onPeripheralChange,
    selectResponse,
    selectTimeSlot,
    updateSetting,
    saveRecord,
    resetCalculator,
    loadRecords,
    formatDate,
    loadSettings,
    init,
  };
}