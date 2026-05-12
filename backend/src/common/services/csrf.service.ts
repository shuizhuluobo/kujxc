import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

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

  async generateToken(_sessionId?: string): Promise<string> {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const payload = `${id}:${timestamp}`;
    const signature = this.sign(payload);
    return `${payload}:${signature}`;
  }

  async validateToken(token: string): Promise<boolean> {
    if (!token) {
      return false;
    }

    const parts = token.split(':');
    if (parts.length !== 3) {
      return false;
    }

    const [, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    // Check if token is expired
    if (Date.now() - timestamp > this.tokenTtl) {
      return false;
    }

    // Verify signature (无状态验证，不依赖缓存，兼容 cluster 模式)
    const id = parts[0];
    const payload = `${id}:${timestamp}`;
    const expectedSignature = this.sign(payload);

    return signature === expectedSignature;
  }

  async consumeToken(token: string): Promise<boolean> {
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
