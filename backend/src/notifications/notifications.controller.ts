import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { MarkReadDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('消息通知')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: '获取我的通知列表' })
  findMy(@CurrentUser() user: CurrentUserData) {
    return this.notificationsService.findByUser(user.id);
  }

  @Get('all')
  @ApiOperation({ summary: '获取所有通知(包括已读)' })
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.notificationsService.findByUser(user.id, true);
  }

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读通知数量' })
  async getUnreadCount(@CurrentUser() user: CurrentUserData) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  @Post('mark-read')
  @ApiOperation({ summary: '标记通知为已读' })
  markRead(@CurrentUser() user: CurrentUserData, @Body() dto: MarkReadDto) {
    return this.notificationsService.markAsRead(dto.ids, user.id);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: '全部标记已读' })
  markAllRead(@CurrentUser() user: CurrentUserData) {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
