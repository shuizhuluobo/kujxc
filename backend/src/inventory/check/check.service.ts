import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CodeGeneratorService } from '../../common/services/code-generator.service';
import { CreateStockCheckDto } from './dto/check.dto';

@Injectable()
export class StockCheckService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codeGenerator: CodeGeneratorService,
  ) {}

  /**
   * 创建盘点单：对比系统库存 vs 实际数量，生成差异报告，不直接改库存
   */
  async create(dto: CreateStockCheckDto, userId?: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('盘点明细不能为空');
    }
    for (const it of dto.items) {
      const product = await this.prisma.product.findFirst({
        where: { id: it.productId, deletedAt: null },
      });
      if (!product) throw new NotFoundException(`产品 ${it.productId} 不存在`);
      if (it.actualQuantity == null || Number(it.actualQuantity) < 0) {
        throw new BadRequestException(`产品 ${it.productId} 实际数量不合法`);
      }
    }

    const code = await this.codeGenerator.generateCode('stock_check_order', 'PD');

    // 计算每个产品的系统数量 sum quantityRem
    const productIds = [...new Set(dto.items.map((i) => i.productId))];
    const batches = await this.prisma.inventoryBatch.findMany({
      where: { productId: { in: productIds } },
      select: { productId: true, quantityRem: true },
    });
    const systemMap = new Map<string, Prisma.Decimal>();
    for (const b of batches) {
      const cur = systemMap.get(b.productId) ?? new Prisma.Decimal(0);
      systemMap.set(b.productId, cur.add(b.quantityRem));
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.stockCheckOrder.create({
        data: {
          code,
          remark: dto.remark,
          status: 'COMPLETED',
          createdBy: userId,
        },
      });

      const detailsData = dto.items.map((it) => {
        const systemQty = systemMap.get(it.productId) ?? new Prisma.Decimal(0);
        const actualQty = new Prisma.Decimal(it.actualQuantity);
        const diff = actualQty.sub(systemQty);
        return {
          checkOrderId: order.id,
          productId: it.productId,
          systemQuantity: systemQty,
          actualQuantity: actualQty,
          diffQuantity: diff,
          remark: it.remark,
        };
      });

      await tx.stockCheckDetail.createMany({
        data: detailsData,
      });

      const full = await tx.stockCheckOrder.findUnique({
        where: { id: order.id },
        include: { details: { include: { product: true } } },
      });
      return full;
    });
  }

  async findAll(query: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 20 } = query;
    const [data, total] = await Promise.all([
      this.prisma.stockCheckOrder.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { details: { include: { product: true } } },
      }),
      this.prisma.stockCheckOrder.count(),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: string) {
    const order = await this.prisma.stockCheckOrder.findUnique({
      where: { id },
      include: { details: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException('盘点单不存在');
    // 计算汇总差异
    return order;
  }
}
