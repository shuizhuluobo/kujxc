import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// 清洗后的 JSON 位于仓库根 temp/clean/ 下
const JSON_PATH = path.resolve(
  __dirname,
  '..',
  '..',
  'temp',
  'clean',
  'products_clean.json',
);

const TAG_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#84cc16',
];

function tagColor(i: number): string {
  return TAG_COLORS[i % TAG_COLORS.length];
}

async function main() {
  if (!fs.existsSync(JSON_PATH)) {
    throw new Error(`找不到清洗数据文件: ${JSON_PATH}`);
  }
  const { categories, brands, products } = JSON.parse(
    fs.readFileSync(JSON_PATH, 'utf-8'),
  ) as {
    categories: { lvl1: string; lvl2: string }[];
    brands: string[];
    products: {
      name: string;
      fullName?: string;
      model?: string | null;
      brand: string;
      categoryLvl1: string;
      categoryLvl2: string;
      unit: string;
      price?: number | null;
      tags: string[];
    }[];
  };

  console.log(
    `读取: ${products.length} 个产品, ${brands.length} 个品牌, ${categories.length} 个二级分类`,
  );

  // ============ 1. 清空旧数据（按外键依赖顺序）============
  console.log('清空旧产品库数据...');
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productCertificate.deleteMany();
  await prisma.productChangeLog.deleteMany();
  await prisma.userProductFavorite.deleteMany();
  await prisma.productTagRelation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.productTag.deleteMany();
  console.log('清空完成。');

  // ============ 2. 创建一级 / 二级分类树 ============
  console.log('创建分类树...');
  const lvl1Map = new Map<string, string>(); // lvl1 name -> id
  for (const lvl1 of Array.from(new Set(categories.map((c) => c.lvl1)))) {
    const created = await prisma.category.create({
      data: {
        name: lvl1,
        description: `${lvl1}（一级分类）`,
        sortOrder: 0,
      },
    });
    lvl1Map.set(lvl1, created.id);
  }

  const catMap = new Map<string, string>(); // "lvl1/lvl2" -> id
  // 按一级分组，二级排序
  const lvl2ByLvl1 = new Map<string, string[]>();
  for (const c of categories) {
    if (!lvl2ByLvl1.has(c.lvl1)) lvl2ByLvl1.set(c.lvl1, []);
    if (!lvl2ByLvl1.get(c.lvl1)!.includes(c.lvl2)) {
      lvl2ByLvl1.get(c.lvl1)!.push(c.lvl2);
    }
  }
  for (const [lvl1, lvl2s] of lvl2ByLvl1) {
    let order = 0;
    for (const lvl2 of lvl2s) {
      const created = await prisma.category.create({
        data: {
          name: lvl2,
          parentId: lvl1Map.get(lvl1),
          description: `${lvl1} / ${lvl2}`,
          sortOrder: order++,
        },
      });
      catMap.set(`${lvl1}/${lvl2}`, created.id);
    }
  }
  console.log(`分类树创建完成: ${lvl1Map.size} 个一级, ${catMap.size} 个二级`);

  // ============ 3. 创建品牌 ============
  console.log('创建品牌...');
  const brandMap = new Map<string, string>();
  let bo = 0;
  for (const b of brands) {
    const created = await prisma.brand.create({
      data: { name: b, sortOrder: bo++ },
    });
    brandMap.set(b, created.id);
  }
  console.log(`品牌创建完成: ${brandMap.size} 个`);

  // ============ 4. 创建标签（去重）============
  console.log('创建标签...');
  const allTags = Array.from(new Set(products.flatMap((p) => p.tags))).sort();
  const tagMap = new Map<string, string>();
  let to = 0;
  for (const t of allTags) {
    const created = await prisma.productTag.create({
      data: {
        name: t,
        color: tagColor(to++),
        description: `自动清洗生成标签：${t}`,
      },
    });
    tagMap.set(t, created.id);
  }
  console.log(`标签创建完成: ${tagMap.size} 个`);

  // ============ 5. 批量创建产品 ============
  console.log('导入产品...');
  let ok = 0;
  let skip = 0;
  let codeSeq = 1;
  for (const p of products) {
    const catId = catMap.get(`${p.categoryLvl1}/${p.categoryLvl2}`);
    const brandId = brandMap.get(p.brand);
    if (!catId || !brandId) {
      skip++;
      continue;
    }
    const code = `P${String(codeSeq++).padStart(6, '0')}`;
    const tagIds = (p.tags || [])
      .map((t) => tagMap.get(t))
      .filter((x): x is string => Boolean(x));

    await prisma.product.create({
      data: {
        code,
        name: p.name,
        description: p.fullName && p.fullName !== p.name ? p.fullName : null,
        model: p.model ?? null,
        unit: p.unit || '台',
        status: 'ACTIVE',
        isMarketProduct: false,
        // 清洗源数据中的价格均为成本价，写入 costPrice；售价待后续报价维护
        costPrice: p.price != null ? new Prisma.Decimal(p.price) : null,
        salePrice: null,
        marketPrice: null,
        brandId,
        categoryId: catId,
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
    });
    ok++;
  }

  console.log(`导入完成: 成功 ${ok}, 跳过 ${skip}`);
  console.log('全部完成 ✅');
}

main()
  .catch((e) => {
    console.error('导入失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
