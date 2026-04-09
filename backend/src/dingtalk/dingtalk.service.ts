import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import * as crypto from 'crypto';

interface WorkOrderData {
  id: string;
  detail: string;
  customer?: { name: string | null; shortName: string | null } | null;
  region?: { name: string | null } | null;
  serviceType?: { name: string | null } | null;
  creator?: { name: string | null } | null;
  createdAt: Date;
}

@Injectable()
export class DingtalkService {
  private readonly logger = new Logger(DingtalkService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 构建编辑工单通知消息
   */
  buildEditedWorkOrderMessage(workOrder: WorkOrderData) {
    const customerName =
      workOrder.customer?.shortName || workOrder.customer?.name || '未知';
    const regionName = workOrder.region?.name || '未知';
    const serviceTypeName = workOrder.serviceType?.name || '未知';
    const creatorName = workOrder.creator?.name || '未知';
    const createdAt = new Date(workOrder.createdAt).toLocaleString('zh-CN');

    return {
      title: '工单已编辑',
      text:
        `## 工单已编辑\n\n` +
        `- **客户**: ${customerName}\n` +
        `- **区域**: ${regionName}\n` +
        `- **服务类型**: ${serviceTypeName}\n` +
        `- **工单详情**: ${workOrder.detail.substring(0, 100)}${workOrder.detail.length > 100 ? '...' : ''}\n` +
        `- **创建人**: ${creatorName}\n` +
        `- **创建时间**: ${createdAt}\n\n` +
        `> [查看待办工单](${process.env.FRONTEND_URL || 'http://localhost:5173'})`,
    };
  }

  /**
   * 发送工单通知到指定区域的钉钉群
   */
  async sendWorkOrderNotification(
    workOrder: WorkOrderData,
    regionId: string,
  ): Promise<void> {
    // 获取区域配置
    const region = await this.prisma.region.findUnique({
      where: { id: regionId },
    });

    if (!region?.dingtalkWebhook) {
      this.logger.debug(`区域未配置钉钉机器人，跳过推送`);
      return;
    }

    const webhook = region.dingtalkWebhook;
    const secret = region.dingtalkSecret;

    // 构建 Markdown 消息
    const message = this.buildWorkOrderMessage(workOrder);

    try {
      await this.sendMarkdownMessage(webhook, secret, message);
      this.logger.log(
        `钉钉消息推送成功: 工单 ${workOrder.id} -> 区域 ${region.name}`,
      );
    } catch (error) {
      this.logger.error(`钉钉消息推送失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 根据工单区域ID发送钉钉通知
   */
  async sendNotificationByRegionId(
    regionId: string,
    workOrder: WorkOrderData,
  ): Promise<void> {
    const region = await this.prisma.region.findUnique({
      where: { id: regionId },
    });

    if (!region?.dingtalkWebhook) {
      this.logger.debug(`区域 ${regionId} 未配置钉钉机器人，跳过推送`);
      return;
    }

    const message = this.buildWorkOrderMessage(workOrder);

    try {
      await this.sendMarkdownMessage(
        region.dingtalkWebhook,
        region.dingtalkSecret,
        message,
      );
      this.logger.log(
        `钉钉消息推送成功: 工单 ${workOrder.id} -> 区域 ${region.name}`,
      );
    } catch (error) {
      this.logger.error(`钉钉消息推送失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 发送编辑工单通知
   */
  async sendEditedNotification(
    workOrder: WorkOrderData,
    regionId: string,
  ): Promise<void> {
    const region = await this.prisma.region.findUnique({
      where: { id: regionId },
    });

    if (!region?.dingtalkWebhook) {
      this.logger.debug(`区域 ${regionId} 未配置钉钉机器人，跳过推送`);
      return;
    }

    const message = this.buildEditedWorkOrderMessage(workOrder);

    try {
      await this.sendMarkdownMessage(
        region.dingtalkWebhook,
        region.dingtalkSecret,
        message,
      );
      this.logger.log(
        `钉钉编辑通知推送成功: 工单 ${workOrder.id} -> 区域 ${region.name}`,
      );
    } catch (error) {
      this.logger.error(`钉钉消息推送失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 构建工单通知消息
   */
  private buildWorkOrderMessage(workOrder: WorkOrderData) {
    const customerName =
      workOrder.customer?.shortName || workOrder.customer?.name || '未知';
    const regionName = workOrder.region?.name || '未知';
    const serviceTypeName = workOrder.serviceType?.name || '未知';
    const creatorName = workOrder.creator?.name || '未知';
    const createdAt = new Date(workOrder.createdAt).toLocaleString('zh-CN');

    return {
      title: '新工单通知',
      text:
        `## 新工单通知\n\n` +
        `- **客户**: ${customerName}\n` +
        `- **区域**: ${regionName}\n` +
        `- **服务类型**: ${serviceTypeName}\n` +
        `- **工单详情**: ${workOrder.detail.substring(0, 100)}${workOrder.detail.length > 100 ? '...' : ''}\n` +
        `- **创建人**: ${creatorName}\n` +
        `- **创建时间**: ${createdAt}\n\n` +
        `> [查看待办工单](${process.env.FRONTEND_URL || 'http://localhost:5173'})`,
    };
  }

  /**
   * 发送 Markdown 消息
   */
  private async sendMarkdownMessage(
    webhook: string,
    secret: string | null | undefined,
    message: { title: string; text: string },
  ): Promise<void> {
    const timestamp = Date.now();
    const sign = secret ? this.generateSign(timestamp, secret) : undefined;

    const url = sign
      ? `${webhook}&timestamp=${timestamp}&sign=${sign}`
      : webhook;

    await axios.post(url, {
      msgtype: 'markdown',
      markdown: message,
    });
  }

  /**
   * 生成加签签名
   */
  private generateSign(timestamp: number, secret: string): string {
    const stringToSign = `${timestamp}\n${secret}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(stringToSign);
    const sign = hmac.digest('base64');
    return encodeURIComponent(sign);
  }
}
