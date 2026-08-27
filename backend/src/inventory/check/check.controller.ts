import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StockCheckService } from './check.service';
import { CreateStockCheckDto } from './dto/check.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CsrfProtected } from '../../common/decorators/csrf-token.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('盘点')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('inventory/checks')
export class StockCheckController {
  constructor(private readonly checkService: StockCheckService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:check', 'inventory:*')
  @ApiOperation({ summary: '创建盘点单（对比系统库存 vs 实际，生成差异，不改库存）' })
  create(@Body() dto: CreateStockCheckDto, @CurrentUser() user?: CurrentUserData) {
    return this.checkService.create(dto, user?.id);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:view', 'inventory:*', 'inventory:check')
  @ApiOperation({ summary: '盘点单列表' })
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.checkService.findAll({
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:view', 'inventory:*', 'inventory:check')
  @ApiOperation({ summary: '盘点单详情（含差异明细）' })
  findOne(@Param('id') id: string) {
    return this.checkService.findOne(id);
  }
}
