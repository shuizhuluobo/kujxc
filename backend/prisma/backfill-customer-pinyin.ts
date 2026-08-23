/**
 * 为存量客户补齐拼音检索字段（namePinyin / nameInitials）。
 * 原因：早期创建/导入的客户未生成这两个字段，导致按拼音搜索对存量数据无效。
 *
 * 运行：
 *  pnpm db:backfill-customer-pinyin
 */
import { PrismaClient } from '@prisma/client';
import { generatePinyinMeta } from '../src/common/utils/pinyin';

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.customer.count();
  const missing = await prisma.customer.findMany({
    where: { OR: [{ namePinyin: null }, { nameInitials: null }] },
    select: { id: true, name: true },
  });
  console.log(`共 ${total} 个客户，缺拼音字段 ${missing.length} 个`);

  let updated = 0;
  for (const c of missing) {
    const { pinyinStr, initials } = generatePinyinMeta(c.name);
    await prisma.customer.update({
      where: { id: c.id },
      data: { namePinyin: pinyinStr || null, nameInitials: initials || null },
    });
    updated += 1;
    if (updated % 50 === 0) console.log(`已更新 ${updated}/${missing.length}`);
  }
  console.log(`完成：更新 ${updated} 个客户`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
