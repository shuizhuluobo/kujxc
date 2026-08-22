import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

export type CategoryNode = {
  id: string;
  name: string;
  parentId: string | null;
  description: string | null;
  sortOrder: number;
  productCount?: number;
  children: CategoryNode[];
};

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException('父级类型不存在');
      }
    }
    return this.prisma.category.create({ data: dto });
  }

  /** 返回自关联树（无限层级） */
  async findTree(): Promise<CategoryNode[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        _count: { select: { products: { where: { deletedAt: null } } } },
      },
    });
    const nodeMap = new Map<string, CategoryNode>();
    for (const c of categories) {
      nodeMap.set(c.id, {
        id: c.id,
        name: c.name,
        parentId: c.parentId,
        description: c.description,
        sortOrder: c.sortOrder,
        productCount: c._count.products,
        children: [],
      });
    }
    const roots: CategoryNode[] = [];
    for (const node of nodeMap.values()) {
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  async findAll() {
    return this.findTree();
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('类型不存在');
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    if (dto.parentId === id) {
      throw new BadRequestException('不能将类型设为自身的父级');
    }
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException('父级类型不存在');
      }
    }
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    const childrenCount = await this.prisma.category.count({
      where: { parentId: id },
    });
    if (childrenCount > 0) {
      throw new ConflictException(
        `类型「${category.name}」下还有 ${childrenCount} 个子类型，请先处理子类型`,
      );
    }
    const productCount = await this.prisma.product.count({
      where: { categoryId: id, deletedAt: null },
    });
    if (productCount > 0) {
      throw new ConflictException(
        `类型「${category.name}」下还有 ${productCount} 个产品，无法删除`,
      );
    }
    await this.prisma.category.delete({ where: { id } });
    return { message: '删除成功' };
  }

  /** 批量查找或创建（导入时宽容度处理，如 "电脑/笔记本" 多级路径） */
  async findOrCreateByPath(path: string): Promise<string> {
    const names = path
      .split(/[/,、>]/)
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length === 0) {
      throw new BadRequestException('类型路径为空');
    }
    let parentId: string | undefined;
    for (const name of names) {
      let cat = await this.prisma.category.findFirst({
        where: { name, ...(parentId ? { parentId } : { parentId: null }) },
      });
      if (!cat) {
        cat = await this.prisma.category.create({
          data: { name, parentId },
        });
      }
      parentId = cat.id;
    }
    return parentId!;
  }
}
