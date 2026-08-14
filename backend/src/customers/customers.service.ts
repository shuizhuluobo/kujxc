import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { generatePinyinMeta } from '../common/utils/pinyin';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../common/dto';
import { PaginationDto } from '../common/dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  private withRegion(
    customer: Prisma.CustomerGetPayload<{
      include: { defaultRegion: true };
    }> | null,
  ) {
    if (!customer) return customer;
    const { defaultRegion, ...rest } = customer;
    return { ...rest, region: defaultRegion };
  }

  async create(createDto: CreateCustomerDto) {
    const { pinyinStr, initials } = generatePinyinMeta(createDto.name);
    const customer = await this.prisma.customer.create({
      data: {
        ...createDto,
        namePinyin: pinyinStr,
        nameInitials: initials,
      },
      include: { defaultRegion: true },
    });
    return this.withRegion(customer);
  }

  async findAll(query: PaginationDto = {}) {
    const { page = 1, pageSize = 20, keyword } = query;
    const where: Prisma.CustomerWhereInput = {};

    if (keyword) {
      const exactShortNameMatch = await this.prisma.customer.findMany({
        where: {
          shortName: { equals: keyword, mode: 'insensitive' },
        },
        orderBy: { createdAt: 'desc' },
        include: { defaultRegion: true },
        take: pageSize,
      });

      if (exactShortNameMatch.length > 0) {
        const exactIds = exactShortNameMatch.map((c) => c.id);

        const remainingWhere: Prisma.CustomerWhereInput = {
          AND: [
            { id: { notIn: exactIds } },
            {
              OR: [
                { name: { contains: keyword, mode: 'insensitive' } },
                { shortName: { contains: keyword, mode: 'insensitive' } },
                {
                  namePinyin: {
                    contains: keyword.toLowerCase(),
                    mode: 'insensitive',
                  },
                },
                {
                  nameInitials: {
                    contains: keyword.toLowerCase(),
                    mode: 'insensitive',
                  },
                },
                { contact: { contains: keyword, mode: 'insensitive' } },
                { phone: { contains: keyword, mode: 'insensitive' } },
              ],
            },
          ],
        };

        const [remaining, totalExact, totalRemaining] = await Promise.all([
          this.prisma.customer.findMany({
            where: remainingWhere,
            orderBy: { createdAt: 'desc' },
            include: { defaultRegion: true },
            skip: Math.max(
              0,
              (page - 1) * pageSize - exactShortNameMatch.length,
            ),
            take: Math.max(0, pageSize - exactShortNameMatch.length),
          }),
          Promise.resolve(exactShortNameMatch.length),
          this.prisma.customer.count({ where: remainingWhere }),
        ]);

        const data =
          page === 1 ? [...exactShortNameMatch, ...remaining] : remaining;
        const total = totalExact + totalRemaining;

        return {
          data: data.map((c) => this.withRegion(c)),
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      }

      where.OR = [
        { shortName: { contains: keyword, mode: 'insensitive' } },
        { name: { contains: keyword, mode: 'insensitive' } },
        {
          namePinyin: { contains: keyword.toLowerCase(), mode: 'insensitive' },
        },
        {
          nameInitials: {
            contains: keyword.toLowerCase(),
            mode: 'insensitive',
          },
        },
        { contact: { contains: keyword, mode: 'insensitive' } },
        { phone: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        orderBy: keyword
          ? [{ shortName: 'asc' }, { name: 'asc' }]
          : { createdAt: 'desc' },
        include: { defaultRegion: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: data.map((c) => this.withRegion(c)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { defaultRegion: true },
    });
    if (!customer) {
      throw new NotFoundException('客户不存在');
    }
    return this.withRegion(customer);
  }

  async update(id: string, updateDto: UpdateCustomerDto) {
    await this.findOne(id);
    const { pinyinStr, initials } = updateDto.name
      ? generatePinyinMeta(updateDto.name)
      : { pinyinStr: undefined, initials: undefined };

    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        ...updateDto,
        namePinyin: pinyinStr,
        nameInitials: initials,
      },
      include: { defaultRegion: true },
    });
    return this.withRegion(customer);
  }

  async remove(id: string) {
    await this.findOne(id);
    const woCount = await this.prisma.workOrder.count({
      where: { customerId: id },
    });
    if (woCount > 0) {
      throw new ConflictException('该客户下还有工单，无法删除');
    }
    await this.prisma.customer.delete({ where: { id } });
    return { message: '删除成功' };
  }
}
