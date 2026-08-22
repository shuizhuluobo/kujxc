import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CsrfProtected } from '../common/decorators/csrf-token.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

class UpdateSettingDto {
  @IsNotEmpty()
  value: unknown;
}

@ApiTags('系统设置')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('product:view', 'system:user_view')
  @ApiOperation({ summary: '获取全部系统设置' })
  getAll() {
    return this.settingsService.getAll();
  }

  @Get(':key')
  @UseGuards(PermissionsGuard)
  @Permissions('product:view', 'system:user_view')
  @ApiOperation({ summary: '获取单项设置' })
  get(@Param('key') key: string) {
    return this.settingsService.get(key);
  }

  @Patch(':key')
  @UseGuards(PermissionsGuard)
  @Permissions('system:user_manage')
  @ApiOperation({ summary: '更新单项设置' })
  update(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.settingsService.set(key, dto.value, user.id);
  }
}
