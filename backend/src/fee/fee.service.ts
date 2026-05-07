import { Injectable } from '@nestjs/common';
import { Prisma, FeeSetting, FeeRecord } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface FeeItem {
  category: string;
  item: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CalculateResult {
  items: FeeItem[];
  subtotal: number;
  discount: number;
  actualAmount: number;
}

@Injectable()
export class FeeService {
  constructor(private prisma: PrismaService) {}

  async getSettings(category?: string): Promise<FeeSetting[]> {
    const where = category ? { category } : {};
    return this.prisma.feeSetting.findMany({
      where,
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async updateSetting(
    id: string,
    data: {
      price?: number;
      unit?: string;
      description?: string;
      isActive?: boolean;
    },
  ): Promise<FeeSetting> {
    return this.prisma.feeSetting.update({
      where: { id },
      data,
    });
  }

  async createSetting(data: {
    category: string;
    item: string;
    unit: string;
    price: number;
    description?: string;
    threshold?: number;
  }): Promise<FeeSetting> {
    return this.prisma.feeSetting.create({ data });
  }

  async deleteSetting(id: string): Promise<FeeSetting> {
    return this.prisma.feeSetting.delete({ where: { id } });
  }

  calculate(
    items: {
      category: string;
      item: string;
      quantity: number;
      unitPrice: number;
    }[],
  ): CalculateResult {
    const calculatedItems: FeeItem[] = items.map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));

    const subtotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);

    return {
      items: calculatedItems,
      subtotal,
      discount: 0,
      actualAmount: subtotal,
    };
  }

  async saveRecord(data: {
    items: FeeItem[];
    subtotal: number;
    discount: number;
    actualAmount: number;
    remark?: string;
    creatorId?: string;
  }): Promise<FeeRecord> {
    return this.prisma.feeRecord.create({
      data: {
        items: data.items as unknown as Prisma.InputJsonValue,
        subtotal: data.subtotal,
        discount: data.discount,
        actualAmount: data.actualAmount,
        remark: data.remark,
        creatorId: data.creatorId,
      },
    });
  }

  async getRecords(
    limit = 20,
    offset = 0,
  ): Promise<Array<FeeRecord & { creator: { name: string } | null }>> {
    return this.prisma.feeRecord.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: { creator: { select: { name: true } } },
    });
  }

  async deleteRecord(id: string): Promise<FeeRecord> {
    return this.prisma.feeRecord.delete({
      where: { id },
    });
  }

  async initDefaultSettings(): Promise<void> {
    const existing = await this.prisma.feeSetting.count();
    if (existing > 0) return;

    const defaults = [
      // 计算机服务 - 出库（使用与现有数据库一致的类别名）
      {
        category: '计算机出库',
        item: '计算机出库(≤5台)',
        unit: '次',
        price: 100,
        threshold: 5,
      },
      {
        category: '计算机出库',
        item: '计算机出库(>5台)',
        unit: '台',
        price: 20,
        threshold: 5,
      },
      {
        category: '计算机安装',
        item: '计算机安装',
        unit: '台',
        price: 20,
      },
      {
        category: '计算机回收',
        item: '计算机回收(≤5台)',
        unit: '次',
        price: 100,
        threshold: 5,
      },
      {
        category: '计算机回收',
        item: '计算机回收(>5台)',
        unit: '台',
        price: 20,
        threshold: 5,
      },
      {
        category: '脱密入库',
        item: '计算机脱密入库',
        unit: '台',
        price: 150,
      },
      // 计算机组合服务（使用与现有数据库一致的类别名）
      {
        category: '计算机设备组合服务',
        item: '计算机出库到就位',
        unit: '台',
        price: 40,
        description: '≤5台150元/次',
      },
      {
        category: '计算机设备组合服务',
        item: '计算机回收到入库',
        unit: '台',
        price: 170,
        description: '含回收转运+脱密入库',
      },
      {
        category: '计算机设备组合服务',
        item: '计算机全流程服务',
        unit: '台',
        price: 200,
        description: '含所有单项服务',
      },
      // 外设安装服务（安装含送货）
      {
        category: '外设安装',
        item: '复印机安装（含送货）',
        unit: '次',
        price: 200,
        description: '含设备就位及与≤5台终端连接调试',
      },
      {
        category: '外设安装',
        item: '打印机安装（含送货）',
        unit: '台',
        price: 80,
        description: '含与≤3台计算机连接调试',
      },
      {
        category: '外设安装',
        item: '扫描仪安装（含送货）',
        unit: '台',
        price: 50,
      },
      {
        category: '外设安装',
        item: '碎纸机安装',
        unit: '台',
        price: 30,
      },
      {
        category: '外设安装',
        item: '投影机安装',
        unit: '台',
        price: 100,
        description: '含桌面/落地安装及信号连接',
      },
      // 外设回收服务（单项）
      {
        category: '外设回收',
        item: '复印机回收',
        unit: '台',
        price: 80,
      },
      {
        category: '外设回收',
        item: '其他外设回收',
        unit: '台',
        price: 20,
        description: '打印机、扫描仪、碎纸机等',
      },
      // 外设全流程服务
      {
        category: '外设全流程服务',
        item: '复印机全流程服务',
        unit: '台',
        price: 260,
        description: '含送货、安装、回收全流程',
      },
      {
        category: '外设全流程服务',
        item: '打印机全流程服务',
        unit: '台',
        price: 140,
        description: '含送货、安装、回收全流程',
      },
      {
        category: '外设全流程服务',
        item: '扫描仪全流程服务',
        unit: '台',
        price: 140,
        description: '含送货、安装、回收全流程',
      },
      {
        category: '外设全流程服务',
        item: '碎纸机全流程服务',
        unit: '台',
        price: 60,
        description: '含送货、安装、回收全流程',
      },
      {
        category: '外设全流程服务',
        item: '投影机全流程服务',
        unit: '台',
        price: 160,
        description: '含送货、安装、回收全流程',
      },
      // 响应时效
      {
        category: '响应时效',
        item: '正常响应(下一工作日)',
        unit: '次',
        price: 0,
        description: '下一个工作日内上门',
      },
      {
        category: '响应时效',
        item: '加急响应',
        unit: '次',
        price: 100,
        description: '上午11:30前通知，当日下午上门',
      },
      {
        category: '响应时效',
        item: '立即响应',
        unit: '次',
        price: 200,
        description: '通知后2小时内上门',
      },
      // 服务时段
      {
        category: '服务时段',
        item: '正常服务',
        unit: '次',
        price: 0,
        description: '法定工作时间',
      },
      {
        category: '服务时段',
        item: '早间服务',
        unit: '次',
        price: 50,
        description: '8:30前',
      },
      {
        category: '服务时段',
        item: '午间服务',
        unit: '次',
        price: 30,
        description: '11:30-13:30',
      },
      {
        category: '服务时段',
        item: '夜间服务',
        unit: '次',
        price: 100,
        description: '17:30后，基础费上浮100%',
      },
      // 交通费
      {
        category: '交通费',
        item: '文登区',
        unit: '次',
        price: 100,
      },
      {
        category: '交通费',
        item: '荣成市',
        unit: '次',
        price: 200,
      },
      {
        category: '交通费',
        item: '乳山市',
        unit: '次',
        price: 300,
      },
    ];

    for (let i = 0; i < defaults.length; i++) {
      await this.prisma.feeSetting.create({
        data: { ...defaults[i], sortOrder: i },
      });
    }
  }
}
