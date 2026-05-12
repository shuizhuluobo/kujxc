import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { WorkOrdersService } from './work-orders.service';
import {
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  CompleteWorkOrderDto,
  WorkOrderFilterDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';
import { CsrfProtected } from '../common/decorators/csrf-token.decorator';

@ApiTags('工单管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('workOrder:create')
  @ApiOperation({ summary: '创建工单' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(
    @Body() createDto: CreateWorkOrderDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.workOrdersService.create(createDto, user.id);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('workOrder:list')
  @ApiOperation({ summary: '获取工单列表（分页筛选）' })
  findAll(@Query() filterDto: WorkOrderFilterDto) {
    return this.workOrdersService.findAll(filterDto);
  }

  @Get('pending')
  @UseGuards(PermissionsGuard)
  @Permissions('workOrder:list')
  @ApiOperation({ summary: '获取待办工单' })
  findPending(@Query('regionId') regionId?: string) {
    return this.workOrdersService.findPending(regionId);
  }

  @Get('stats')
  @UseGuards(PermissionsGuard)
  @Permissions('workOrder:list')
  @ApiOperation({ summary: '获取工单统计' })
  getStats(@Query('regionId') regionId?: string) {
    return this.workOrdersService.getStats(regionId);
  }

  @Get('export')
  @UseGuards(PermissionsGuard)
  @Permissions('workOrder:export')
  @ApiOperation({ summary: '导出工单为Excel' })
  async export(@Query() filterDto: WorkOrderFilterDto, @Res() res: Response) {
    const workbook = await this.workOrdersService.export(filterDto);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=work-orders-${Date.now()}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('workOrder:view')
  @ApiOperation({ summary: '获取指定工单' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workOrdersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('workOrder:update')
  @ApiOperation({ summary: '更新工单' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateWorkOrderDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.workOrdersService.update(id, updateDto, user.id, user.roleCode);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('workOrder:delete')
  @ApiOperation({ summary: '删除工单' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.workOrdersService.remove(id, user.id, user.roleCode);
  }

  @Post(':id/receive')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('workOrder:receive')
  @ApiOperation({ summary: '接收工单' })
  receive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.workOrdersService.receive(id, user.id);
  }

  @Patch(':id/cancel-receive')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('workOrder:receive')
  @ApiOperation({ summary: '取消接收工单' })
  cancelReceive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.workOrdersService.cancelReceive(id, user.id);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('workOrder:complete')
  @ApiOperation({ summary: '完成工单' })
  complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() completeDto: CompleteWorkOrderDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.workOrdersService.complete(id, user.id, completeDto);
  }
}
