import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuotationTemplateDto, UpdateQuotationTemplateDto } from './dto';

@Injectable()
export class QuotationTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly DEFAULT_CONFIG = {
    columns: [
      {
        key: 'index',
        label: '序号',
        visible: true,
        type: 'field',
        field: 'index',
      },
      {
        key: 'code',
        label: '产品编号',
        visible: true,
        type: 'field',
        field: 'code',
      },
      {
        key: 'brandModel',
        label: '品牌型号',
        visible: true,
        type: 'formula',
        formula: '{brand} {model}',
      },
      {
        key: 'description',
        label: '参数',
        visible: true,
        type: 'field',
        field: 'description',
      },
      {
        key: 'unit',
        label: '单位',
        visible: true,
        type: 'field',
        field: 'unit',
      },
      {
        key: 'quantity',
        label: '数量',
        visible: true,
        type: 'field',
        field: 'quantity',
      },
      {
        key: 'unitPrice',
        label: '单价',
        visible: true,
        type: 'field',
        field: 'unitPrice',
      },
      {
        key: 'discount',
        label: '折扣',
        visible: false,
        type: 'field',
        field: 'discount',
      },
      {
        key: 'subtotal',
        label: '小计',
        visible: true,
        type: 'field',
        field: 'subtotal',
      },
    ],
    titleFormat: '{{customerName}} 报价单',
    showTax: true,
    showLogo: true,
    header: '',
    footer: '本报价单有效期 30 天，最终价格以合同为准。',
    mergeKey: 'brandModel',
  };

  async create(userId: string, dto: CreateQuotationTemplateDto) {
    if (dto.isDefault) {
      await this.prisma.quotationTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }
    return this.prisma.quotationTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        config: dto.config as unknown as Prisma.InputJsonValue,
        isDefault: dto.isDefault ?? false,
        createdBy: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.quotationTemplate.findMany({
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.quotationTemplate.findUnique({
      where: { id },
    });
    if (!template) {
      throw new NotFoundException('报价模板不存在');
    }
    return template;
  }

  async update(id: string, dto: UpdateQuotationTemplateDto) {
    await this.findOne(id);
    if (dto.isDefault) {
      await this.prisma.quotationTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }
    return this.prisma.quotationTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        isDefault: dto.isDefault,
        config: dto.config
          ? (dto.config as unknown as Prisma.InputJsonValue)
          : undefined,
      },
    });
  }

  async remove(id: string) {
    const template = await this.findOne(id);
    const used = await this.prisma.quotation.count({
      where: { templateId: id },
    });
    if (used > 0) {
      throw new ConflictException(
        `模板「${template.name}」已被 ${used} 条报价使用，无法删除`,
      );
    }
    await this.prisma.quotationTemplate.delete({ where: { id } });
    return { message: '删除成功' };
  }

  /** 获取默认模板，无则创建内置默认 */
  async getDefault() {
    let template = await this.prisma.quotationTemplate.findFirst({
      where: { isDefault: true },
    });
    if (!template) {
      template = await this.prisma.quotationTemplate.findFirst();
    }
    if (!template) {
      template = await this.prisma.quotationTemplate.create({
        data: { name: '标准版', config: this.DEFAULT_CONFIG, isDefault: true },
      });
    }
    return template;
  }
}
