import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { E2eHelper, authHeaders } from './helpers/e2e-auth.helper';

describe('Product Import (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let helper: E2eHelper;
  let templateId: string;

  // 每次运行使用唯一后缀，避免与库中历史数据（含上次中断遗留）重复，
  // 使测试幂等：默认 duplicateStrategy=skip 时也不会因重名而 successRows=0。
  const runId = `${Date.now()}`;
  const rows = [
    {
      品牌型号: `戴尔 PowerEdge R750 ${runId}`,
      品牌: `戴尔_${runId}`,
      类型: `服务器_${runId}`,
      价格: 38000,
      单位: '台',
    },
    {
      品牌型号: `惠普 ProLiant DL380 ${runId}`,
      品牌: `惠普_${runId}`,
      类型: `服务器_${runId}`,
      价格: 29000,
      单位: '台',
    },
  ];
  const mappingConfig = {
    name: '品牌型号',
    brandName: '品牌',
    categoryPath: '类型',
    marketPrice: '价格',
    unit: '单位',
  };

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
    // 清理本次导入的数据（按唯一后缀匹配，不影响库中其他数据）
    await prisma.product
      .deleteMany({
        where: { name: { contains: runId } },
      })
      .catch(() => undefined);
    await prisma.brand
      .deleteMany({ where: { name: { contains: runId } } })
      .catch(() => undefined);
    await prisma.category
      .deleteMany({ where: { name: { contains: runId } } })
      .catch(() => undefined);
    await helper.cleanup();
    await app.close();
  });

  it('401 未认证 preview', async () => {
    await request(app.getHttpServer())
      .post('/api/products/import/preview')
      .send({ mappingConfig, rows })
      .expect(401);
  });

  it('preview 返回解析结果', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/products/import/preview')
      .set(authHeaders(helper.getToken()))
      .send({
        mappingConfig,
        rows,
        options: { createMissingBrand: true, createMissingCategory: true },
      })
      .expect(201);
    expect(res.body).toHaveProperty('rows');
    expect(Array.isArray(res.body.rows)).toBe(true);
    expect(res.body.rows.length).toBe(2);
    expect(res.body.rows[0].mapped).toHaveProperty('name');
  });

  it('preview 校验失败 -> 400（缺 mappingConfig）', async () => {
    await request(app.getHttpServer())
      .post('/api/products/import/preview')
      .set(authHeaders(helper.getToken()))
      .send({ rows })
      .expect(400);
  });

  it('execute 实际写入产品', async () => {
    const before = await prisma.product.count();
    const res = await request(app.getHttpServer())
      .post('/api/products/import/execute')
      .set(authHeaders(helper.getToken()))
      .send({
        mappingConfig,
        rows,
        options: { createMissingBrand: true, createMissingCategory: true },
      })
      .expect(201);
    expect(res.body.successRows).toBeGreaterThanOrEqual(1);
    const after = await prisma.product.count();
    expect(after).toBeGreaterThan(before);
    expect(
      await prisma.product.findFirst({ where: { name: rows[0].品牌型号 } }),
    ).not.toBeNull();
  });

  it('导入模板 CRUD', async () => {
    const create = await request(app.getHttpServer())
      .post('/api/products/import/templates')
      .set(authHeaders(helper.getToken()))
      .send({ name: `导入模板_${Date.now()}`, mappingConfig, isGlobal: false })
      .expect(201);
    templateId = create.body.id;

    await request(app.getHttpServer())
      .get('/api/products/import/templates')
      .set(authHeaders(helper.getToken(), false))
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/api/products/import/templates/${templateId}`)
      .set(authHeaders(helper.getToken()))
      .send({ name: '导入模板改名' })
      .expect(200);
    await request(app.getHttpServer())
      .delete(`/api/products/import/templates/${templateId}`)
      .set(authHeaders(helper.getToken()))
      .expect(200);
  });

  it('导入日志列表', async () => {
    await request(app.getHttpServer())
      .get('/api/products/import/logs')
      .set(authHeaders(helper.getToken(), false))
      .expect(200);
  });

  it('商务用户无 product:import 权限 -> 403', async () => {
    await request(app.getHttpServer())
      .post('/api/products/import/preview')
      .set(authHeaders(helper.getToken('e2e_business')))
      .send({ mappingConfig, rows })
      .expect(403);
  });
});
