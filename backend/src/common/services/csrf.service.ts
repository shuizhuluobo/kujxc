import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

interface CsrfTokenData {
  token: string;
  createdAt: number;
}

@Injectable()
export class CsrfService {
  private readonly tokenSecret: string;
  private readonly tokenTtl: number = 3600000; // 1 hour in milliseconds
  private readonly tokenStore = new Map<string, CsrfTokenData>();

  constructor(private configService: ConfigService) {
    this.tokenSecret = this.configService.get<string>(
      'CSRF_SECRET',
      this.configService.get<string>('JWT_SECRET', 'default-csrf-secret'),
    );

    // Clean up expired tokens every 10 minutes
    setInterval(() => this.cleanupExpiredTokens(), 600000);
  }

  generateToken(sessionId?: string): string {
    const id = sessionId || crypto.randomUUID();
    const timestamp = Date.now();
    const payload = `${id}:${timestamp}`;
    const signature = this.sign(payload);
    const token = `${payload}:${signature}`;

    this.tokenStore.set(id, {
      token,
      createdAt: timestamp,
    });

    return token;
  }

  validateToken(token: string): boolean {
    if (!token) {
      return false;
    }

    const parts = token.split(':');
    if (parts.length !== 3) {
      return false;
    }

    const [id, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    // Check if token is expired
    if (Date.now() - timestamp > this.tokenTtl) {
      this.tokenStore.delete(id);
      return false;
    }

    // Verify signature
    const payload = `${id}:${timestamp}`;
    const expectedSignature = this.sign(payload);

    if (signature !== expectedSignature) {
      return false;
    }

    // Check if token exists in store (optional, for additional security)
    const storedData = this.tokenStore.get(id);
    if (!storedData || storedData.token !== token) {
      return false;
    }

    return true;
  }

  consumeToken(token: string): boolean {
    const isValid = this.validateToken(token);
    // 不删除token，允许在有效期内重复使用
    return isValid;
  }

  private sign(data: string): string {
    return crypto
      .createHmac('sha256', this.tokenSecret)
      .update(data)
      .digest('hex')
      .substring(0, 32);
  }

  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [id, data] of this.tokenStore.entries()) {
      if (now - data.createdAt > this.tokenTtl) {
        this.tokenStore.delete(id);
      }
    }
  }
}
