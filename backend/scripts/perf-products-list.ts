/**
 * [perf-products-list] 产品列表性能计时反馈环
 *
 * 只读：对真实 ProductsService.findAll 计时（页1/页2/关键词搜索），
 * 并用 prisma query 事件记录每条 SQL 耗时，用于定位"加载/翻页慢"。
 *
 * 运行：cd backend && npx ts-node --transpile-only scripts/perf-products-list.ts
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ProductsService } from '../src/products/products.service';
import { PrismaService } from '../src/prisma/prisma.service';

const TAG = '[perf-products]';
const USER_ID = 'perf-run-user';

async function main() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app: INestApplication = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api');
  await app.init();

  const prisma = app.get(PrismaService);
  const products = app.get(ProductsService);

  const queries: { q: string; ms: number }[] = [];
  prisma.$on('query' as never, (e: any) => {
    queries.push({ q: String(e.query).slice(0, 120), ms: Number(e.duration) });
  });

  async function timed(label: string, fn: () => Promise<unknown>) {
    queries.length = 0;
    const t0 = performance.now();
    const result = (await fn()) as { total?: number; data?: unknown[] };
    const elapsed = performance.now() - t0;
    const bytes = Buffer.byteLength(JSON.stringify(result));
    const top = [...queries].sort((a, b) => b.ms - a.ms).slice(0, 5);
    console.log(
      `${TAG} ${label}: ${elapsed.toFixed(0)}ms | rows=${result.data?.length} total=${result.total} | payload=${(bytes / 1024).toFixed(0)}KB | queries=${queries.length}`,
    );
    for (const t of top) console.log(`${TAG}   top-query ${t.ms}ms :: ${t.q}`);
    return elapsed;
  }

  // 预热一次（连接池、编译缓存）
  await products.findAll({ page: 1, pageSize: 20 }, USER_ID);

  const runs: number[] = [];
  for (let i = 0; i < 3; i++) {
    runs.push(await timed(`page1 size20 #${i + 1}`, () => products.findAll({ page: 1, pageSize: 20 }, USER_ID)));
  }
  for (let i = 0; i < 3; i++) {
    runs.push(await timed(`page2 size20 #${i + 1}`, () => products.findAll({ page: 2, pageSize: 20 }, USER_ID)));
  }
  await timed('page1 keyword=服务器', () => products.findAll({ page: 1, pageSize: 20, keyword: '服务器' } as any, USER_ID));
  await timed('page1 size100', () => products.findAll({ page: 1, pageSize: 100 }, USER_ID));

  const avg = runs.reduce((a, b) => a + b, 0) / runs.length;
  console.log(`${TAG} avg(page1+page2) = ${avg.toFixed(0)}ms`);

  await prisma.$disconnect();
  await app.close();
}

void main();
