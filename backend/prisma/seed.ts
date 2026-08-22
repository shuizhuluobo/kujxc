import {
  PrismaClient,
  Prisma,
  Region,
  ServiceType,
  Customer,
} from '@prisma/client';
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
        'product:list',
        'product:view',
        'product:create',
        'product:edit',
        'product:delete',
        'product:import',
        'brand:manage',
        'category:manage',
        'tag:manage',
        'quotation:list',
        'quotation:view',
        'quotation:create',
        'quotation:update',
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
        'product:list',
        'product:view',
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

  // 2.1 编号前缀配置
  const defaultPrefixes = [
    { entityType: 'product', prefix: 'LX', name: '产品' },
    { entityType: 'quotation', prefix: 'BJ', name: '报价' },
    { entityType: 'project', prefix: 'XM', name: '项目' },
    { entityType: 'customer', prefix: 'KH', name: '客户' },
    { entityType: 'contract', prefix: 'HT', name: '合同' },
    { entityType: 'purchase', prefix: 'CG', name: '采购单' },
  ];
  for (const p of defaultPrefixes) {
    await prisma.codePrefixConfig.upsert({
      where: { entityType: p.entityType },
      update: {},
      create: p,
    });
  }
  console.log('✅ 编号前缀配置已就绪');

  // 2.2 系统设置（产品库相关默认值）
  const settings = [
    {
      key: 'staleThresholdDays',
      value: 90,
      description: '产品超期未更新提醒阈值（天）',
    },
    { key: 'defaultTaxRate', value: 13, description: '报价默认税率（%）' },
    { key: 'defaultUnit', value: '台', description: '产品默认计量单位' },
    { key: 'quotationPrefix', value: 'BJ', description: '报价编号前缀' },
    {
      key: 'companyInfo',
      value: { name: '公司名称', logo: '', phone: '', address: '', footer: '' },
      description: '公司信息（用于报价模板）',
    },
  ];
  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log('✅ 系统设置已就绪');

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

  // 6.5 产品库：品牌 / 分类 / 标签 / 示例产品
  await seedProductLibrary();
  console.log('✅ 产品库示例数据已就绪');

  // 6.6 示例报价单（含多种产品 / 同名设备合并 / 不同税率）
  await seedQuotations(customerMap, admin.id, business.id);
  console.log('✅ 示例报价单已就绪');

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

// ==================== 产品库种子数据 ====================
// 参考 temp/品牌，分类，标签.md 与 temp/tree.txt

const TAG_COLORS = [
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#9254DE',
  '#13C2C2',
  '#EB2F96',
  '#FA8C16',
];

interface CategoryNode {
  name: string;
  children?: CategoryNode[];
}

// 完整分类树（来自 temp/tree.txt）
const categoryTree: CategoryNode[] = [
  {
    name: '计算机设备',
    children: [
      {
        name: '笔记本电脑',
        children: [
          { name: '商用笔记本' },
          { name: '消费级笔记本' },
          { name: '移动工作站' },
          { name: '信创笔记本' },
        ],
      },
      {
        name: '台式电脑',
        children: [
          { name: '商用台式机' },
          { name: '家用台式机' },
          { name: '一体机' },
          { name: '信创台式主机' },
        ],
      },
      {
        name: '图形工作站',
        children: [{ name: '台式工作站' }, { name: '移动工作站' }],
      },
    ],
  },
  {
    name: '服务器设备',
    children: [
      {
        name: '机架式服务器',
        children: [
          { name: '1U机架服务器' },
          { name: '2U机架服务器' },
          { name: '4U机架服务器' },
        ],
      },
      { name: '塔式服务器' },
      { name: '刀片服务器' },
      { name: '高密度节点服务器' },
      { name: '存储服务器' },
      { name: '信创服务器' },
    ],
  },
  {
    name: '打印机/文印设备',
    children: [
      { name: '单功能打印机' },
      {
        name: '多功能一体机',
        children: [{ name: '三合一一体机' }, { name: '四合一一体机' }],
      },
      { name: '数码复合机' },
      {
        name: '票据打印机',
        children: [{ name: '针式票据打印机' }, { name: '热敏票据打印机' }],
      },
      { name: '大幅面绘图仪' },
      { name: '标签/条码打印机' },
    ],
  },
  {
    name: '投影机（投影仪）',
    children: [
      { name: '商务办公投影机' },
      { name: '教育教学投影机' },
      { name: '超短焦投影机' },
      { name: '激光工程投影机' },
      { name: '家用智能投影' },
      { name: '便携微型投影' },
    ],
  },
  {
    name: '扫描仪设备',
    children: [
      { name: '平板式扫描仪' },
      { name: '馈纸式高速扫描仪' },
      { name: '高速文档扫描仪' },
      { name: '高拍仪（视频展台）' },
      { name: '书刊/非拆卷扫描仪' },
      { name: '工业三维扫描仪' },
    ],
  },
];

// 品牌 + 分类路径 + 标签 + 完整产品属性（来自 temp/品牌，分类，标签.md）
interface SeedProduct {
  brand: string;
  categoryPath: string[];
  tags: string[];
  name?: string; // 产品名称（同名设备用于报价合并）
  model?: string; // 型号
  description?: string; // 一句话描述/卖点
  params?: Record<string, string>; // 关键参数（规格）
  warranty?: string; // 保修
  supplier?: string; // 供应商
  moq?: number; // 最小起订量
  link?: string; // 参考链接
  images?: string[]; // 产品图片
  certs?: string[]; // 认证
  remark?: string; // 备注
}

const seedProducts: SeedProduct[] = [
  {
    brand: '戴尔 (Dell)',
    categoryPath: ['计算机设备', '笔记本电脑', '商用笔记本'],
    tags: ['商用', '办公', 'Windows', '14 英寸', '15.6 英寸'],
    model: 'Latitude 5440',
    description: '14 英寸轻薄商务本，全接口设计，适合移动办公。',
    params: {
      处理器: 'Intel Core i5-1335U',
      内存: '16GB LPDDR5',
      硬盘: '512GB NVMe SSD',
      屏幕: '14" FHD 防眩光',
      重量: '1.39kg',
      电池: '54Wh 长续航',
    },
    warranty: '三年下一工作日上门',
    supplier: '戴尔（中国）有限公司',
    moq: 1,
    certs: ['CCC', '能源之星', 'EPEAT 金'],
    remark: '支持 vPro 远程管理',
  },
  {
    brand: '惠普 (HP)',
    categoryPath: ['计算机设备', '笔记本电脑', '商用笔记本'],
    tags: ['商用', '办公', 'Windows', '14 英寸', '15.6 英寸'],
    model: 'EliteBook 840 G10',
    description: '15.6 英寸高端商务本，军工级耐用机身。',
    params: {
      处理器: 'Intel Core i7-1355U',
      内存: '32GB DDR5',
      硬盘: '1TB NVMe SSD',
      屏幕: '15.6" FHD 低蓝光',
      重量: '1.53kg',
      接口: '2×Thunderbolt 4',
    },
    warranty: '三年上门',
    supplier: '惠普贸易（上海）有限公司',
    moq: 1,
    certs: ['CCC', '节能认证'],
    remark: '可选配 5G 模块',
  },
  {
    brand: '联想 (ThinkPad)',
    categoryPath: ['计算机设备', '笔记本电脑', '商用笔记本'],
    tags: ['商用', '办公', 'Windows', '14 英寸', '15.6 英寸', '小红帽'],
    model: 'ThinkPad X1 Carbon Gen11',
    description: '碳纤维机身旗舰商务本，经典小红帽指点杆。',
    params: {
      处理器: 'Intel Core i7-1355U',
      内存: '32GB LPDDR5x',
      硬盘: '1TB SSD',
      屏幕: '14" 2.2K 低蓝光',
      重量: '1.12kg',
      安全: '指纹 + 红外摄像头',
    },
    warranty: '三年上门',
    supplier: '联想（北京）信息技术有限公司',
    moq: 1,
    certs: ['CCC', '能源之星'],
    remark: 'MIL-STD-810H 军规测试',
  },
  {
    brand: '华硕 (ASUS)',
    categoryPath: ['计算机设备', '笔记本电脑', '消费级笔记本'],
    tags: ['家用', '消费', 'Windows', '15.6 英寸', '16 英寸'],
  },
  {
    brand: '宏碁 (Acer)',
    categoryPath: ['计算机设备', '笔记本电脑', '消费级笔记本'],
    tags: ['家用', '消费', 'Windows', '15.6 英寸', '16 英寸'],
  },
  {
    brand: '微星 (MSI)',
    categoryPath: ['计算机设备', '笔记本电脑', '消费级笔记本'],
    tags: ['家用', '游戏', 'Windows', '15.6 英寸', '17.3 英寸'],
    model: 'GP68 HX',
    description: '17.3 英寸游戏本，高刷新率电竞屏。',
    params: {
      处理器: 'Intel Core i9-13950HX',
      内存: '32GB DDR5',
      显卡: 'RTX 4070 8GB',
      屏幕: '17.3" QHD 240Hz',
      重量: '2.7kg',
    },
    warranty: '两年上门',
    supplier: '微星科技',
    moq: 1,
    certs: ['CCC'],
  },
  {
    brand: '戴尔 (Dell)',
    categoryPath: ['计算机设备', '笔记本电脑', '移动工作站'],
    tags: ['图形设计', '渲染', 'ISV 认证', '高性能', '独显'],
    model: 'Precision 7780',
    description: '17 英寸移动工作站，通过 ISV 认证。',
    params: {
      处理器: 'Intel Core i9-13950HX',
      内存: '64GB DDR5 ECC',
      显卡: 'RTX A3000 12GB',
      屏幕: '17" UHD 专业色域',
      认证: 'AutoCAD/SolidWorks',
    },
    warranty: '三年上门',
    supplier: '戴尔（中国）有限公司',
    moq: 1,
    certs: ['CCC', 'ISV'],
  },
  {
    brand: '惠普 (HP)',
    categoryPath: ['计算机设备', '笔记本电脑', '移动工作站'],
    tags: ['图形设计', '渲染', 'ISV 认证', '高性能', '独显'],
  },
  {
    brand: '联想 (ThinkPad)',
    categoryPath: ['计算机设备', '笔记本电脑', '移动工作站'],
    tags: ['图形设计', '渲染', 'ISV 认证', '高性能', '独显'],
  },
  {
    brand: '华为擎云',
    categoryPath: ['计算机设备', '笔记本电脑', '信创笔记本'],
    tags: ['国产化', '信创', '银河麒麟', '统信 UOS', '商用'],
  },
  {
    brand: '浪潮',
    categoryPath: ['计算机设备', '笔记本电脑', '信创笔记本'],
    tags: ['国产化', '信创', '银河麒麟', '统信 UOS', '商用'],
  },
  {
    brand: '开天 (联想)',
    categoryPath: ['计算机设备', '笔记本电脑', '信创笔记本'],
    tags: ['国产化', '信创', '银河麒麟', '统信 UOS', '商用'],
  },
  {
    brand: '中科可控',
    categoryPath: ['计算机设备', '笔记本电脑', '信创笔记本'],
    tags: ['国产化', '信创', '银河麒麟', '统信 UOS', '商用'],
  },
  {
    brand: '同方',
    categoryPath: ['计算机设备', '笔记本电脑', '信创笔记本'],
    tags: ['国产化', '信创', '银河麒麟', '统信 UOS', '商用'],
  },
  {
    brand: '戴尔 (Dell)',
    categoryPath: ['计算机设备', '台式电脑', '商用台式机'],
    tags: ['商用', '办公', 'Windows', '7×24 小时稳定运行'],
    model: 'OptiPlex 7010',
    description: '小型机箱商用台式机，稳定耐用。',
    params: {
      处理器: 'Intel Core i5-13500',
      内存: '16GB DDR5',
      硬盘: '512GB SSD + 1TB HDD',
      显卡: '集成 UHD 770',
      机箱: '小机箱',
    },
    warranty: '三年上门',
    supplier: '戴尔（中国）有限公司',
    moq: 1,
    certs: ['CCC', '节能认证'],
  },
  {
    brand: '惠普 (HP)',
    categoryPath: ['计算机设备', '台式电脑', '商用台式机'],
    tags: ['商用', '办公', 'Windows', '7×24 小时稳定运行'],
  },
  {
    brand: '联想',
    categoryPath: ['计算机设备', '台式电脑', '商用台式机'],
    tags: ['商用', '办公', 'Windows', '7×24 小时稳定运行'],
  },
  {
    brand: '华硕 (ASUS)',
    categoryPath: ['计算机设备', '台式电脑', '家用台式机'],
    tags: ['家用', '办公', 'Windows', 'DIY', '组装'],
  },
  {
    brand: '宏碁 (Acer)',
    categoryPath: ['计算机设备', '台式电脑', '家用台式机'],
    tags: ['家用', '办公', 'Windows', '一体机'],
  },
  {
    brand: '联想',
    categoryPath: ['计算机设备', '台式电脑', '一体机'],
    tags: ['家用', '办公', '一体机', '21.5 英寸', '27 英寸'],
    model: 'ThinkCentre M90a',
    description: '23.8 英寸一体机，简洁省空间。',
    params: {
      处理器: 'Intel Core i5-13400',
      内存: '16GB',
      硬盘: '512GB SSD',
      屏幕: '23.8" FHD 触控可选',
    },
    warranty: '三年上门',
    supplier: '联想（北京）信息技术有限公司',
    moq: 1,
    certs: ['CCC'],
  },

  // 服务器设备
  {
    brand: '戴尔 (Dell)',
    categoryPath: ['服务器设备', '机架式服务器', '2U机架服务器'],
    tags: ['数据中心', '虚拟化', '高性能'],
    model: 'PowerEdge R750',
    description: '2U 双路机架服务器，适合虚拟化与数据库。',
    params: {
      CPU: '2 × Intel Xeon Silver 4310 (12C)',
      内存: '128GB DDR4 ECC',
      硬盘: '2×480GB SSD + 4×4TB SATA',
      网卡: '4×1GbE + 2×10GbE',
      电源: '2×1100W 冗余',
      管理: 'iDRAC9 企业版',
    },
    warranty: '三年下一工作日上门',
    supplier: '戴尔（中国）有限公司',
    moq: 1,
    certs: ['CCC', '节能认证'],
    remark: '支持 GPU 扩展',
  },
  {
    brand: '惠普 (HPE)',
    categoryPath: ['服务器设备', '机架式服务器', '2U机架服务器'],
    tags: ['数据中心', '虚拟化', '高性能'],
    model: 'ProLiant DL380 Gen11',
    description: '2U 通用双路服务器，扩展性强。',
    params: {
      CPU: '2 × Xeon Gold 5318Y',
      内存: '256GB DDR5',
      硬盘: '8×2.4TB SAS',
      网卡: '2×10GbE + 1×1GbE',
      电源: '2×800W 冗余',
    },
    warranty: '三年上门',
    supplier: '新华三技术有限公司',
    moq: 1,
    certs: ['CCC'],
  },
  {
    brand: '联想',
    categoryPath: ['服务器设备', '塔式服务器'],
    tags: ['中小企业', '塔式'],
    model: 'ThinkSystem ST650 V2',
    description: '塔式服务器，适合中小企业机房。',
    params: {
      CPU: '1 × Xeon Silver 4310',
      内存: '64GB',
      硬盘: '2×480GB SSD',
      电源: '1×1100W',
    },
    warranty: '三年上门',
    supplier: '联想（北京）信息技术有限公司',
    moq: 1,
    certs: ['CCC'],
  },

  // 打印机 / 文印设备（含同名设备，用于测试导出合并）
  {
    brand: '惠普 (HP)',
    categoryPath: ['打印机/文印设备', '多功能一体机', '四合一一体机'],
    tags: ['文印', '黑白激光', '网络'],
    model: 'HP LaserJet Pro M428fdw',
    name: 'A4 黑白激光一体机',
    description: '四合一黑白激光一体机，打印/复印/扫描/传真。',
    params: {
      类型: '黑白激光',
      速度: '38 页/分钟',
      分辨率: '1200×1200dpi',
      网络: '有线/无线',
      双面: '自动双面',
      月负荷: '80000 页',
    },
    warranty: '一年上门',
    supplier: '惠普贸易（上海）有限公司',
    moq: 1,
    certs: ['CCC', '节能认证'],
    remark: '支持惠普智屏',
  },
  {
    brand: '兄弟 (Brother)',
    categoryPath: ['打印机/文印设备', '多功能一体机', '四合一一体机'],
    tags: ['文印', '黑白激光', '网络'],
    model: 'Brother MFC-L8900CDW',
    name: 'A4 黑白激光一体机',
    description: '四合一黑白激光一体机，安全打印与低功耗。',
    params: {
      类型: '黑白激光',
      速度: '33 页/分钟',
      分辨率: '2400×600dpi',
      网络: '有线/无线',
      双面: '自动双面',
      月负荷: '60000 页',
    },
    warranty: '一年送修',
    supplier: '兄弟（中国）商业有限公司',
    moq: 1,
    certs: ['CCC', '能源之星'],
  },
  {
    brand: '佳能 (Canon)',
    categoryPath: ['打印机/文印设备', '数码复合机'],
    tags: ['文印', '彩色', '复合机'],
    model: 'imageRUNNER ADVANCE DX C3835',
    name: 'A3 彩色数码复合机',
    description: 'A3 彩色数码复合机，中高速生产型。',
    params: {
      类型: '彩色激光',
      速度: '35 页/分钟',
      分辨率: '2400×1200dpi',
      纸张: 'A3-A5',
      装订: '可选装订器',
      安全: 'HDD 数据清除',
    },
    warranty: '一年上门',
    supplier: '佳能（中国）有限公司',
    moq: 1,
    certs: ['CCC', '节能认证'],
    remark: '需配套工作台',
  },
  {
    brand: '爱普生 (Epson)',
    categoryPath: ['打印机/文印设备', '票据打印机', '针式票据打印机'],
    tags: ['票据', '针式'],
    model: 'LQ-630K',
    name: '针式票据打印机',
    description: '平推式针式打印机，发票/单据专用。',
    params: {
      类型: '24 针平推式',
      速度: '150 字/秒',
      复写: '1+6 联',
      接口: 'USB/并口',
      进纸: '前进前出',
    },
    warranty: '三年送修',
    supplier: '爱普生（中国）有限公司',
    moq: 5,
    certs: ['CCC'],
  },

  // 投影机 / 扫描仪
  {
    brand: '爱普生 (Epson)',
    categoryPath: ['投影机（投影仪）', '商务办公投影机'],
    tags: ['投影', '商务', '激光'],
    model: 'CB-L200SW',
    description: '激光商务投影机，免维护光源。',
    params: {
      亮度: '4200 流明',
      分辨率: '1920×1080',
      对比度: '2500000:1',
      光源: '激光（20000 小时）',
      接口: 'HDMI×2/USB',
    },
    warranty: '两年上门',
    supplier: '爱普生（中国）有限公司',
    moq: 1,
    certs: ['CCC'],
  },
  {
    brand: '富士通 (Fujitsu)',
    categoryPath: ['扫描仪设备', '馈纸式高速扫描仪'],
    tags: ['扫描', '高速', '文档'],
    model: 'fi-7160',
    description: '高速文档扫描仪，自动进纸双面。',
    params: {
      类型: '馈纸式',
      速度: '60ppm/120ipm',
      分辨率: '600dpi',
      进纸: '80 页 ADF',
      接口: 'USB 3.0',
    },
    warranty: '一年送修',
    supplier: '富士通先端科技',
    moq: 1,
    certs: ['CCC', '节能认证'],
  },
];

async function createCategoryTree(
  nodes: CategoryNode[],
  parentId: string | null = null,
  orderStart = 0,
): Promise<void> {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const existing = await prisma.category.findFirst({
      where: { name: node.name, parentId },
    });
    let id: string;
    if (existing) {
      id = existing.id;
    } else {
      const created = await prisma.category.create({
        data: { name: node.name, parentId, sortOrder: orderStart + i },
      });
      id = created.id;
      console.log(`  + 分类: ${node.name}`);
    }
    if (node.children?.length) {
      await createCategoryTree(node.children, id, 0);
    }
  }
}

async function ensureCategory(path: string[]): Promise<string> {
  let parentId: string | null = null;
  let id = '';
  for (const name of path) {
    const existing = await prisma.category.findFirst({
      where: { name, parentId },
    });
    if (existing) {
      id = existing.id;
    } else {
      const created = await prisma.category.create({
        data: { name, parentId },
      });
      id = created.id;
    }
    parentId = id;
  }
  return id;
}

async function ensureBrand(name: string): Promise<string> {
  const b = await prisma.brand.upsert({
    where: { name },
    update: {},
    create: { name },
  });
  return b.id;
}

async function ensureTag(name: string): Promise<string> {
  const existing = await prisma.productTag.findUnique({ where: { name } });
  if (existing) return existing.id;
  const color = TAG_COLORS[Math.abs(hashString(name)) % TAG_COLORS.length];
  const created = await prisma.productTag.create({ data: { name, color } });
  console.log(`  + 标签: ${name}`);
  return created.id;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}

async function seedProductLibrary(): Promise<void> {
  console.log('🌱 播种产品库（品牌 / 分类 / 标签 / 产品）...');

  // 1. 分类树
  await createCategoryTree(categoryTree);
  console.log('✅ 分类树已就绪');

  // 2. 品牌
  const brandSet = new Set<string>();
  seedProducts.forEach((p) => brandSet.add(p.brand));
  for (const name of brandSet) {
    await ensureBrand(name);
    console.log(`  + 品牌: ${name}`);
  }

  // 3. 标签
  const tagSet = new Set<string>();
  seedProducts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  for (const name of tagSet) {
    await ensureTag(name);
  }
  console.log(`✅ 标签已就绪（${tagSet.size} 个）`);

  // 4. 产品 + 标签关系
  let seq = 1;
  for (const sp of seedProducts) {
    const brandId = await ensureBrand(sp.brand);
    const categoryId = await ensureCategory(sp.categoryPath);
    const code = `LX${String(seq).padStart(4, '0')}`;
    const leaf = sp.categoryPath[sp.categoryPath.length - 1];
    const marketPrice = 5000 + (seq % 20) * 600;

    // 完整产品属性（优先用种子里声明的，否则根据分类给合理默认值）
    const model = sp.model ?? `${leaf.slice(0, 2)}-${String(1000 + seq)}`;
    // 结构化参数并入描述文本（Product.spec 遗留列已移除，导出「参数」列走快照 description 兜底）
    const spec = sp.params ?? buildDefaultSpec(sp, seq);
    const specText = Object.entries(spec)
      .map(([k, v]) => `${k}：${v}`)
      .join('；');
    const description =
      sp.description ??
      `${sp.brand} ${leaf}，适用于${categoryHint(sp.categoryPath)}场景。`;
    const fullDescription = [description, specText, sp.remark]
      .filter(Boolean)
      .join('\n');
    const warranty = sp.warranty ?? '三年上门保修';
    const supplier = sp.supplier ?? `${sp.brand} 授权代理商`;
    const minOrderQty = sp.moq ?? 1;
    const marketUrl =
      sp.link ?? `https://example.com/products/${code.toLowerCase()}`;
    const imageUrls = sp.images ?? [
      `https://pics.example.com/${code.toLowerCase()}-1.jpg`,
      `https://pics.example.com/${code.toLowerCase()}-2.jpg`,
    ];
    const certNames = sp.certs ?? ['CCC', '节能认证'];

    const productData = {
      name: sp.name ?? `${sp.brand} ${leaf}`,
      model,
      brandId,
      categoryId,
      unit: '台',
      marketPrice,
      description: fullDescription,
      warranty,
      supplier,
      minOrderQty,
      marketUrl,
      status: 'ACTIVE' as const,
    };

    const product = await prisma.product.upsert({
      where: { code },
      update: productData,
      create: { code, ...productData, lastPriceUpdateAt: new Date() },
    });

    for (const tagName of sp.tags) {
      const tagId = await ensureTag(tagName);
      await prisma.productTagRelation.upsert({
        where: { productId_tagId: { productId: product.id, tagId } },
        update: {},
        create: { productId: product.id, tagId },
      });
    }

    // 图片/证书写关联表（幂等：先清再建，支持重复执行 seed 刷新）
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: imageUrls.map((url, idx) => ({
        productId: product.id,
        url,
        displayOrder: idx,
      })),
    });
    await prisma.productCertificate.deleteMany({
      where: { productId: product.id },
    });
    await prisma.productCertificate.createMany({
      data: certNames.map((name, idx) => ({
        productId: product.id,
        url: '',
        name,
        displayOrder: idx,
      })),
    });
    seq++;
  }
  console.log(`✅ 示例产品已就绪（${seedProducts.length} 个）`);
}

// 根据分类路径推断一个合理的默认参数集合
function buildDefaultSpec(
  sp: SeedProduct,
  seq: number,
): Record<string, string> {
  const leaf = sp.categoryPath[sp.categoryPath.length - 1];
  const brand = sp.brand;
  if (leaf.includes('笔记本') || leaf.includes('台式')) {
    return {
      处理器: 'Intel Core i5 / i7 或同级别',
      内存: '16GB DDR4（可扩展至 32GB）',
      硬盘: '512GB SSD',
      显卡: '集成显卡 / 可选独显',
      屏幕: leaf.includes('笔记本') ? '14 英寸 FHD' : '—',
      系统: '预装 Windows 11 专业版',
    };
  }
  if (leaf.includes('服务器')) {
    return {
      CPU: '2 × Xeon 银牌 4310',
      内存: '64GB DDR4 ECC',
      硬盘: '2 × 480GB SSD + 4 × 4TB SATA',
      网卡: '4 × 千兆 + 2 × 万兆',
      电源: '1+1 冗余电源',
    };
  }
  if (
    leaf.includes('打印') ||
    leaf.includes('复合') ||
    leaf.includes('一体机')
  ) {
    return {
      类型: '黑白激光 / 彩色激光可选',
      速度: '30-40 页/分钟',
      分辨率: '1200 × 1200 dpi',
      网络: '支持有线/无线',
      月负荷: '50000 页',
    };
  }
  if (leaf.includes('投影')) {
    return {
      亮度: '4000 流明',
      分辨率: '1920 × 1080',
      对比度: '20000:1',
      接口: 'HDMI × 2 / VGA / USB',
    };
  }
  if (leaf.includes('扫描')) {
    return {
      类型: '馈纸式 / 平板式',
      速度: '40 ppm（单面）',
      分辨率: '600 dpi',
      接口: 'USB 3.0 / 网络',
    };
  }
  return {
    品牌: brand,
    类别: leaf,
    规格: '详见技术白皮书',
    序列: String(seq),
  };
}

// 根据分类路径给出一句话场景描述
function categoryHint(path: string[]): string {
  const joined = path.join('/');
  if (joined.includes('笔记本') || joined.includes('台式'))
    return '日常办公与图形处理';
  if (joined.includes('服务器')) return '数据中心与虚拟化';
  if (joined.includes('打印') || joined.includes('复合')) return '企业文印';
  if (joined.includes('投影')) return '会议演示与教学';
  if (joined.includes('扫描')) return '文档数字化';
  return '通用办公';
}

// ==================== 示例报价单 ====================
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

interface QuotationSeedItem {
  // 定位产品的条件
  code?: string;
  name?: string; // 按产品名称（同名设备合并时使用）
  model?: string; // 按型号定位
  quantity: number;
  unitPrice: number;
  discount?: number; // 默认 100
}

async function seedQuotations(
  customerMap: Map<string, Customer>,
  createdById: string,
  updatedById: string,
): Promise<void> {
  console.log('🌱 播种示例报价单...');

  // 清掉已存在的示例报价单（含明细），保证可重复运行并刷新快照/合计
  await prisma.quotation.deleteMany({
    where: {
      code: { in: ['Q-TEST-0001', 'Q-THU-2024-001', 'Q-SGCC-2024-007'] },
    },
  });

  // 取一个默认模板（仅不存在时创建，已存在则不覆盖，避免抹掉用户在模板设置页的自定义列配置）
  let template = await prisma.quotationTemplate.findFirst({
    where: { name: '标准版' },
  });
  if (!template) {
    template = await prisma.quotationTemplate.create({
      data: {
        name: '标准版',
        description: '标准报价模板（含参数/折扣列）',
        config: {
          columns: [
            { key: 'index', label: '序号', visible: true },
            { key: 'code', label: '产品编号', visible: true },
            { key: 'name', label: '品牌型号', visible: true },
            { key: 'description', label: '参数', visible: true },
            { key: 'unit', label: '单位', visible: true },
            { key: 'quantity', label: '数量', visible: true },
            { key: 'unitPrice', label: '单价', visible: true },
            { key: 'discount', label: '折扣', visible: true },
            { key: 'subtotal', label: '小计', visible: true },
          ],
          titleFormat: '{{customerName}} 报价单',
          showTax: true,
          remark: '本报价含一年质保，最终解释权归本公司所有。',
          footer: '感谢您的信任与支持！',
        },
        isDefault: true,
      },
    });
  }

  // 标准报价单模板：标题 + 页眉 + 表格 + 页脚（type=quotation）
  const QUOTATION_COLUMNS = [
    { key: 'index', label: '序号', visible: true },
    { key: 'code', label: '产品编号', visible: true },
    { key: 'name', label: '品牌型号', visible: true },
    { key: 'description', label: '参数', visible: true },
    { key: 'unit', label: '单位', visible: true },
    { key: 'quantity', label: '数量', visible: true },
    { key: 'unitPrice', label: '单价', visible: true },
    { key: 'discount', label: '折扣', visible: true },
    { key: 'subtotal', label: '小计', visible: true },
  ];

  let quotationTemplate = await prisma.quotationTemplate.findFirst({
    where: { name: '标准报价单' },
  });
  if (!quotationTemplate) {
    quotationTemplate = await prisma.quotationTemplate.create({
      data: {
        name: '标准报价单',
        description: '标准报价单：标题 + 页眉 + 明细表 + 页脚',
        config: {
          type: 'quotation',
          columns: QUOTATION_COLUMNS,
          titleFormat: '{{customerName}} 报价单',
          title: '{{customerName}} 报价单',
          showTax: true,
          header:
            'XX科技有限公司　|　地址：XX市XX区XX路XX号　|　电话：400-XXX-XXXX',
          footer:
            '感谢您的信任与支持！本报价含一年质保，最终解释权归本公司所有。',
        },
        isDefault: false,
      },
    });
  }

  // 读取所有产品，建立定位索引
  const allProducts = await prisma.product.findMany({
    include: {
      brand: true,
      category: true,
      tags: { include: { tag: true } },
      images: true,
      certificates: true,
    },
  });
  const byCode = new Map(allProducts.map((p) => [p.code, p]));
  const byName = new Map(allProducts.map((p) => [p.name, p]));
  const byModel = new Map<string, (typeof allProducts)[number]>();
  for (const p of allProducts) if (p.model) byModel.set(p.model, p);
  const locate = (cond: { code?: string; name?: string; model?: string }) => {
    const p =
      (cond.code && byCode.get(cond.code)) ||
      (cond.model && byModel.get(cond.model)) ||
      (cond.name && byName.get(cond.name));
    if (!p) throw new Error(`未找到产品: ${JSON.stringify(cond)}`);
    return p;
  };

  // 由产品 + 报价条件构建报价明细
  const buildItems = async (
    defs: QuotationSeedItem[],
    opts: { showDiscount?: boolean } = {},
  ) => {
    const items: Prisma.QuotationItemCreateWithoutQuotationInput[] = [];
    for (let i = 0; i < defs.length; i++) {
      const d = defs[i];
      const p = locate(d);
      const discount = d.discount ?? 100;
      const subtotal = round2((d.unitPrice * d.quantity * discount) / 100);
      // 键名必须与前端 QuotationGeneratorView.buildSnapshot / quotationColumns.fieldValue 一致：
      // 起订量=minOrderQty、商城链接=marketUrl。图片/证书取自关联表。
      const snap: Record<string, unknown> = {
        code: p.code,
        name: p.name,
        brand: p.brand?.name ?? '',
        model: p.model ?? '',
        category: p.category?.name ?? '',
        unit: p.unit ?? '台',
        description: p.description ?? '',
        warranty: p.warranty ?? '',
        supplier: p.supplier ?? '',
        tags: p.tags?.map((t) => t.tag.name) ?? [],
        minOrderQty: p.minOrderQty ?? 1,
        marketUrl: p.marketUrl ?? '',
        images: (p.images ?? []).map((i) => i.url),
        certNames: (p.certificates ?? []).map((c) => c.name),
        unitPrice: d.unitPrice,
      };
      items.push({
        product: { connect: { id: p.id } },
        productSnapshot: snap as unknown as Prisma.InputJsonValue,
        quantity: d.quantity,
        unitPrice: d.unitPrice,
        discount: opts.showDiscount ? discount : null,
        subtotal,
        displayOrder: i,
      });
    }
    return items;
  };

  // 计算合计
  const totals = (
    items: { unitPrice: number; quantity: number; discount?: number }[],
  ) => {
    const totalAmount = round2(
      items.reduce(
        (s, it) =>
          s + round2((it.unitPrice * it.quantity * (it.discount ?? 100)) / 100),
        0,
      ),
    );
    return totalAmount;
  };

  // ---- 报价单 1：综合办公设备（含同名 A4 打印机合并 + 折扣）----
  const q1Customer = customerMap.get('中国银行总行')!;
  const q1Defs: QuotationSeedItem[] = [
    { model: 'Latitude 5440', quantity: 20, unitPrice: 6200, discount: 95 },
    { model: 'ThinkPad X1 Carbon Gen11', quantity: 5, unitPrice: 13800 },
    { model: 'OptiPlex 7010', quantity: 15, unitPrice: 4500, discount: 90 },
    { name: 'A4 黑白激光一体机', quantity: 8, unitPrice: 3200 }, // 同名设备①
    { name: 'A4 黑白激光一体机', quantity: 4, unitPrice: 2900, discount: 92 }, // 同名设备②（合并）
    { model: 'CB-L200SW', quantity: 3, unitPrice: 6800 },
    { model: 'fi-7160', quantity: 2, unitPrice: 5200, discount: 96 },
    { model: 'PowerEdge R750', quantity: 1, unitPrice: 86000 },
  ];
  const q1Items = await buildItems(q1Defs, { showDiscount: true });
  const q1Total = totals(q1Defs);
  const q1TaxRate = 13;
  const q1Tax = round2((q1Total * q1TaxRate) / 100);
  await prisma.quotation.create({
    data: {
      code: 'Q-TEST-0001',
      customerId: q1Customer.id,
      customerName: q1Customer.name,
      customerContact: q1Customer.contact ?? '',
      customerAddress: q1Customer.address ?? '',
      templateId: template.id,
      taxRate: q1TaxRate,
      totalAmount: q1Total,
      taxAmount: q1Tax,
      finalAmount: round2(q1Total + q1Tax),
      status: 'SENT',
      version: 1,
      versionGroupId: 'seed-q-test-0001',
      createdBy: createdById,
      updatedBy: updatedById,
      items: { create: q1Items },
    },
  });

  // ---- 报价单 2：文印与会议设备（清华大学，无折扣列，简单结构）----
  const q2Customer = customerMap.get('清华大学计算机系')!;
  const q2Defs: QuotationSeedItem[] = [
    { name: 'A3 彩色数码复合机', quantity: 2, unitPrice: 58000 },
    { model: 'CB-L200SW', quantity: 6, unitPrice: 6800 },
    { model: 'fi-7160', quantity: 4, unitPrice: 5200 },
    { name: '针式票据打印机', quantity: 10, unitPrice: 1500 },
  ];
  const q2Items = await buildItems(q2Defs, { showDiscount: false });
  const q2Total = totals(q2Defs);
  const q2TaxRate = 13;
  const q2Tax = round2((q2Total * q2TaxRate) / 100);
  await prisma.quotation.create({
    data: {
      code: 'Q-THU-2024-001',
      customerId: q2Customer.id,
      customerName: q2Customer.name,
      customerContact: q2Customer.contact ?? '',
      customerAddress: q2Customer.address ?? '',
      templateId: template.id,
      taxRate: q2TaxRate,
      totalAmount: q2Total,
      taxAmount: q2Tax,
      finalAmount: round2(q2Total + q2Tax),
      status: 'DRAFT',
      version: 1,
      versionGroupId: 'seed-q-thu-001',
      createdBy: createdById,
      updatedBy: updatedById,
      items: { create: q2Items },
    },
  });

  // ---- 报价单 3：数据中心建设（国家电网，高单价，含折扣）----
  const q3Customer = customerMap.get('国家电网信息部')!;
  const q3Defs: QuotationSeedItem[] = [
    { model: 'PowerEdge R750', quantity: 4, unitPrice: 86000, discount: 88 },
    {
      model: 'ProLiant DL380 Gen11',
      quantity: 2,
      unitPrice: 96000,
      discount: 90,
    },
    { model: 'ThinkSystem ST650 V2', quantity: 1, unitPrice: 42000 },
    { model: 'Precision 7780', quantity: 3, unitPrice: 32000 },
  ];
  const q3Items = await buildItems(q3Defs, { showDiscount: true });
  const q3Total = totals(q3Defs);
  const q3TaxRate = 13;
  const q3Tax = round2((q3Total * q3TaxRate) / 100);
  await prisma.quotation.create({
    data: {
      code: 'Q-SGCC-2024-007',
      customerId: q3Customer.id,
      customerName: q3Customer.name,
      customerContact: q3Customer.contact ?? '',
      customerAddress: q3Customer.address ?? '',
      templateId: template.id,
      taxRate: q3TaxRate,
      totalAmount: q3Total,
      taxAmount: q3Tax,
      finalAmount: round2(q3Total + q3Tax),
      status: 'DRAFT',
      version: 1,
      versionGroupId: 'seed-q-sgcc-007',
      createdBy: createdById,
      updatedBy: updatedById,
      items: { create: q3Items },
    },
  });

  console.log(
    '✅ 示例报价单已创建：Q-TEST-0001 / Q-THU-2024-001 / Q-SGCC-2024-007',
  );
}
