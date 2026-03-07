import { SetMetadata } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { applyDecorators } from '@nestjs/common';

export const THROTTLE_KEY = 'throttle';

export interface ThrottleOptions {
  limit: number;
  ttl: number; // 毫秒
}

/**
 * 速率限制装饰器 - 用于控制特定接口的请求频率
 * @param limit 最大请求次数
 * @param ttl 时间窗口（秒）
 */
export const Throttle = (limit: number, ttl: number = 60) =>
  SetMetadata(THROTTLE_KEY, { limit, ttl });

/**
 * 宽松的速率限制 - 用于一般接口
 */
export const ThrottleRelaxed = () =>
  SetMetadata(THROTTLE_KEY, { limit: 100, ttl: 60 });

/**
 * 严格的速率限制 - 用于登录等敏感接口
 */
export const ThrottleStrict = () =>
  SetMetadata(THROTTLE_KEY, { limit: 5, ttl: 60 });
