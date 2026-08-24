import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { E2eHelper, authHeaders } from './helpers/e2e-auth.helper';

describe('Products Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let helper: E2eHelper;
  let brandId: string;
  let categoryId: string;

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

    // 创建产品所需的前置依赖
    const brand = await request(app.getHttpServer())
      .post('/api/brands')
      .set(authHeaders(helper.getToken()))
      .send({ name: `品牌_${Date.now()}` });
    brandId = brand.body.id;
    const cat = await request(app.getHttpServer())
      .post('/api/categories')
      .set(authHeaders(helper.getToken()))
      .send({ name: `分类_${Date.now()}`, parentId: null });
    categoryId = cat.body.id;
  });

  afterAll(async () => {
    await helper.cleanup();
    if (brandId)
      await prisma.brand
        .delete({ where: { id: brandId } })
        .catch(() => undefined);
    if (categoryId)
      await prisma.category
        .delete({ where: { id: categoryId } })
        .catch(() => undefined);
    await app.close();
  });

  describe('Authentication & CSRF', () => {
    it('401 无 token 访问受保护接口', async () => {
      await request(app.getHttpServer()).get('/api/products').expect(401);
    });

    it('401 无效 token', async () => {
      await request(app.getHttpServer())
        .get('/api/products')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });

    it('403 写请求缺少 CSRF token', async () => {
      await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${helper.getToken()}`)
        .send({ name: 'x' })
        .expect(403);
    });

    it('200 携带合法 CSRF token 的写请求通过校验', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/products')
        .set(authHeaders(helper.getToken()))
        .send({
          name: 'CSRF 校验通过产品',
          model: 'CSRF-001',
          brandId,
          categoryId,
          unit: '台',
          salePrice: 100,
        })
        .expect(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('CSRF 校验通过产品');
    });
  });

  describe('Products CRUD', () => {
    let createdId: string;

    it('POST /api/products 创建产品', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/products')
        .set(authHeaders(helper.getToken()))
        .send({
          name: '联想 ThinkStation P620',
          model: 'P620',
          brandId,
          categoryId,
          unit: '台',
          salePrice: 25000,
          costPrice: 21000,
          description: '高端图形工作站',
          tagIds: [],
        })
        .expect(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.code).toMatch(/^LX/);
      expect(res.body.name).toBe('联想 ThinkStation P620');
      createdId = res.body.id;
    });

    it('POST /api/products 校验失败 -> 400（缺必填 brandId）', async () => {
      await request(app.getHttpServer())
        .post('/api/products')
        .set(authHeaders(helper.getToken()))
        .send({ name: '缺品牌', unit: '台' })
        .expect(400);
    });

    it('GET /api/products 列表（含分类筛选）', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/products')
        .set(authHeaders(helper.getToken(), false))
        .expect(200);
      expect(Array.isArray(res.body.data ?? res.body)).toBe(true);
      const list = res.body.data ?? res.body;
      expect(list.some((p: any) => p.id === createdId)).toBe(true);

      const filtered = await request(app.getHttpServer())
        .get(`/api/products?categoryId=${categoryId}`)
        .set(authHeaders(helper.getToken(), false))
        .expect(200);
      const filteredList = filtered.body.data ?? filtered.body;
      expect(filteredList.length).toBeGreaterThan(0);
      expect(filteredList.every((p: any) => p.categoryId === categoryId)).toBe(
        true,
      );
    });

    it('GET /api/products/:id 详情', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/products/${createdId}`)
        .set(authHeaders(helper.getToken(), false))
        .expect(200);
      expect(res.body.id).toBe(createdId);
    });

    it('GET /api/products/:id 不存在 -> 404', async () => {
      await request(app.getHttpServer())
        .get('/api/products/non-existent-id')
        .set(authHeaders(helper.getToken(), false))
        .expect(404);
    });

    it('PATCH /api/products/:id 更新', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/products/${createdId}`)
        .set(authHeaders(helper.getToken()))
        .send({ salePrice: 26000, description: '价格更新' })
        .expect(200);
      expect(res.body.salePrice).toBe(26000);
      expect(res.body.description).toBe('价格更新');
    });

    it('DELETE /api/products/:id 删除', async () => {
      await request(app.getHttpServer())
        .delete(`/api/products/${createdId}`)
        .set(authHeaders(helper.getToken()))
        .expect(200);
      await request(app.getHttpServer())
        .get(`/api/products/${createdId}`)
        .set(authHeaders(helper.getToken(), false))
        .expect(404);
    });
  });

  describe('Permission enforcement', () => {
    it('商务用户可创建产品', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/products')
        .set(authHeaders(helper.getToken('e2e_business')))
        .send({
          name: '商务创建产品',
          model: 'BIZ-1',
          unit: '台',
          brandId,
          categoryId,
        })
        .expect(201);
      expect(res.body.id).toBeDefined();
    });
  });
});
