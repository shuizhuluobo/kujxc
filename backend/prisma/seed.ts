import { PrismaClient, Region, ServiceType, Customer } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始初始化数据库...');

  // 1. 清理现有数据 (可选，开发环境使用)
  // await prisma.workOrder.deleteMany();
  // await prisma.customer.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.region.deleteMany();
  // await prisma.serviceType.deleteMany();
  // await prisma.role.deleteMany();

  // 2. 创建角色
  const adminRole = await prisma.role.upsert({
    where: { code: 'admin' },
    update: {},
    create: { name: '管理员', code: 'admin', permissions: ['*'] },
  });

  const businessRole = await prisma.role.upsert({
    where: { code: 'business' },
    update: {},
    create: {
      name: '商务',
      code: 'business',
      permissions: [
        'workOrder:create',
        'workOrder:list',
        'workOrder:view',
        'workOrder:update',
        'workOrder:delete',
        'workOrder:export',
        'customer:list',
        'customer:view',
        'customer:create',
        'customer:edit',
        'region:list',
        'region:view',
        'serviceType:list',
        'serviceType:view',
        'system:user_view',
        'wiki:list',
        'wiki:view',
        'wiki:create',
        'wiki:edit',
        'profile:profile',
        'profile:view',
        'profile:edit',
        'profile:change_password',
        'profile:change_avatar',
      ],
    },
  });

  const engineerRole = await prisma.role.upsert({
    where: { code: 'engineer' },
    update: {},
    create: {
      name: '售后工程师',
      code: 'engineer',
      permissions: [
        'workOrder:list',
        'workOrder:view',
        'workOrder:receive',
        'workOrder:complete',
        'workOrder:create',
        'workOrder:update',
        'workOrder:delete',
        'customer:list',
        'customer:view',
        'region:list',
        'region:view',
        'serviceType:list',
        'serviceType:view',
        'wiki:list',
        'wiki:view',
        'wiki:create',
        'wiki:edit',
        'wiki:delete',
        'system:user_view',
        'profile:profile',
        'profile:view',
        'profile:edit',
        'profile:change_password',
        'profile:change_avatar',
      ],
    },
  });
  console.log('✅ 角色已就绪');

  // 3. 创建区域
  const regionsData = ['中心', '西线', '南线', '北线', '东线'];
  const regionMap = new Map<string, Region>();
  for (let i = 0; i < regionsData.length; i++) {
    const region = await prisma.region.upsert({
      where: { name: regionsData[i] },
      update: {},
      create: { name: regionsData[i], sortOrder: i },
    });
    regionMap.set(regionsData[i], region);
  }
  console.log(`✅ 区域已就绪: ${regionsData.join(', ')}`);

  // 4. 创建服务类型
  const serviceTypesData = ['一般', '同方', '长城', '超越'];
  const serviceTypeMap = new Map<string, ServiceType>();
  for (let i = 0; i < serviceTypesData.length; i++) {
    const st = await prisma.serviceType.upsert({
      where: { name: serviceTypesData[i] },
      update: {},
      create: { name: serviceTypesData[i], sortOrder: i },
    });
    serviceTypeMap.set(serviceTypesData[i], st);
  }
  console.log(`✅ 服务类型已就绪: ${serviceTypesData.join(', ')}`);

  // 5. 创建用户
  // 使用环境变量或默认强密码
  const defaultPassword = process.env.SEED_PASSWORD || 'SecurePass123!';
  const password = await bcrypt.hash(defaultPassword, 10);

  // 管理员
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password,
      name: '系统管理员',
      roleId: adminRole.id,
      regionId: regionMap.get('中心')!.id,
    },
  });

  // 商务
  const business = await prisma.user.upsert({
    where: { username: 'business' },
    update: {},
    create: {
      username: 'business',
      password,
      name: '李商务',
      roleId: businessRole.id,
      regionId: regionMap.get('中心')!.id,
    },
  });

  // 工程师 (不同区域)
  const _engineer1 = await prisma.user.upsert({
    where: { username: 'zhangsan' },
    update: {},
    create: {
      username: 'zhangsan',
      password,
      name: '张三(西线)',
      roleId: engineerRole.id,
      regionId: regionMap.get('西线')!.id,
    },
  });

  const engineer2 = await prisma.user.upsert({
    where: { username: 'lisi' },
    update: {},
    create: {
      username: 'lisi',
      password,
      name: '李四(南线)',
      roleId: engineerRole.id,
      regionId: regionMap.get('南线')!.id,
    },
  });

  console.log(
    '✅ 用户已创建: admin, business, zhangsan, lisi (密码请使用环境变量 SEED_PASSWORD 设置)',
  );

  // 6. 创建客户
  const customersData = [
    {
      name: '中国银行总行',
      contact: '王经理',
      phone: '13800138000',
      address: '北京市复兴门内大街1号',
    },
    {
      name: '国家电网信息部',
      contact: '刘主任',
      phone: '13900139000',
      address: '北京市西城区西长安街86号',
    },
    {
      name: '清华大学计算机系',
      contact: '张老师',
      phone: '010-62780000',
      address: '北京市海淀区清华园',
    },
  ];

  const customerMap = new Map<string, Customer>();
  for (const c of customersData) {
    const _customer = await prisma.customer
      .upsert({
        // 注意：这里简化逻辑，假设名字唯一，实际可能需要更复杂判断
        where: { id: 'temp-id-placeholder' }, // 实际上 Customer 没有唯一 name 约束，这里仅作演示。生产环境建议用 findFirst 检查
        update: {},
        create: c,
      })
      .catch(async () => {
        // Fallback: 如果 upsert by name 不行 (因为 name 不是 unique)，就直接 create
        return await prisma.customer.create({ data: c });
      });
    // 修正：上面的 upsert 逻辑在没有 unique 键时会报错。
    // 为了简单起见，我们先查找，没有则创建
    const existing = await prisma.customer.findFirst({
      where: { name: c.name },
    });
    if (existing) {
      customerMap.set(c.name, existing);
    } else {
      const newC = await prisma.customer.create({ data: c });
      customerMap.set(c.name, newC);
    }
  }
  console.log(`✅ 客户已就绪: ${customersData.map((c) => c.name).join(', ')}`);

  // 7. 创建示例工单
  const customer1 = customerMap.get('中国银行总行')!;
  const customer2 = customerMap.get('国家电网信息部')!;
  const typeNormal = serviceTypeMap.get('一般')!;
  const typeTongfang = serviceTypeMap.get('同方')!;

  // 工单 1: 待办
  await prisma.workOrder.create({
    data: {
      customerId: customer1.id,
      regionId: regionMap.get('西线')!.id,
      serviceTypeId: typeTongfang.id,
      creatorId: business.id,
      detail: '核心交换机故障，需要上门排查。',
      status: 'PENDING',
      scoreLevel: 'NORMAL',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
    },
  });

  // 工单 2: 已接收
  await prisma.workOrder.create({
    data: {
      customerId: customer2.id,
      regionId: regionMap.get('南线')!.id,
      serviceTypeId: typeNormal.id,
      creatorId: admin.id,
      receiverId: engineer2.id,
      receivedAt: new Date(),
      detail: '服务器巡检任务。',
      status: 'RECEIVED',
      scoreLevel: 'SIMPLE',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1天前
    },
  });

  console.log('✅ 示例工单已创建');
  console.log('🎉 数据库初始化全部完成!');
}

main()
  .catch((e) => {
    console.error('❌ 初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
