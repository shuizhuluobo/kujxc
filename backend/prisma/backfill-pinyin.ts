// 一次性回填存量产品的拼音检索列：npx tsx prisma/backfill-pinyin.ts
import { PrismaClient } from '@prisma/client';
import { toPinyinFields } from '../src/products/pinyin.util';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
  });
  let n = 0;
  for (const p of products) {
    const { full, initials } = toPinyinFields(p.name);
    await prisma.product.update({
      where: { id: p.id },
      data: { namePinyin: full || null, nameInitials: initials || null },
    });
    if (++n % 100 === 0) console.log(`已处理 ${n}/${products.length}`);
  }
  console.log(`✅ 拼音回填完成：${n} 个产品`);
}

void main().finally(() => prisma.$disconnect());
