import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  WarehouseFilterDto,
} from './dto/warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: WarehouseFilterDto): Prisma.WarehouseWhereInput {
    const { keyword } = query;
    if (!keyword) return {};
    return {
      OR: [
        { name: { contains: keyword, mode: 'insensitive' } },
        { type: { contains: keyword, mode: 'insensitive' } },
      ],
    };
  }

  async create(dto: CreateWarehouseDto) {
    const existing = await this.prisma.warehouse.findUnique({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException('仓库名称已存在');
    return this.prisma.warehouse.create({
      data: dto,
      include: { region: true },
    });
  }

  async findAll(query: WarehouseFilterDto) {
    const { page = 1, pageSize = 20 } = query;
    const where = this.buildWhere(query);
    const [data, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { region: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.warehouse.count({ where }),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: { region: true },
    });
    if (!warehouse) throw new NotFoundException('仓库不存在');
    return warehouse;
  }

  async update(id: string, dto: UpdateWarehouseDto) {
    const existing = await this.findOne(id);
    if (dto.name && dto.name !== existing.name) {
      const dup = await this.prisma.warehouse.findUnique({ where: { name: dto.name } });
      if (dup) throw new ConflictException('仓库名称已存在');
    }
    return this.prisma.warehouse.update({
      where: { id },
      data: dto,
      include: { region: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    const batchCount = await this.prisma.inventoryBatch.count({
      where: { warehouseId: id },
    });
    if (batchCount > 0) throw new ConflictException('该仓库下还有库存批次，无法删除');
    await this.prisma.warehouse.delete({ where: { id } });
    return { message: '删除成功' };
  }
}
