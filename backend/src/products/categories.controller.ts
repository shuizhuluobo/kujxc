import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';
import { CsrfProtected } from '../common/decorators/csrf-token.decorator';

@ApiTags('类型管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly auditLog: AuditLogService,
  ) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('category:manage')
  @ApiOperation({ summary: '创建类型' })
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateCategoryDto,
  ) {
    const result = await this.categoriesService.create(dto);
    await this.auditLog.log(user.id, 'create', 'category', undefined, {
      name: dto.name,
    });
    return result;
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('category:manage', 'product:list', 'product:view')
  @ApiOperation({ summary: '类型树（无限层级）' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('category:manage', 'product:list', 'product:view')
  @ApiOperation({ summary: '类型详情' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('category:manage')
  @ApiOperation({ summary: '更新类型' })
  async update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const result = await this.categoriesService.update(id, dto);
    await this.auditLog.log(user.id, 'update', 'category', id);
    return result;
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('category:manage')
  @ApiOperation({ summary: '删除类型' })
  async remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    const result = await this.categoriesService.remove(id);
    await this.auditLog.log(user.id, 'delete', 'category', id);
    return result;
  }
}
