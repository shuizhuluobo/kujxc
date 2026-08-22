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
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';
import { CsrfProtected } from '../common/decorators/csrf-token.decorator';

@ApiTags('品牌管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('brands')
export class BrandsController {
  constructor(
    private readonly brandsService: BrandsService,
    private readonly auditLog: AuditLogService,
  ) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('brand:manage')
  @ApiOperation({ summary: '创建品牌' })
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateBrandDto,
  ) {
    const result = await this.brandsService.create(dto);
    await this.auditLog.log(user.id, 'create', 'brand', undefined, {
      name: dto.name,
    });
    return result;
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('brand:manage', 'product:list', 'product:view')
  @ApiOperation({ summary: '品牌列表' })
  findAll() {
    return this.brandsService.findAll();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('brand:manage', 'product:list', 'product:view')
  @ApiOperation({ summary: '品牌详情' })
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('brand:manage')
  @ApiOperation({ summary: '更新品牌' })
  async update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdateBrandDto,
  ) {
    const result = await this.brandsService.update(id, dto);
    await this.auditLog.log(user.id, 'update', 'brand', id);
    return result;
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('brand:manage')
  @ApiOperation({ summary: '删除品牌' })
  async remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    const result = await this.brandsService.remove(id);
    await this.auditLog.log(user.id, 'delete', 'brand', id);
    return result;
  }
}
