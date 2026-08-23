/**
 * 一次性数据清理：仅保留「计算机（台式机、笔记本）」「打印机/复印机」相关产品，
 * 并清理因此变成无产品的品牌分类标签。
 *
 * 安全策略：
 *  - 产品采用软删除（deletedAt），与线上 remove 行为一致，不破坏外键与历史；
 *  - 品牌 / 分类 / 标签为独立表，删除产品不会级联清理，故产品清理后再清理
 *    “已无未删除产品”的品牌、分类、标签（含其标签关系）；
 *  - 默认 DRY-RUN（仅统计打印，不落库）。加参数 `execute` 才真正执行：
 *      pnpm db:cleanup-products execute
 *
 * 运行：
 *   pnpm db:cleanup-products          # 仅统计
 *   pnpm db:cleanup-products execute  # 真正清理
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 是否真正执行
const EXECUTE = process.argv[2] === 'execute';

/** 判断某二级分类是否属于保留范围 */
function isKeptCategory(lvl1: string | null, lvl2: string | null): boolean {
  const a = (lvl1 ?? '').trim();
  const b = (lvl2 ?? '').trim();
  // 电脑整机：仅保留台式机、笔记本
  if (a === '电脑整机') {
    return b.includes('台式') || b.includes('笔记本');
  }
  // 打印设备：仅保留指定二级分类
  if (a === '打印设备') {
    return (
      b === '打印机' ||
      b === '复印机' ||
      b === '多功能一体机' ||
      b === '喷墨打印机' ||
      b === '激光打印机'
    );
  }
  // 关键词兜底（兼容一级命名差异）
  if (
    b.includes('台式') ||
    b.includes('笔记本') ||
    b.includes('打印机') ||
    b.includes('复印机') ||
    b.includes('一体机')
  ) {
    return true;
  }
  return false;
}

async function main() {
  console.log(`模式：${EXECUTE ? '⚠️ 真实执行' : '🔍 仅统计（DRY-RUN）'}`);

  // 取所有未删除产品，关联分类
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      code: true,
      categoryId: true,
      category: { select: { name: true, parent: { select: { name: true } } } },
    },
  });

  // 判定保留分类的 id 集合（基于分类树名）
  const keepCatIds = new Set<string>();
  const catSummary = new Map<string, number>(); // "一级/二级" -> 产品数
  for (const p of products) {
    const lvl1 = p.category?.parent?.name ?? null;
    const lvl2 = p.category?.name ?? null;
    const key = `${lvl1 ?? '∅'} / ${lvl2 ?? '∅'}`;
    catSummary.set(key, (catSummary.get(key) ?? 0) + 1);
    if (p.categoryId && isKeptCategory(lvl1, lvl2)) {
      keepCatIds.add(p.categoryId);
    }
  }

  console.log('\n=== 当前分类与产品数（按二级）===');
  for (const [k, n] of [...catSummary.entries()].sort()) {
    const kept = keepCatIds.has('');
    console.log(`  ${kept ? '✅' : '  '} ${k} : ${n}`);
  }
  console.log(`保留分类数：${keepCatIds.size}`);

  // 待删除产品
  const toDelete = products.filter((p) => !keepCatIds.has(p.categoryId ?? ''));
  console.log(`\n未删除产品总数：${products.length}，将被清理：${toDelete.length}，保留：${products.length - toDelete.length}`);

  if (!EXECUTE) {
    console.log('\n— DRY-RUN：前 20 条待清理产品 —');
    for (const p of toDelete.slice(0, 20)) {
      console.log(`  [${p.code}] ${p.name}  (分类: ${p.category?.parent?.name ?? '∅'}/${p.category?.name ?? '∅'})`);
    }
    if (toDelete.length > 20) console.log(`  ... 其余 ${toDelete.length - 20} 条略`);
    console.log('\n未加 execute 参数，未做任何修改。如需执行请运行：pnpm db:cleanup-products execute');
    return;
  }

  // ===== 真实执行 =====
  // 1) 软删除产品
  let delCount = 0;
  for (const p of toDelete) {
    await prisma.product.update({
      where: { id: p.id },
      data: { deletedAt: new Date() },
    });
    delCount++;
  }
  console.log(`\n✅ 已软删除产品：${delCount}`);

  // 2) 清理无“任何产品（含软删除）”引用的品牌
  //    注意：产品为软删除，仍占用 brandId 外键，故需基于全部产品判断，而非仅未删除
  const usedBrandIds = new Set(
    (
      await prisma.product.findMany({
        select: { brandId: true },
        distinct: ['brandId'],
      })
    )
      .map((p) => p.brandId)
      .filter((x): x is string => Boolean(x)),
  );
  const allBrands = await prisma.brand.findMany({ select: { id: true, name: true } });
  const orphanBrands = allBrands.filter((b) => !usedBrandIds.has(b.id));
  for (const b of orphanBrands) {
    await prisma.brand.delete({ where: { id: b.id } });
  }
  console.log(`✅ 已删除无产品品牌：${orphanBrands.length}（剩余 ${allBrands.length - orphanBrands.length}）`);

  // 3) 清理无“任何产品（含软删除）”引用的分类（含其子级）
  const usedCatIds = new Set(
    (
      await prisma.product.findMany({
        select: { categoryId: true },
        distinct: ['categoryId'],
      })
    )
      .map((p) => p.categoryId)
      .filter((x): x is string => Boolean(x)),
  );
  const allCats = await prisma.category.findMany({ select: { id: true, name: true, parentId: true } });
  // 计算无产品的分类集合（含因子级被清而变空的一级）
  // 先标记叶子分类：无未删除产品即孤儿
  const orphanCatIds = new Set<string>();
  const childrenOf = new Map<string | null, string[]>();
  for (const c of allCats) {
    if (!childrenOf.has(c.parentId)) childrenOf.set(c.parentId, []);
    childrenOf.get(c.parentId)!.push(c.id);
  }
  for (const c of allCats) {
    const children = childrenOf.get(c.id) ?? [];
    if (children.length === 0) {
      // 叶子：无产品即孤儿
      if (!usedCatIds.has(c.id)) orphanCatIds.add(c.id);
    }
  }
  // 一级分类：所有子级均为孤儿时才删除（子级已在上面标记过）
  for (const c of allCats) {
    const children = childrenOf.get(c.id) ?? [];
    if (children.length > 0) {
      const allChildrenOrphan = children.every((chId) => orphanCatIds.has(chId));
      if (allChildrenOrphan) orphanCatIds.add(c.id);
    }
  }
  for (const id of orphanCatIds) {
    await prisma.category.delete({ where: { id } });
  }
  console.log(`✅ 已删除无产品分类：${orphanCatIds.size}`);

  // 4) 清理标签：无任何标签关系的标签
  await prisma.productTag.deleteMany({
    where: { products: { none: {} } },
  });
  const remainingTags = await prisma.productTag.count();
  console.log(`✅ 已清理无关联标签，剩余标签：${remainingTags}`);

  console.log('\n全部清理完成 ✅');
}

main()
  .catch((e) => {
    console.error('清理失败:', e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
