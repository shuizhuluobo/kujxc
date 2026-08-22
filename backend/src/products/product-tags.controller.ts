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
import { ProductTagsService } from './product-tags.service';
import { CreateTagDto, UpdateTagDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';
import { CsrfProtected } from '../common/decorators/csrf-token.decorator';

@ApiTags('产品标签管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('product-tags')
export class ProductTagsController {
  constructor(
    private readonly productTagsService: ProductTagsService,
    private readonly auditLog: AuditLogService,
  ) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('tag:manage')
  @ApiOperation({ summary: '创建标签' })
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateTagDto,
  ) {
    const result = await this.productTagsService.create(dto);
    await this.auditLog.log(user.id, 'create', 'tag', undefined, {
      name: dto.name,
    });
    return result;
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('tag:manage', 'product:list', 'product:view')
  @ApiOperation({ summary: '标签列表' })
  findAll() {
    return this.productTagsService.findAll();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('tag:manage', 'product:list', 'product:view')
  @ApiOperation({ summary: '标签详情' })
  findOne(@Param('id') id: string) {
    return this.productTagsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('tag:manage')
  @ApiOperation({ summary: '更新标签' })
  async update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdateTagDto,
  ) {
    const result = await this.productTagsService.update(id, dto);
    await this.auditLog.log(user.id, 'update', 'tag', id);
    return result;
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('tag:manage')
  @ApiOperation({ summary: '删除标签' })
  async remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    const result = await this.productTagsService.remove(id);
    await this.auditLog.log(user.id, 'delete', 'tag', id);
    return result;
  }
}
