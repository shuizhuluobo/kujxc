import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Res,
  Query,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CsrfProtected } from '../common/decorators/csrf-token.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';
import { PerformanceService } from './performance.service';
import type {
  CreateProjectDto,
  UpdateProjectDto,
  CreateRecordDto,
  CreateRecordsDto,
  UpdateRecordDto,
} from './performance.service';

@ApiTags('项目台账')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@CsrfProtected()
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('projects')
  @Permissions('fee:view_project')
  async getProjects(@CurrentUser() user: CurrentUserData) {
    const isAdmin =
      user.roleCode === 'admin' || user.roleCode === 'project_manager';
    return this.performanceService.getProjects(user.id, isAdmin);
  }

  @Get('projects/export')
  @Permissions('fee:export')
  async exportProjects(@Query('ids') ids: string, @Res() res: Response) {
    const projectIds = ids ? ids.split(',').filter(Boolean) : undefined;
    const buffer = await this.performanceService.exportProjects(projectIds);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent('项目台账_批量导出')}.xlsx`,
    });
    res.send(buffer);
  }

  @Get('projects/:id')
  @Permissions('fee:view_project')
  async getProject(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const project = await this.performanceService.getProject(id);
    if (!project) throw new NotFoundException('项目不存在');
    const isAdmin =
      user.roleCode === 'admin' || user.roleCode === 'project_manager';
    if (!isAdmin) {
      const isMember = await this.performanceService.isProjectMember(
        id,
        user.id,
      );
      if (!isMember) throw new ForbiddenException('您不是该项目的参与人员');
    }
    return project;
  }

  @Post('projects')
  @Permissions('fee:create_project')
  async createProject(
    @Body() data: CreateProjectDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.performanceService.createProject(data, user.id);
  }

  @Patch('projects/:id')
  @Permissions('fee:view_project')
  async updateProject(
    @Param('id') id: string,
    @Body() data: UpdateProjectDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    // 只有创建人或管理员可以修改（含成员管理）
    const project = await this.performanceService.getProject(id);
    if (!project) {
      throw new NotFoundException('项目不存在');
    }
    if (project.creatorId !== user.id && user.roleCode !== 'admin') {
      throw new ForbiddenException('只有创建人或管理员可以修改项目');
    }
    return this.performanceService.updateProject(id, data);
  }

  @Delete('projects/:id')
  @Permissions('fee:view_project')
  async deleteProject(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    // 只有创建人或管理员可以删除
    const project = await this.performanceService.getProject(id);
    if (!project) {
      throw new NotFoundException('项目不存在');
    }
    if (project.creatorId !== user.id && user.roleCode !== 'admin') {
      throw new ForbiddenException('只有创建人或管理员可以删除项目');
    }
    return this.performanceService.deleteProject(id);
  }

  @Get('projects/:projectId/records')
  @Permissions('fee:view_project')
  async getRecords(@Param('projectId') projectId: string) {
    return this.performanceService.getRecords(projectId);
  }

  @Post('projects/:projectId/records')
  @Permissions('fee:view_project')
  async createRecord(
    @Param('projectId') projectId: string,
    @Body() data: CreateRecordDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.performanceService.createRecord(
      projectId,
      data,
      user.id,
      user.roleCode,
    );
  }

  @Post('projects/:projectId/records/batch')
  @Permissions('fee:view_project')
  async createRecords(
    @Param('projectId') projectId: string,
    @Body() data: CreateRecordsDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.performanceService.createRecords(
      projectId,
      data,
      user.id,
      user.roleCode,
    );
  }

  @Patch('projects/:projectId/records/:recordId')
  @Permissions('fee:view_project')
  async updateRecord(
    @Param('projectId') projectId: string,
    @Param('recordId') recordId: string,
    @Body() data: UpdateRecordDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    // 只有记录创建人或管理员可以修改
    const record = await this.performanceService.getRecord(projectId, recordId);
    if (record.creatorId !== user.id && user.roleCode !== 'admin') {
      throw new ForbiddenException('只有创建人或管理员可以修改记录');
    }
    return this.performanceService.updateRecord(projectId, recordId, data);
  }

  @Delete('projects/:projectId/records/:recordId')
  @Permissions('fee:view_project')
  async deleteRecord(
    @Param('projectId') projectId: string,
    @Param('recordId') recordId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    // 只有记录创建人或管理员可以删除
    const record = await this.performanceService.getRecord(projectId, recordId);
    if (record.creatorId !== user.id && user.roleCode !== 'admin') {
      throw new ForbiddenException('只有创建人或管理员可以删除记录');
    }
    return this.performanceService.deleteRecord(projectId, recordId);
  }

  @Get('projects/:projectId/devices')
  @Permissions('fee:view_project')
  async getDevices(@Param('projectId') projectId: string) {
    return this.performanceService.getDevices(projectId);
  }

  @Post('projects/:projectId/devices')
  @Permissions('fee:view_project')
  async createDevice(
    @Param('projectId') projectId: string,
    @Body()
    data: {
      customerId: string;
      deviceName: string;
      expectedQuantity: number;
      remark?: string;
    },
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.performanceService.createDevice(
      projectId,
      data,
      user.id,
      user.roleCode,
    );
  }

  @Patch('devices/:deviceId')
  @Permissions('fee:view_project')
  async updateDevice(
    @Param('deviceId') deviceId: string,
    @Body()
    data: {
      customerId?: string;
      deviceName?: string;
      expectedQuantity?: number;
      remark?: string;
    },
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.performanceService.updateDevice(
      deviceId,
      data,
      user.id,
      user.roleCode,
    );
  }

  @Delete('devices/:deviceId')
  @Permissions('fee:view_project')
  async deleteDevice(
    @Param('deviceId') deviceId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.performanceService.deleteDevice(
      deviceId,
      user.id,
      user.roleCode,
    );
  }

  @Get('projects/:projectId/stats')
  @Permissions('fee:view_stats')
  async getStats(@Param('projectId') projectId: string) {
    return this.performanceService.getStats(projectId);
  }

  @Get('projects/:projectId/stats/me')
  @Permissions('fee:view_stats')
  async getMyStats(
    @Param('projectId') projectId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.performanceService.getMyStats(projectId, user.id);
  }

  @Get('projects/:projectId/export')
  @Permissions('fee:export')
  async exportProject(
    @Param('projectId') projectId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.performanceService.exportProject(projectId);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent('项目台账')}_${projectId}.xlsx`,
    });
    res.send(buffer);
  }

  @Get('global-stats')
  @Permissions('fee:view_stats')
  async getGlobalStats(
    @CurrentUser() user: CurrentUserData,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
  ) {
    if (user.roleCode !== 'admin') {
      throw new ForbiddenException('仅管理员可查看绩效总览');
    }
    return this.performanceService.getGlobalStats(startDate, endDate, userId);
  }

  @Get('projects/:projectId/fee-records')
  @Permissions('fee:view_records')
  async getFeeRecords(@Param('projectId') projectId: string) {
    return this.performanceService.getFeeRecords(projectId);
  }

  @Post('projects/:projectId/fee-records')
  @Permissions('fee:save_records')
  async saveFeeRecord(
    @Param('projectId') projectId: string,
    @Body()
    data: {
      items: any[];
      subtotal: number;
      discount: number;
      actualAmount: number;
      remark?: string;
      customerId?: string;
      collaboratorIds?: string[];
    },
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.performanceService.saveFeeRecord(projectId, data, user.id);
  }

  @Delete('projects/:projectId/fee-records/:recordId')
  @Permissions('fee:delete_records')
  async deleteFeeRecord(
    @Param('projectId') projectId: string,
    @Param('recordId') recordId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const isAdmin = user.roleCode === 'admin';
    if (!isAdmin) {
      throw new ForbiddenException('只有管理员可以删除费用记录');
    }
    return this.performanceService.deleteFeeRecord(projectId, recordId);
  }

  // ===== 公物仓独立费用记录（无项目关联）=====
  @Get('warehouse/fee-records')
  @Permissions('fee:view_records')
  async getWarehouseFeeRecords() {
    return this.performanceService.getFeeRecords();
  }

  @Post('warehouse/fee-records')
  @Permissions('fee:save_records')
  async saveWarehouseFeeRecord(
    @Body()
    data: {
      items: any[];
      subtotal: number;
      discount: number;
      actualAmount: number;
      remark?: string;
      customerId?: string;
      collaboratorIds?: string[];
    },
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.performanceService.saveFeeRecord(null, data, user.id);
  }

  @Delete('warehouse/fee-records/:recordId')
  @Permissions('fee:delete_records')
  async deleteWarehouseFeeRecord(
    @Param('recordId') recordId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const isAdmin = user.roleCode === 'admin';
    if (!isAdmin) {
      throw new ForbiddenException('只有管理员可以删除费用记录');
    }
    return this.performanceService.deleteFeeRecord(null, recordId);
  }
}
