import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
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

export interface FeeRecordsResult {
  data: Array<FeeRecord & { creator: { name: string } | null }>;
  total: number;
}

export interface FeeStatsResult {
  totalRecords: number;
  totalAmount: number;
  totalDiscount: number;
  totalActual: number;
  byCategory: Record<string, { count: number; amount: number }>;
}

@Injectable()
export class FeeService {
  constructor(private prisma: PrismaService) {}

  async getSettings(category?: string, isActive?: boolean): Promise<FeeSetting[]> {
    const where: Prisma.FeeSettingWhereInput = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive;
    return this.prisma.feeSetting.findMany({
      where,
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async getSetting(id: string): Promise<FeeSetting> {
    const setting = await this.prisma.feeSetting.findUnique({ where: { id } });
    if (!setting) throw new NotFoundException('费用设置不存在');
    return setting;
  }

  async updateSetting(
    id: string,
    data: {
      price?: number;
      unit?: string;
      description?: string;
      isActive?: boolean;
      sortOrder?: number;
    },
  ): Promise<FeeSetting> {
    await this.getSetting(id); // 校验存在性
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
    sortOrder?: number;
  }): Promise<FeeSetting> {
    // 检查同分类下是否已存在同名项目
    const existing = await this.prisma.feeSetting.findFirst({
      where: { category: data.category, item: data.item },
    });
    if (existing) {
      throw new BadRequestException(`分类"${data.category}"下已存在项目"${data.item}"`);
    }
    return this.prisma.feeSetting.create({ data });
  }

  async deleteSetting(id: string): Promise<FeeSetting> {
    await this.getSetting(id); // 校验存在性
    return this.prisma.feeSetting.delete({ where: { id } });
  }

  /**
   * 安全计算：从数据库获取单价，而非信任前端传入
   * 前端只需传 category + item + quantity，单价由后端从 FeeSetting 查询
   */
  async calculate(
    items: {
      category: string;
      item: string;
      quantity: number;
    }[],
  ): Promise<CalculateResult> {
    const calculatedItems: FeeItem[] = [];

    for (const item of items) {
      if (item.quantity <= 0) continue;

      // 从数据库查找对应的价格设置
      const setting = await this.prisma.feeSetting.findFirst({
        where: {
          category: item.category,
          item: item.item,
          isActive: true,
        },
      });

      if (!setting) {
        throw new BadRequestException(
          `未找到有效的费用设置: ${item.category} - ${item.item}`,
        );
      }

      calculatedItems.push({
        category: item.category,
        item: item.item,
        quantity: item.quantity,
        unitPrice: setting.price,
        total: item.quantity * setting.price,
      });
    }

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
    projectId?: string;
    customerId?: string;
    creatorId: string;
  }): Promise<FeeRecord> {
    // 安全计算：忽略前端传入的 unitPrice/total，按 category+item 从 FeeSetting 重算
    // 防止攻击者提交篡改后的单价
    const recalculatedItems: FeeItem[] = [];
    for (const item of data.items) {
      if (item.quantity <= 0) continue;

      const setting = await this.prisma.feeSetting.findFirst({
        where: {
          category: item.category || '未分类',
          item: item.item,
          isActive: true,
        },
      });

      if (!setting) {
        throw new BadRequestException(
          `未找到有效的费用设置: ${item.category || '未分类'} - ${item.item}`,
        );
      }

      recalculatedItems.push({
        category: setting.category,
        item: setting.item,
        quantity: item.quantity,
        unitPrice: setting.price,
        total: item.quantity * setting.price,
      });
    }

    if (recalculatedItems.length === 0) {
      throw new BadRequestException('费用明细不能为空');
    }

    // 用重算后的金额覆盖前端传入值
    const subtotal = recalculatedItems.reduce(
      (sum, item) => sum + item.total,
      0,
    );
    const actualAmount = subtotal - data.discount;

    if (data.discount < 0) {
      throw new BadRequestException('折扣金额不能为负数');
    }
    if (actualAmount < 0) {
      throw new BadRequestException('折扣金额不能超过小计金额');
    }

    return this.prisma.feeRecord.create({
      data: {
        items: recalculatedItems as unknown as Prisma.InputJsonValue,
        subtotal,
        discount: data.discount,
        actualAmount,
        remark: data.remark,
        creatorId: data.creatorId,
        projectId: data.projectId,
        customerId: data.customerId,
      },
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true, shortName: true } },
      },
    });
  }

  async getRecords(params: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
    creatorId?: string;
    projectId?: string;
    customerId?: string;
  }): Promise<FeeRecordsResult> {
    const { limit = 20, offset = 0, startDate, endDate, creatorId, projectId, customerId } = params;

    const where: Prisma.FeeRecordWhereInput = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (creatorId) where.creatorId = creatorId;
    if (projectId) where.projectId = projectId;
    if (customerId) where.customerId = customerId;

    const [data, total] = await Promise.all([
      this.prisma.feeRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          creator: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true, shortName: true } },
        },
      }),
      this.prisma.feeRecord.count({ where }),
    ]);

    return { data, total };
  }

  async deleteRecord(id: string, userId: string, isAdmin: boolean): Promise<FeeRecord> {
    const record = await this.prisma.feeRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('费用记录不存在');

    // 只有创建人 or 管理员可删除
    if (!isAdmin && record.creatorId !== userId) {
      throw new ForbiddenException('只有记录创建人或管理员可以删除此记录');
    }

    return this.prisma.feeRecord.delete({ where: { id } });
  }

  async getStats(params: {
    startDate?: string;
    endDate?: string;
  }): Promise<FeeStatsResult> {
    const { startDate, endDate } = params;

    const where: Prisma.FeeRecordWhereInput = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const records = await this.prisma.feeRecord.findMany({
      where,
      select: {
        actualAmount: true,
        discount: true,
        subtotal: true,
        items: true,
      },
    });

    const totalRecords = records.length;
    const totalAmount = records.reduce((sum, r) => sum + r.subtotal, 0);
    const totalDiscount = records.reduce((sum, r) => sum + r.discount, 0);
    const totalActual = records.reduce((sum, r) => sum + r.actualAmount, 0);

    // 按分类统计
    const byCategory: Record<string, { count: number; amount: number }> = {};
    for (const record of records) {
      const items = record.items as unknown as FeeItem[];
      for (const item of items) {
        const cat = item.category || '未分类';
        if (!byCategory[cat]) {
          byCategory[cat] = { count: 0, amount: 0 };
        }
        byCategory[cat].count += item.quantity;
        byCategory[cat].amount += item.total;
      }
    }

    return { totalRecords, totalAmount, totalDiscount, totalActual, byCategory };
  }

  async initDefaultSettings(): Promise<void> {
    const existing = await this.prisma.feeSetting.findMany({
      select: { category: true, item: true },
    });
    const existingKeys = new Set(existing.map(e => `${e.category}:${e.item}`));

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

    let sortOffset = existing.length;
    for (let i = 0; i < defaults.length; i++) {
      const key = `${defaults[i].category}:${defaults[i].item}`;
      if (!existingKeys.has(key)) {
        await this.prisma.feeSetting.create({
          data: { ...defaults[i], sortOrder: sortOffset++ },
        });
      }
    }
  }
}
