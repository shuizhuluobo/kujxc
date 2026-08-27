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
import { TransferService } from './transfer.service';
import { TransferDto } from './dto/transfer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CsrfProtected } from '../../common/decorators/csrf-token.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('调拨')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('inventory/transfers')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:transfer', 'inventory:*')
  @ApiOperation({ summary: '创建调拨单（FIFO扣减+目标新建批次，全局总量不变）' })
  create(@Body() dto: TransferDto, @CurrentUser() user?: CurrentUserData) {
    return this.transferService.create(dto, user?.id);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:view', 'inventory:*', 'inventory:transfer')
  @ApiOperation({ summary: '调拨单列表' })
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('productId') productId?: string,
  ) {
    return this.transferService.findAll({
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
      productId,
    });
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:view', 'inventory:*', 'inventory:transfer')
  @ApiOperation({ summary: '调拨单详情' })
  findOne(@Param('id') id: string) {
    return this.transferService.findOne(id);
  }
}
