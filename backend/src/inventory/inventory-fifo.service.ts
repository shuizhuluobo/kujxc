import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryFifoService {
  constructor(private readonly prisma: PrismaService) {}

  generateBatchId(): string {
    const d = new Date();
    const y = d.getFullYear().toString();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const rand = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `${y}${m}${day}${rand}`;
  }

  /**
   * 全局 FIFO：按 receivedAt 升序，不按仓库隔离
   * 用于出库/调拨扣减
   */
  async getFifoBatches(
    productId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = (tx ?? this.prisma) as Prisma.TransactionClient;
    return client.inventoryBatch.findMany({
      where: { productId, quantityRem: { gt: 0 } },
      orderBy: { receivedAt: 'asc' },
    });
  }

  /**
   * 供事务内调用的 FIFO 查询（强制 tx）
   */
  async getFifoBatchesTx(
    tx: Prisma.TransactionClient,
    productId: string,
  ) {
    return tx.inventoryBatch.findMany({
      where: { productId, quantityRem: { gt: 0 } },
      orderBy: { receivedAt: 'asc' },
    });
  }

  /**
   * LIFO 回补查询：按 receivedAt DESC，优先回补最近消耗的批次
   * 过滤 quantityRem < quantityIn 的已消耗批次；若无则回退到任意批次
   */
  async getLifoReplenishBatches(
    tx: Prisma.TransactionClient,
    productId: string,
  ) {
    const batches = await tx.inventoryBatch.findMany({
      where: { productId },
      orderBy: { receivedAt: 'desc' },
    });
    const filtered = batches.filter((b) => {
      const rem = new Prisma.Decimal(b.quantityRem);
      const inn = new Prisma.Decimal(b.quantityIn);
      return rem.lt(inn);
    });
    if (filtered.length > 0) return filtered;
    return batches;
  }
}
