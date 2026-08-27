import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CodeGeneratorService } from '../../common/services/code-generator.service';
import { InventoryFifoService } from '../inventory-fifo.service';
import { CreateReturnDto } from './dto/return.dto';

@Injectable()
export class ReturnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codeGenerator: CodeGeneratorService,
    private readonly fifoService: InventoryFifoService,
  ) {}

  async create(dto: CreateReturnDto, userId?: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, deletedAt: null },
    });
    if (!product) throw new NotFoundException('产品不存在');
    if (dto.saleOrderId) {
      const so = await this.prisma.saleOrder.findUnique({
        where: { id: dto.saleOrderId },
      });
      if (!so) throw new NotFoundException('关联销售单不存在');
    }
    const qty = new Prisma.Decimal(dto.quantity);
    if (qty.lte(0)) throw new BadRequestException('退货数量必须大于0');

    const code = await this.codeGenerator.generateCode('return_order', 'TH');

    return this.prisma.$transaction(async (tx) => {
      // LIFO 回补：优先回补最近被扣减的批次 (quantityRem < quantityIn) 按 receivedAt DESC
      const batches = await this.fifoService.getLifoReplenishBatches(
        tx,
        dto.productId,
      );

      let remaining = qty;

      if (batches.length > 0) {
        for (const batch of batches) {
          if (remaining.lte(0)) break;
          const rem = new Prisma.Decimal(batch.quantityRem);
          const inn = new Prisma.Decimal(batch.quantityIn);
          const available = inn.sub(rem); // 可回补空间
          if (available.lte(0)) continue;
          const take = available.lt(remaining) ? available : remaining;
          await tx.inventoryBatch.update({
            where: { id: batch.id },
            data: { quantityRem: { increment: take } },
          });
          remaining = remaining.sub(take);
        }
      }

      // 若仍有剩余（库存已满或无批次），对最早批次直接 increment，或新建一批次
      if (remaining.gt(0)) {
        // 尝试找到最早批次进行增量
        const earliest = await tx.inventoryBatch.findFirst({
          where: { productId: dto.productId },
          orderBy: { receivedAt: 'asc' },
        });
        if (earliest) {
          await tx.inventoryBatch.update({
            where: { id: earliest.id },
            data: { quantityRem: { increment: remaining } },
          });
        } else {
          // 无批次则新建
          const newId = this.fifoService.generateBatchId();
          // 查询产品默认价格兜底
          const defaultPrice = new Prisma.Decimal(0);
          await tx.inventoryBatch.create({
            data: {
              id: newId,
              productId: dto.productId,
              quantityIn: remaining,
              quantityRem: remaining,
              unitPrice: defaultPrice,
              receivedAt: new Date(),
            },
          });
        }
        remaining = new Prisma.Decimal(0);
      }

      // 同步更新 Stock
      const stock = await tx.stock.findUnique({
        where: { productId: dto.productId },
      });
      if (stock) {
        await tx.stock.update({
          where: { productId: dto.productId },
          data: { quantity: { increment: qty } },
        });
      } else {
        // 创建 stock 以当前总量为准
        const agg = await tx.inventoryBatch.aggregate({
          where: { productId: dto.productId },
          _sum: { quantityRem: true },
        });
        const total = agg._sum.quantityRem ?? qty;
        await tx.stock.upsert({
          where: { productId: dto.productId },
          update: { quantity: total },
          create: { productId: dto.productId, quantity: total },
        });
      }

      const order = await tx.returnOrder.create({
        data: {
          code,
          productId: dto.productId,
          quantity: qty,
          remark: dto.remark,
          saleOrderId: dto.saleOrderId,
          createdBy: userId,
        },
        include: { product: true, saleOrder: true },
      });
      return order;
    });
  }

  async findAll(query: { page?: number; pageSize?: number; productId?: string }) {
    const { page = 1, pageSize = 20, productId } = query;
    const where: Prisma.ReturnOrderWhereInput = {};
    if (productId) where.productId = productId;
    const [data, total] = await Promise.all([
      this.prisma.returnOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { product: true, saleOrder: true },
      }),
      this.prisma.returnOrder.count({ where }),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: string) {
    const order = await this.prisma.returnOrder.findUnique({
      where: { id },
      include: { product: true, saleOrder: true },
    });
    if (!order) throw new NotFoundException('退货单不存在');
    return order;
  }
}
