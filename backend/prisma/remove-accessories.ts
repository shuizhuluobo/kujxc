/**
 * 移除产品库中混杂的“配件/耗材/非整机”产品（内存条、SSD、主板、纯CPU、疑议项）。
 * 采用精确 model 匹配，避免误删整机。
 * 默认 DRY-RUN（仅列出待删），加 execute 才删除：pnpm db:remove-accessories execute
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const EXECUTE = process.argv[2] === 'execute';

// 精确待移除 model 集合（来自语义审查，均为孤立配件/CPU/疑议项）
const REMOVE_MODELS = new Set<string>([
  // 内存 / SSD（金士顿/威刚/海盗船/海力士/INTEL 512G）
  '4G', '4g', '16G', '8G', '16g2666', '8g2666', '4G2400内存', '8g3000', '16g4代',
  '16gddr4', '240固态', '16G*2 DDR5', '512G', '8g2666 骇客神条',
  // 主板（技嘉/华硕）
  'H310M主板', '2370主板', 'B360主板', 'h310m主板', '主板310M', '365主板', 'B460主板',
  'b560m主板', '主板b760md5', 'h610m主板', 'H61M主板', 'B760m主板', 'B760m主板 魔鹰Xax',
  // 纯 CPU（AMD/INTEL/联想/戴尔/苹果/东芝/惠普/研华 的孤立 CPU 描述）
  '270', '860K', 'i5-7400', 'I5-4590S', 'I3-4170', 'I7', 'i7', 'I3 7代', 'I3-1215U',
  'I5 8代', 'I5 9代', 'i5', 'ultra 9', '300G',
  // 研华工控 / IPC
  'IPC-610',
]);

// 整品牌清除（其全部产品均为非整机：内存/SSD、主板、工控）
const REMOVE_BRANDS = new Set(['金士顿', '技嘉', '华硕', '研华']);

async function main() {
  console.log(`模式：${EXECUTE ? '⚠️ 真实删除' : '🔍 仅列出（DRY-RUN）'}`);

  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    select: {
      id: true, code: true, name: true, model: true, brand: { select: { name: true } },
      category: { select: { name: true, parent: { select: { name: true } } } },
    },
  });

  const toRemove = products.filter(
    (p) =>
      REMOVE_MODELS.has((p.model ?? '').trim()) ||
      REMOVE_BRANDS.has((p.brand?.name ?? '').trim()),
  );

  console.log(`待移除: ${toRemove.length} / 总 ${products.length}\n`);
  for (const p of toRemove) {
    console.log(`  [${p.brand?.name}] ${p.name} | model=${p.model} | ${p.category?.parent?.name}/${p.category?.name} | code=${p.code}`);
  }

  if (!EXECUTE) {
    console.log('\n未加 execute，未删除。确认后运行：pnpm db:remove-accessories execute');
    return;
  }

  // 整品牌清除：物理删除这些品牌下所有产品（含软删），随后删品牌
  const brandIds = (
    await prisma.brand.findMany({ where: { name: { in: [...REMOVE_BRANDS] } }, select: { id: true } })
  ).map((b) => b.id);
  let bn = 0;
  if (brandIds.length) {
    const r = await prisma.product.deleteMany({ where: { brandId: { in: brandIds } } });
    bn = r.count;
    for (const id of brandIds) {
      await prisma.brand.delete({ where: { id } });
    }
  }

  // 其余按 model 匹配的孤立配件：软删除
  let n = 0;
  for (const p of toRemove) {
    if (REMOVE_BRANDS.has((p.brand?.name ?? '').trim())) continue; // 已整品牌物理删除
    await prisma.product.update({ where: { id: p.id }, data: { deletedAt: new Date() } });
    n++;
  }
  console.log(`\n✅ 已整品牌清除 ${brandIds.length} 个品牌（物理删产品 ${bn} 条），并软删除其余孤立配件 ${n} 条`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
