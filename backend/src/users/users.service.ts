import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../common/services/files.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from './dto';
import { PaginationDto } from '../common/dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // 检查用户名是否已存在
    const existing = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });
    if (existing) {
      throw new ConflictException('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      include: { role: true, region: true },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async findAll(query: PaginationDto = {}) {
    const { page = 1, pageSize = 20, keyword } = query;
    const where: Prisma.UserWhereInput = {};

    if (keyword) {
      where.OR = [
        { username: { contains: keyword, mode: 'insensitive' } },
        { name: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: { role: true, region: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => {
        const { password: _password, ...rest } = user;
        return rest;
      }),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true, region: true },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    const { password: _password, ...result } = user;
    return result;
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: { role: true, region: true },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // 检查用户是否存在

    // 如果修改用户名，检查是否冲突
    if (updateUserDto.username) {
      const existing = await this.prisma.user.findFirst({
        where: {
          username: updateUserDto.username,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException('用户名已存在');
      }
    }

    // 如果修改密码，加密
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: { role: true, region: true },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  /**
   * 检查用户是否有数据关联（有则不可硬删除，只能禁用）
   * 覆盖 WorkOrder / Collaborator / Performance 等外键场景
   */
  async hasDataAssociation(userId: string): Promise<boolean> {
    const [workOrderCount, collabCount, deviceCount, projectCount, recordCount, memberCount, articleCount] =
      await Promise.all([
        this.prisma.workOrder.count({
          where: { OR: [{ creatorId: userId }, { receiverId: userId }, { completerId: userId }] },
        }),
        this.prisma.workOrderCollaborator.count({ where: { userId } }),
        this.prisma.customerDevice.count({ where: { creatorId: userId } }),
        this.prisma.performanceProject.count({ where: { creatorId: userId } }),
        this.prisma.performanceRecord.count({ where: { creatorId: userId } }),
        this.prisma.projectMember.count({ where: { userId } }),
        this.prisma.wikiArticle.count({ where: { authorId: userId } }),
      ]);
    return (
      workOrderCount > 0 ||
      collabCount > 0 ||
      deviceCount > 0 ||
      projectCount > 0 ||
      recordCount > 0 ||
      memberCount > 0 ||
      articleCount > 0
    );
  }

  async canHardDelete(id: string): Promise<{ canHardDelete: boolean; hasAssociation: boolean }> {
    await this.findOne(id);
    const hasAssociation = await this.hasDataAssociation(id);
    return { canHardDelete: !hasAssociation, hasAssociation };
  }

  async remove(id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('用户不存在');

    const hasAssociation = await this.hasDataAssociation(id);

    if (hasAssociation) {
      // 有数据关联，只能禁用（避免外键约束）
      if (!existing.isActive) {
        return { message: '该用户已被禁用', action: 'already_disabled' as const, hasAssociation: true };
      }
      const user = await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
        include: { role: true, region: true },
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return { ...result, message: '该工程师有数据关联，只能禁用，已禁用该用户', action: 'disabled' as const, hasAssociation: true };
    }

    // 无关联，可硬删除
    await this.prisma.user.delete({ where: { id } });
    return { message: '删除成功', action: 'deleted' as const, hasAssociation: false };
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('用户不存在');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateProfileDto,
      include: { role: true, region: true },
    });

    // Cleanup old avatar if it was changed
    if (
      updateProfileDto.avatar &&
      existing.avatar &&
      existing.avatar !== updateProfileDto.avatar
    ) {
      await this.filesService.deleteFileIfUnused(existing.avatar);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证旧密码
    const isValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );
    if (!isValid) {
      throw new BadRequestException('旧密码错误');
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: '密码修改成功' };
  }

  async getStats(userId: string) {
    // 获取当月的起始和结束日期
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    // 基础统计查询（不依赖新增字段，数据库 schema 漂移时也能正常工作）
    const [completed, received, created] = await Promise.all([
      this.prisma.workOrder.count({ where: { completerId: userId } }),
      this.prisma.workOrder.count({ where: { receiverId: userId } }),
      this.prisma.workOrder.count({ where: { creatorId: userId } }),
    ]);

    // 月度统计（依赖 completedAt/receivedAt/createdAt 等核心字段，通常可靠）
    let monthlyCompleted = 0;
    let monthlyReceived = 0;
    let monthlyCreated = 0;

    try {
      const [
        monthlyCompletedResult,
        monthlyReceivedResult,
        monthlyCreatedResult,
      ] = await Promise.all([
        this.prisma.workOrder.count({
          where: {
            completerId: userId,
            completedAt: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        this.prisma.workOrder.count({
          where: {
            receiverId: userId,
            receivedAt: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        this.prisma.workOrder.count({
          where: {
            creatorId: userId,
            createdAt: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
      ]);

      monthlyCompleted = monthlyCompletedResult;
      monthlyReceived = monthlyReceivedResult;
      monthlyCreated = monthlyCreatedResult;
    } catch (error) {
      console.error(
        '[UsersService] getStats monthly count queries failed:',
        error,
      );
    }

    // 维修费统计（依赖 repairFee 字段，可能因 schema 漂移而失败）
    let totalRepairFee = 0;
    let monthlyRepairFee = 0;

    try {
      const [totalRepairFeeResult, monthlyRepairFeeResult] = await Promise.all([
        this.prisma.workOrder.aggregate({
          where: { completerId: userId, repairFee: { not: null } },
          _sum: { repairFee: true },
        }),
        this.prisma.workOrder.aggregate({
          where: {
            completerId: userId,
            repairFee: { not: null },
            completedAt: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { repairFee: true },
        }),
      ]);

      totalRepairFee = totalRepairFeeResult._sum.repairFee || 0;
      monthlyRepairFee = monthlyRepairFeeResult._sum.repairFee || 0;
    } catch (error) {
      console.error(
        '[UsersService] getStats repairFee aggregate queries failed:',
        error,
      );
    }

    return {
      completed,
      received,
      created,
      totalRepairFee,
      monthlyCompleted,
      monthlyReceived,
      monthlyCreated,
      monthlyRepairFee,
    };
  }
}
