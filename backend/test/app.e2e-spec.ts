import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('API End-to-End Tests', () => {
  let app: INestApplication;
  let adminToken: string;
  let refreshToken: string;
  let engineerToken: string;
  let testUserId: string;
  let testCustomerId: string;
  let testWorkOrderId: string;
  let testWikiArticleId: string;

  const adminCredentials = {
    username: 'admin',
    password: 'Admin123!',
  };

  const engineerCredentials = {
    username: 'engineer1',
    password: 'Engineer123!',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('should login with admin credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(adminCredentials)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toHaveProperty('username', 'admin');
      adminToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrongpassword' })
        .expect(401);

      expect(response.body.message).toContain('密码错误');
    });

    it('should refresh tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      adminToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should reject invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });

    it('should login as engineer', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(engineerCredentials)
        .expect(201);

      engineerToken = response.body.accessToken;
      expect(response.body.user.role.code).toBe('engineer');
    });

    it('should get current user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('username');
    });
  });

  describe('Users Management', () => {
    it('should create a new user (admin only)', async () => {
      const newUser = {
        username: `testuser_${Date.now()}`,
        password: 'TestUser123!',
        name: 'Test User',
        roleId: '', // Will be filled after getting roles
      };

      const rolesResponse = await request(app.getHttpServer())
        .get('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const engineerRole = rolesResponse.body.find(
        (r: any) => r.code === 'engineer',
      );
      newUser.roleId = engineerRole.id;

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(newUser.username);
      testUserId = response.body.id;
    });

    it('should reject duplicate username', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'admin',
          password: 'TestUser123!',
          name: 'Duplicate',
          roleId: 'some-role-id',
        })
        .expect(409);
    });

    it('should list users with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users?page=1&pageSize=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page', 1);
    });

    it('should get user by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(testUserId);
    });

    it('should update user', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
    });

    it('should change password', async () => {
      await request(app.getHttpServer())
        .post(`/api/users/${testUserId}/change-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          oldPassword: 'TestUser123!',
          newPassword: 'NewPass123!',
        })
        .expect(201);
    });

    it('should delete user', async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should not allow engineer to access user management', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${engineerToken}`)
        .expect(403);
    });
  });

  describe('Customers Management', () => {
    it('should create a new customer', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Test Customer ${Date.now()}`,
          shortName: 'TC',
          contact: 'John Doe',
          phone: '1234567890',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('namePinyin');
      expect(response.body).toHaveProperty('nameInitials');
      testCustomerId = response.body.id;
    });

    it('should list customers with keyword search', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/customers?keyword=Test')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
    });

    it('should get customer by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(testCustomerId);
    });

    it('should update customer', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ contact: 'Jane Doe' })
        .expect(200);

      expect(response.body.contact).toBe('Jane Doe');
    });

    it('should reject deleting customer with work orders', async () => {
      await request(app.getHttpServer())
        .delete(`/api/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(409);
    });
  });

  describe('Regions & Service Types', () => {
    it('should list regions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/regions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should list service types', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/service-types')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Work Orders', () => {
    let regionId: string;
    let serviceTypeId: string;

    beforeAll(async () => {
      const regionsResponse = await request(app.getHttpServer())
        .get('/api/regions')
        .set('Authorization', `Bearer ${adminToken}`);
      regionId = regionsResponse.body[0]?.id;

      const serviceTypesResponse = await request(app.getHttpServer())
        .get('/api/service-types')
        .set('Authorization', `Bearer ${adminToken}`);
      serviceTypeId = serviceTypesResponse.body[0]?.id;
    });

    it('should create a new work order', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          detail: 'Test work order detail',
          customerId: testCustomerId,
          regionId,
          serviceTypeId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('PENDING');
      testWorkOrderId = response.body.id;
    });

    it('should list work orders with filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/work-orders?page=1&pageSize=20')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
    });

    it('should get work order by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/work-orders/${testWorkOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(testWorkOrderId);
    });

    it('should update work order', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/work-orders/${testWorkOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ detail: 'Updated detail' })
        .expect(200);

      expect(response.body.detail).toBe('Updated detail');
    });

    it('should receive a work order', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/work-orders/${testWorkOrderId}/receive`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .expect(201);

      expect(response.body.status).toBe('RECEIVED');
    });

    it('should complete a work order', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/work-orders/${testWorkOrderId}/complete`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .send({})
        .expect(201);

      expect(response.body.status).toBe('COMPLETED');
      expect(response.body).toHaveProperty('completedAt');
    });

    it('should get pending work orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/work-orders/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get work order stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/work-orders/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('pending');
      expect(response.body).toHaveProperty('received');
      expect(response.body).toHaveProperty('total');
    });

    it('should delete work order', async () => {
      await request(app.getHttpServer())
        .delete(`/api/work-orders/${testWorkOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Wiki', () => {
    let categoryId: string;

    it('should list wiki categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/wiki/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      categoryId = response.body[0]?.id;
    });

    it('should create a wiki article', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/wiki/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: `Test Article ${Date.now()}`,
          content: 'This is a test article content.',
          categoryId,
          isPublic: true,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('titlePinyin');
      expect(response.body).toHaveProperty('titleInitials');
      testWikiArticleId = response.body.id;
    });

    it('should list wiki articles', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/wiki/articles?page=1&pageSize=20')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
    });

    it('should get wiki article by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/wiki/articles/${testWikiArticleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(testWikiArticleId);
    });

    it('should update wiki article', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/wiki/articles/${testWikiArticleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ content: 'Updated content' })
        .expect(200);

      expect(response.body.content).toBe('Updated content');
    });

    it('should toggle like on article', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/wiki/articles/${testWikiArticleId}/like`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('isLiked');
    });

    it('should delete wiki article', async () => {
      await request(app.getHttpServer())
        .delete(`/api/wiki/articles/${testWikiArticleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Notifications', () => {
    it('should get user notifications', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get unread notification count', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(typeof response.body.count).toBe('number');
    });
  });

  describe('Fee Calculator', () => {
    it('should get fee settings', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/fee/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should calculate fee', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/fee/calculate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          items: [
            {
              category: '计算机安装',
              item: '安装就位',
              quantity: 5,
              unitPrice: 20,
            },
          ],
        })
        .expect(201);

      expect(response.body).toHaveProperty('subtotal');
      expect(response.body.subtotal).toBe(100);
    });
  });

  describe('Security', () => {
    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer()).get('/api/users').expect(401);
    });

    it('should validate CSRF token', async () => {
      const csrfResponse = await request(app.getHttpServer())
        .get('/api/security/csrf-token')
        .expect(200);

      const csrfToken = csrfResponse.body.csrfToken;

      await request(app.getHttpServer())
        .post('/api/users')
        .set('X-CSRF-Token', csrfToken)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'csrf-test',
          password: 'CsrfTest123!',
          name: 'CSRF Test',
          roleId: 'some-role-id',
        })
        .expect(400);
    });

    it('should enforce rate limiting on login', async () => {
      for (let i = 0; i < 6; i++) {
        await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ username: 'admin', password: 'wrong' });
      }

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrong' })
        .expect(400);
    });
  });
});
