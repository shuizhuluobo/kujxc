import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkOrderStatus, ScoreLevel, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DingtalkService } from '../dingtalk/dingtalk.service';
import {
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  CompleteWorkOrderDto,
  WorkOrderFilterDto,
} from './dto';
import * as ExcelJS from 'exceljs';

// 分值映射
const SCORE_VALUES: Record<ScoreLevel, number | null> = {
  SIMPLE: 0.5,
  NORMAL: 1,
  COMPLEX: null,
};

const SCORE_LABELS: Record<ScoreLevel, string> = {
  SIMPLE: '简单',
  NORMAL: '一般',
  COMPLEX: '复杂',
};

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  PENDING: '待接收',
  RECEIVED: '已接收',
  COMPLETED: '已完成',
};

@Injectable()
export class WorkOrdersService {
  constructor(
    private prisma: PrismaService,

    private notificationsService: NotificationsService,

    private eventEmitter: EventEmitter2,

    private dingtalkService: DingtalkService,
  ) {}

  private readonly includeRelations = {
    customer: true,
    region: true,
    serviceType: true,
    creator: { select: { id: true, name: true, username: true } },
    receiver: { select: { id: true, name: true, username: true } },
    completer: { select: { id: true, name: true, username: true } },
    collaborators: {
      include: {
        user: { select: { id: true, name: true, username: true } },
      },
    },
  };

  async create(createDto: CreateWorkOrderDto, creatorId: string) {
    const workOrder = await this.prisma.workOrder.create({
      data: {
        ...createDto,
        scoreLevel: createDto.scoreLevel || ScoreLevel.NORMAL,
        creatorId,
      },
      include: this.includeRelations,
    });

    // 推送通知给该区域的工程师
    await this.notificationsService.notifyRegionEngineers(
      workOrder.id,
      workOrder.regionId,
      '新工单通知',
      `您所在区域有新工单: ${workOrder.customer?.name || ''} - ${workOrder.detail.substring(0, 50)}`,
    );

    // 推送钉钉消息通知
    await this.dingtalkService.sendWorkOrderNotification(
      workOrder,
      workOrder.regionId,
    );

    // 触发 SSE 事件
    this.eventEmitter.emit('app.event', {
      type: 'work-order.created',
      payload: workOrder,
    });

    return workOrder;
  }

  async findAll(filterDto: WorkOrderFilterDto) {
    const {
      page = 1,
      pageSize = 20,
      statuses,
      regionId,
      serviceTypeId,
      customerId,
      creatorId,
      receiverId,
      startDate,
      endDate,
      keyword,
    } = filterDto;

    const where: Prisma.WorkOrderWhereInput = {};

    if (statuses && statuses.length > 0) {
      where.status = { in: filterDto.statuses };
    }
    if (regionId) where.regionId = regionId;
    if (serviceTypeId) where.serviceTypeId = serviceTypeId;
    if (customerId) where.customerId = customerId;
    if (creatorId) where.creatorId = creatorId;
    if (receiverId) where.receiverId = receiverId;
    if (filterDto.completerId) where.completerId = filterDto.completerId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59');
    }

    if (keyword) {
      where.OR = [
        { detail: { contains: keyword, mode: 'insensitive' } },
        { customer: { name: { contains: keyword, mode: 'insensitive' } } },
        { customer: { shortName: { contains: keyword, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where,
        include: this.includeRelations,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.workOrder.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      filterParams: filterDto,
    };
  }

  async findPending(regionId?: string) {
    const where: Prisma.WorkOrderWhereInput = {
      status: { not: WorkOrderStatus.COMPLETED },
    };
    if (regionId) {
      where.regionId = regionId;
    }
    return this.prisma.workOrder.findMany({
      where,
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(regionId?: string) {
    const where: Prisma.WorkOrderWhereInput = {};
    if (regionId) {
      where.regionId = regionId;
    }

    const [pending, received] = await Promise.all([
      this.prisma.workOrder.count({
        where: {
          ...where,
          status: WorkOrderStatus.PENDING,
        },
      }),
      this.prisma.workOrder.count({
        where: {
          ...where,
          status: WorkOrderStatus.RECEIVED,
        },
      }),
    ]);

    return {
      pending,
      received,
      total: pending + received,
    };
  }

  async findOne(id: string) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id },
      include: this.includeRelations,
    });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }
    return workOrder;
  }

  async update(
    id: string,
    updateDto: UpdateWorkOrderDto,
    userId: string,
    roleCode?: string,
  ) {
    const workOrder = await this.findOne(id);

    console.log('DEBUG update:', {
      id,
      userId,
      roleCode,
      creatorId: workOrder.creatorId,
    });

    // 只有创建人可以编辑，管理员除外
    if (workOrder.creatorId !== userId && roleCode !== 'admin') {
      throw new ForbiddenException('只有创建人或管理员可以编辑工单');
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: updateDto,
      include: this.includeRelations,
    });
  }

  async remove(id: string, userId: string, roleCode?: string) {
    const workOrder = await this.findOne(id);

    // 只有创建人可以删除，管理员除外
    if (workOrder.creatorId !== userId && roleCode !== 'admin') {
      throw new ForbiddenException('只有创建人或管理员可以删除工单');
    }

    await this.prisma.workOrder.delete({ where: { id } });

    // 触发 SSE 事件
    this.eventEmitter.emit('app.event', {
      type: 'work-order.deleted',
      payload: { id },
    });

    return { message: '删除成功' };
  }

  async receive(id: string, userId: string) {
    const workOrder = await this.findOne(id);

    // 允许接收待接收的工单，或转接已接收的工单
    if (workOrder.status === WorkOrderStatus.COMPLETED) {
      throw new BadRequestException('已完成的工单无法接收');
    }

    const previousReceiverId = workOrder.receiverId;

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: {
        status: WorkOrderStatus.RECEIVED,
        receiverId: userId,
        receivedAt: new Date(),
      },
      include: this.includeRelations,
    });

    // 如果是转接，通知原接收人
    if (previousReceiverId && previousReceiverId !== userId) {
      const newReceiver = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      await this.notificationsService.create({
        userId: previousReceiverId,
        type: 'work_order_transferred',
        title: '工单已转接',
        content: `您的工单已被 ${newReceiver?.name || '其他工程师'} 接收`,
        workOrderId: id,
      });
    }

    // 触发 SSE 事件
    this.eventEmitter.emit('app.event', {
      type: 'work-order.updated',
      payload: updated,
    });

    return updated;
  }

  async cancelReceive(id: string, userId: string) {
    const workOrder = await this.findOne(id);

    // 只有接收人可以取消接收
    if (workOrder.receiverId !== userId) {
      throw new ForbiddenException('只有接收人可以取消接收');
    }

    // 只有已接收状态的工单可以取消接收
    if (workOrder.status !== WorkOrderStatus.RECEIVED) {
      throw new BadRequestException('只有已接收的工单可以取消接收');
    }

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: {
        status: WorkOrderStatus.PENDING,
        receiverId: null,
        receivedAt: null,
      },
      include: this.includeRelations,
    });

    // 触发 SSE 事件
    this.eventEmitter.emit('app.event', {
      type: 'work-order.updated',
      payload: updated,
    });

    return updated;
  }

  async complete(
    id: string,
    userId: string,
    completeDto: CompleteWorkOrderDto,
  ) {
    const workOrder = await this.findOne(id);

    if (workOrder.status !== WorkOrderStatus.RECEIVED) {
      throw new BadRequestException('只有已接收的工单可以完成');
    }

    // 只有接收人可以完成
    if (workOrder.receiverId !== userId) {
      throw new ForbiddenException('只有接收人可以完成工单');
    }

    // 使用事务包裹多个数据库操作，确保数据一致性
    const completedWorkOrder = await this.prisma.$transaction(async (tx) => {
      // 更新工单状态
      await tx.workOrder.update({
        where: { id },
        data: {
          status: WorkOrderStatus.COMPLETED,
          completerId: userId,
          completedAt: new Date(),
        },
      });

      // 添加协作人
      if (completeDto.collaboratorIds?.length) {
        await tx.workOrderCollaborator.createMany({
          data: completeDto.collaboratorIds.map((collaboratorId) => ({
            workOrderId: id,
            userId: collaboratorId,
          })),
          skipDuplicates: true,
        });
      }

      // 返回更新后的工单
      return tx.workOrder.findUnique({
        where: { id },
        include: this.includeRelations,
      });
    });

    if (!completedWorkOrder) {
      throw new BadRequestException('工单更新失败');
    }

    // 触发 SSE 事件
    this.eventEmitter.emit('app.event', {
      type: 'work-order.updated',
      payload: completedWorkOrder,
    });

    return completedWorkOrder;
  }

  async export(filterDto: WorkOrderFilterDto) {
    const MAX_EXPORT_LIMIT = 50000;
    const BATCH_SIZE = 1000;

    const {
      page: _page,
      pageSize: _pageSize,
      ...filterWithoutPagination
    } = filterDto;

    // 获取总数量
    const where = this.buildWhereClause(filterWithoutPagination);
    const totalCount = await this.prisma.workOrder.count({ where });

    if (totalCount > MAX_EXPORT_LIMIT) {
      throw new BadRequestException(
        `导出数量超过限制(${MAX_EXPORT_LIMIT}条)，请缩小筛选范围`,
      );
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('工单列表');

    // A4 横向页面设置，方便打印
    worksheet.pageSetup = {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.4,
        right: 0.4,
        top: 0.5,
        bottom: 0.5,
        header: 0.3,
        footer: 0.3,
      },
    };

    // 按用户指定顺序设置表头: 完成人, 协作人, 客户简称, 工单详情, 创建时间, 完成时间
    worksheet.columns = [
      { header: '完成人', key: 'completer', width: 10 },
      { header: '协作人', key: 'collaborators', width: 12 },
      { header: '客户', key: 'customerName', width: 16 },
      { header: '工单详情', key: 'detail', width: 45 },
      { header: '创建时间', key: 'createdAt', width: 16 },
      { header: '完成时间', key: 'completedAt', width: 16 },
    ];

    // 表头样式
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 11 };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 22;

    let totalScore = 0;
    let processedCount = 0;
    let hasMore = true;

    // 分批查询和写入数据
    while (hasMore && processedCount < totalCount) {
      const batch = await this.prisma.workOrder.findMany({
        where,
        include: this.includeRelations,
        orderBy: [{ completer: { name: 'asc' } }, { createdAt: 'desc' }],
        skip: processedCount,
        take: BATCH_SIZE,
      });

      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      // 批量处理数据并写入工作表
      const rows = batch.map((wo) => {
        // 累积分值（排除复杂类型）
        if (
          wo.status === WorkOrderStatus.COMPLETED &&
          wo.scoreLevel !== ScoreLevel.COMPLEX
        ) {
          totalScore += SCORE_VALUES[wo.scoreLevel] || 0;
        }

        // 仅导出日期部分
        const formatDateOnly = (date?: Date | null) => {
          if (!date) return '';
          return new Date(date).toISOString().split('T')[0];
        };

        return {
          completer: wo.completer?.name ?? '',
          collaborators:
            wo.collaborators
              ?.map((c) => c.user?.name)
              .filter(Boolean)
              .join(', ') ?? '',
          customerName: wo.customer?.shortName || wo.customer?.name || '',
          detail: wo.detail,
          createdAt: formatDateOnly(wo.createdAt),
          completedAt: formatDateOnly(wo.completedAt),
        };
      });

      // 批量添加行
      worksheet.addRows(rows);
      processedCount += batch.length;

      // 如果达到限制，停止处理
      if (processedCount >= MAX_EXPORT_LIMIT) {
        break;
      }
    }

    // 设置所有行（包括表头和数据行）的样式
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      row.height = 25; // 统一行高
      row.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };

      // 表头特殊处理
      if (rowNumber === 1) {
        row.font = { bold: true, size: 11 };
      } else {
        row.font = { size: 10 };
      }

      // 添加边框
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // 添加汇总行
    worksheet.addRow({});
    const summaryRow = worksheet.addRow({
      completer: '分值合计',
      collaborators: totalScore,
    });
    summaryRow.font = { bold: true, size: 11 };
    summaryRow.alignment = { vertical: 'middle', horizontal: 'center' };
    summaryRow.height = 25;
    summaryRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    return workbook;
  }

  private buildWhereClause(
    filter: Omit<WorkOrderFilterDto, 'page' | 'pageSize'>,
  ): Prisma.WorkOrderWhereInput {
    const {
      status,
      statuses,
      regionId,
      serviceTypeId,
      customerId,
      creatorId,
      receiverId,
      startDate,
      endDate,
      keyword,
      completerId,
    } = filter;
    const where: Prisma.WorkOrderWhereInput = {};

    if (status) where.status = status;
    if (statuses?.length) {
      where.status = { in: statuses };
    }
    if (regionId) where.regionId = regionId;
    if (serviceTypeId) where.serviceTypeId = serviceTypeId;
    if (customerId) where.customerId = customerId;
    if (creatorId) where.creatorId = creatorId;
    if (receiverId) where.receiverId = receiverId;
    if (completerId) where.completerId = completerId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59');
    }

    if (keyword) {
      where.OR = [
        { detail: { contains: keyword, mode: 'insensitive' } },
        { customer: { name: { contains: keyword, mode: 'insensitive' } } },
        { customer: { shortName: { contains: keyword, mode: 'insensitive' } } },
      ];
    }

    return where;
  }
}
