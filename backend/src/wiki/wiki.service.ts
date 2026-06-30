import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { generatePinyinMeta } from '../common/utils/pinyin';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../common/services/files.service';
import {
  CreateWikiCategoryDto,
  UpdateWikiCategoryDto,
  CreateWikiArticleDto,
  UpdateWikiArticleDto,
  WikiArticleFilterDto,
} from './dto';

@Injectable()
export class WikiService {
  private readonly logger = new Logger(WikiService.name);

  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
  ) {}

  // --- Categories ---
  async createCategory(dto: CreateWikiCategoryDto) {
    return this.prisma.wikiCategory.create({ data: dto });
  }

  async findAllCategories() {
    return this.prisma.wikiCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { articles: true } } },
    });
  }

  async updateCategory(id: string, dto: UpdateWikiCategoryDto) {
    return this.prisma.wikiCategory.update({ where: { id }, data: dto });
  }

  async deleteCategory(id: string) {
    return this.prisma.wikiCategory.delete({ where: { id } });
  }

  // --- Tags ---
  async findAllTags() {
    return this.prisma.wikiTag.findMany({
      include: { _count: { select: { articles: true } } },
    });
  }

  // --- Articles ---
  async createArticle(userId: string, dto: CreateWikiArticleDto) {
    const { tagNames, attachments, ...rest } = dto;
    const { pinyinStr, initials } = generatePinyinMeta(dto.title);

    return this.prisma.wikiArticle.create({
      data: {
        ...rest,
        authorId: userId,
        titlePinyin: pinyinStr,
        titleInitials: initials,
        tags:
          tagNames && tagNames.length > 0
            ? {
                connectOrCreate: tagNames.map((name) => ({
                  where: { name },
                  create: { name },
                })),
              }
            : undefined,
        attachments:
          attachments && attachments.length > 0
            ? {
                create: attachments,
              }
            : undefined,
      },
      include: {
        category: true,
        tags: true,
        author: {
          select: { id: true, name: true, username: true, avatar: true },
        },
        attachments: true,
      },
    });
  }

  async findAllArticles(filter: WikiArticleFilterDto) {
    const {
      keyword,
      categoryId,
      tagName,
      authorId,
      page = 1,
      pageSize = 20,
    } = filter;
    const where: Prisma.WikiArticleWhereInput = {};

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } },
        {
          titlePinyin: { contains: keyword.toLowerCase(), mode: 'insensitive' },
        },
        {
          titleInitials: {
            contains: keyword.toLowerCase(),
            mode: 'insensitive',
          },
        },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;
    if (tagName) {
      where.tags = { some: { name: tagName } };
    }

    const [articles, total] = await Promise.all([
      this.prisma.wikiArticle.findMany({
        where,
        include: {
          category: true,
          tags: true,
          author: {
            select: { id: true, name: true, username: true, avatar: true },
          },
          _count: {
            select: { attachments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.wikiArticle.count({ where }),
    ]);

    return {
      data: articles,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOneArticle(id: string, _userId?: string) {
    const article = await this.prisma.wikiArticle.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
        author: {
          select: { id: true, name: true, username: true, avatar: true },
        },
        attachments: true,
      },
    });
    if (!article) throw new NotFoundException('文章不存在');

    this.incrementViewCount(id).catch((err: Error) => {
      this.logger.warn(
        `Failed to increment viewCount for article ${id}: ${err.message}`,
      );
    });

    return article;
  }

  private async incrementViewCount(id: string): Promise<void> {
    try {
      await this.prisma.wikiArticle.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
    } catch (err) {
      this.logger.error(
        `Failed to increment viewCount: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
      throw err;
    }
  }

  async updateArticle(id: string, dto: UpdateWikiArticleDto, userId?: string) {
    const { tagNames, attachments, ...rest } = dto;
    const oldArticle = await this.prisma.wikiArticle.findUnique({
      where: { id },
      include: { attachments: true },
    });
    if (!oldArticle) throw new NotFoundException('Article not found');

    if (userId && oldArticle.authorId !== userId) {
      throw new ForbiddenException('只有作者可以编辑文章');
    }

    const { pinyinStr, initials } = dto.title
      ? generatePinyinMeta(dto.title)
      : { pinyinStr: undefined, initials: undefined };

    const updatedArticle = await this.prisma.wikiArticle.update({
      where: { id },
      data: {
        ...rest,
        titlePinyin: pinyinStr,
        titleInitials: initials,
        tags:
          tagNames && tagNames.length > 0
            ? {
                set: [],
                connectOrCreate: tagNames.map((name) => ({
                  where: { name },
                  create: { name },
                })),
              }
            : { set: [] },
        attachments:
          attachments !== undefined
            ? {
                deleteMany: {},
                create: attachments,
              }
            : undefined,
      },
      include: { category: true, tags: true, attachments: true },
    });

    // Cleanup orphaned attachments
    if (attachments !== undefined) {
      const newAttachmentUrls = attachments.map((a) => a.url);
      const removedAttachments = oldArticle.attachments.filter(
        (a) => !newAttachmentUrls.includes(a.url),
      );
      for (const att of removedAttachments) {
        await this.filesService.deleteFileIfUnused(att.url);
      }
    }

    // Cleanup orphaned images in content
    if (rest.content && rest.content !== oldArticle.content) {
      const oldUrls = this.filesService.extractUrls(oldArticle.content);
      const newUrls = this.filesService.extractUrls(rest.content);
      const removedUrls = oldUrls.filter((url) => !newUrls.includes(url));
      for (const url of removedUrls) {
        await this.filesService.deleteFileIfUnused(url);
      }
    }

    return updatedArticle;
  }

  async deleteArticle(id: string, userId?: string) {
    const article = await this.prisma.wikiArticle.findUnique({
      where: { id },
      include: { attachments: true },
    });
    if (!article) throw new NotFoundException('Article not found');

    if (userId && article.authorId !== userId) {
      throw new ForbiddenException('只有作者可以删除文章');
    }

    // Capture URLs before deleting article
    const contentUrls = this.filesService.extractUrls(article.content);
    const attachmentUrls = article.attachments.map((a) => a.url);

    await this.prisma.wikiArticle.delete({ where: { id } });

    // Cleanup physical files
    for (const url of [...contentUrls, ...attachmentUrls]) {
      await this.filesService.deleteFileIfUnused(url);
    }

    return { success: true };
  }

  async toggleLike(id: string, userId: string) {
    const article = await this.prisma.wikiArticle.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');

    if (!this.prisma.wikiArticleLike) {
      throw new Error(
        'wikiArticleLike model not found in Prisma client. Please run prisma generate.',
      );
    }

    const existingLike = await this.prisma.wikiArticleLike.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId: id,
        },
      },
    });

    if (existingLike) {
      await this.prisma.$transaction([
        this.prisma.wikiArticleLike.delete({
          where: { id: existingLike.id },
        }),
        this.prisma.wikiArticle.update({
          where: { id },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      return { isLiked: false };
    } else {
      await this.prisma.$transaction([
        this.prisma.wikiArticleLike.create({
          data: {
            userId,
            articleId: id,
          },
        }),
        this.prisma.wikiArticle.update({
          where: { id },
          data: { likeCount: { increment: 1 } },
        }),
      ]);
      return { isLiked: true };
    }
  }

  async backfillPinyin() {
    this.logger.log('Starting Pinyin backfill...');
    let count = 0;

    // 使用事务批量更新，减少数据库往返
    await this.prisma.$transaction(async (tx) => {
      // 1. WikiArticles
      const articles = await tx.wikiArticle.findMany({
        where: { OR: [{ titlePinyin: null }, { titleInitials: null }] },
        select: { id: true, title: true },
      });
      for (const article of articles) {
        const { pinyinStr, initials } = generatePinyinMeta(article.title);
        await tx.wikiArticle.update({
          where: { id: article.id },
          data: { titlePinyin: pinyinStr, titleInitials: initials },
        });
        count++;
      }

      // 2. Customers
      const customers = await tx.customer.findMany({
        where: { OR: [{ namePinyin: null }, { nameInitials: null }] },
        select: { id: true, name: true },
      });
      for (const customer of customers) {
        const { pinyinStr, initials } = generatePinyinMeta(customer.name);
        await tx.customer.update({
          where: { id: customer.id },
          data: { namePinyin: pinyinStr, nameInitials: initials },
        });
        count++;
      }

      // 3. Regions
      const regions = await tx.region.findMany({
        where: { OR: [{ namePinyin: null }, { nameInitials: null }] },
        select: { id: true, name: true },
      });
      for (const region of regions) {
        const { pinyinStr, initials } = generatePinyinMeta(region.name);
        await tx.region.update({
          where: { id: region.id },
          data: { namePinyin: pinyinStr, nameInitials: initials },
        });
        count++;
      }

      // 4. ServiceTypes
      const serviceTypes = await tx.serviceType.findMany({
        where: { OR: [{ namePinyin: null }, { nameInitials: null }] },
        select: { id: true, name: true },
      });
      for (const st of serviceTypes) {
        const { pinyinStr, initials } = generatePinyinMeta(st.name);
        await tx.serviceType.update({
          where: { id: st.id },
          data: { namePinyin: pinyinStr, nameInitials: initials },
        });
        count++;
      }
    });

    this.logger.log(`Pinyin backfill completed! Total updated: ${count}`);
    return { success: true, count };
  }
}
