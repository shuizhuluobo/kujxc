import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, QuotationStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CodeGeneratorService } from '../common/services/code-generator.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { SettingsService } from '../settings/settings.service';
import {
  CreateQuotationDto,
  QuotationFilterDto,
  UpdateQuotationStatusDto,
} from './dto';

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

@Injectable()
export class QuotationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codeGenerator: CodeGeneratorService,
    private readonly auditLog: AuditLogService,
    private readonly settings: SettingsService,
  ) {}

  private quotationInclude() {
    return {
      items: { orderBy: { displayOrder: 'asc' as const } },
      template: true,
    };
  }

  private serializeQuotation(
    quotation: Prisma.QuotationGetPayload<{
      include: ReturnType<QuotationsService['quotationInclude']>;
    }>,
  ) {
    return {
      ...quotation,
      totalAmount: Number(quotation.totalAmount),
      taxRate: quotation.taxRate != null ? Number(quotation.taxRate) : null,
      taxAmount:
        quotation.taxAmount != null ? Number(quotation.taxAmount) : null,
      finalAmount: Number(quotation.finalAmount),
      estimatedProfit:
        quotation.estimatedProfit != null
          ? Number(quotation.estimatedProfit)
          : null,
      items: quotation.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        discount: item.discount != null ? Number(item.discount) : null,
        subtotal: Number(item.subtotal),
        costPrice: item.costPrice != null ? Number(item.costPrice) : null,
        profit: item.profit != null ? Number(item.profit) : null,
      })),
    };
  }

  private computeTotals(items: CreateQuotationDto['items'], taxRate?: number) {
    let totalAmount = 0;
    let estimatedProfit = 0;
    const computedItems = items.map((item) => {
      // 折扣口径与前端 quotationMath.computeItemSubtotal 一致：
      // null/undefined/0 均视为不打折（100%），避免误填 0 导致小计归零
      const discount =
        item.discount != null && item.discount > 0 ? item.discount : 100;
      const subtotal = round2(
        (item.unitPrice * item.quantity * discount) / 100,
      );
      const profit =
        item.costPrice != null
          ? round2(
              (item.unitPrice - item.costPrice) *
                item.quantity *
                (discount / 100),
            )
          : null;
      if (profit != null) estimatedProfit = round2(estimatedProfit + profit);
      totalAmount = round2(totalAmount + subtotal);
      return { ...item, discount, subtotal, profit };
    });

    let taxAmount: number | null = null;
    let finalAmount = totalAmount;
    if (taxRate != null && taxRate > 0) {
      taxAmount = round2((totalAmount * taxRate) / 100);
      finalAmount = round2(totalAmount + taxAmount);
    }

    return {
      computedItems,
      totalAmount,
      taxAmount,
      finalAmount,
      estimatedProfit,
    };
  }

  private buildCreateData(
    userId: string,
    dto: CreateQuotationDto,
    canViewCost: boolean,
  ) {
    const {
      computedItems,
      totalAmount,
      taxAmount,
      finalAmount,
      estimatedProfit,
    } = this.computeTotals(dto.items, dto.taxRate);
    const id = uuidv4();
    return {
      id,
      code: '', // 由调用方赋值
      customerId: dto.customerId,
      customerName: dto.customerName,
      customerContact: dto.customerContact,
      customerAddress: dto.customerAddress,
      remark: dto.remark,
      templateId: dto.templateId,
      taxRate: dto.taxRate,
      totalAmount,
      taxAmount,
      finalAmount,
      estimatedProfit: canViewCost ? estimatedProfit : null,
      status: dto.status ?? QuotationStatus.DRAFT,
      version: 1,
      versionGroupId: id,
      createdBy: userId,
      updatedBy: userId,
      items: computedItems.map((item, index) => ({
        productId: item.productId,
        productSnapshot:
          item.productSnapshot as unknown as Prisma.InputJsonValue,
        selectedImages: item.selectedImages
          ? (item.selectedImages as unknown as Prisma.InputJsonValue)
          : undefined,
        selectedCerts: item.selectedCerts
          ? (item.selectedCerts as unknown as Prisma.InputJsonValue)
          : undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        subtotal: item.subtotal,
        costPrice: canViewCost ? item.costPrice : undefined,
        profit: canViewCost ? item.profit : undefined,
        displayOrder: index,
      })),
    };
  }

  async create(userId: string, dto: CreateQuotationDto, canViewCost: boolean) {
    const code = await this.codeGenerator.generateCode('quotation');
    const data = this.buildCreateData(userId, dto, canViewCost);
    const quotation = await this.prisma.quotation.create({
      data: {
        ...data,
        code,
        items: { create: data.items },
      },
      include: this.quotationInclude(),
    });
    return this.serializeQuotation(quotation);
  }

  /** 基于已有报价生成新版本（版本号递增，保留版本链） */
  async createNewVersion(
    userId: string,
    id: string,
    dto: CreateQuotationDto,
    canViewCost: boolean,
  ) {
    const original = await this.prisma.quotation.findFirst({
      where: { id, deletedAt: null },
    });
    if (!original) {
      throw new NotFoundException('报价不存在');
    }
    const code = await this.codeGenerator.generateCode('quotation');
    const data = this.buildCreateData(userId, dto, canViewCost);
    const quotation = await this.prisma.quotation.create({
      data: {
        ...data,
        code,
        version: original.version + 1,
        versionGroupId: original.versionGroupId,
        parentQuotationId: original.id,
        items: { create: data.items },
      },
      include: this.quotationInclude(),
    });
    return this.serializeQuotation(quotation);
  }

  async findAll(query: QuotationFilterDto) {
    const {
      page = 1,
      pageSize = 20,
      keyword,
      status,
      customerId,
      customerName,
      versionGroupId,
    } = query;
    const where: Prisma.QuotationWhereInput = {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(customerId ? { customerId } : {}),
      ...(versionGroupId ? { versionGroupId } : {}),
      ...(customerName
        ? { customerName: { contains: customerName, mode: 'insensitive' } }
        : {}),
      ...(keyword
        ? {
            OR: [
              { code: { contains: keyword, mode: 'insensitive' } },
              { customerName: { contains: keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.quotation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { items: true } },
          items: { select: { productSnapshot: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.quotation.count({ where }),
    ]);

    // 批量映射操作人 id -> 用户名
    const userIds = Array.from(
      new Set(data.map((q) => q.createdBy).filter(Boolean)),
    ) as string[];
    const users =
      userIds.length > 0
        ? await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true },
          })
        : [];
    const userNameMap = new Map(users.map((u) => [u.id, u.name]));

    return {
      data: data.map((q) => ({
        ...q,
        totalAmount: Number(q.totalAmount),
        taxRate: q.taxRate != null ? Number(q.taxRate) : null,
        taxAmount: q.taxAmount != null ? Number(q.taxAmount) : null,
        finalAmount: Number(q.finalAmount),
        estimatedProfit:
          q.estimatedProfit != null ? Number(q.estimatedProfit) : null,
        createdByName:
          (q.createdBy && userNameMap.get(q.createdBy)) || q.createdBy || '-',
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, canViewCost = false) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, deletedAt: null },
      include: this.quotationInclude(),
    });
    if (!quotation) {
      throw new NotFoundException('报价不存在');
    }
    const serialized = this.serializeQuotation(quotation);
    if (!canViewCost) {
      serialized.items = serialized.items.map((item) => ({
        ...item,
        costPrice: null,
        profit: null,
      }));
      serialized.estimatedProfit = null;
    }
    return serialized;
  }

  /** 同一版本组内全部版本（升序） */
  async getVersionGroup(id: string) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, deletedAt: null },
    });
    if (!quotation) {
      throw new NotFoundException('报价不存在');
    }
    const versions = await this.prisma.quotation.findMany({
      where: { versionGroupId: quotation.versionGroupId, deletedAt: null },
      orderBy: { version: 'asc' },
      include: this.quotationInclude(),
    });
    // 完整序列化（含 items / productSnapshot），保证版本导出时能拿到明细数据；
    // 版本列表不携带成本可见性上下文，默认隐藏成本价与利润。
    return versions.map((q) => {
      const serialized = this.serializeQuotation(q);
      serialized.items = serialized.items.map((item) => ({
        ...item,
        costPrice: null,
        profit: null,
      }));
      return serialized;
    });
  }

  async updateStatus(
    userId: string,
    id: string,
    dto: UpdateQuotationStatusDto,
  ) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, deletedAt: null },
    });
    if (!quotation) {
      throw new NotFoundException('报价不存在');
    }
    await this.prisma.quotation.update({
      where: { id },
      data: { status: dto.status, updatedBy: userId },
    });
    if (dto.status === QuotationStatus.CANCELLED) {
      await this.auditLog.log(userId, 'cancel', 'quotation', id, {
        code: quotation.code,
      });
    }
    return this.findOne(id);
  }

  async remove(userId: string, id: string) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, deletedAt: null },
    });
    if (!quotation) {
      throw new NotFoundException('报价不存在');
    }
    await this.prisma.quotation.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    });
    await this.auditLog.log(userId, 'delete', 'quotation', id, {
      code: quotation.code,
      customerName: quotation.customerName,
    });
    return { message: '删除成功' };
  }
}
