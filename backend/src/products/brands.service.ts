import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto, UpdateBrandDto } from './dto';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBrandDto) {
    return this.prisma.brand.create({ data: dto });
  }

  async findAll() {
    return this.prisma.brand.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: { select: { products: { where: { deletedAt: null } } } },
      },
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        _count: { select: { products: { where: { deletedAt: null } } } },
      },
    });
    if (!brand) {
      throw new NotFoundException('品牌不存在');
    }
    return brand;
  }

  async update(id: string, dto: UpdateBrandDto) {
    await this.findOne(id);
    return this.prisma.brand.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const brand = await this.findOne(id);
    const productCount = await this.prisma.product.count({
      where: { brandId: id, deletedAt: null },
    });
    if (productCount > 0) {
      throw new ConflictException(
        `品牌「${brand.name}」下还有 ${productCount} 个产品，无法删除`,
      );
    }
    await this.prisma.brand.delete({ where: { id } });
    return { message: '删除成功' };
  }

  /** 批量查找或创建（导入时宽容度处理） */
  async findOrCreateMany(
    names: string[],
    create = true,
  ): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    const uniqueNames = [
      ...new Set(names.map((n) => n.trim()).filter(Boolean)),
    ];
    if (uniqueNames.length === 0) return result;

    const existing = await this.prisma.brand.findMany({
      where: { name: { in: uniqueNames } },
    });
    for (const b of existing) {
      result.set(b.name, b.id);
    }

    const missing = uniqueNames.filter((n) => !result.has(n));
    if (create && missing.length > 0) {
      await this.prisma.brand.createMany({
        data: missing.map((name) => ({ name })),
        skipDuplicates: true,
      });
      const created = await this.prisma.brand.findMany({
        where: { name: { in: missing } },
      });
      for (const b of created) {
        result.set(b.name, b.id);
      }
    }
    return result;
  }

  /** 记录产品相关品牌引用（供导入宽容度统计） */
  async findByIds(
    ids: string[],
  ): Promise<Prisma.BrandGetPayload<Record<string, never>>[]> {
    return this.prisma.brand.findMany({ where: { id: { in: ids } } });
  }
}
