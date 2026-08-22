/**
 * 一次性数据迁移：把存量产品的 name（品牌型号）按品牌前缀拆分，补全独立 model（型号）字段。
 *
 * 规则（保守策略，避免误拆分）：
 *  - 仅处理 model 为空的记录；
 *  - 仅当 name 以品牌名开头时，把剩余部分作为 model；
 *  - 拆出的 model 为空时跳过（例如 name 恰好等于品牌名）；
 *  - 拆不出的记录保持 model 为空，name 一律不动，后续由用户在编辑页补填。
 *
 * 运行：pnpm db:split-model
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      model: true,
      brand: { select: { name: true } },
    },
  });

  let updated = 0;
  let skipped = 0;
  let already = 0;
  const samples: string[] = [];

  for (const p of products) {
    if (p.model && p.model.trim()) {
      already++;
      continue;
    }
    const brandName = p.brand?.name?.trim();
    const name = p.name?.trim() ?? '';
    if (!brandName || !name) {
      skipped++;
      continue;
    }
    if (name === brandName) {
      skipped++;
      continue;
    }
    if (name.startsWith(brandName)) {
      const model = name.slice(brandName.length).trim();
      if (!model) {
        skipped++;
        continue;
      }
      await prisma.product.update({
        where: { id: p.id },
        data: { model },
      });
      updated++;
      if (samples.length < 10) samples.push(`${name} -> ${model}`);
    } else {
      skipped++;
    }
  }

  console.log(
    `拆分完成：已补型号 ${updated} 条，已有型号 ${already} 条，未拆分（无品牌前缀/名称为空）${skipped} 条`,
  );
  if (samples.length) {
    console.log('示例：');
    samples.forEach((s) => console.log(`  ${s}`));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());