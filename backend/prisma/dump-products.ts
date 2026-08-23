/**
 * 导出当前保留（未软删）的所有产品为 JSON，供清洗分析与重新导入。
 * 输出：backend/temp/export/products_export.json
 * 运行：pnpm db:dump-products
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const outDir = path.resolve(__dirname, '..', 'temp', 'export');
  fs.mkdirSync(outDir, { recursive: true });

  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    select: {
      code: true,
      name: true,
      description: true,
      model: true,
      unit: true,
      costPrice: true,
      salePrice: true,
      status: true,
      brand: { select: { name: true } },
      category: {
        select: { name: true, parent: { select: { name: true } } },
      },
      tags: { select: { tag: { select: { name: true } } } },
    },
    orderBy: { code: 'asc' },
  });

  const out = products.map((p) => ({
    code: p.code,
    name: p.name,
    description: p.description,
    model: p.model,
    unit: p.unit,
    costPrice: p.costPrice != null ? Number(p.costPrice) : null,
    salePrice: p.salePrice != null ? Number(p.salePrice) : null,
    status: p.status,
    brand: p.brand?.name ?? null,
    categoryLvl1: p.category?.parent?.name ?? null,
    categoryLvl2: p.category?.name ?? null,
    tags: p.tags.map((t) => t.tag.name),
  }));

  const brands = Array.from(new Set(out.map((p) => p.brand).filter(Boolean))) as string[];
  const categories = Array.from(
    new Set(out.map((p) => `${p.categoryLvl1}/${p.categoryLvl2}`)),
  );
  const tags = Array.from(new Set(out.flatMap((p) => p.tags))).sort();

  const payload = { brands, categories, products: out };
  const file = path.join(outDir, 'products_export.json');
  fs.writeFileSync(file, JSON.stringify(payload, null, 2), 'utf-8');

  console.log(
    `导出完成：${out.length} 个产品 -> ${file}\n品牌 ${brands.length} 个，二级分类 ${categories.length} 个，标签 ${tags.length} 个`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
