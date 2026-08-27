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
import { ReturnService } from './return.service';
import { CreateReturnDto } from './dto/return.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CsrfProtected } from '../../common/decorators/csrf-token.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('退货')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('inventory/returns')
export class ReturnController {
  constructor(private readonly returnService: ReturnService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:return', 'inventory:*')
  @ApiOperation({ summary: '创建退货单（LIFO回补批次，不含扣减逻辑）' })
  create(@Body() dto: CreateReturnDto, @CurrentUser() user?: CurrentUserData) {
    return this.returnService.create(dto, user?.id);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:view', 'inventory:*', 'inventory:return')
  @ApiOperation({ summary: '退货单列表' })
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('productId') productId?: string,
  ) {
    return this.returnService.findAll({
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
      productId,
    });
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:view', 'inventory:*', 'inventory:return')
  @ApiOperation({ summary: '退货单详情' })
  findOne(@Param('id') id: string) {
    return this.returnService.findOne(id);
  }
}
