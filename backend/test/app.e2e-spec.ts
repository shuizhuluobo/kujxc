import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/security/csrf-token 公共端点返回 token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/security/csrf-token')
      .expect(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.token.split(':')).toHaveLength(3);
  });

  it('未知路由返回 404', async () => {
    await request(app.getHttpServer()).get('/api/does-not-exist').expect(404);
  });
});
