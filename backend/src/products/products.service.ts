import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../prisma/prisma.service';
import { CodeGeneratorService } from '../common/services/code-generator.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { toPinyinFields } from './pinyin.util';
import { SettingsService } from '../settings/settings.service';
import {
  BatchDeleteDto,
  BatchStatusDto,
  CreateProductDto,
  ProductFilterDto,
  UpdateProductDto,
} from './dto';

const CHANGE_LOG_FIELDS = [
  'name',
  'model',
  'description',
  'status',
  'isMarketProduct',
  'unit',
  'minOrderQty',
  'warranty',
  'supplier',
  'marketUrl',
  'marketPrice',
  'salePrice',
  'costPrice',
] as const;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codeGenerator: CodeGeneratorService,
    private readonly auditLog: AuditLogService,
    private readonly settings: SettingsService,
  ) {}

  /** 名称 → 拼音检索列（全拼 + 首字母） */
  private pinyinFieldsOf(name?: string | null) {
    const { full, initials } = toPinyinFields(name);
    return { namePinyin: full || null, nameInitials: initials || null };
  }

  private productInclude(userId?: string) {
    return {
      brand: true,
      category: true,
      images: { orderBy: { displayOrder: 'asc' as const } },
      certificates: { orderBy: { displayOrder: 'asc' as const } },
      tags: { include: { tag: true } },
      favorites: userId
        ? { where: { userId }, take: 1, select: { id: true } }
        : false,
      // 收藏总数：列表展示与 Excel 导出「收藏数」列共用
      _count: { select: { favorites: true } },
    };
  }

  private serialize(
    product: Prisma.ProductGetPayload<{
      include: ReturnType<ProductsService['productInclude']>;
    }>,
    opts: { isStale: boolean },
  ) {
    const base: Record<string, unknown> = {
      id: product.id,
      code: product.code,
      name: product.name,
      model: product.model,
      description: product.description,
      status: product.status,
      isMarketProduct: product.isMarketProduct,
      unit: product.unit,
      minOrderQty: product.minOrderQty,
      warranty: product.warranty,
      supplier: product.supplier,
      marketUrl: product.marketUrl,
      marketPrice:
        product.marketPrice != null ? Number(product.marketPrice) : null,
      salePrice: product.salePrice != null ? Number(product.salePrice) : null,
      costPrice: product.costPrice != null ? Number(product.costPrice) : null,
      lastPriceUpdateAt: product.lastPriceUpdateAt,
      staleAcknowledgedAt: product.staleAcknowledgedAt,
      viewCount: product.viewCount,
      brandId: product.brandId,
      brand: product.brand,
      categoryId: product.categoryId,
      category: product.category,
      images: product.images,
      certificates: product.certificates,
      tags: (product.tags || []).map((r) => r.tag),
      isFavorite: !!(
        product.favorites && (product.favorites as unknown[]).length > 0
      ),
      favoriteCount: product._count?.favorites ?? 0,
      isStale: opts.isStale,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      createdBy: product.createdBy,
      updatedBy: product.updatedBy,
    };
    return base;
  }

  private isStale(
    product: {
      status: ProductStatus;
      isMarketProduct: boolean;
      marketPrice: Prisma.Decimal | null;
      salePrice: Prisma.Decimal | null;
      lastPriceUpdateAt: Date | null;
      updatedAt: Date;
      staleAcknowledgedAt?: Date | null;
    },
    thresholdDays: number,
  ): boolean {
    // 超期判定基于当前生效价格：商城产品看 marketPrice，否则看 salePrice
    const effectivePrice = product.isMarketProduct
      ? product.marketPrice
      : product.salePrice;
    if (product.status !== 'ACTIVE' || effectivePrice == null) return false;
    // 阈值由调用方在 findAll 中统一获取一次，避免每行重复读取 settings
    const threshold = new Date(
      Date.now() - thresholdDays * 24 * 60 * 60 * 1000,
    );
    // 续期基准：取「最近改价时间」与「用户确认无需更新的时间」的较大值
    const refTimes = [
      product.lastPriceUpdateAt?.getTime() ?? 0,
      product.updatedAt?.getTime() ?? 0,
      product.staleAcknowledgedAt?.getTime() ?? 0,
    ];
    const ref = new Date(Math.max(...refTimes));
    return ref < threshold;
  }

  async create(userId: string, dto: CreateProductDto) {
    const code = await this.codeGenerator.generateCode('product');
    const staleThresholdDays = await this.settings.getNumber(
      'staleThresholdDays',
      90,
    );
    const product = await this.prisma.product.create({
      data: {
        code,
        name: dto.name,
        ...this.pinyinFieldsOf(dto.name),
        model: dto.model,
        description: dto.description,
        status: dto.status,
        isMarketProduct: dto.isMarketProduct ?? false,
        unit: dto.unit,
        minOrderQty: dto.minOrderQty,
        warranty: dto.warranty,
        supplier: dto.supplier,
        marketUrl: dto.marketUrl,
        marketPrice: dto.marketPrice,
        salePrice: dto.salePrice,
        costPrice: dto.costPrice,
        lastPriceUpdateAt:
          dto.marketPrice != null || dto.salePrice != null ? new Date() : null,
        brandId: dto.brandId,
        categoryId: dto.categoryId,
        createdBy: userId,
        updatedBy: userId,
        tags: dto.tagIds?.length
          ? {
              create: dto.tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
        images: dto.images?.length
          ? {
              create: dto.images.map((img, i) => ({
                url: img.url,
                description: img.description,
                displayOrder: img.displayOrder ?? i,
              })),
            }
          : undefined,
        certificates: dto.certificates?.length
          ? {
              create: dto.certificates.map((cert, i) => ({
                url: cert.url,
                name: cert.name,
                description: cert.description,
                displayOrder: cert.displayOrder ?? i,
              })),
            }
          : undefined,
      },
      include: this.productInclude(userId),
    });
    return this.serialize(product, {
      isStale: this.isStale(product, staleThresholdDays),
    });
  }

  /** 根据筛选条件构造 Prisma where，findAll 与 exportList 共用，避免逻辑漂移 */
  private buildWhere(query: ProductFilterDto): Prisma.ProductWhereInput {
    const {
      keyword,
      brandIds,
      categoryId,
      tagIds,
      status,
      minPrice,
      maxPrice,
    } = query;

    const conditions: Prisma.ProductWhereInput[] = [{ deletedAt: null }];

    if (brandIds?.length) {
      conditions.push({ brandId: { in: brandIds } });
    }
    if (categoryId) {
      conditions.push({ categoryId });
    }
    if (tagIds?.length) {
      // 多选标签采用「且」语义：产品需同时包含所有已选标签
      conditions.push({
        AND: tagIds.map((tagId) => ({ tags: { some: { tagId } } })),
      });
    }
    if (status && status !== 'ALL') {
      conditions.push({ status });
    }
    if (minPrice != null || maxPrice != null) {
      const priceFilter = {
        ...(minPrice != null ? { gte: minPrice } : {}),
        ...(maxPrice != null ? { lte: maxPrice } : {}),
      };
      conditions.push({
        OR: [{ marketPrice: priceFilter }, { salePrice: priceFilter }],
      });
    }
    if (keyword) {
      const or: Prisma.ProductWhereInput[] = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { model: { contains: keyword, mode: 'insensitive' } },
        { code: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
      // 纯字母/数字关键词追加拼音全拼（包含）与首字母（前缀）检索，如 dnao/htrp
      const asciiKw = keyword
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      if (asciiKw.length >= 2) {
        or.push({ namePinyin: { contains: asciiKw, mode: 'insensitive' } });
        or.push({ nameInitials: { startsWith: asciiKw } });
      }
      conditions.push({ OR: or });
    }

    return { AND: conditions };
  }

  async findAll(query: ProductFilterDto, userId: string) {
    const { page = 1, pageSize = 20, orderBy } = query;

    const where = this.buildWhere(query);

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy:
          orderBy === 'staleFirst'
            ? { updatedAt: 'asc' }
            : { updatedAt: 'desc' },
        include: this.productInclude(userId),
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    const staleThresholdDays = await this.settings.getNumber(
      'staleThresholdDays',
      90,
    );
    const serialized = data.map((p) => {
      const isStale = this.isStale(p, staleThresholdDays);
      return this.serialize(p, { isStale });
    });

    return {
      data: serialized,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      staleThresholdDays,
    };
  }

  /**
   * 导出产品列表为 Excel（.xlsx）。
   * 复用 buildWhere 的筛选条件，分页拉取全部数据后写入工作簿，避免一次性加载全部行到内存。
   */
  async exportList(
    query: ProductFilterDto,
    userId: string,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const where = this.buildWhere(query);
    const orderBy =
      query.orderBy === 'staleFirst'
        ? ({ updatedAt: 'asc' } as const)
        : ({ updatedAt: 'desc' } as const);
    const staleThresholdDays = await this.settings.getNumber(
      'staleThresholdDays',
      90,
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = '产品库';
    workbook.created = new Date();
    const sheet = workbook.addWorksheet('产品列表');

    sheet.columns = [
      { header: '产品编号', key: 'code', width: 16 },
      { header: '品牌型号', key: 'name', width: 28 },
      { header: '型号', key: 'model', width: 16 },
      { header: '品牌', key: 'brand', width: 14 },
      { header: '类型', key: 'category', width: 14 },
      { header: '市场价', key: 'marketPrice', width: 12 },
      { header: '单位', key: 'unit', width: 8 },
      { header: '状态', key: 'status', width: 10 },
      { header: '超期', key: 'isStale', width: 8 },
      { header: '供应商', key: 'supplier', width: 18 },
      { header: '收藏数', key: 'favoriteCount', width: 10 },
      { header: '浏览数', key: 'viewCount', width: 10 },
      { header: '最近更新价', key: 'lastPriceUpdateAt', width: 18 },
      { header: '创建时间', key: 'createdAt', width: 18 },
    ];
    sheet.getRow(1).font = { bold: true };

    const BATCH = 200;
    let skip = 0;
    // 游标分页拉取，直到无更多数据

    while (true) {
      const batch = await this.prisma.product.findMany({
        where,
        orderBy,
        include: this.productInclude(userId),
        skip,
        take: BATCH,
      });
      if (batch.length === 0) break;

      const rows = batch.map((p) => {
        const s = this.serialize(p, {
          isStale: this.isStale(p, staleThresholdDays),
        });
        return {
          code: s.code,
          name: s.name,
          model: s.model ?? '',
          brand: (p.brand as { name?: string } | null)?.name ?? '',
          category: (p.category as { name?: string } | null)?.name ?? '',
          marketPrice: s.marketPrice,
          unit: s.unit ?? '',
          status: s.status,
          isStale: s.isStale ? '是' : '否',
          supplier: s.supplier ?? '',
          favoriteCount: s.favoriteCount ?? 0,
          viewCount: s.viewCount ?? 0,
          lastPriceUpdateAt:
            p.lastPriceUpdateAt != null
              ? new Date(p.lastPriceUpdateAt).toLocaleString('zh-CN')
              : '',
          createdAt: new Date(p.createdAt).toLocaleString('zh-CN'),
        };
      });
      rows.forEach((r) => sheet.addRow(r));
      skip += batch.length;
      if (batch.length < BATCH) break;
    }

    const buffer = (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
    const fileName = `产品列表_${new Date().toISOString().slice(0, 10)}.xlsx`;
    return { buffer, fileName };
  }

  async findOne(id: string, userId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: this.productInclude(userId),
    });
    if (!product) {
      throw new NotFoundException('产品不存在');
    }
    const staleThresholdDays = await this.settings.getNumber(
      'staleThresholdDays',
      90,
    );
    return this.serialize(product, {
      isStale: this.isStale(product, staleThresholdDays),
    });
  }

  /**
   * 用户「确认无需更新」——记录续期时间，相当于把超期基准刷新为当前时刻，
   * 在阈值天数内不再提醒。若后续真的改价，lastPriceUpdateAt 会更晚，提醒自然重新生效。
   */
  async acknowledgeStale(id: string, userId: string) {
    const existing = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException('产品不存在');
    }
    const updated = await this.prisma.product.update({
      where: { id },
      data: { staleAcknowledgedAt: new Date(), updatedBy: userId },
      include: this.productInclude(userId),
    });
    const staleThresholdDays = await this.settings.getNumber(
      'staleThresholdDays',
      90,
    );
    return this.serialize(updated, {
      isStale: this.isStale(updated, staleThresholdDays),
    });
  }

  /** 详情页记录查看次数 */
  async recordView(id: string, userId: string) {
    await this.findOne(id, userId);
    const product = await this.prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      include: this.productInclude(userId),
    });
    const staleThresholdDays = await this.settings.getNumber(
      'staleThresholdDays',
      90,
    );
    return this.serialize(product, {
      isStale: this.isStale(product, staleThresholdDays),
    });
  }

  async update(userId: string, id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException('产品不存在');
    }

    const data: Prisma.ProductUncheckedUpdateInput = {
      name: dto.name,
      ...(dto.name !== undefined && dto.name !== existing.name
        ? this.pinyinFieldsOf(dto.name)
        : {}),
      model: dto.model,
      description: dto.description,
      status: dto.status,
      unit: dto.unit,
      minOrderQty: dto.minOrderQty,
      warranty: dto.warranty,
      supplier: dto.supplier,
      marketUrl: dto.marketUrl,
      brandId: dto.brandId,
      categoryId: dto.categoryId,
      updatedBy: userId,
    };

    if (dto.marketPrice !== undefined) {
      data.marketPrice = dto.marketPrice;
      if (dto.marketPrice !== Number(existing.marketPrice)) {
        data.lastPriceUpdateAt = new Date();
      }
    }

    if (dto.salePrice !== undefined) {
      data.salePrice = dto.salePrice;
      if (dto.salePrice !== Number(existing.salePrice)) {
        data.lastPriceUpdateAt = new Date();
      }
    }

    if (dto.costPrice !== undefined) {
      data.costPrice = dto.costPrice;
      if (dto.costPrice !== Number(existing.costPrice)) {
        data.lastPriceUpdateAt = new Date();
      }
    }

    if (dto.isMarketProduct !== undefined) {
      data.isMarketProduct = dto.isMarketProduct;
    }

    // 变更日志（仅记录实际变化字段）
    const logs: Prisma.ProductChangeLogCreateManyInput[] = [];
    for (const field of CHANGE_LOG_FIELDS) {
      if (dto[field] === undefined) continue;
      const oldVal = (existing as Record<string, unknown>)[field];
      const newVal = dto[field];
      const oldStr = oldVal == null ? '' : (JSON.stringify(oldVal) ?? '');
      const newStr = newVal == null ? '' : (JSON.stringify(newVal) ?? '');
      if (oldStr !== newStr) {
        logs.push({
          productId: id,
          field,
          oldValue: oldVal == null ? null : oldStr,
          newValue: newVal == null ? null : newStr,
          changedBy: userId,
        });
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data });
      if (logs.length > 0) {
        await tx.productChangeLog.createMany({ data: logs });
      }
      if (dto.tagIds !== undefined) {
        await tx.productTagRelation.deleteMany({ where: { productId: id } });
        if (dto.tagIds.length > 0) {
          await tx.productTagRelation.createMany({
            data: dto.tagIds.map((tagId) => ({ productId: id, tagId })),
          });
        }
      }
      if (dto.images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (dto.images.length > 0) {
          await tx.productImage.createMany({
            data: dto.images.map((img, i) => ({
              productId: id,
              url: img.url,
              description: img.description,
              displayOrder: img.displayOrder ?? i,
            })),
          });
        }
      }
      if (dto.certificates !== undefined) {
        await tx.productCertificate.deleteMany({ where: { productId: id } });
        if (dto.certificates.length > 0) {
          await tx.productCertificate.createMany({
            data: dto.certificates.map((cert, i) => ({
              productId: id,
              url: cert.url,
              name: cert.name,
              description: cert.description,
              displayOrder: cert.displayOrder ?? i,
            })),
          });
        }
      }
    });

    return this.findOne(id, userId);
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException('产品不存在');
    }
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    });
    await this.auditLog.log(userId, 'delete', 'product', id, {
      code: existing.code,
      name: existing.name,
    });
    return { message: '删除成功' };
  }

  async batchUpdateStatus(userId: string, dto: BatchStatusDto) {
    const result = await this.prisma.product.updateMany({
      where: { id: { in: dto.ids }, deletedAt: null },
      data: { status: dto.status, updatedBy: userId },
    });
    await this.auditLog.log(userId, 'batch_status', 'product', undefined, {
      ids: dto.ids,
      status: dto.status,
      affected: result.count,
    });
    return { affected: result.count };
  }

  async batchRemove(userId: string, dto: BatchDeleteDto) {
    const result = await this.prisma.product.updateMany({
      where: { id: { in: dto.ids }, deletedAt: null },
      data: { deletedAt: new Date(), updatedBy: userId },
    });
    await this.auditLog.log(userId, 'batch_delete', 'product', undefined, {
      ids: dto.ids,
      affected: result.count,
    });
    return { affected: result.count };
  }

  // ==================== 收藏 ====================

  async toggleFavorite(userId: string, productId: string) {
    await this.findOne(productId, userId);
    const existing = await this.prisma.userProductFavorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      await this.prisma.userProductFavorite.delete({
        where: { id: existing.id },
      });
      return { isFavorite: false };
    }
    await this.prisma.userProductFavorite.create({
      data: { userId, productId },
    });
    return { isFavorite: true };
  }

  async listFavorites(userId: string, query: ProductFilterDto) {
    const { page = 1, pageSize = 20 } = query;
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      status: 'ACTIVE',
      favorites: { some: { userId } },
    };
    const staleThresholdDays = await this.settings.getNumber(
      'staleThresholdDays',
      90,
    );
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        include: this.productInclude(userId),
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);
    const serialized = data.map((p) =>
      this.serialize(p, {
        isStale: this.isStale(p, staleThresholdDays),
      }),
    );
    return {
      data: serialized,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // ==================== 变更历史 ====================

  async getChangeLogs(productId: string) {
    await this.findOne(productId, '').catch(() => {
      throw new NotFoundException('产品不存在');
    });
    return this.prisma.productChangeLog.findMany({
      where: { productId },
      orderBy: { changedAt: 'desc' },
    });
  }
}
