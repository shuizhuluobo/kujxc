import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierFilterDto,
} from './dto/supplier.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CsrfProtected } from '../common/decorators/csrf-token.decorator';

@ApiTags('供应商管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('supplier:create', 'supplier:*')
  @ApiOperation({ summary: '创建供应商' })
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('supplier:list', 'supplier:view', 'supplier:*')
  @ApiOperation({ summary: '供应商列表（分页 + 拼音搜索）' })
  findAll(@Query() query: SupplierFilterDto) {
    return this.suppliersService.findAll(query);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('supplier:view', 'supplier:*')
  @ApiOperation({ summary: '供应商详情' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('supplier:edit', 'supplier:*')
  @ApiOperation({ summary: '更新供应商' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('supplier:delete', 'supplier:*')
  @ApiOperation({ summary: '删除供应商' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.remove(id);
  }
}
