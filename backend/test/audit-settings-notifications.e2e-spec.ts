import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { E2eHelper, authHeaders } from './helpers/e2e-auth.helper';

describe('AuditLog / Settings / Notifications (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let helper: E2eHelper;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.setGlobalPrefix('api');
    await app.init();
    prisma = app.get(PrismaService);
    helper = new E2eHelper(prisma, app);
    await helper.seed();
  });

  afterAll(async () => {
    await helper.cleanup();
    await app.close();
  });

  describe('Audit Log', () => {
    it('列表（返回 200）', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/audit-logs')
        .set(authHeaders(helper.getToken(), false))
        .expect(200);
      expect(res.body).toBeDefined();
    });
  });

  describe('Settings', () => {
    it('获取全部设置', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/settings')
        .set(authHeaders(helper.getToken(), false))
        .expect(200);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('defaultTaxRate');
    });

    it('获取单个设置', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/settings/defaultTaxRate')
        .set(authHeaders(helper.getToken(), false))
        .expect(200);
      // 契约：GET /settings/:key 直接返回原始值（如税率数字），
      // supertest 不解析顶层原始值，需从 res.text 解析。
      const value = JSON.parse(res.text);
      expect(value).not.toBeNull();
      expect(value).not.toEqual({});
    });

    it('更新设置（PATCH）', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/settings/defaultTaxRate')
        .set(authHeaders(helper.getToken()))
        .send({ value: 13 })
        .expect(200);
      // PATCH 同样返回原始值
      expect(JSON.parse(res.text)).toBe(13);
      // 重新读取验证已生效
      const verify = await request(app.getHttpServer())
        .get('/api/settings/defaultTaxRate')
        .set(authHeaders(helper.getToken(), false))
        .expect(200);
      expect(JSON.parse(verify.text)).toBe(13);
    });
  });

  describe('Notifications', () => {
    it('获取我的通知', async () => {
      await request(app.getHttpServer())
        .get('/api/notifications')
        .set(authHeaders(helper.getToken(), false))
        .expect(200);
    });

    it('获取全部通知', async () => {
      await request(app.getHttpServer())
        .get('/api/notifications/all')
        .set(authHeaders(helper.getToken(), false))
        .expect(200);
    });

    it('获取未读数量', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/notifications/unread-count')
        .set(authHeaders(helper.getToken(), false))
        .expect(200);
      expect(res.body).toHaveProperty('count');
    });

    it('标记全部已读（写请求需 CSRF）', async () => {
      await request(app.getHttpServer())
        .post('/api/notifications/mark-all-read')
        .set(authHeaders(helper.getToken()))
        .expect(201);
    });

    it('清空全部（写请求需 CSRF）', async () => {
      await request(app.getHttpServer())
        .post('/api/notifications/clear-all')
        .set(authHeaders(helper.getToken()))
        .expect(201);
    });
  });
});
