import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto';

import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  // 创建通知
  async create(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: dto,
    });

    this.eventEmitter.emit('app.event', {
      type: 'notification.created',
      payload: notification,
    });

    return notification;
  }

  // 批量创建通知 (给多个用户)
  async createMany(dtos: CreateNotificationDto[]) {
    const result = await this.prisma.notification.createMany({
      data: dtos,
    });

    // 为每个用户发送 SSE 事件
    for (const dto of dtos) {
      this.eventEmitter.emit('app.event', {
        type: 'notification.created',
        payload: {
          ...dto,
          createdAt: new Date().toISOString(),
        },
      });
    }

    return result;
  }

  // 推送工单创建通知给区域工程师
  async notifyRegionEngineers(
    workOrderId: string,
    regionId: string,
    title: string,
    content: string,
  ) {
    // 查找该区域的所有工程师
    const engineers = await this.prisma.user.findMany({
      where: {
        regionId,
        role: { code: 'engineer' },
        isActive: true,
      },
      select: { id: true },
    });

    if (engineers.length === 0) return;

    const notifications = engineers.map((eng) => ({
      userId: eng.id,
      type: 'work_order_created',
      title,
      content,
      workOrderId,
    }));

    await this.createMany(notifications);
  }

  // 获取用户通知列表
  async findByUser(userId: string, includeRead = false) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(includeRead ? {} : { isRead: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // 获取未读数量
  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  // 标记为已读
  async markAsRead(ids: string[], userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: { in: ids },
        userId, // 确保只能标记自己的通知
      },
      data: { isRead: true },
    });
  }

  // 全部标记已读
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  // 删除单条/多条通知（仅能删除自己的）
  async delete(ids: string[], userId: string) {
    return this.prisma.notification.deleteMany({
      where: {
        id: { in: ids },
        userId,
      },
    });
  }

  // 清空全部通知（硬删除）
  async clearAll(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }
}
