import { INestApplication, HttpStatus } from '@nestjs/common';
import * as supertest from 'supertest';
const request = (supertest as any).default ?? supertest;
import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

/**
 * E2E 测试认证与数据辅助
 *
 * - 在测试库内创建最小可用数据（角色 / 用户 / 系统设置 / 编号前缀）
 * - 通过测试内 AppModule 的 HTTP server（supertest）完成登录，获取 accessToken
 * - 提供 CSRF token 生成（与运行时 CsrfService 使用同一密钥签名，因此可被守卫校验通过）
 *
 * 注意：CSRF 守卫对 GET 豁免，写请求需携带 x-csrf-token。
 * 由于 CsrfService 用 JWT_SECRET 做 HMAC 签名，只要 e2e 启动时设置了相同的 JWT_SECRET，
 * 这里生成的 token 即可通过校验。
 */

export const E2E_JWT_SECRET = 'e2e-test-secret-do-not-use-in-prod';

export interface E2eUser {
  username: string;
  password: string;
  accessToken: string;
}

const TEST_USERS = [
  {
    username: 'e2e_admin',
    name: 'E2E 管理员',
    permission: ['*'] as string[],
    password: 'E2eAdmin123!',
  },
  {
    username: 'e2e_business',
    name: 'E2E 商务',
    // 仅拥有产品库与报价相关权限，无 tag/brand/category 管理权限，用于权限校验
    permission: [
      'product:list',
      'product:view',
      'product:create',
      'product:edit',
      'product:delete',
      'quotation:list',
      'quotation:view',
      'quotation:create',
      'quotation:update',
      'profile:profile',
    ] as string[],
    password: 'E2eBiz123!',
  },
];

export class E2eHelper {
  private users: Map<string, E2eUser> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly app: INestApplication,
  ) {}

  /** 在测试库中播种角色与用户，并返回登录 token */
  async seed(): Promise<void> {
    for (const u of TEST_USERS) {
      const role = await this.prisma.role.upsert({
        where: { code: `e2e_${u.username}` },
        update: { permissions: u.permission },
        create: {
          name: `${u.name}角色`,
          code: `e2e_${u.username}`,
          permissions: u.permission,
        },
      });

      const passwordHash = await bcrypt.hash(u.password, 10);
      await this.prisma.user.upsert({
        where: { username: u.username },
        update: { password: passwordHash, roleId: role.id },
        create: {
          username: u.username,
          name: u.name,
          password: passwordHash,
          roleId: role.id,
        },
      });

      const token = await this.login(u.username, u.password);
      this.users.set(u.username, {
        username: u.username,
        password: u.password,
        accessToken: token,
      });
    }

    // 报价单 / 产品需要的基础配置
    await this.prisma.systemSetting.upsert({
      where: { key: 'defaultTaxRate' },
      update: {},
      create: { key: 'defaultTaxRate', value: 13, description: '默认税率' },
    });
    await this.prisma.codePrefixConfig.upsert({
      where: { entityType: 'product' },
      update: {},
      create: { entityType: 'product', prefix: 'LX', name: '产品' },
    });
    await this.prisma.codePrefixConfig.upsert({
      where: { entityType: 'quotation' },
      update: {},
      create: { entityType: 'quotation', prefix: 'BJ', name: '报价' },
    });
  }

  /** 清理本次播种数据（保留结构），可在 afterAll 调用 */
  async cleanup(): Promise<void> {
    for (const u of TEST_USERS) {
      await this.prisma.user
        .delete({ where: { username: u.username } })
        .catch(() => undefined);
      await this.prisma.role
        .delete({ where: { code: `e2e_${u.username}` } })
        .catch(() => undefined);
    }
  }

  async login(username: string, password: string): Promise<string> {
    const res = await request(this.app.getHttpServer())
      .post('/api/auth/login')
      .send({ username, password });
    if (res.status !== HttpStatus.OK) {
      throw new Error(
        `E2E login failed for ${username}: ${res.status} ${JSON.stringify(res.body)}`,
      );
    }
    return res.body.accessToken;
  }

  getToken(username = 'e2e_admin'): string {
    const u = this.users.get(username);
    if (!u) throw new Error(`No token for ${username}, did you call seed()?`);
    return u.accessToken;
  }

  /** 生成合法 CSRF token（与运行时 CsrfService 同源签名） */
  static makeCsrfToken(): string {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const payload = `${id}:${timestamp}`;
    const signature = crypto
      .createHmac('sha256', E2E_JWT_SECRET)
      .update(payload)
      .digest('hex')
      .substring(0, 32);
    return `${payload}:${signature}`;
  }
}

/** 给 supertest 请求附加认证头与 CSRF 头 */
export function authHeaders(
  token: string,
  withCsrf = true,
): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (withCsrf) {
    headers['x-csrf-token'] = E2eHelper.makeCsrfToken();
  }
  return headers;
}
