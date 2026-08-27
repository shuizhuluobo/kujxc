import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toPinyinFields } from '../products/pinyin.util';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierFilterDto,
} from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  private pinyinFieldsOf(name?: string | null) {
    const { full, initials } = toPinyinFields(name);
    return { namePinyin: full || null, nameInitials: initials || null };
  }

  private buildWhere(query: SupplierFilterDto): Prisma.SupplierWhereInput {
    const { keyword } = query;
    if (!keyword) return {};
    const asciiKw = keyword.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const or: Prisma.SupplierWhereInput[] = [
      { name: { contains: keyword, mode: 'insensitive' } },
      { contact: { contains: keyword, mode: 'insensitive' } },
      { phone: { contains: keyword, mode: 'insensitive' } },
      { address: { contains: keyword, mode: 'insensitive' } },
    ];
    if (asciiKw.length >= 2) {
      or.push({ namePinyin: { contains: asciiKw, mode: 'insensitive' } });
      or.push({ nameInitials: { contains: asciiKw, mode: 'insensitive' } });
    }
    return { OR: or };
  }

  async create(dto: CreateSupplierDto) {
    const existing = await this.prisma.supplier.findUnique({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException('供应商名称已存在');
    return this.prisma.supplier.create({
      data: {
        ...dto,
        ...this.pinyinFieldsOf(dto.name),
      },
    });
  }

  async findAll(query: SupplierFilterDto) {
    const { page = 1, pageSize = 20, orderBy = 'createdAt' } = query;
    const where = this.buildWhere(query);
    const order =
      orderBy === 'name' ? { name: 'asc' as const } : { createdAt: 'desc' as const };
    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        orderBy: order,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.supplier.count({ where }),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('供应商不存在');
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto) {
    const existing = await this.findOne(id);
    if (dto.name && dto.name !== existing.name) {
      const dup = await this.prisma.supplier.findUnique({ where: { name: dto.name } });
      if (dup) throw new ConflictException('供应商名称已存在');
    }
    const pinyin =
      dto.name !== undefined && dto.name !== existing.name
        ? this.pinyinFieldsOf(dto.name)
        : {};
    // undefined pinyin fields should not overwrite if name not changed
    const data: Prisma.SupplierUpdateInput = {
      ...dto,
      ...(Object.keys(pinyin).length ? pinyin : {}),
    };
    // if name explicitly set to same value, still ensure pinyin computed
    if (dto.name !== undefined && dto.name === existing.name) {
      // no pinyin change needed
    }
    return this.prisma.supplier.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    const batchCount = await this.prisma.inventoryBatch.count({
      where: { supplierId: id },
    });
    if (batchCount > 0) throw new ConflictException('该供应商下还有库存批次，无法删除');
    await this.prisma.supplier.delete({ where: { id } });
    return { message: '删除成功' };
  }
}
