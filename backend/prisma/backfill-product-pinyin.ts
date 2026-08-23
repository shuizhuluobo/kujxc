/**
 * 为存量产品补齐拼音检索字段（namePinyin / nameInitials）。
 * 原因：早期创建/导入的产品未生成这两个字段，导致按拼音搜索（全拼/首字母）对存量数据无效。
 *
 * 运行：
 *  pnpm db:backfill-pinyin
 */
import { PrismaClient } from '@prisma/client';
import { toPinyinFields } from '../src/products/pinyin.util';

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.product.count();
  const missing = await prisma.product.findMany({
    where: { OR: [{ namePinyin: null }, { nameInitials: null }] },
    select: { id: true, name: true },
  });
  console.log(`共 ${total} 个产品，缺拼音字段 ${missing.length} 个`);

  let updated = 0;
  for (const p of missing) {
    const { full, initials } = toPinyinFields(p.name);
    await prisma.product.update({
      where: { id: p.id },
      data: { namePinyin: full || null, nameInitials: initials || null },
    });
    updated += 1;
    if (updated % 200 === 0) console.log(`已更新 ${updated}/${missing.length}`);
  }
  console.log(`完成：更新 ${updated} 个产品`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
