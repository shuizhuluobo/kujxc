import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { generatePinyinMeta } from '../common/utils/pinyin';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceTypeDto, UpdateServiceTypeDto } from '../common/dto';

@Injectable()
export class ServiceTypesService {
  constructor(private prisma: PrismaService) { }

  async create(createDto: CreateServiceTypeDto) {
    const existing = await this.prisma.serviceType.findUnique({
      where: { name: createDto.name },
    });
    if (existing) throw new ConflictException('服务类型名称已存在');
    const { pinyinStr, initials } = generatePinyinMeta(createDto.name);
    return this.prisma.serviceType.create({
      data: {
        ...createDto,
        namePinyin: pinyinStr,
        nameInitials: initials
      }
    });
  }

  async findAll() {
    return this.prisma.serviceType.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async findOne(id: string) {
    const st = await this.prisma.serviceType.findUnique({ where: { id } });
    if (!st) throw new NotFoundException('服务类型不存在');
    return st;
  }

  async update(id: string, updateDto: UpdateServiceTypeDto) {
    await this.findOne(id);
    const { pinyinStr, initials } = updateDto.name
      ? generatePinyinMeta(updateDto.name)
      : { pinyinStr: undefined, initials: undefined };

    return this.prisma.serviceType.update({
      where: { id },
      data: {
        ...updateDto,
        namePinyin: pinyinStr,
        nameInitials: initials,
      }
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    const woCount = await this.prisma.workOrder.count({
      where: { serviceTypeId: id },
    });
    if (woCount > 0)
      throw new ConflictException('该服务类型下还有工单，无法删除');
    await this.prisma.serviceType.delete({ where: { id } });
    return { message: '删除成功' };
  }
}
