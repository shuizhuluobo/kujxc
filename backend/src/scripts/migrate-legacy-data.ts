/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient, WorkOrderStatus, ScoreLevel } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as iconv from 'iconv-lite';

const prisma = new PrismaClient();

// CSV 解析函数
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter((line) => line.trim());
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    records.push(record);
  }

  return records;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function main() {
  console.log('🚀 开始数据迁移...\n');

  const sqlDir = path.join(__dirname, '../../../sql');

  // 1. 备份管理员用户
  console.log('📋 [1/6] 获取管理员用户信息...');
  const adminUsers = await prisma.user.findMany({
    where: {
      role: { code: 'admin' },
    },
  });
  console.log(`   找到 ${adminUsers.length} 个管理员用户`);

  // 2. 清空数据表 (保留 Role 和管理员 User)
  console.log('\n🗑️  [2/6] 清空测试数据...');

  // 先删除依赖表
  await prisma.workOrderCollaborator.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.wikiArticle.deleteMany();
  await prisma.wikiTag.deleteMany();
  await prisma.wikiCategory.deleteMany();

  // 删除非管理员用户
  await prisma.user.deleteMany({
    where: {
      role: { code: { not: 'admin' } },
    },
  });

  console.log('   ✅ 测试数据已清空');

  // 3. 导入用户 (工程师)
  console.log('\n👥 [3/6] 导入用户...');
  const usersCSV = fs.readFileSync(
    path.join(sqlDir, 'cnc_glyb_202602051836.csv'),
    'utf-8',
  );
  const usersData = parseCSV(usersCSV);

  // 获取 engineer 角色
  let engineerRole = await prisma.role.findUnique({
    where: { code: 'engineer' },
  });
  if (!engineerRole) {
    engineerRole = await prisma.role.create({
      data: { name: '工程师', code: 'engineer', permissions: [] },
    });
  }

  let businessRole = await prisma.role.findUnique({
    where: { code: 'business' },
  });
  if (!businessRole) {
    businessRole = await prisma.role.create({
      data: { name: '业务员', code: 'business', permissions: [] },
    });
  }

  const userMap = new Map<string, string>(); // username -> userId
  let userCount = 0;

  for (const row of usersData) {
    const username = row['glydh']?.trim();
    const password = row['glymm']?.trim() || '123456';
    const name = row['glyname']?.trim();

    if (!username || !name) continue;
    if (username === 'admin') continue; // 跳过 admin

    // 检查用户是否已存在
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      userMap.set(name, existing.id);
      continue;
    }

    try {
      const user = await prisma.user.create({
        data: {
          username,
          password, // 注意：实际使用时应该加密
          name,
          roleId: engineerRole.id,
          isActive: row['ifuse'] === '1',
        },
      });
      userMap.set(name, user.id);
      userCount++;
    } catch (e) {
      console.log(`   ⚠️ 跳过重复用户: ${username}`);
    }
  }
  console.log(`   ✅ 导入 ${userCount} 个用户`);
  console.log(`   📋 User Map Size: ${userMap.size}`);
  // 打印几个用户映射供调试
  console.log(
    '   🔍 User Map Sample:',
    Array.from(userMap.entries()).slice(0, 5),
  );

  // 把管理员也加入 userMap
  for (const admin of adminUsers) {
    userMap.set(admin.name, admin.id);
  }

  // 4. 导入客户
  console.log('\n🏢 [4/6] 导入客户...');
  const customersCSV = fs.readFileSync(
    path.join(sqlDir, '基础信息_客户档案_202602051836.csv'),
    'utf-8',
  );
  const customersData = parseCSV(customersCSV);

  const customerMap = new Map<string, string>(); // customerName -> customerId
  let customerCount = 0;

  for (const row of customersData) {
    const name = row['客户名称']?.trim();
    if (!name) continue;

    // 检查客户是否已存在
    if (customerMap.has(name)) continue;

    try {
      const customer = await prisma.customer.create({
        data: {
          name,
          contact: row['联系人']?.trim() || null,
          phone: row['电话']?.trim() || row['联系人电话']?.trim() || null,
          address: row['单位地址']?.trim() || null,
        },
      });
      customerMap.set(name, customer.id);
      customerCount++;
    } catch (e) {
      // 忽略重复
    }
  }
  console.log(`   ✅ 导入 ${customerCount} 个客户`);
  console.log(`   📋 Customer Map Size: ${customerMap.size}`);
  console.log(
    '   🔍 Customer Map Sample:',
    Array.from(customerMap.entries()).slice(0, 5),
  );

  // 5. 确保区域和服务类型存在
  console.log('\n📍 [5/6] 检查区域和服务类型...');

  let defaultRegion = await prisma.region.findFirst();
  if (!defaultRegion) {
    defaultRegion = await prisma.region.create({
      data: { name: '默认区域', sortOrder: 0 },
    });
  }

  // 创建服务类型 (基于维修类别)
  const serviceTypeMap = new Map<string, string>();
  const serviceTypes = ['简易', '一般', '复杂', '维修'];
  for (const typeName of serviceTypes) {
    let st = await prisma.serviceType.findUnique({ where: { name: typeName } });
    if (!st) {
      st = await prisma.serviceType.create({
        data: { name: typeName, sortOrder: 0 },
      });
    }
    serviceTypeMap.set(typeName, st.id);
  }
  console.log('   ✅ 区域和服务类型已准备');

  // 6. 导入工单
  console.log('\n📋 [6/6] 导入工单...');

  // 读取 UTF-8 文件 (无需 iconv)
  const repairsCSV = fs.readFileSync(
    path.join(sqlDir, '维修记录_202602070814.csv'),
    'utf-8',
  );
  const repairsData = parseCSV(repairsCSV);

  let workOrderCount = 0;
  let skippedCount = 0;

  // 统计匹配情况
  const stats = {
    customerMatched: 0,
    customerNew: 0,
    creatorMatched: 0,
    creatorDefault: 0,
    receiverMatched: 0,
    receiverMissing: 0,
    completerMatched: 0,
    completerMissing: 0,
  };

  // 获取默认创建者（admin）
  const defaultCreator = adminUsers[0] || (await prisma.user.findFirst());
  if (!defaultCreator) {
    throw new Error('没有可用的创建者用户');
  }

  for (const row of repairsData) {
    const customerName = row['用户单位']?.trim();
    const detail = row['故障信息']?.trim();
    const statusStr = row['记录状态']?.trim();
    const scoreLevelStr = row['维修类别']?.trim();
    const completerName = row['完结人']?.trim();
    const receiverName = row['接收人']?.trim();
    const creatorName = row['登记人']?.trim();

    // 日期字段
    const createDateStr = row['登记日期']?.trim();
    const receiveDateStr = row['接货时间']?.trim();
    const completeDateStr = row['完结日期']?.trim();

    if (!customerName) {
      skippedCount++;
      continue;
    }

    // 查找或创建客户
    let customerId = customerMap.get(customerName);
    if (!customerId) {
      try {
        const customer = await prisma.customer.create({
          data: { name: customerName },
        });
        customerId = customer.id;
        customerMap.set(customerName, customerId);
        stats.customerNew++;
      } catch {
        skippedCount++;
        continue;
      }
    } else {
      stats.customerMatched++;
    }

    // 解析日期
    const parseDate = (dateStr: string | undefined): Date | undefined => {
      if (!dateStr || dateStr === 'NULL' || !dateStr.trim()) return undefined;
      // 简单处理 2025-01-01 00:00:00.000 格式
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? undefined : d;
    };

    const createdAt = parseDate(createDateStr) || new Date();
    const receivedAt = parseDate(receiveDateStr);
    const completedAt = parseDate(completeDateStr);

    // 确定接收人和完成人
    const completerId = completerName ? userMap.get(completerName) : undefined;
    const receiverId = receiverName ? userMap.get(receiverName) : undefined;
    const creatorId =
      (creatorName && userMap.get(creatorName)) || defaultCreator.id;

    // 统计匹配
    if (creatorName) {
      if (userMap.has(creatorName)) stats.creatorMatched++;
      else stats.creatorDefault++;
    }

    if (receiverName) {
      if (receiverId) stats.receiverMatched++;
      else stats.receiverMissing++;
    }

    if (completerName) {
      if (completerId) stats.completerMatched++;
      else stats.completerMissing++;
    }

    // 确定状态
    let status: WorkOrderStatus = WorkOrderStatus.PENDING;

    if (statusStr === '已完成' || statusStr === '已完结') {
      status = WorkOrderStatus.COMPLETED;
    } else {
      // 未完结状态
      if (receiverName && receiverId) {
        status = WorkOrderStatus.RECEIVED;
      } else {
        status = WorkOrderStatus.PENDING;
      }
    }

    // 确定分值
    let scoreLevel: ScoreLevel = ScoreLevel.NORMAL;
    if (scoreLevelStr === '简易') {
      scoreLevel = ScoreLevel.SIMPLE;
    } else if (scoreLevelStr === '复杂') {
      scoreLevel = ScoreLevel.COMPLEX;
    }

    // 确定服务类型
    const serviceTypeId =
      serviceTypeMap.get(scoreLevelStr || '一般') ||
      serviceTypeMap.get('一般')!;

    try {
      await prisma.workOrder.create({
        data: {
          detail: detail || customerName,
          status,
          scoreLevel,
          customerId,
          regionId: defaultRegion.id,
          serviceTypeId,
          creatorId: creatorId,
          createdAt: createdAt,
          // 接收信息
          receiverId: receiverId,
          receivedAt:
            receivedAt ||
            (status !== WorkOrderStatus.PENDING ? createdAt : undefined),
          // 完成信息
          completerId:
            status === WorkOrderStatus.COMPLETED ? completerId : undefined,
          completedAt:
            status === WorkOrderStatus.COMPLETED ? completedAt : undefined,
          updatedAt: completedAt || receivedAt || createdAt,
        },
      });
      workOrderCount++;

      if (workOrderCount % 1000 === 0) {
        console.log(`   进度: ${workOrderCount} 条工单已导入...`);
      }
    } catch (e) {
      skippedCount++;
    }
  }

  console.log(`   ✅ 导入 ${workOrderCount} 条工单，跳过 ${skippedCount} 条`);

  console.log('\n📊 匹配统计:');
  console.log(`   Customers Matched: ${stats.customerMatched}`);
  console.log(`   Customers New: ${stats.customerNew}`);
  console.log(`   Creator Matched: ${stats.creatorMatched}`);
  console.log(`   Creator Defaulted (Admin): ${stats.creatorDefault}`);
  console.log(`   Receiver Matched: ${stats.receiverMatched}`);
  console.log(`   Receiver Missing: ${stats.receiverMissing}`);
  console.log(`   Completer Matched: ${stats.completerMatched}`);
  console.log(`   Completer Missing: ${stats.completerMissing}`);

  // 统计
  console.log('\n📊 数据库统计:');
  console.log(`   用户: ${await prisma.user.count()}`);
  console.log(`   客户: ${await prisma.customer.count()}`);
  console.log(`   工单: ${await prisma.workOrder.count()}`);

  console.log('\n✅ 数据迁移完成!');
}

main()
  .catch((e) => {
    console.error('❌ 迁移失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
