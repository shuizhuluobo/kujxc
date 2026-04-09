import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WikiService } from './wiki.service';
import {
  CreateWikiCategoryDto,
  UpdateWikiCategoryDto,
  CreateWikiArticleDto,
  UpdateWikiArticleDto,
  WikiArticleFilterDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('知识库管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wiki')
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  // --- Categories ---
  @Get('categories')
  @UseGuards(PermissionsGuard)
  @Permissions('wiki:view')
  @ApiOperation({ summary: '获取所有分类' })
  findAllCategories() {
    return this.wikiService.findAllCategories();
  }

  @Post('categories')
  @UseGuards(PermissionsGuard)
  @Permissions('wiki:manage_categories')
  @ApiOperation({ summary: '创建分类' })
  createCategory(@Body() dto: CreateWikiCategoryDto) {
    return this.wikiService.createCategory(dto);
  }

  @Patch('categories/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('wiki:manage_categories')
  @ApiOperation({ summary: '更新分类' })
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWikiCategoryDto,
  ) {
    return this.wikiService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('wiki:manage_categories')
  @ApiOperation({ summary: '删除分类' })
  deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.wikiService.deleteCategory(id);
  }

  // --- Tags ---
  @Get('tags')
  @UseGuards(PermissionsGuard)
  @Permissions('wiki:view')
  @ApiOperation({ summary: '获取所有标签' })
  findAllTags() {
    return this.wikiService.findAllTags();
  }

  // --- Articles ---
  @Get('articles')
  @UseGuards(PermissionsGuard)
  @Permissions('wiki:view')
  @ApiOperation({ summary: '获取文章列表' })
  findAllArticles(@Query() filter: WikiArticleFilterDto) {
    return this.wikiService.findAllArticles(filter);
  }

  @Get('articles/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('wiki:view')
  @ApiOperation({ summary: '获取文章详情' })
  findOneArticle(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.wikiService.findOneArticle(id, user?.id);
  }

  @Post('articles')
  @UseGuards(PermissionsGuard)
  @Permissions('wiki:create')
  @ApiOperation({ summary: '创建文章' })
  createArticle(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateWikiArticleDto,
  ) {
    return this.wikiService.createArticle(user.id, dto);
  }

  @Patch('articles/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('wiki:edit')
  @ApiOperation({ summary: '更新文章' })
  updateArticle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWikiArticleDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    // 检查是否为作者或有权限
    return this.wikiService.updateArticle(id, dto, user.id);
  }

  @Delete('articles/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('wiki:delete')
  @ApiOperation({ summary: '删除文章' })
  deleteArticle(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.wikiService.deleteArticle(id, user.id);
  }

  @Post('articles/:id/like')
  @UseGuards(PermissionsGuard)
  @Permissions('wiki:view') // Everyone who can view can like
  @ApiOperation({ summary: '点赞/取消点赞文章' })
  toggleLike(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.wikiService.toggleLike(id, user.id);
  }
}
