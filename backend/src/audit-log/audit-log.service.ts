import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 审计日志服务：记录关键操作（删除产品、删除报价、修改成本价、批量导入等）
 */
@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    userId: string | undefined,
    action: string,
    entityType: string,
    entityId?: string,
    detail?: Record<string, unknown>,
  ) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        detail: detail ? (detail as object) : undefined,
      },
    });
  }

  async findAll(query: {
    entityType?: string;
    entityId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { entityType, entityId, page = 1, pageSize = 20 } = query;
    const where = {
      ...(entityType ? { entityType } : {}),
      ...(entityId ? { entityId } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { data, total, page, pageSize };
  }
}
