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
import { CsrfProtected } from '../common/decorators/csrf-token.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';
import { PerformanceService } from './performance.service';
import type {
  CreateProjectDto,
  UpdateProjectDto,
  CreateRecordDto,
  UpdateRecordDto,
} from './performance.service';

@ApiTags('项目台账')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('projects')
  async getProjects(@CurrentUser() user: CurrentUserData) {
    // roleCode 直接来自 JWT payload，不依赖 role.code
    if (user.roleCode === 'admin' || user.roleCode === 'project_manager') {
      return this.performanceService.getProjects();
    }
    return this.performanceService.getProjects(user.id);
  }

  @Get('projects/export')
  async exportProjects(@Query('ids') ids: string, @Res() res: Response) {
    const projectIds = ids ? ids.split(',').filter(Boolean) : undefined;
    const buffer = await this.performanceService.exportProjects(projectIds);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent('项目台账_批量导出')}.xlsx`,
    });
    res.send(buffer);
  }

  @Get('projects/:id')
  async getProject(@Param('id') id: string) {
    return this.performanceService.getProject(id);
  }

  @Post('projects')
  async createProject(@Body() data: CreateProjectDto, @CurrentUser() user: CurrentUserData) {
    return this.performanceService.createProject(data, user.id);
  }

  @Patch('projects/:id')
  async updateProject(
    @Param('id') id: string,
    @Body() data: UpdateProjectDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    // 只有创建人或管理员可以修改
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
  async getRecords(@Param('projectId') projectId: string) {
    return this.performanceService.getRecords(projectId);
  }

  @Post('projects/:projectId/records')
  async createRecord(
    @Param('projectId') projectId: string,
    @Body() data: CreateRecordDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.performanceService.createRecord(projectId, data, user.id);
  }

  @Patch('projects/:projectId/records/:recordId')
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
  async getDevices(@Param('projectId') projectId: string) {
    return this.performanceService.getDevices(projectId);
  }

  @Post('projects/:projectId/devices')
  async createDevice(
    @Param('projectId') projectId: string,
    @Body() data: { customerId: string; deviceName: string; expectedQuantity: number; remark?: string },
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.performanceService.createDevice(projectId, data, user.id);
  }

  @Patch('devices/:deviceId')
  async updateDevice(
    @Param('deviceId') deviceId: string,
    @Body() data: { customerId?: string; deviceName?: string; expectedQuantity?: number; remark?: string },
  ) {
    return this.performanceService.updateDevice(deviceId, data);
  }

  @Delete('devices/:deviceId')
  async deleteDevice(@Param('deviceId') deviceId: string) {
    return this.performanceService.deleteDevice(deviceId);
  }

  @Post('devices/:deviceId/delivery')
  async recordDelivery(
    @Param('deviceId') deviceId: string,
    @Body() data: { quantity: number; collaboratorIds: string[] },
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.performanceService.recordDelivery(deviceId, data, user.id);
  }

  @Post('devices/:deviceId/install')
  async recordInstall(
    @Param('deviceId') deviceId: string,
    @Body() data: { quantity: number; collaboratorIds: string[] },
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.performanceService.recordInstall(deviceId, data, user.id);
  }

  @Post('devices/:deviceId/debug')
  async recordDebug(
    @Param('deviceId') deviceId: string,
    @Body() data: { quantity: number; collaboratorIds: string[] },
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.performanceService.recordDebug(deviceId, data, user.id);
  }

  @Get('projects/:projectId/stats')
  async getStats(@Param('projectId') projectId: string) {
    return this.performanceService.getStats(projectId);
  }

  @Get('projects/:projectId/stats/me')
  async getMyStats(
    @Param('projectId') projectId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.performanceService.getMyStats(projectId, user.id);
  }

  @Get('projects/:projectId/export')
  async exportProject(@Param('projectId') projectId: string, @Res() res: Response) {
    const buffer = await this.performanceService.exportProject(projectId);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent('项目台账')}_${projectId}.xlsx`,
    });
    res.send(buffer);
  }
}
