import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 通用编号生成服务
 *
 * 支持多种业务实体类型（产品、报价、项目、客户、合同、采购单等），
 * 每种实体独立维护序列，按 `entityType + year + month` 分段，每月从 1 开始。
 * 编号格式：`{前缀}-{年份后2位}{月份2位}-{5位序列}`，如 `LX-2608-00001`。
 *
 * 并发安全：事务内使用原生 SQL `FOR UPDATE` 行锁锁定当月序列行后再递增，
 * 组合唯一索引兜底，防止并发重复编号。
 */
@Injectable()
export class CodeGeneratorService {
  private readonly logger = new Logger(CodeGeneratorService.name);

  private readonly defaultPrefixes: Record<string, string> = {
    product: 'LX', // 产品
    quotation: 'BJ', // 报价
    project: 'XM', // 项目
    customer: 'KH', // 客户
    contract: 'HT', // 合同
    purchase: 'CG', // 采购单
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 生成单个编号
   * @param entityType 实体类型（如 'product' / 'quotation'）
   * @param prefix 可选，自定义前缀，缺省时从配置读取
   */
  async generateCode(entityType: string, prefix?: string): Promise<string> {
    return this.withRetry(async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const codePrefix = prefix || (await this.getPrefix(entityType));

      const value = await this.prisma.$transaction(async (tx) => {
        return this.nextValue(tx, entityType, year, month);
      });

      return this.formatCode(codePrefix, year, month, value);
    });
  }

  /**
   * 批量预生成编号（用于批量导入等场景，一次事务预留序列号段）
   */
  async generateBatchCodes(
    entityType: string,
    count: number,
    prefix?: string,
  ): Promise<string[]> {
    if (count <= 0) return [];
    return this.withRetry(async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const codePrefix = prefix || (await this.getPrefix(entityType));

      const start = await this.prisma.$transaction(async (tx) => {
        const rows = await tx.$queryRaw<
          Array<{ id: number; currentValue: number }>
        >`
          SELECT "id", "currentValue" FROM "code_sequences"
          WHERE "entityType" = ${entityType} AND "year" = ${year} AND "month" = ${month}
          FOR UPDATE
        `;
        if (rows.length === 0) {
          const created = await tx.codeSequence.create({
            data: { entityType, year, month, currentValue: count },
          });
          return created.currentValue - count + 1;
        }
        const seq = await tx.codeSequence.update({
          where: { id: rows[0].id },
          data: { currentValue: { increment: count } },
        });
        return seq.currentValue - count + 1;
      });

      const codes: string[] = [];
      for (let i = 0; i < count; i++) {
        codes.push(this.formatCode(codePrefix, year, month, start + i));
      }
      return codes;
    });
  }

  /**
   * 事务内获取当月下一个序列号（FOR UPDATE 行锁）
   */
  private async nextValue(
    tx: Prisma.TransactionClient,
    entityType: string,
    year: number,
    month: number,
  ): Promise<number> {
    const rows = await tx.$queryRaw<
      Array<{ id: number; currentValue: number }>
    >`
      SELECT "id", "currentValue" FROM "code_sequences"
      WHERE "entityType" = ${entityType} AND "year" = ${year} AND "month" = ${month}
      FOR UPDATE
    `;

    if (rows.length === 0) {
      const created = await tx.codeSequence.create({
        data: { entityType, year, month, currentValue: 1 },
      });
      return created.currentValue;
    }

    const seq = await tx.codeSequence.update({
      where: { id: rows[0].id },
      data: { currentValue: { increment: 1 } },
    });
    return seq.currentValue;
  }

  private formatCode(
    prefix: string,
    year: number,
    month: number,
    value: number,
  ): string {
    const yearStr = year.toString().slice(-2);
    const monthStr = month.toString().padStart(2, '0');
    const seqStr = value.toString().padStart(5, '0');
    return `${prefix}-${yearStr}${monthStr}-${seqStr}`;
  }

  /**
   * 获取实体类型前缀：优先读 CodePrefixConfig 表，其次兜底硬编码配置
   */
  private async getPrefix(entityType: string): Promise<string> {
    try {
      const config = await this.prisma.codePrefixConfig.findUnique({
        where: { entityType },
      });
      if (config?.isActive) {
        return config.prefix;
      }
    } catch {
      // 表未初始化时兜底
    }
    return this.defaultPrefixes[entityType] || 'CODE';
  }

  /**
   * 校验编号格式是否合法
   * @param code 编号
   * @param entityType 可选，校验前缀是否匹配
   */
  async validateCodeFormat(
    code: string,
    entityType?: string,
  ): Promise<boolean> {
    const regex = /^[A-Z]{2,4}-\d{4}-\d{5}$/;
    if (!regex.test(code)) {
      return false;
    }
    if (entityType) {
      const expected = await this.getPrefix(entityType);
      const [actualPrefix] = code.split('-');
      return actualPrefix === expected;
    }
    return true;
  }

  /**
   * 并发创建序列记录时可能出现唯一约束冲突（P2002），整体重试
   */
  private async withRetry<T>(fn: () => Promise<T>, retries = 5): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await fn();
      } catch (error) {
        const isConflict =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002';
        if (isConflict && attempt < retries - 1) {
          continue;
        }
        if (isConflict) {
          this.logger.warn(
            `编号生成并发冲突重试超过 ${retries} 次，entityType 序列号可能异常`,
          );
        }
        throw error;
      }
    }
  }
}
