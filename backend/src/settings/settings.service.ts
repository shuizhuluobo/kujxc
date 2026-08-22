import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 系统设置读写服务（基于 SystemSetting 表，value 存 Json）
 */
@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Record<string, unknown>> {
    const rows = await this.prisma.systemSetting.findMany();
    const result: Record<string, unknown> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  }

  async get(key: string): Promise<unknown> {
    const row = await this.prisma.systemSetting.findUnique({ where: { key } });
    return row?.value ?? undefined;
  }

  async getNumber(key: string, fallback = 0): Promise<number> {
    const value = await this.get(key);
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  async set(key: string, value: unknown, updatedBy?: string): Promise<unknown> {
    const existing = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    if (!existing) {
      throw new NotFoundException(`系统设置 ${key} 不存在`);
    }
    const row = await this.prisma.systemSetting.update({
      where: { key },
      data: { value: value as object, updatedBy },
    });
    return row.value;
  }
}
