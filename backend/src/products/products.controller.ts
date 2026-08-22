import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Body,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  BatchDeleteDto,
  BatchStatusDto,
  CreateProductDto,
  ProductFilterDto,
  UpdateProductDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CsrfProtected } from '../common/decorators/csrf-token.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('产品管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('product:create')
  @ApiOperation({ summary: '创建产品（编号自动生成）' })
  create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateProductDto) {
    return this.productsService.create(user.id, dto);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('product:list', 'product:view')
  @ApiOperation({ summary: '产品列表（多维筛选 + 超期标记）' })
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query() query: ProductFilterDto,
  ) {
    return this.productsService.findAll(query, user.id);
  }

  @Get('export')
  @UseGuards(PermissionsGuard)
  @Permissions('product:list', 'product:view')
  @ApiOperation({ summary: '导出产品列表为 Excel（沿用列表筛选条件）' })
  async export(
    @CurrentUser() user: CurrentUserData,
    @Query() query: ProductFilterDto,
    @Res() res: Response,
  ) {
    const { buffer, fileName } = await this.productsService.exportList(
      query,
      user.id,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName)}"`,
    );
    res.send(buffer);
  }

  @Get('favorites')
  @UseGuards(PermissionsGuard)
  @Permissions('product:list', 'product:view')
  @ApiOperation({ summary: '我的收藏产品' })
  listFavorites(
    @CurrentUser() user: CurrentUserData,
    @Query() query: ProductFilterDto,
  ) {
    return this.productsService.listFavorites(user.id, query);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('product:view', 'product:list')
  @ApiOperation({ summary: '产品详情' })
  findOne(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.productsService.findOne(id, user.id);
  }

  @Patch(':id/acknowledge-stale')
  @UseGuards(PermissionsGuard)
  @Permissions('product:edit', 'product:manage')
  @ApiOperation({ summary: '确认无需更新（一键续期，消除超期提醒）' })
  acknowledgeStale(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.productsService.acknowledgeStale(id, user.id);
  }

  @Post(':id/view')
  @UseGuards(PermissionsGuard)
  @Permissions('product:view', 'product:list')
  @ApiOperation({ summary: '记录查看次数' })
  recordView(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.productsService.recordView(id, user.id);
  }

  @Post(':id/favorite')
  @UseGuards(PermissionsGuard)
  @Permissions('product:view', 'product:list')
  @ApiOperation({ summary: '收藏产品' })
  toggleFavorite(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.productsService.toggleFavorite(user.id, id);
  }

  @Get(':id/change-logs')
  @UseGuards(PermissionsGuard)
  @Permissions('product:view', 'product:list')
  @ApiOperation({ summary: '产品变更历史' })
  changeLogs(@Param('id') id: string) {
    return this.productsService.getChangeLogs(id);
  }

  @Patch('batch/status')
  @UseGuards(PermissionsGuard)
  @Permissions('product:edit', 'product:manage')
  @ApiOperation({ summary: '批量修改状态' })
  batchStatus(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: BatchStatusDto,
  ) {
    return this.productsService.batchUpdateStatus(user.id, dto);
  }

  @Patch('batch/delete')
  @UseGuards(PermissionsGuard)
  @Permissions('product:delete', 'product:manage')
  @ApiOperation({ summary: '批量删除（软删除）' })
  batchDelete(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: BatchDeleteDto,
  ) {
    return this.productsService.batchRemove(user.id, dto);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('product:edit', 'product:manage')
  @ApiOperation({ summary: '更新产品（记录变更历史）' })
  update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('product:delete', 'product:manage')
  @ApiOperation({ summary: '删除产品（软删除 + 审计日志）' })
  remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.productsService.remove(user.id, id);
  }
}
