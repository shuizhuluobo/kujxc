import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CodeGeneratorService } from '../../common/services/code-generator.service';
import { InventoryFifoService } from '../inventory-fifo.service';
import { TransferDto } from './dto/transfer.dto';

@Injectable()
export class TransferService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codeGenerator: CodeGeneratorService,
    private readonly fifoService: InventoryFifoService,
  ) {}

  async create(dto: TransferDto, userId?: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, deletedAt: null },
    });
    if (!product) throw new NotFoundException('产品不存在');

    if (dto.fromWarehouseId) {
      const wh = await this.prisma.warehouse.findUnique({
        where: { id: dto.fromWarehouseId },
      });
      if (!wh) throw new NotFoundException('源仓库不存在');
    }
    if (dto.toWarehouseId) {
      const wh = await this.prisma.warehouse.findUnique({
        where: { id: dto.toWarehouseId },
      });
      if (!wh) throw new NotFoundException('目标仓库不存在');
    }
    if (
      dto.fromWarehouseId &&
      dto.toWarehouseId &&
      dto.fromWarehouseId === dto.toWarehouseId
    ) {
      throw new BadRequestException('源仓库与目标仓库不能相同');
    }
    const qty = new Prisma.Decimal(dto.quantity);
    if (qty.lte(0)) throw new BadRequestException('调拨数量必须大于0');

    // 校验全局库存是否充足（仅当需要扣减批次时）
    const needBatchMove = !!dto.toWarehouseId;
    if (needBatchMove) {
      const totalAgg = await this.prisma.inventoryBatch.aggregate({
        where: { productId: dto.productId, quantityRem: { gt: 0 } },
        _sum: { quantityRem: true },
      });
      const totalRem = totalAgg._sum.quantityRem ?? new Prisma.Decimal(0);
      if (new Prisma.Decimal(totalRem).lt(qty)) {
        throw new BadRequestException(
          `产品 ${dto.productId} 库存不足，需 ${qty.toString()}，可用 ${new Prisma.Decimal(totalRem).toString()}`,
        );
      }
    }

    const code = await this.codeGenerator.generateCode('transfer_order', 'DB');

    return this.prisma.$transaction(async (tx) => {
      if (needBatchMove) {
        const batches = await this.fifoService.getFifoBatchesTx(
          tx,
          dto.productId,
        );
        let totalRem = new Prisma.Decimal(0);
        for (const b of batches) totalRem = totalRem.add(b.quantityRem);
        if (totalRem.lt(qty)) {
          throw new BadRequestException(
            `产品 ${dto.productId} 库存不足，需 ${qty.toString()}，可用 ${totalRem.toString()}`,
          );
        }
        let remaining = qty;
        for (const batch of batches) {
          if (remaining.lte(0)) break;
          const batchRem = new Prisma.Decimal(batch.quantityRem);
          if (batchRem.lte(0)) continue;
          const take = batchRem.lt(remaining) ? batchRem : remaining;

          await tx.inventoryBatch.update({
            where: { id: batch.id },
            data: { quantityRem: { decrement: take } },
          });

          // 在目标仓库新建批次，继承单价/采购价
          let newId = this.fifoService.generateBatchId();
          // 避免极低概率的ID冲突
          let exists = await tx.inventoryBatch.findUnique({
            where: { id: newId },
          });
          let retries = 0;
          while (exists && retries < 3) {
            newId = this.fifoService.generateBatchId();
            exists = await tx.inventoryBatch.findUnique({
              where: { id: newId },
            });
            retries++;
          }
          if (exists) throw new BadRequestException(`批次ID ${newId} 冲突`);

          await tx.inventoryBatch.create({
            data: {
              id: newId,
              productId: dto.productId,
              warehouseId: dto.toWarehouseId,
              storeName: batch.storeName,
              quantityIn: take,
              quantityRem: take,
              unitPrice: batch.unitPrice,
              purchasePrice: batch.purchasePrice,
              receivedAt: new Date(),
              supplierId: batch.supplierId,
              status: batch.status,
              flag: batch.flag,
            },
          });

          remaining = remaining.sub(take);
        }
        if (remaining.gt(0)) {
          throw new BadRequestException(`调拨FIFO分配失败，剩余 ${remaining.toString()}`);
        }
        // 全局库存总量不变，无需更新 Stock
      }

      const order = await tx.transferOrder.create({
        data: {
          code,
          productId: dto.productId,
          quantity: qty,
          fromWarehouseId: dto.fromWarehouseId,
          toWarehouseId: dto.toWarehouseId,
          remark: dto.remark,
          createdBy: userId,
        },
        include: { product: true, fromWarehouse: true, toWarehouse: true },
      });
      return order;
    });
  }

  async findAll(query: { page?: number; pageSize?: number; productId?: string }) {
    const { page = 1, pageSize = 20, productId } = query;
    const where: Prisma.TransferOrderWhereInput = {};
    if (productId) where.productId = productId;
    const [data, total] = await Promise.all([
      this.prisma.transferOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { product: true, fromWarehouse: true, toWarehouse: true },
      }),
      this.prisma.transferOrder.count({ where }),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: string) {
    const order = await this.prisma.transferOrder.findUnique({
      where: { id },
      include: { product: true, fromWarehouse: true, toWarehouse: true },
    });
    if (!order) throw new NotFoundException('调拨单不存在');
    return order;
  }
}
