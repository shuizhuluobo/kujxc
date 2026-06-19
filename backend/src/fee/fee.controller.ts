import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';
import { CsrfProtected } from '../common/decorators/csrf-token.decorator';
import { FeeService } from './fee.service';
import {
  CreateFeeSettingDto,
  UpdateFeeSettingDto,
  CalculateFeeDto,
  SaveFeeRecordDto,
  FeeRecordsQueryDto,
  FeeStatsQueryDto,
} from './dto/fee.dto';

@ApiTags('费用管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('fee')
export class FeeController {
  constructor(private readonly feeService: FeeService) {}

  // ==================== 费用设置 ====================

  @Get('settings')
  @UseGuards(PermissionsGuard)
  @Permissions('fee:calculate')
  async getSettings(
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
  ) {
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.feeService.getSettings(category, isActiveBool);
  }

  @Get('settings/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('fee:settings')
  async getSetting(@Param('id', ParseUUIDPipe) id: string) {
    return this.feeService.getSetting(id);
  }

  @Post('settings')
  @UseGuards(PermissionsGuard)
  @Permissions('fee:settings')
  async createSetting(@Body() data: CreateFeeSettingDto) {
    return this.feeService.createSetting(data);
  }

  @Put('settings/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('fee:settings')
  async updateSetting(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateFeeSettingDto,
  ) {
    return this.feeService.updateSetting(id, data);
  }

  @Delete('settings/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('fee:settings')
  async deleteSetting(@Param('id', ParseUUIDPipe) id: string) {
    return this.feeService.deleteSetting(id);
  }

  @Post('settings/init')
  @UseGuards(PermissionsGuard)
  @Permissions('fee:settings')
  async initDefaultSettings() {
    await this.feeService.initDefaultSettings();
    return { success: true };
  }

  // ==================== 费用计算 ====================

  @Post('calculate')
  @UseGuards(PermissionsGuard)
  @Permissions('fee:calculate')
  calculate(@Body() body: CalculateFeeDto) {
    return this.feeService.calculate(body.items);
  }

  // ==================== 费用记录 ====================

  @Post('records')
  @UseGuards(PermissionsGuard)
  @Permissions('fee:save_records')
  async saveRecord(
    @Body() data: SaveFeeRecordDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.feeService.saveRecord({
      items: data.items,
      subtotal: data.subtotal,
      discount: data.discount,
      actualAmount: data.actualAmount,
      remark: data.remark,
      projectId: data.projectId,
      customerId: data.customerId,
      creatorId: user.id,
    });
  }

  @Get('records')
  @UseGuards(PermissionsGuard)
  @Permissions('fee:view_records')
  async getRecords(@Query() query: FeeRecordsQueryDto) {
    return this.feeService.getRecords({
      limit: query.limit,
      offset: query.offset,
      startDate: query.startDate,
      endDate: query.endDate,
      creatorId: query.creatorId,
      projectId: query.projectId,
      customerId: query.customerId,
    });
  }

  @Delete('records/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('fee:delete_records')
  async deleteRecord(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const isAdmin = user.roleCode === 'admin';
    return this.feeService.deleteRecord(id, user.id, isAdmin);
  }

  // ==================== 费用统计 ====================

  @Get('stats')
  @UseGuards(PermissionsGuard)
  @Permissions('fee:view_records')
  async getStats(@Query() query: FeeStatsQueryDto) {
    return this.feeService.getStats({
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }
}
