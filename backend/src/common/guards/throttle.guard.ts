import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { THROTTLE_KEY } from '../decorators/throttle.decorator';

// 简化的速率限制存储（内存中）
const requestCounts = new Map<string, { count: number; resetTime: number }>();

@Injectable()
export class ThrottleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<{
      limit: number;
      ttl: number;
    }>(THROTTLE_KEY, [context.getHandler(), context.getClass()]);

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    const key = `${ip}:${request.url}`;

    const now = Date.now();
    const record = requestCounts.get(key);

    if (record && record.resetTime > now) {
      if (record.count >= options.limit) {
        throw new BadRequestException('请求过于频繁，请稍后再试');
      }
      record.count++;
    } else {
      requestCounts.set(key, {
        count: 1,
        resetTime: now + options.ttl * 1000,
      });
    }

    return true;
  }
}
