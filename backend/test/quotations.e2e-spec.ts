import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { E2eHelper, authHeaders } from './helpers/e2e-auth.helper';

describe('Quotations & Templates (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let helper: E2eHelper;
  let quotationId: string;
  let quoteTemplateId: string;

  const exportColumns = [
    {
      key: 'index',
      label: '序号',
      type: 'field',
      field: 'index',
      visible: true,
    },
    {
      key: 'name',
      label: '产品名称',
      type: 'field',
      field: 'name',
      visible: true,
    },
    {
      key: 'brand',
      label: '品牌',
      type: 'field',
      field: 'brand',
      visible: true,
    },
    {
      key: 'model',
      label: '型号',
      type: 'field',
      field: 'model',
      visible: true,
    },
    { key: 'unit', label: '单位', type: 'field', field: 'unit', visible: true },
    {
      key: 'quantity',
      label: '数量',
      type: 'field',
      field: 'quantity',
      visible: true,
    },
    {
      key: 'unitPrice',
      label: '单价',
      type: 'field',
      field: 'unitPrice',
      visible: true,
    },
    {
      key: 'subtotal',
      label: '小计',
      type: 'field',
      field: 'subtotal',
      visible: true,
    },
  ];

  const item = {
    productSnapshot: {
      name: '联想 ThinkStation P620',
      model: 'P620',
      brandName: '联想',
    },
    quantity: 2,
    unitPrice: 25000,
    discount: 95,
    selectedImages: ['https://example.com/a.png'],
    selectedCerts: [],
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
    await helper.cleanup();
    if (quotationId)
      await prisma.quotation
        .delete({ where: { id: quotationId } })
        .catch(() => undefined);
    if (quoteTemplateId)
      await prisma.quotationTemplate
        .delete({ where: { id: quoteTemplateId } })
        .catch(() => undefined);
    await app.close();
  });

  describe('Quotation Templates', () => {
    const columns = [
      {
        key: 'name',
        label: '产品名称',
        type: 'field',
        field: 'name',
        visible: true,
      },
      {
        key: 'model',
        label: '型号',
        type: 'field',
        field: 'model',
        visible: true,
      },
      {
        key: 'salePrice',
        label: '单价',
        type: 'field',
        field: 'salePrice',
        visible: true,
      },
    ];

    it('创建模板', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/quotation-templates')
        .set(authHeaders(helper.getToken()))
        .send({
          name: `模板_${Date.now()}`,
          description: '标准报价模板',
          config: { columns, title: '报价单' },
          isDefault: false,
        })
        .expect(201);
      expect(res.body.config.columns).toHaveLength(3);
      quoteTemplateId = res.body.id;
    });

    it('列表 / 详情 / 更新 / 删除', async () => {
      await request(app.getHttpServer())
        .get('/api/quotation-templates')
        .set(authHeaders(helper.getToken(), false))
        .expect(200);
      await request(app.getHttpServer())
        .get(`/api/quotation-templates/${quoteTemplateId}`)
        .set(authHeaders(helper.getToken(), false))
        .expect(200);
      await request(app.getHttpServer())
        .patch(`/api/quotation-templates/${quoteTemplateId}`)
        .set(authHeaders(helper.getToken()))
        .send({ name: '模板改名' })
        .expect(200);
      await request(app.getHttpServer())
        .delete(`/api/quotation-templates/${quoteTemplateId}`)
        .set(authHeaders(helper.getToken()))
        .expect(200);
    });
  });

  describe('Quotations CRUD', () => {
    it('创建报价单', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/quotations')
        .set(authHeaders(helper.getToken()))
        .send({
          customerName: '测试客户有限公司',
          customerContact: '王经理',
          customerAddress: '北京市海淀区',
          remark: 'E2E 测试报价',
          taxRate: 13,
          items: [item],
        })
        .expect(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.code).toMatch(/^BJ/);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.totalAmount).toBeGreaterThan(0);
      quotationId = res.body.id;
    });

    it('创建报价单：明细为空数组仍被接受（201）', async () => {
      await request(app.getHttpServer())
        .post('/api/quotations')
        .set(authHeaders(helper.getToken()))
        .send({ customerName: '无明细客户', items: [] })
        .expect(201);
    });

    it('列表 / 筛选 / 详情', async () => {
      const list = await request(app.getHttpServer())
        .get('/api/quotations')
        .set(authHeaders(helper.getToken(), false))
        .expect(200);
      expect(Array.isArray(list.body.data ?? list.body)).toBe(true);

      const filtered = await request(app.getHttpServer())
        .get('/api/quotations?customerName=测试客户')
        .set(authHeaders(helper.getToken(), false))
        .expect(200);
      const arr = filtered.body.data ?? filtered.body;
      expect(arr.some((q: any) => q.id === quotationId)).toBe(true);

      await request(app.getHttpServer())
        .get(`/api/quotations/${quotationId}`)
        .set(authHeaders(helper.getToken(), false))
        .expect(200);
    });

    it('更新状态', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/quotations/${quotationId}/status`)
        .set(authHeaders(helper.getToken()))
        .send({ status: 'SENT' })
        .expect(200);
      expect(res.body.status).toBe('SENT');
    });

    it('导出 docx（需关联导出列模板）', async () => {
      const tpl = await request(app.getHttpServer())
        .post('/api/quotation-templates')
        .set(authHeaders(helper.getToken()))
        .send({
          name: `导出模板_${Date.now()}`,
          config: { columns: exportColumns, title: '报价单' },
          isDefault: false,
        })
        .expect(201);
      const tplId = tpl.body.id;

      const res = await request(app.getHttpServer())
        .post(`/api/quotations/${quotationId}/export-docx`)
        .set(authHeaders(helper.getToken()))
        .send({ templateId: tplId })
        .expect(201);
      expect(res.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );
      await prisma.quotationTemplate
        .delete({ where: { id: tplId } })
        .catch(() => undefined);
    });

    it('删除报价单', async () => {
      await request(app.getHttpServer())
        .delete(`/api/quotations/${quotationId}`)
        .set(authHeaders(helper.getToken()))
        .expect(200);
    });
  });

  describe('Permission', () => {
    it('商务用户可创建报价单', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/quotations')
        .set(authHeaders(helper.getToken('e2e_business')))
        .send({
          customerName: '商务客户',
          items: [
            {
              productSnapshot: { name: '产品X', model: 'X1' },
              quantity: 1,
              unitPrice: 100,
            },
          ],
        })
        .expect(201);
      expect(res.body.id).toBeDefined();
    });
  });
});
