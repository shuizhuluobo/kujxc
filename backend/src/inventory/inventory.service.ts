import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryFifoService } from './inventory-fifo.service';
import {
  CreateInventoryBatchDto,
  UpdateInventoryBatchDto,
  InventoryFilterDto,
  StockQueryDto,
} from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fifoService: InventoryFifoService,
  ) {}

  private generateBatchId(): string {
    return this.fifoService.generateBatchId();
  }

  private buildWhere(query: InventoryFilterDto): Prisma.InventoryBatchWhereInput {
    const where: Prisma.InventoryBatchWhereInput = {};
    if (query.productId) where.productId = query.productId;
    if (query.warehouseId) where.warehouseId = query.warehouseId;
    if (query.supplierId) where.supplierId = query.supplierId;
    if (query.keyword) {
      where.OR = [
        { id: { contains: query.keyword, mode: 'insensitive' } },
        { product: { name: { contains: query.keyword, mode: 'insensitive' } } },
        { product: { code: { contains: query.keyword, mode: 'insensitive' } } },
        { storeName: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }
    return where;
  }

  async create(dto: CreateInventoryBatchDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, deletedAt: null },
    });
    if (!product) throw new NotFoundException('产品不存在');
    if (dto.warehouseId) {
      const wh = await this.prisma.warehouse.findUnique({ where: { id: dto.warehouseId } });
      if (!wh) throw new NotFoundException('仓库不存在');
    }
    if (dto.supplierId) {
      const sup = await this.prisma.supplier.findUnique({ where: { id: dto.supplierId } });
      if (!sup) throw new NotFoundException('供应商不存在');
    }
    const id = dto.id || this.generateBatchId();
    const existing = await this.prisma.inventoryBatch.findUnique({ where: { id } });
    if (existing) throw new BadRequestException(`批次ID ${id} 已存在`);
    return this.prisma.inventoryBatch.create({
      data: {
        id,
        productId: dto.productId,
        warehouseId: dto.warehouseId,
        storeName: dto.storeName,
        quantityIn: dto.quantityIn,
        quantityRem: dto.quantityIn,
        unitPrice: dto.unitPrice,
        purchasePrice: dto.purchasePrice,
        receivedAt: new Date(dto.receivedAt),
        supplierId: dto.supplierId,
        status: dto.status ?? 'NORMAL',
        flag: dto.flag ?? 'YES',
      },
      include: { product: true, warehouse: true, supplier: true },
    });
  }

  async findAll(query: InventoryFilterDto) {
    const { page = 1, pageSize = 20 } = query;
    const where = this.buildWhere(query);
    const [data, total] = await Promise.all([
      this.prisma.inventoryBatch.findMany({
        where,
        orderBy: { receivedAt: 'desc' },
        include: { product: true, warehouse: true, supplier: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.inventoryBatch.count({ where }),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: string) {
    const batch = await this.prisma.inventoryBatch.findUnique({
      where: { id },
      include: { product: true, warehouse: true, supplier: true },
    });
    if (!batch) throw new NotFoundException('库存批次不存在');
    return batch;
  }

  async update(id: string, dto: UpdateInventoryBatchDto) {
    await this.findOne(id);
    const data: Prisma.InventoryBatchUpdateInput = {};
    if (dto.productId !== undefined) {
      const p = await this.prisma.product.findFirst({
        where: { id: dto.productId, deletedAt: null },
      });
      if (!p) throw new NotFoundException('产品不存在');
      data.product = { connect: { id: dto.productId } };
    }
    if (dto.warehouseId !== undefined) {
      data.warehouse = dto.warehouseId ? { connect: { id: dto.warehouseId } } : { disconnect: true };
    }
    if (dto.supplierId !== undefined) {
      data.supplier = dto.supplierId ? { connect: { id: dto.supplierId } } : { disconnect: true };
    }
    if (dto.quantityIn !== undefined) {
      data.quantityIn = dto.quantityIn;
      // quantityRem 同步调整需业务判断，此处仅允许调大时补差；简化：不自动改 quantityRem，由盘点处理
    }
    if (dto.unitPrice !== undefined) data.unitPrice = dto.unitPrice;
    if (dto.purchasePrice !== undefined) data.purchasePrice = dto.purchasePrice;
    if (dto.receivedAt !== undefined) data.receivedAt = new Date(dto.receivedAt);
    if (dto.storeName !== undefined) data.storeName = dto.storeName;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.flag !== undefined) data.flag = dto.flag;
    return this.prisma.inventoryBatch.update({
      where: { id },
      data,
      include: { product: true, warehouse: true, supplier: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.inventoryBatch.delete({ where: { id } });
    return { message: '删除成功' };
  }

  /**
   * kccx 全局库存查询：按 productId 分组，sum quantityRem 与 sum quantityRem*unitPrice
   * 全局不按 warehouse 隔离；warehouseId 仅作为展示筛选，不参与分组过滤（除非显式传入 productId 场景）
   */
  async stock(query: StockQueryDto) {
    const { page = 1, pageSize = 20, keyword, productId } = query;

    // 构造批次过滤：全局库存不过滤 warehouse，keyword 匹配产品名称/编码
    const batchWhere: Prisma.InventoryBatchWhereInput = {
      quantityRem: { gt: 0 },
    };
    if (productId) batchWhere.productId = productId;
    if (keyword) {
      batchWhere.OR = [
        { product: { name: { contains: keyword, mode: 'insensitive' } } },
        { product: { code: { contains: keyword, mode: 'insensitive' } } },
        { id: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // 使用 groupBy 按 productId 聚合
    const groups = await this.prisma.inventoryBatch.groupBy({
      by: ['productId'],
      where: batchWhere,
      _sum: { quantityRem: true },
    });

    // 取产品信息 + 加权金额：sum(quantityRem*unitPrice) 需在内存计算或 raw query
    // 为保持 Prisma 兼容，分两步：先取批次明细再聚合金额
    const productIds = groups.map((g) => g.productId);
    if (productIds.length === 0) {
      return { data: [], total: 0, page, pageSize, totalPages: 0 };
    }

    // 拉取相关批次用于金额聚合（quantityRem*unitPrice）
    const batches = await this.prisma.inventoryBatch.findMany({
      where: batchWhere,
      select: { productId: true, quantityRem: true, unitPrice: true },
    });
    const amountByProduct = new Map<string, number>();
    const qtyByProduct = new Map<string, number>();
    for (const b of batches) {
      const qty = Number(b.quantityRem);
      const price = Number(b.unitPrice);
      amountByProduct.set(b.productId, (amountByProduct.get(b.productId) || 0) + qty * price);
      qtyByProduct.set(b.productId, (qtyByProduct.get(b.productId) || 0) + qty);
    }

    // 拉取产品详情
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, code: true, name: true, unit: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    // 组合结果
    let items = productIds.map((pid) => ({
      productId: pid,
      product: productMap.get(pid) || null,
      totalQuantity: qtyByProduct.get(pid) || 0,
      totalAmount: amountByProduct.get(pid) || 0,
    }));

    // keyword 已在 batchWhere 过滤，此处无需二次过滤
    // 排序：按 totalQuantity 倒序
    items.sort((a, b) => b.totalQuantity - a.totalQuantity);

    const total = items.length;
    const paged = items.slice((page - 1) * pageSize, page * pageSize);

    return {
      data: paged,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 全局 FIFO：按 cpid+receivedAt 排序，不按 warehouse 过滤
   * 用于出库扣减时依次消耗最早批次
   * 复用 InventoryFifoService 避免重复
   */
  async fifoBatches(productId: string, limit?: number) {
    const batches = await this.fifoService.getFifoBatches(productId);
    if (limit) return batches.slice(0, limit);
    return this.prisma.inventoryBatch.findMany({
      where: { productId, quantityRem: { gt: 0 } },
      orderBy: { receivedAt: 'asc' },
      take: limit,
      include: { warehouse: true, supplier: true },
    });
  }

  private async getFifoBatches(productId: string, limit?: number) {
    // 委托公共服务，保持单一来源
    const batches = await this.fifoService.getFifoBatches(productId);
    if (limit) return batches.slice(0, limit);
    // 为保持 include warehouse/supplier 的查询兼容，此处直接查询带 include
    return this.prisma.inventoryBatch.findMany({
      where: { productId, quantityRem: { gt: 0 } },
      orderBy: { receivedAt: 'asc' },
      take: limit,
      include: { warehouse: true, supplier: true },
    });
  }
}
