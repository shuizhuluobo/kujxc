import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CSRF_TOKEN_KEY } from '../decorators/csrf-token.decorator';
import { CsrfService } from '../services/csrf.service';

interface RequestWithCsrf extends Request {
  csrfToken?: () => string;
}

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private csrfService: CsrfService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireCsrf = this.reflector.getAllAndOverride<boolean>(
      CSRF_TOKEN_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireCsrf) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithCsrf>();

    // GET requests don't need CSRF validation
    if (request.method === 'GET') {
      return true;
    }

    // Get CSRF token from header
    const csrfToken = request.headers['x-csrf-token'] as string | undefined;

    // 开发环境允许跳过CSRF验证
    if (process.env.NODE_ENV === 'development') {
      if (!csrfToken) {
        console.warn('[CSRF] Missing CSRF token in development mode, allowing request');
        return true;
      }
    }

    if (!csrfToken) {
      throw new ForbiddenException('CSRF token缺失');
    }

    // Validate and consume the token
    if (!(await this.csrfService.consumeToken(csrfToken))) {
      throw new ForbiddenException('CSRF token无效或已过期');
    }

    return true;
  }
}
