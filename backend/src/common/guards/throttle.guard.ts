import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { THROTTLE_KEY } from '../decorators/throttle.decorator';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class ThrottleGuard implements CanActivate {
  private readonly logger = new Logger(ThrottleGuard.name);
  private readonly requestCounts = new Map<string, RateLimitRecord>();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL_MS = 60 * 1000;
  private readonly MAX_MAP_SIZE = 10000;

  constructor(private reflector: Reflector) {
    this.startCleanup();
  }

  private startCleanup(): void {
    if (this.cleanupInterval) {
      return;
    }
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL_MS);

    this.cleanupInterval.unref();
  }

  private cleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, record] of this.requestCounts.entries()) {
      if (record.resetTime <= now) {
        this.requestCounts.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger.debug(
        `Cleaned up ${removedCount} expired rate limit records`,
      );
    }

    if (this.requestCounts.size > this.MAX_MAP_SIZE) {
      const entriesToDelete = this.requestCounts.size - this.MAX_MAP_SIZE;
      const keys = Array.from(this.requestCounts.keys()).slice(
        0,
        entriesToDelete,
      );
      keys.forEach((key) => this.requestCounts.delete(key));
      this.logger.warn(
        `Rate limit map exceeded max size, removed ${entriesToDelete} oldest entries`,
      );
    }
  }

  private getClientIp(request: {
    ip?: string;
    connection?: { remoteAddress?: string };
    headers?: Record<string, string>;
  }): string {
    const forwardedFor = request.headers?.['x-forwarded-for'];
    if (forwardedFor) {
      const ips = forwardedFor.split(',').map((ip: string) => ip.trim());
      return ips[0];
    }
    return request.ip || request.connection?.remoteAddress || 'unknown';
  }

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<{
      limit: number;
      ttl: number;
    }>(THROTTLE_KEY, [context.getHandler(), context.getClass()]);

    if (!options) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { url: string }>();
    const ip = this.getClientIp(
      request as unknown as {
        ip?: string;
        connection?: { remoteAddress?: string };
        headers?: Record<string, string>;
      },
    );
    const key = `${ip}:${request.url}`;

    const now = Date.now();
    const record = this.requestCounts.get(key);

    if (record && record.resetTime > now) {
      if (record.count >= options.limit) {
        throw new BadRequestException('请求过于频繁，请稍后再试');
      }
      record.count++;
    } else {
      this.requestCounts.set(key, {
        count: 1,
        resetTime: now + options.ttl * 1000,
      });
    }

    return true;
  }
}
