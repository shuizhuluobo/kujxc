import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { generatePinyinMeta } from '../common/utils/pinyin';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegionDto, UpdateRegionDto } from '../common/dto';

@Injectable()
export class RegionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateRegionDto) {
    const existing = await this.prisma.region.findUnique({
      where: { name: createDto.name },
    });
    if (existing) {
      throw new ConflictException('区域名称已存在');
    }
    const { pinyinStr, initials } = generatePinyinMeta(createDto.name);
    return this.prisma.region.create({
      data: {
        ...createDto,
        namePinyin: pinyinStr,
        nameInitials: initials,
      },
    });
  }

  async findAll() {
    return this.prisma.region.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async findOne(id: string) {
    const region = await this.prisma.region.findUnique({ where: { id } });
    if (!region) throw new NotFoundException('区域不存在');
    return region;
  }

  async update(id: string, updateDto: UpdateRegionDto) {
    await this.findOne(id);
    const { pinyinStr, initials } = updateDto.name
      ? generatePinyinMeta(updateDto.name)
      : { pinyinStr: undefined, initials: undefined };

    return this.prisma.region.update({
      where: { id },
      data: {
        ...updateDto,
        namePinyin: pinyinStr,
        nameInitials: initials,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    const woCount = await this.prisma.workOrder.count({
      where: { regionId: id },
    });
    if (woCount > 0) throw new ConflictException('该区域下还有工单，无法删除');
    await this.prisma.region.delete({ where: { id } });
    return { message: '删除成功' };
  }
}
