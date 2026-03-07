import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    const existing = await this.prisma.role.findFirst({
      where: {
        OR: [{ name: createRoleDto.name }, { code: createRoleDto.code }],
      },
    });
    if (existing) {
      throw new ConflictException('角色名称或代码已存在');
    }

    return this.prisma.role.create({
      data: {
        ...createRoleDto,
        permissions: createRoleDto.permissions || [],
      },
    });
  }

  async findAll() {
    return this.prisma.role.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    return role;
  }

  async findByCode(code: string) {
    return this.prisma.role.findUnique({ where: { code } });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    await this.findOne(id);
    return this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    // 检查是否有用户使用此角色
    const userCount = await this.prisma.user.count({ where: { roleId: id } });
    if (userCount > 0) {
      throw new ConflictException('该角色下还有用户，无法删除');
    }
    await this.prisma.role.delete({ where: { id } });
    return { message: '删除成功' };
  }
}
