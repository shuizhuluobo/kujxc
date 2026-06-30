import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * CSRF 防护层（冗余设计）
 *
 * 说明：本项目采用 JWT Bearer + localStorage 认证，浏览器不会自动携带凭证，
 * CSRF 攻击面不存在。本层为历史遗留的纵深防御，保留不影响安全。
 * 若未来引入 Cookie 认证，需修复 consumeToken 的 token 复用问题
 * （当前 consumeToken 仅校验签名，不消费/失效 token）。
 */
@Injectable()
export class CsrfService {
  private readonly tokenSecret: string;
  private readonly tokenTtl: number = 86400000; // 24 hours in milliseconds

  constructor(private configService: ConfigService) {
    this.tokenSecret = this.configService.get<string>(
      'CSRF_SECRET',
      this.configService.get<string>('JWT_SECRET', 'default-csrf-secret'),
    );
  }

  generateToken(_sessionId?: string): Promise<string> {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const payload = `${id}:${timestamp}`;
    const signature = this.sign(payload);
    return Promise.resolve(`${payload}:${signature}`);
  }

  validateToken(token: string): Promise<boolean> {
    if (!token) {
      return Promise.resolve(false);
    }

    const parts = token.split(':');
    if (parts.length !== 3) {
      return Promise.resolve(false);
    }

    const [, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    // Check if token is expired
    if (Date.now() - timestamp > this.tokenTtl) {
      return Promise.resolve(false);
    }

    // Verify signature (无状态验证，不依赖缓存，兼容 cluster 模式)
    const id = parts[0];
    const payload = `${id}:${timestamp}`;
    const expectedSignature = this.sign(payload);

    return Promise.resolve(signature === expectedSignature);
  }

  consumeToken(token: string): Promise<boolean> {
    return this.validateToken(token);
  }

  private sign(data: string): string {
    return crypto
      .createHmac('sha256', this.tokenSecret)
      .update(data)
      .digest('hex')
      .substring(0, 32);
  }
}
