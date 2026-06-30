import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'node:http';
import { AppModule } from '../src/app.module';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    name: string;
    role: {
      code: string;
    };
  };
}

interface RoleResponse {
  id: string;
  code: string;
  name: string;
}

interface UserResponse {
  id: string;
  username: string;
  name: string;
}

interface CustomerResponse {
  id: string;
  name: string;
  namePinyin: string;
  nameInitials: string;
  contact: string;
}

interface WorkOrderResponse {
  id: string;
  detail: string;
  status: string;
  createdAt: string;
  completedAt?: string;
}

interface WikiArticleResponse {
  id: string;
  title: string;
  content: string;
  titlePinyin: string;
  titleInitials: string;
  isLiked?: boolean;
}

interface FeeResponse {
  subtotal: number;
}

interface IdResponse {
  id: string;
}

interface UnreadCountResponse {
  count: number;
}

interface CsrfTokenResponse {
  csrfToken: string;
}

describe('API End-to-End Tests', () => {
  let app: INestApplication;
  let httpServer: Server;
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
    httpServer = app.getHttpServer() as Server;
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
      const response = await request(httpServer)
        .post('/api/auth/login')
        .send(adminCredentials)
        .expect(201);

      const loginResponse = response.body as LoginResponse;
      expect(loginResponse).toHaveProperty('accessToken');
      expect(loginResponse).toHaveProperty('refreshToken');
      expect(loginResponse.user).toHaveProperty('username', 'admin');
      adminToken = loginResponse.accessToken;
      refreshToken = loginResponse.refreshToken;
    });

    it('should reject invalid credentials', async () => {
      const response = await request(httpServer)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrongpassword' })
        .expect(401);

      const errorResponse = response.body as { message: string | string[] };
      const message = Array.isArray(errorResponse.message)
        ? errorResponse.message.join(', ')
        : errorResponse.message;
      expect(message).toContain('密码错误');
    });

    it('should refresh tokens', async () => {
      const response = await request(httpServer)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(201);

      const loginResponse = response.body as LoginResponse;
      expect(loginResponse).toHaveProperty('accessToken');
      expect(loginResponse).toHaveProperty('refreshToken');
      adminToken = loginResponse.accessToken;
      refreshToken = loginResponse.refreshToken;
    });

    it('should reject invalid refresh token', async () => {
      await request(httpServer)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });

    it('should login as engineer', async () => {
      const response = await request(httpServer)
        .post('/api/auth/login')
        .send(engineerCredentials)
        .expect(201);

      const loginResponse = response.body as LoginResponse;
      engineerToken = loginResponse.accessToken;
      expect(loginResponse.user.role.code).toBe('engineer');
    });

    it('should get current user profile', async () => {
      const response = await request(httpServer)
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

      const rolesResponse = await request(httpServer)
        .get('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const roles = rolesResponse.body as RoleResponse[];
      const engineerRole = roles.find((r) => r.code === 'engineer');
      newUser.roleId = engineerRole?.id ?? '';

      const response = await request(httpServer)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser)
        .expect(201);

      const userResponse = response.body as UserResponse;
      expect(userResponse).toHaveProperty('id');
      expect(userResponse.username).toBe(newUser.username);
      testUserId = userResponse.id;
    });

    it('should reject duplicate username', async () => {
      await request(httpServer)
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
      const response = await request(httpServer)
        .get('/api/users?page=1&pageSize=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page', 1);
    });

    it('should get user by id', async () => {
      const response = await request(httpServer)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const userResponse = response.body as UserResponse;
      expect(userResponse.id).toBe(testUserId);
    });

    it('should update user', async () => {
      const response = await request(httpServer)
        .patch(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      const userResponse = response.body as UserResponse;
      expect(userResponse.name).toBe('Updated Name');
    });

    it('should change password', async () => {
      await request(httpServer)
        .post(`/api/users/${testUserId}/change-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          oldPassword: 'TestUser123!',
          newPassword: 'NewPass123!',
        })
        .expect(201);
    });

    it('should delete user', async () => {
      await request(httpServer)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should not allow engineer to access user management', async () => {
      await request(httpServer)
        .get('/api/users')
        .set('Authorization', `Bearer ${engineerToken}`)
        .expect(403);
    });
  });

  describe('Customers Management', () => {
    it('should create a new customer', async () => {
      const response = await request(httpServer)
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Test Customer ${Date.now()}`,
          shortName: 'TC',
          contact: 'John Doe',
          phone: '1234567890',
        })
        .expect(201);

      const customerResponse = response.body as CustomerResponse;
      expect(customerResponse).toHaveProperty('id');
      expect(customerResponse).toHaveProperty('namePinyin');
      expect(customerResponse).toHaveProperty('nameInitials');
      testCustomerId = customerResponse.id;
    });

    it('should list customers with keyword search', async () => {
      const response = await request(httpServer)
        .get('/api/customers?keyword=Test')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
    });

    it('should get customer by id', async () => {
      const response = await request(httpServer)
        .get(`/api/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const customerResponse = response.body as CustomerResponse;
      expect(customerResponse.id).toBe(testCustomerId);
    });

    it('should update customer', async () => {
      const response = await request(httpServer)
        .patch(`/api/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ contact: 'Jane Doe' })
        .expect(200);

      const customerResponse = response.body as CustomerResponse;
      expect(customerResponse.contact).toBe('Jane Doe');
    });

    it('should reject deleting customer with work orders', async () => {
      await request(httpServer)
        .delete(`/api/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(409);
    });
  });

  describe('Regions & Service Types', () => {
    it('should list regions', async () => {
      const response = await request(httpServer)
        .get('/api/regions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should list service types', async () => {
      const response = await request(httpServer)
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
      const regionsResponse = await request(httpServer)
        .get('/api/regions')
        .set('Authorization', `Bearer ${adminToken}`);
      const regions = regionsResponse.body as IdResponse[];
      regionId = regions[0]?.id;

      const serviceTypesResponse = await request(httpServer)
        .get('/api/service-types')
        .set('Authorization', `Bearer ${adminToken}`);
      const serviceTypes = serviceTypesResponse.body as IdResponse[];
      serviceTypeId = serviceTypes[0]?.id;
    });

    it('should create a new work order', async () => {
      const response = await request(httpServer)
        .post('/api/work-orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          detail: 'Test work order detail',
          customerId: testCustomerId,
          regionId,
          serviceTypeId,
        })
        .expect(201);

      const workOrderResponse = response.body as WorkOrderResponse;
      expect(workOrderResponse).toHaveProperty('id');
      expect(workOrderResponse.status).toBe('PENDING');
      testWorkOrderId = workOrderResponse.id;
    });

    it('should list work orders with filters', async () => {
      const response = await request(httpServer)
        .get('/api/work-orders?page=1&pageSize=20')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
    });

    it('should get work order by id', async () => {
      const response = await request(httpServer)
        .get(`/api/work-orders/${testWorkOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const workOrderResponse = response.body as WorkOrderResponse;
      expect(workOrderResponse.id).toBe(testWorkOrderId);
    });

    it('should update work order', async () => {
      const response = await request(httpServer)
        .patch(`/api/work-orders/${testWorkOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ detail: 'Updated detail' })
        .expect(200);

      const workOrderResponse = response.body as WorkOrderResponse;
      expect(workOrderResponse.detail).toBe('Updated detail');
    });

    it('should receive a work order', async () => {
      const response = await request(httpServer)
        .post(`/api/work-orders/${testWorkOrderId}/receive`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .expect(201);

      const workOrderResponse = response.body as WorkOrderResponse;
      expect(workOrderResponse.status).toBe('RECEIVED');
    });

    it('should complete a work order', async () => {
      const response = await request(httpServer)
        .post(`/api/work-orders/${testWorkOrderId}/complete`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .send({})
        .expect(201);

      const workOrderResponse = response.body as WorkOrderResponse;
      expect(workOrderResponse.status).toBe('COMPLETED');
      expect(workOrderResponse).toHaveProperty('completedAt');
    });

    it('should get pending work orders', async () => {
      const response = await request(httpServer)
        .get('/api/work-orders/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get work order stats', async () => {
      const response = await request(httpServer)
        .get('/api/work-orders/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('pending');
      expect(response.body).toHaveProperty('received');
      expect(response.body).toHaveProperty('total');
    });

    it('should delete work order', async () => {
      await request(httpServer)
        .delete(`/api/work-orders/${testWorkOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Wiki', () => {
    let categoryId: string;

    it('should list wiki categories', async () => {
      const response = await request(httpServer)
        .get('/api/wiki/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const categories = response.body as IdResponse[];
      categoryId = categories[0]?.id;
    });

    it('should create a wiki article', async () => {
      const response = await request(httpServer)
        .post('/api/wiki/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: `Test Article ${Date.now()}`,
          content: 'This is a test article content.',
          categoryId,
          isPublic: true,
        })
        .expect(201);

      const articleResponse = response.body as WikiArticleResponse;
      expect(articleResponse).toHaveProperty('id');
      expect(articleResponse).toHaveProperty('titlePinyin');
      expect(articleResponse).toHaveProperty('titleInitials');
      testWikiArticleId = articleResponse.id;
    });

    it('should list wiki articles', async () => {
      const response = await request(httpServer)
        .get('/api/wiki/articles?page=1&pageSize=20')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
    });

    it('should get wiki article by id', async () => {
      const response = await request(httpServer)
        .get(`/api/wiki/articles/${testWikiArticleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const articleResponse = response.body as WikiArticleResponse;
      expect(articleResponse.id).toBe(testWikiArticleId);
    });

    it('should update wiki article', async () => {
      const response = await request(httpServer)
        .patch(`/api/wiki/articles/${testWikiArticleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ content: 'Updated content' })
        .expect(200);

      const articleResponse = response.body as WikiArticleResponse;
      expect(articleResponse.content).toBe('Updated content');
    });

    it('should toggle like on article', async () => {
      const response = await request(httpServer)
        .post(`/api/wiki/articles/${testWikiArticleId}/like`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      const articleResponse = response.body as WikiArticleResponse;
      expect(articleResponse).toHaveProperty('isLiked');
    });

    it('should delete wiki article', async () => {
      await request(httpServer)
        .delete(`/api/wiki/articles/${testWikiArticleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Notifications', () => {
    it('should get user notifications', async () => {
      const response = await request(httpServer)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get unread notification count', async () => {
      const response = await request(httpServer)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const unreadResponse = response.body as UnreadCountResponse;
      expect(typeof unreadResponse.count).toBe('number');
    });
  });

  describe('Fee Calculator', () => {
    it('should get fee settings', async () => {
      const response = await request(httpServer)
        .get('/api/fee/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should calculate fee', async () => {
      const response = await request(httpServer)
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

      const feeResponse = response.body as FeeResponse;
      expect(feeResponse).toHaveProperty('subtotal');
      expect(feeResponse.subtotal).toBe(100);
    });
  });

  describe('Security', () => {
    it('should reject unauthenticated requests', async () => {
      await request(httpServer).get('/api/users').expect(401);
    });

    it('should validate CSRF token', async () => {
      const csrfResponse = await request(httpServer)
        .get('/api/security/csrf-token')
        .expect(200);

      const csrfBody = csrfResponse.body as CsrfTokenResponse;
      const csrfToken = csrfBody.csrfToken;

      await request(httpServer)
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
        await request(httpServer)
          .post('/api/auth/login')
          .send({ username: 'admin', password: 'wrong' });
      }

      await request(httpServer)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrong' })
        .expect(400);
    });
  });
});
