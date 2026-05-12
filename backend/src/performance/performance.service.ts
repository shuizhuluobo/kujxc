import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalculationType, RecordType } from '@prisma/client';
import * as ExcelJS from 'exceljs';

export interface CreateProjectDto {
  projectName: string;
  calculationType: CalculationType;
  totalQuantity?: number;
  deliveryUnitPrice: number;
  installUnitPrice: number;
  debugUnitPrice: number;
  dailyPrice: number;
  remark?: string;
}

export interface UpdateProjectDto {
  projectName?: string;
  totalQuantity?: number;
  deliveryUnitPrice?: number;
  installUnitPrice?: number;
  debugUnitPrice?: number;
  dailyPrice?: number;
  remark?: string;
}

export interface CreateRecordDto {
  recordType?: RecordType;
  quantity?: number;
  customerId?: string;
  workHours?: number;
  description?: string;
  date: string;
  collaboratorIds: string[];
  includeRecorder: boolean;
  remark?: string;
  deviceId?: string;
}

export interface UpdateRecordDto {
  recordType?: RecordType;
  quantity?: number;
  customerId?: string;
  workHours?: number;
  description?: string;
  date?: string;
  collaboratorIds?: string[];
  includeRecorder?: boolean;
  remark?: string;
}

export interface PerformanceResult {
  userId: string;
  userName: string;
  deliveryCount: number;
  deliveryAmount: number;
  installCount: number;
  installAmount: number;
  debugCount: number;
  debugAmount: number;
  totalWorkDays: number;
  workDaysAmount: number;
  totalAmount: number;
}

export interface MyPerformanceStats {
  deliveryCount: number;
  installCount: number;
  debugCount: number;
  totalWorkDays: number;
}

@Injectable()
export class PerformanceService {
  constructor(private prisma: PrismaService) {}

  async getProjects(creatorId?: string) {
    const where = creatorId ? { creatorId } : {};
    return this.prisma.performanceProject.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true } },
      },
    });
  }

  async getProject(id: string) {
    return this.prisma.performanceProject.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true } },
      },
    });
  }

  async createProject(data: CreateProjectDto, creatorId: string) {
    return this.prisma.performanceProject.create({
      data: {
        ...data,
        creatorId,
      },
      include: {
        creator: { select: { id: true, name: true } },
      },
    });
  }

  async updateProject(id: string, data: UpdateProjectDto) {
    return this.prisma.performanceProject.update({
      where: { id },
      data,
      include: {
        creator: { select: { id: true, name: true } },
      },
    });
  }

  async deleteProject(id: string) {
    return this.prisma.performanceProject.delete({
      where: { id },
    });
  }

  async getRecords(projectId: string) {
    const records = await this.prisma.performanceRecord.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });

    const allCollaboratorIds = [...new Set(records.flatMap(r => r.collaboratorIds))];
    const collaborators = await this.prisma.user.findMany({
      where: { id: { in: allCollaboratorIds } },
      select: { id: true, name: true },
    });
    const collaboratorMap = new Map(collaborators.map(c => [c.id, c]));

    return records.map(record => ({
      ...record,
      collaborators: record.collaboratorIds.map(id => collaboratorMap.get(id) || { id, name: '未知' }),
    }));
  }

  async getRecord(projectId: string, recordId: string) {
    const record = await this.prisma.performanceRecord.findFirst({
      where: { id: recordId, projectId },
    });
    if (!record) {
      throw new NotFoundException('记录不存在');
    }
    return record;
  }

  async createRecord(projectId: string, data: CreateRecordDto, creatorId: string) {
    return this.prisma.performanceRecord.create({
      data: {
        ...data,
        projectId,
        creatorId,
      },
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });
  }

  async updateRecord(projectId: string, recordId: string, data: UpdateRecordDto) {
    return this.prisma.performanceRecord.update({
      where: { id: recordId },
      data,
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });
  }

  async deleteRecord(projectId: string, recordId: string) {
    return this.prisma.performanceRecord.delete({
      where: { id: recordId },
    });
  }

  async getDevices(projectId: string) {
    return this.prisma.customerDevice.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
        project: { select: { id: true, projectName: true } },
      },
    });
  }

  async createDevice(projectId: string, data: {
    customerId: string;
    deviceName: string;
    expectedQuantity: number;
    remark?: string;
  }, creatorId: string) {
    return this.prisma.customerDevice.create({
      data: {
        ...data,
        projectId,
        creatorId,
      },
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });
  }

  async updateDevice(deviceId: string, data: {
    customerId?: string;
    deviceName?: string;
    expectedQuantity?: number;
    remark?: string;
  }) {
    return this.prisma.customerDevice.update({
      where: { id: deviceId },
      data,
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });
  }

  async deleteDevice(deviceId: string) {
    return this.prisma.customerDevice.delete({
      where: { id: deviceId },
    });
  }

  async recordDelivery(deviceId: string, data: {
    quantity: number;
    collaboratorIds: string[];
  }, userId: string) {
    const device = await this.prisma.customerDevice.findUnique({ where: { id: deviceId } });
    if (!device) throw new Error('设备不存在');
    
    const newQuantity = device.deliveryQuantity + data.quantity;
    const isCompleted = this.checkCompletion({
      ...device,
      deliveryQuantity: newQuantity,
    });
    
    return this.prisma.customerDevice.update({
      where: { id: deviceId },
      data: {
        deliveryQuantity: newQuantity,
        deliveryBy: userId,
        deliveryAt: new Date(),
        deliveryCollaborators: data.collaboratorIds,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });
  }

  async recordInstall(deviceId: string, data: {
    quantity: number;
    collaboratorIds: string[];
  }, userId: string) {
    const device = await this.prisma.customerDevice.findUnique({ where: { id: deviceId } });
    if (!device) throw new Error('设备不存在');
    
    const newQuantity = device.installQuantity + data.quantity;
    const isCompleted = this.checkCompletion({
      ...device,
      installQuantity: newQuantity,
    });
    
    return this.prisma.customerDevice.update({
      where: { id: deviceId },
      data: {
        installQuantity: newQuantity,
        installBy: userId,
        installAt: new Date(),
        installCollaborators: data.collaboratorIds,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });
  }

  async recordDebug(deviceId: string, data: {
    quantity: number;
    collaboratorIds: string[];
  }, userId: string) {
    const device = await this.prisma.customerDevice.findUnique({ where: { id: deviceId } });
    if (!device) throw new Error('设备不存在');
    
    const newQuantity = device.debugQuantity + data.quantity;
    const isCompleted = this.checkCompletion({
      ...device,
      debugQuantity: newQuantity,
    });
    
    return this.prisma.customerDevice.update({
      where: { id: deviceId },
      data: {
        debugQuantity: newQuantity,
        debugBy: userId,
        debugAt: new Date(),
        debugCollaborators: data.collaboratorIds,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });
  }

  private checkCompletion(device: any): boolean {
    return (
      device.deliveryQuantity >= device.expectedQuantity &&
      device.installQuantity >= device.deliveryQuantity &&
      device.debugQuantity >= device.installQuantity
    );
  }

  async getStats(projectId: string): Promise<PerformanceResult[]> {
    const project = await this.prisma.performanceProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return [];
    }

    const records = await this.prisma.performanceRecord.findMany({
      where: { projectId },
      include: { creator: { select: { id: true, name: true } } },
    });

    const userStats = new Map<string, PerformanceResult>();

    records.forEach((record) => {
      const allUserIds: string[] = [...record.collaboratorIds];
      if (record.includeRecorder) {
        allUserIds.push(record.creatorId);
      }

      const userCount = allUserIds.length || 1;

      allUserIds.forEach((userId) => {
        if (!userStats.has(userId)) {
          userStats.set(userId, {
            userId,
            userName: userId === record.creatorId ? record.creator.name : '',
            deliveryCount: 0,
            deliveryAmount: 0,
            installCount: 0,
            installAmount: 0,
            debugCount: 0,
            debugAmount: 0,
            totalWorkDays: 0,
            workDaysAmount: 0,
            totalAmount: 0,
          });
        }

        const stats = userStats.get(userId)!;

        if (project.calculationType === CalculationType.QUANTITY && record.quantity) {
          const quantityPerUser = record.quantity / userCount;

          switch (record.recordType) {
            case RecordType.DELIVERY:
              stats.deliveryCount += quantityPerUser;
              stats.deliveryAmount += (quantityPerUser * project.deliveryUnitPrice) || 0;
              break;
            case RecordType.INSTALL:
              stats.installCount += quantityPerUser;
              stats.installAmount += (quantityPerUser * project.installUnitPrice) || 0;
              break;
            case RecordType.DEBUG:
              stats.debugCount += quantityPerUser;
              stats.debugAmount += (quantityPerUser * project.debugUnitPrice) || 0;
              break;
          }
        } else if (project.calculationType === CalculationType.DAILY && record.workHours) {
          const totalWorkDays = record.workHours / 8;
          stats.totalWorkDays += totalWorkDays;
          stats.workDaysAmount += totalWorkDays * project.dailyPrice;
        }
      });
    });

    const users = await this.prisma.user.findMany({
      where: { id: { in: Array.from(userStats.keys()) } },
      select: { id: true, name: true },
    });

    users.forEach((user) => {
      const stats = userStats.get(user.id);
      if (stats) {
        stats.userName = user.name;
      }
    });

    return Array.from(userStats.values()).map((stat) => ({
      ...stat,
      deliveryCount: Math.round(stat.deliveryCount * 100) / 100,
      installCount: Math.round(stat.installCount * 100) / 100,
      debugCount: Math.round(stat.debugCount * 100) / 100,
      totalWorkDays: Math.round(stat.totalWorkDays * 100) / 100,
      totalAmount: stat.deliveryAmount + stat.installAmount + stat.debugAmount + stat.workDaysAmount,
    }));
  }

  async getMyStats(projectId: string, userId: string): Promise<MyPerformanceStats> {
    const project = await this.prisma.performanceProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return {
        deliveryCount: 0,
        installCount: 0,
        debugCount: 0,
        totalWorkDays: 0,
      };
    }

    const records = await this.prisma.performanceRecord.findMany({
      where: {
        projectId,
        OR: [
          { collaboratorIds: { has: userId } },
          { creatorId: userId, includeRecorder: true },
        ],
      },
    });

    const result: MyPerformanceStats = {
      deliveryCount: 0,
      installCount: 0,
      debugCount: 0,
      totalWorkDays: 0,
    };

    records.forEach((record) => {
      const allUserIds: string[] = [...record.collaboratorIds];
      if (record.includeRecorder) {
        allUserIds.push(record.creatorId);
      }

      const userCount = allUserIds.length || 1;

      if (project.calculationType === CalculationType.QUANTITY && record.quantity) {
        const quantityPerUser = record.quantity / userCount;

        switch (record.recordType) {
          case RecordType.DELIVERY:
            result.deliveryCount += quantityPerUser;
            break;
          case RecordType.INSTALL:
            result.installCount += quantityPerUser;
            break;
          case RecordType.DEBUG:
            result.debugCount += quantityPerUser;
            break;
        }
      } else if (project.calculationType === CalculationType.DAILY && record.workHours) {
        result.totalWorkDays += record.workHours / 8;
      }
    });

    return {
      deliveryCount: Math.round(result.deliveryCount * 100) / 100,
      installCount: Math.round(result.installCount * 100) / 100,
      debugCount: Math.round(result.debugCount * 100) / 100,
      totalWorkDays: Math.round(result.totalWorkDays * 100) / 100,
    };
  }

  async exportProject(projectId: string): Promise<Buffer> {
    const project = await this.prisma.performanceProject.findUnique({
      where: { id: projectId },
      include: {
        records: {
          include: {
            customer: true,
            creator: true,
          },
          orderBy: { date: 'desc' },
        },
        creator: true,
      },
    });

    if (!project) {
      throw new Error('项目不存在');
    }

    const workbook = new ExcelJS.Workbook();
    
    // 创建项目信息工作表
    const infoSheet = workbook.addWorksheet('项目信息');
    infoSheet.columns = [
      { header: '项目信息', key: 'label', width: 20 },
      { header: '内容', key: 'value', width: 40 },
    ];
    infoSheet.getRow(1).font = { bold: true };
    
    infoSheet.addRow({ label: '项目名称', value: project.projectName });
    infoSheet.addRow({ label: '计算方式', value: project.calculationType === 'QUANTITY' ? '按量计算' : '按天计算' });
    infoSheet.addRow({ label: '设备总量', value: project.totalQuantity || '-' });
    infoSheet.addRow({ label: '送货单价', value: `${project.deliveryUnitPrice}元/台` });
    infoSheet.addRow({ label: '安装单价', value: `${project.installUnitPrice}元/台` });
    infoSheet.addRow({ label: '调试单价', value: `${project.debugUnitPrice}元/台` });
    infoSheet.addRow({ label: '日结单价', value: `${project.dailyPrice}元/人/天` });
    infoSheet.addRow({ label: '备注', value: project.remark || '-' });
    infoSheet.addRow({ label: '创建人', value: project.creator?.name || '-' });
    infoSheet.addRow({ label: '创建时间', value: new Date(project.createdAt).toLocaleString('zh-CN') });

    // 创建工作记录工作表
    const recordSheet = workbook.addWorksheet('工作记录');
    recordSheet.columns = [
      { header: '日期', key: 'date', width: 12 },
      { header: '记录类型', key: 'recordType', width: 10 },
      { header: '数量/工时', key: 'quantity', width: 12 },
      { header: '客户', key: 'customer', width: 20 },
      { header: '协作人员', key: 'collaborators', width: 25 },
      { header: '包含记录人', key: 'includeRecorder', width: 10 },
      { header: '描述/备注', key: 'description', width: 30 },
      { header: '记录人', key: 'creator', width: 12 },
    ];
    
    const headerRow = recordSheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    const recordTypeLabels: Record<RecordType, string> = {
      DELIVERY: '送货',
      INSTALL: '安装',
      DEBUG: '调试',
      CONSTRUCTION: '施工',
    };

    const collaborators = await this.prisma.user.findMany({
      where: { id: { in: [...new Set(project.records.flatMap(r => r.collaboratorIds))] } },
    });
    const collaboratorMap = new Map(collaborators.map(c => [c.id, c.name]));

    project.records.forEach(record => {
      const recordTypeName = record.recordType ? recordTypeLabels[record.recordType] : '-';
      const quantityOrHours = record.quantity 
        ? `${record.quantity}台` 
        : record.workHours 
          ? `${record.workHours}小时 (${(record.workHours / 8).toFixed(1)}天)` 
          : '-';
      const collaboratorNames = record.collaboratorIds.map(id => collaboratorMap.get(id) || id).join(', ');
      
      recordSheet.addRow({
        date: new Date(record.date).toLocaleDateString('zh-CN'),
        recordType: recordTypeName,
        quantity: quantityOrHours,
        customer: record.customer?.name || '-',
        collaborators: collaboratorNames,
        includeRecorder: record.includeRecorder ? '是' : '否',
        description: record.description || record.remark || '-',
        creator: record.creator?.name || '-',
      });
    });

    // 创建工作量统计工作表
    const stats = await this.getStats(projectId);
    const statsSheet = workbook.addWorksheet('工作量统计');
    statsSheet.columns = [
      { header: '参与人员', key: 'userName', width: 15 },
      { header: '送货数量', key: 'deliveryCount', width: 12 },
      { header: '送货金额', key: 'deliveryAmount', width: 12 },
      { header: '安装数量', key: 'installCount', width: 12 },
      { header: '安装金额', key: 'installAmount', width: 12 },
      { header: '调试数量', key: 'debugCount', width: 12 },
      { header: '调试金额', key: 'debugAmount', width: 12 },
      { header: '工作天数', key: 'totalWorkDays', width: 12 },
      { header: '日结金额', key: 'workDaysAmount', width: 12 },
      { header: '合计金额', key: 'totalAmount', width: 12 },
    ];
    
    const statsHeaderRow = statsSheet.getRow(1);
    statsHeaderRow.font = { bold: true };
    statsHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };

    stats.forEach(stat => {
      statsSheet.addRow({
        userName: stat.userName,
        deliveryCount: stat.deliveryCount.toFixed(2),
        deliveryAmount: `${stat.deliveryAmount.toFixed(2)}元`,
        installCount: stat.installCount.toFixed(2),
        installAmount: `${stat.installAmount.toFixed(2)}元`,
        debugCount: stat.debugCount.toFixed(2),
        debugAmount: `${stat.debugAmount.toFixed(2)}元`,
        totalWorkDays: stat.totalWorkDays.toFixed(2),
        workDaysAmount: `${stat.workDaysAmount.toFixed(2)}元`,
        totalAmount: `${stat.totalAmount.toFixed(2)}元`,
      });
    });

    // 添加合计行
    const totalRow = statsSheet.addRow({
      userName: '合计',
      deliveryCount: stats.reduce((sum, s) => sum + s.deliveryCount, 0).toFixed(2),
      deliveryAmount: `${stats.reduce((sum, s) => sum + s.deliveryAmount, 0).toFixed(2)}元`,
      installCount: stats.reduce((sum, s) => sum + s.installCount, 0).toFixed(2),
      installAmount: `${stats.reduce((sum, s) => sum + s.installAmount, 0).toFixed(2)}元`,
      debugCount: stats.reduce((sum, s) => sum + s.debugCount, 0).toFixed(2),
      debugAmount: `${stats.reduce((sum, s) => sum + s.debugAmount, 0).toFixed(2)}元`,
      totalWorkDays: stats.reduce((sum, s) => sum + s.totalWorkDays, 0).toFixed(2),
      workDaysAmount: `${stats.reduce((sum, s) => sum + s.workDaysAmount, 0).toFixed(2)}元`,
      totalAmount: `${stats.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}元`,
    });
    totalRow.font = { bold: true };

    return workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  async exportProjects(projectIds?: string[]): Promise<Buffer> {
    const where = projectIds && projectIds.length > 0
      ? { id: { in: projectIds } }
      : {};

    const projects = await this.prisma.performanceProject.findMany({
      where,
      include: {
        records: {
          include: { customer: true },
        },
        creator: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();

    // 创建项目汇总表
    const summarySheet = workbook.addWorksheet('项目汇总');
    summarySheet.columns = [
      { header: '项目名称', key: 'projectName', width: 25 },
      { header: '计算方式', key: 'calculationType', width: 12 },
      { header: '设备总量', key: 'totalQuantity', width: 12 },
      { header: '记录数', key: 'recordCount', width: 10 },
      { header: '创建人', key: 'creator', width: 12 },
      { header: '创建时间', key: 'createdAt', width: 18 },
    ];
    
    const summaryHeader = summarySheet.getRow(1);
    summaryHeader.font = { bold: true };
    summaryHeader.alignment = { vertical: 'middle', horizontal: 'center' };

    // 获取所有用户信息
    const allUserIds = [...new Set(projects.flatMap(p => [p.creatorId, ...p.records.flatMap(r => r.collaboratorIds)]))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: allUserIds } },
    });
    const userMap = new Map(users.map(u => [u.id, u.name]));

    // 添加各项目工作表并汇总
    projects.forEach(project => {
      // 添加到汇总表
      summarySheet.addRow({
        projectName: project.projectName,
        calculationType: project.calculationType === 'QUANTITY' ? '按量计算' : '按天计算',
        totalQuantity: project.totalQuantity || '-',
        recordCount: project.records.length,
        creator: userMap.get(project.creatorId) || '-',
        createdAt: new Date(project.createdAt).toLocaleString('zh-CN'),
      });

      // 创建每个项目的详情工作表
      const detailSheet = workbook.addWorksheet(project.projectName.length > 30 ? project.projectName.substring(0, 30) : project.projectName);
      detailSheet.columns = [
        { header: '日期', key: 'date', width: 12 },
        { header: '类型', key: 'recordType', width: 10 },
        { header: '数量/工时', key: 'quantity', width: 12 },
        { header: '客户', key: 'customer', width: 20 },
        { header: '协作人员', key: 'collaborators', width: 25 },
        { header: '金额', key: 'amount', width: 12 },
      ];
      
      const detailHeader = detailSheet.getRow(1);
      detailHeader.font = { bold: true };

      const recordTypeLabels: Record<RecordType, string> = {
        DELIVERY: '送货',
        INSTALL: '安装',
        DEBUG: '调试',
        CONSTRUCTION: '施工',
      };

      project.records.forEach(record => {
        let amount = 0;
        if (project.calculationType === 'QUANTITY' && record.quantity) {
          const userCount = [...record.collaboratorIds, ...(record.includeRecorder ? [record.creatorId] : [])].length || 1;
          const quantityPerUser = record.quantity / userCount;
          switch (record.recordType) {
            case RecordType.DELIVERY:
              amount = quantityPerUser * project.deliveryUnitPrice;
              break;
            case RecordType.INSTALL:
              amount = quantityPerUser * project.installUnitPrice;
              break;
            case RecordType.DEBUG:
              amount = quantityPerUser * project.debugUnitPrice;
              break;
          }
        } else if (project.calculationType === CalculationType.DAILY && record.workHours) {
          amount = (record.workHours / 8) * project.dailyPrice;
        }

        detailSheet.addRow({
          date: new Date(record.date).toLocaleDateString('zh-CN'),
          recordType: record.recordType ? recordTypeLabels[record.recordType] : '-',
          quantity: record.quantity ? `${record.quantity}台` : record.workHours ? `${record.workHours}小时` : '-',
          customer: record.customer?.name || '-',
          collaborators: record.collaboratorIds.map(id => userMap.get(id) || id).join(', '),
          amount: `${amount.toFixed(2)}元`,
        });
      });
    });

    return workbook.xlsx.writeBuffer() as unknown as Buffer;
  }
}
