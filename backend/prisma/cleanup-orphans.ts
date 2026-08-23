/**
 * 清理孤儿品牌/分类/标签：无任何“未删除产品”引用的品牌、分类、标签。
 * 默认 DRY-RUN，加 execute 才删除：pnpm db:cleanup-orphans execute
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const EXECUTE = process.argv[2] === 'execute';

async function main() {
  console.log(`模式：${EXECUTE ? '⚠️ 真实删除' : '🔍 仅统计（DRY-RUN）'}`);

  const usedBrandIds = new Set(
    (await prisma.product.findMany({ where: { deletedAt: null }, select: { brandId: true }, distinct: ['brandId'] }))
      .map((p) => p.brandId).filter((x): x is string => Boolean(x)),
  );
  const usedCatIds = new Set(
    (await prisma.product.findMany({ where: { deletedAt: null }, select: { categoryId: true }, distinct: ['categoryId'] }))
      .map((p) => p.categoryId).filter((x): x is string => Boolean(x)),
  );

  const allBrands = await prisma.brand.findMany({ select: { id: true, name: true } });
  const orphanBrands = allBrands.filter((b) => !usedBrandIds.has(b.id));
  const allCats = await prisma.category.findMany({ select: { id: true, name: true, parentId: true } });
  const catChildren = new Map<string | null, string[]>();
  for (const c of allCats) {
    if (!catChildren.has(c.parentId)) catChildren.set(c.parentId, []);
    catChildren.get(c.parentId)!.push(c.id);
  }
  const orphanCatIds = new Set<string>();
  for (const c of allCats) {
    const children = catChildren.get(c.id) ?? [];
    if (children.length === 0) {
      if (!usedCatIds.has(c.id)) orphanCatIds.add(c.id);
    } else {
      if (children.every((ch) => orphanCatIds.has(ch) || !usedCatIds.has(ch))) orphanCatIds.add(c.id);
    }
  }

  console.log(`孤儿品牌(${orphanBrands.length}):`, orphanBrands.map((b) => b.name).join(', '));
  console.log(`孤儿分类(${orphanCatIds.size}):`, allCats.filter((c) => orphanCatIds.has(c.id)).map((c) => c.name).join(', '));

  if (!EXECUTE) {
    console.log('\n未加 execute。确认后运行：pnpm db:cleanup-orphans execute');
    return;
  }

  for (const b of orphanBrands) {
    // 产品为软删除，仍占 brandId 外键；先物理删除该品牌全部产品（含软删），再删品牌
    await prisma.product.deleteMany({ where: { brandId: b.id } });
    await prisma.brand.delete({ where: { id: b.id } });
  }
  for (const id of orphanCatIds) {
    await prisma.product.deleteMany({ where: { categoryId: id } });
    await prisma.category.delete({ where: { id } });
  }
  await prisma.productTag.deleteMany({ where: { products: { none: {} } } });
  console.log(`\n✅ 已删除孤儿品牌 ${orphanBrands.length} 个、分类 ${orphanCatIds.size} 个，并清理无关联标签`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
