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
} from './dto/fee.dto';

@ApiTags('费用管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('fee')
export class FeeController {
  constructor(private readonly feeService: FeeService) {}

  @Get('settings')
  @UseGuards(PermissionsGuard)
  @Permissions('fee:calculate')
  async getSettings(@Query('category') category?: string) {
    return this.feeService.getSettings(category);
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

  @Post('settings')
  @UseGuards(PermissionsGuard)
  @Permissions('fee:settings')
  async createSetting(@Body() data: CreateFeeSettingDto) {
    return this.feeService.createSetting(data);
  }

  @Delete('settings/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('fee:settings')
  async deleteSetting(@Param('id', ParseUUIDPipe) id: string) {
    return this.feeService.deleteSetting(id);
  }

  @Post('calculate')
  @UseGuards(PermissionsGuard)
  @Permissions('fee:calculate')
  calculate(@Body() body: CalculateFeeDto) {
    return this.feeService.calculate(body.items);
  }

  @Post('records')
  @UseGuards(PermissionsGuard)
  @Permissions('fee:save_records')
  async saveRecord(
    @Body() data: SaveFeeRecordDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    // creatorId 从 JWT 取，忽略请求体中的值
    return this.feeService.saveRecord({ ...data, creatorId: user.id });
  }

  @Delete('records/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('fee:delete_records')
  async deleteRecord(@Param('id', ParseUUIDPipe) id: string) {
    return this.feeService.deleteRecord(id);
  }

  @Get('records')
  @UseGuards(PermissionsGuard)
  @Permissions('fee:view_records')
  async getRecords(@Query() query: FeeRecordsQueryDto) {
    return this.feeService.getRecords(query.limit, query.offset);
  }

  // 仅管理员可初始化默认设置
  @Post('settings/init')
  @UseGuards(PermissionsGuard)
  @Permissions('fee:settings')
  async initDefaultSettings() {
    await this.feeService.initDefaultSettings();
    return { success: true };
  }
}
