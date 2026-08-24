import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { E2eHelper, authHeaders } from './helpers/e2e-auth.helper';

describe('Brands / Categories / Tags (e2e)', () => {
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

  describe('Brands', () => {
    let brandId: string;
    const name = `品牌_${Date.now()}`;

    it('管理员创建品牌', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/brands')
        .set(authHeaders(helper.getToken()))
        .send({ name, description: '测试品牌' })
        .expect(201);
      expect(res.body.name).toBe(name);
      brandId = res.body.id;
    });

    it('商务用户无 brand:manage 权限 -> 403', async () => {
      await request(app.getHttpServer())
        .post('/api/brands')
        .set(authHeaders(helper.getToken('e2e_business')))
        .send({ name: '无权限品牌' })
        .expect(403);
    });

    it('列表与详情', async () => {
      await request(app.getHttpServer())
        .get('/api/brands')
        .set(authHeaders(helper.getToken(), false))
        .expect(200);
      await request(app.getHttpServer())
        .get(`/api/brands/${brandId}`)
        .set(authHeaders(helper.getToken(), false))
        .expect(200);
    });

    it('更新与删除', async () => {
      const upd = await request(app.getHttpServer())
        .patch(`/api/brands/${brandId}`)
        .set(authHeaders(helper.getToken()))
        .send({ description: '已更新' })
        .expect(200);
      expect(upd.body.description).toBe('已更新');
      await request(app.getHttpServer())
        .delete(`/api/brands/${brandId}`)
        .set(authHeaders(helper.getToken()))
        .expect(200);
    });
  });

  describe('Categories', () => {
    let catId: string;
    const name = `分类_${Date.now()}`;

    it('管理员创建分类', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/categories')
        .set(authHeaders(helper.getToken()))
        .send({ name, parentId: null })
        .expect(201);
      expect(res.body.name).toBe(name);
      catId = res.body.id;
    });

    it('商务用户无 category:manage -> 403', async () => {
      await request(app.getHttpServer())
        .post('/api/categories')
        .set(authHeaders(helper.getToken('e2e_business')))
        .send({ name: '无权限分类' })
        .expect(403);
    });

    it('列表', async () => {
      await request(app.getHttpServer())
        .get('/api/categories')
        .set(authHeaders(helper.getToken(), false))
        .expect(200);
    });

    it('更新与删除', async () => {
      await request(app.getHttpServer())
        .patch(`/api/categories/${catId}`)
        .set(authHeaders(helper.getToken()))
        .send({ name: `${name}_改` })
        .expect(200);
      await request(app.getHttpServer())
        .delete(`/api/categories/${catId}`)
        .set(authHeaders(helper.getToken()))
        .expect(200);
    });
  });

  describe('Tags', () => {
    let tagId: string;
    const name = `标签_${Date.now()}`;

    it('管理员创建标签', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/product-tags')
        .set(authHeaders(helper.getToken()))
        .send({ name, color: '#ff0000' })
        .expect(201);
      expect(res.body.name).toBe(name);
      tagId = res.body.id;
    });

    it('商务用户无 tag:manage -> 403', async () => {
      await request(app.getHttpServer())
        .post('/api/product-tags')
        .set(authHeaders(helper.getToken('e2e_business')))
        .send({ name: '无权限标签' })
        .expect(403);
    });

    it('列表 / 更新 / 删除', async () => {
      await request(app.getHttpServer())
        .get('/api/product-tags')
        .set(authHeaders(helper.getToken(), false))
        .expect(200);
      await request(app.getHttpServer())
        .patch(`/api/product-tags/${tagId}`)
        .set(authHeaders(helper.getToken()))
        .send({ color: '#00ff00' })
        .expect(200);
      await request(app.getHttpServer())
        .delete(`/api/product-tags/${tagId}`)
        .set(authHeaders(helper.getToken()))
        .expect(200);
    });
  });
});
