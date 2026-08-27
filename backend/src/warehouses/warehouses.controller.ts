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
import { WarehousesService } from './warehouses.service';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  WarehouseFilterDto,
} from './dto/warehouse.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CsrfProtected } from '../common/decorators/csrf-token.decorator';

@ApiTags('仓库管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:manage', 'warehouse:*')
  @ApiOperation({ summary: '创建仓库' })
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehousesService.create(dto);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:manage', 'warehouse:list', 'warehouse:view', 'warehouse:*')
  @ApiOperation({ summary: '仓库列表（分页）' })
  findAll(@Query() query: WarehouseFilterDto) {
    return this.warehousesService.findAll(query);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:manage', 'warehouse:view', 'warehouse:*')
  @ApiOperation({ summary: '仓库详情' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.warehousesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:manage', 'warehouse:*')
  @ApiOperation({ summary: '更新仓库' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWarehouseDto) {
    return this.warehousesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('warehouse:manage', 'warehouse:*')
  @ApiOperation({ summary: '删除仓库' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.warehousesService.remove(id);
  }
}
