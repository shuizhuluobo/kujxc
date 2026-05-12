import {
  Controller,
  Sse,
  MessageEvent,
  Query,
  UnauthorizedException,
  UseGuards,
  Get,
  SetMetadata,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent, map } from 'rxjs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

// SSE端点使用query参数中的token自行验证，需跳过全局JwtAuthGuard和CsrfGuard
const IS_PUBLIC_KEY = 'isPublic';
const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// SSE专用payload（短时效）
@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(
    private eventEmitter: EventEmitter2,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  /**
   * 获取SSE专用token（短时效60秒）
   * 前端应先调用此接口获取token，再连接SSE
   */
  @Get('token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取SSE连接专用Token（60秒有效期）' })
  async getSseToken(
    @CurrentUser() user: { id: string; roleId: string },
  ): Promise<{ token: string }> {
    // 获取用户区域信息
    const userInfo = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { regionId: true },
    });

    const payload = {
      sub: user.id,
      regionId: userInfo?.regionId,
      type: 'sse',
    };

    // SSE token 60秒有效期
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '60s',
    });

    return { token };
  }

  @Sse('sse')
  @Public()
  @ApiOperation({ summary: 'Subscribe to server-sent events' })
  async sse(@Query('token') token: string): Promise<Observable<MessageEvent>> {
    // 严格验证 Token
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    interface JwtPayload {
      sub: string;
      type: string;
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      // 验证token类型必须是sse
      if (payload.type !== 'sse') {
        throw new UnauthorizedException('Invalid token type');
      }
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // 验证用户是否存在且活跃
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, isActive: true, regionId: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or disabled');
    }

    // 监听内部事件并转发为 SSE（根据用户区域过滤）
    return fromEvent(this.eventEmitter, 'app.event').pipe(
      map((data: { type: string; payload: unknown }) => {
        // 如果事件包含区域信息，则检查用户是否有权限接收
        const eventPayload = data.payload as {
          regionId?: string;
          creatorId?: string;
          receiverId?: string;
        };
        const userRegionId = user.regionId;

        // 工单相关事件进行区域过滤
        if (data.type.startsWith('work-order.') && eventPayload?.regionId) {
          // 如果用户没有区域，或事件区域与用户区域不匹配，则不发送
          if (userRegionId && eventPayload.regionId !== userRegionId) {
            // 返回空数据，客户端忽略
            return { data: { type: 'heartbeat', payload: {} } };
          }
        }

        return {
          data: { type: data.type, payload: data.payload },
        };
      }),
    );
  }
}
