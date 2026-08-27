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
import { SaleService } from './sale.service';
import { CreateSaleOrderDto, ApproveDto } from './dto/sale.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CsrfProtected } from '../../common/decorators/csrf-token.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('销售出库')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('inventory/sales')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:create', 'inventory:*')
  @ApiOperation({ summary: '创建销售单 (PENDING)' })
  create(
    @Body() dto: CreateSaleOrderDto,
    @CurrentUser() user?: CurrentUserData,
  ) {
    return this.saleService.createOrder(dto, user?.id);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:view', 'inventory:*')
  @ApiOperation({ summary: '销售单列表' })
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
  ) {
    return this.saleService.findAll({
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
      status,
    });
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:view', 'inventory:*')
  @ApiOperation({ summary: '销售单详情' })
  findOne(@Param('id') id: string) {
    return this.saleService.findOne(id);
  }

  @Post(':id/approve')
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:approve', 'inventory:*')
  @ApiOperation({ summary: '审核销售单 严格FIFO扣减' })
  approve(@Param('id') id: string, @Body() dto?: ApproveDto) {
    return this.saleService.approveOrder(id, dto);
  }
}
