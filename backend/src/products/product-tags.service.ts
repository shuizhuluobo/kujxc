import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto, UpdateTagDto } from './dto';

@Injectable()
export class ProductTagsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTagDto) {
    return this.prisma.productTag.create({ data: dto });
  }

  async findAll() {
    return this.prisma.productTag.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { products: true } } },
    });
  }

  async findOne(id: string) {
    const tag = await this.prisma.productTag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException('标签不存在');
    }
    return tag;
  }

  async update(id: string, dto: UpdateTagDto) {
    await this.findOne(id);
    return this.prisma.productTag.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const tag = await this.findOne(id);
    const productCount = await this.prisma.productTagRelation.count({
      where: { tagId: id },
    });
    if (productCount > 0) {
      throw new ConflictException(
        `标签「${tag.name}」已关联 ${productCount} 个产品，无法删除`,
      );
    }
    await this.prisma.productTag.delete({ where: { id } });
    return { message: '删除成功' };
  }

  /** 批量查找或创建（导入时宽容度处理） */
  async findOrCreateMany(names: string[]): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    const uniqueNames = [
      ...new Set(names.map((n) => n.trim()).filter(Boolean)),
    ];
    if (uniqueNames.length === 0) return result;

    const existing = await this.prisma.productTag.findMany({
      where: { name: { in: uniqueNames } },
    });
    for (const t of existing) {
      result.set(t.name, t.id);
    }

    const missing = uniqueNames.filter((n) => !result.has(n));
    if (missing.length > 0) {
      await this.prisma.productTag.createMany({
        data: missing.map((name) => ({ name })),
        skipDuplicates: true,
      });
      const created = await this.prisma.productTag.findMany({
        where: { name: { in: missing } },
      });
      for (const t of created) {
        result.set(t.name, t.id);
      }
    }
    return result;
  }
}
