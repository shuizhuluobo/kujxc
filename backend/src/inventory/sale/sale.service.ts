import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CodeGeneratorService } from '../../common/services/code-generator.service';
import { InventoryFifoService } from '../inventory-fifo.service';
import { CreateSaleOrderDto, ApproveDto } from './dto/sale.dto';

@Injectable()
export class SaleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codeGenerator: CodeGeneratorService,
    private readonly fifoService: InventoryFifoService,
  ) {}

  async createOrder(dto: CreateSaleOrderDto, userId?: string) {
    if (!dto.details || dto.details.length === 0) {
      throw new BadRequestException('销售明细不能为空');
    }
    // 校验产品存在
    for (const d of dto.details) {
      const product = await this.prisma.product.findFirst({
        where: { id: d.productId, deletedAt: null },
      });
      if (!product) throw new NotFoundException(`产品 ${d.productId} 不存在`);
      if (d.quantity == null || Number(d.quantity) <= 0) {
        throw new BadRequestException(`产品 ${d.productId} 数量必须大于0`);
      }
    }
    if (dto.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
      });
      if (!customer) throw new NotFoundException('客户不存在');
    }

    const code = await this.codeGenerator.generateCode('sale_order', 'XS');

    // 事务创建 sale_order + details 状态PENDING
    return this.prisma.saleOrder.create({
      data: {
        code,
        status: 'PENDING',
        customerId: dto.customerId,
        remark: dto.remark,
        createdBy: userId,
        details: {
          create: dto.details.map((d) => ({
            productId: d.productId,
            quantity: new Prisma.Decimal(d.quantity),
            unitPrice:
              d.unitPrice != null ? new Prisma.Decimal(d.unitPrice) : undefined,
            remark: d.remark,
          })),
        },
      },
      include: { details: true, customer: true },
    });
  }

  async findAll(query: { page?: number; pageSize?: number; status?: string }) {
    const { page = 1, pageSize = 20, status } = query;
    const where: Prisma.SaleOrderWhereInput = {};
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.saleOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { details: { include: { product: true } }, customer: true },
      }),
      this.prisma.saleOrder.count({ where }),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: string) {
    const order = await this.prisma.saleOrder.findUnique({
      where: { id },
      include: {
        details: {
          include: { product: true, allocations: { include: { batch: true } } },
        },
        customer: true,
      },
    });
    if (!order) throw new NotFoundException('销售单不存在');
    return order;
  }

  /**
   * 严格FIFO审核：事务内按每个 detail 的 quantity 遍历 InventoryBatch
   * where quantityRem>0 orderBy receivedAt asc，take=min(need, batch.quantityRem)
   * 生成 SaleAllocation 并 decrement batch.quantityRem，校验总量不足则回滚抛错
   * 同步更新 Stock 全局数量
   */
  async approveOrder(id: string, _dto?: ApproveDto) {
    const order = await this.prisma.saleOrder.findUnique({
      where: { id },
      include: { details: true },
    });
    if (!order) throw new NotFoundException('销售单不存在');
    if (order.status !== 'PENDING') {
      throw new BadRequestException(`销售单状态为 ${order.status}，不可重复审核`);
    }

    return this.prisma.$transaction(async (tx) => {
      for (const detail of order.details) {
        const need = new Prisma.Decimal(detail.quantity);
        const batches = await this.getFifoBatches(tx, detail.productId);

        // 校验总量不足
        let totalRem = new Prisma.Decimal(0);
        for (const b of batches) {
          totalRem = totalRem.add(b.quantityRem);
        }
        if (totalRem.lt(need)) {
          throw new BadRequestException(
            `产品 ${detail.productId} 库存不足，需 ${need.toString()}，可用 ${totalRem.toString()}`,
          );
        }

        // 严格FIFO循环拆批，类似 legacy NewFolder1/cksh_edit
        let remaining = need;
        for (const batch of batches) {
          if (remaining.lte(0)) break;
          const batchRem = new Prisma.Decimal(batch.quantityRem);
          if (batchRem.lte(0)) continue;
          const take = batchRem.lt(remaining) ? batchRem : remaining;

          await tx.saleAllocation.create({
            data: {
              saleDetailId: detail.id,
              batchId: batch.id,
              quantity: take,
              unitCost: new Prisma.Decimal(batch.unitPrice),
            },
          });

          await tx.inventoryBatch.update({
            where: { id: batch.id },
            data: { quantityRem: { decrement: take } },
          });

          remaining = remaining.sub(take);
        }

        if (remaining.gt(0)) {
          // 防御：总量校验后不应出现
          throw new BadRequestException(`产品 ${detail.productId} FIFO 分配失败，剩余 ${remaining.toString()}`);
        }

        // 同步更新 Stock 全局数量
        const stock = await tx.stock.findUnique({
          where: { productId: detail.productId },
        });
        if (stock) {
          await tx.stock.update({
            where: { productId: detail.productId },
            data: { quantity: { decrement: need } },
          });
        } else {
          // 若 Stock 不存在，则以批次总量为基准创建剩余量；按 totalRem - need 计算
          const remainingStock = totalRem.sub(need);
          // 避免负数：若批次总量计算不含已扣减部分，需确保非负
          const safeQty = remainingStock.gte(0) ? remainingStock : new Prisma.Decimal(0);
          await tx.stock.create({
            data: {
              productId: detail.productId,
              quantity: safeQty,
            },
          });
        }
      }

      // 更新单头状态为 APPROVED
      return tx.saleOrder.update({
        where: { id },
        data: { status: 'APPROVED' },
        include: { details: { include: { allocations: true } } },
      });
    });
  }

  /**
   * 复用 InventoryFifoService 保持 FIFO 单一来源
   * 全局不按 warehouse 隔离，FIFO 按 productId + receivedAt ASC
   */
  private async getFifoBatches(
    tx: Prisma.TransactionClient,
    productId: string,
  ) {
    return this.fifoService.getFifoBatchesTx(tx, productId);
  }
}
