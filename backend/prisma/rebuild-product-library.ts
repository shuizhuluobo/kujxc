/**
 * 产品库重构：读取 dump 的 products_export.json，按统一规则清洗
 * （品牌归一化 + 型号剥离品类前缀 + name=品牌 型号 + 参数写入 description），
 * 然后清空产品库相关表并从清洗结果重新导入。
 *
 * 规则：
 *  - 品牌归一化：施乐→富士施乐、汉印喷墨→汉印、北洋身份证/北洋二维码→北洋、
 *    中铁信安保密→中铁信安；废弃类品牌（废/旧/报废）及其产品直接丢弃。
 *  - 型号：去掉开头的品类前缀词，取首个“非品类”段为纯型号；其余非品类段拼为参数(description)。
 *  - name = `${品牌} ${纯型号}`；description 合并原 description + 参数。
 *
 * 安全：默认 DRY-RUN（统计+样例）。加 execute 才落库：
 *   pnpm db:rebuild-products execute
 */
import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const EXECUTE = process.argv[2] === 'execute';

const EXPORT_PATH = path.resolve(__dirname, '..', 'temp', 'export', 'products_export.json');

// 品牌归一化映射
const BRAND_MAP: Record<string, string> = {
  施乐: '富士施乐',
  汉印喷墨: '汉印',
  北洋身份证: '北洋',
  北洋二维码: '北洋',
  中铁信安保密: '中铁信安',
  惠郎: '惠朗',
};
// 废弃品牌（连同产品丢弃）
const DISCARD_BRANDS = new Set(['废', '旧', '报废', '保密']);
// 边缘/非标品牌后缀关键词：品牌名里含这些词的产品直接丢弃（白板/教学/灯箱/访客/测温/UV/错题/票据/支票/升降/核查/备份/触摸查询/户外 等混写）
const EDGE_BRAND_KEYWORDS = [
  '白板', '多媒体教学', '教学', '升降', '户外灯箱', '灯箱', '访客', '核查测温', '测温',
  'UV', '错题', '票据', '支票', '自动矫正', '触摸查询', '备份', '高精',
];
function isEdgeBrand(brand: string): boolean {
  const b = brand.trim();
  return EDGE_BRAND_KEYWORDS.some((k) => b.includes(k));
}

// 品类词（精确匹配用于剥离/识别；支持前缀/中缀/后缀）
const CATEGORY_WORDS = new Set([
  '台式机', '笔记本', '打印机', '复印机', '激光打印机', '喷墨打印机',
  '多功能一体机', '彩色打印机', '一体机', '速印机', '平板', '工作站',
  '服务器', '显示器', '条码打印机', '标签打印机', '针式打印机', '主机',
]);
// 单字/短品类片段（出现在型号段里也视为品类，如段恰好等于“台式机”）
function isCategorySegment(seg: string): boolean {
  const s = seg.trim();
  if (!s) return true;
  if (CATEGORY_WORDS.has(s)) return true;
  // 含品类词（前缀/中缀/后缀），且剥离后仍无明显型号特征 -> 视为品类段
  for (const w of CATEGORY_WORDS) {
    if (s.includes(w) && s.length > w.length) return true;
  }
  return false;
}

// 从段中剥离所有品类词（前缀/中缀/后缀均可），返回剩余型号部分
function stripCategoryPrefix(seg: string): string {
  let s = seg.trim();
  // 反复剥离前缀品类词
  let changed = true;
  while (changed) {
    changed = false;
    for (const w of CATEGORY_WORDS) {
      if (s.startsWith(w) && s.length > w.length) {
        s = s.slice(w.length).trim();
        changed = true;
      }
    }
  }
  // 剥除中缀/后缀品类词（如 启天台式机 -> 启天，X笔记本 -> X，黑白激光多功能一体机 -> 黑白激光多功能）
  for (const w of CATEGORY_WORDS) {
    if (s.endsWith(w) && s.length > w.length) {
      s = s.slice(0, s.length - w.length).trim();
    } else if (s.includes(w) && s.length > w.length) {
      s = s.split(w).join('').trim();
    }
  }
  return s;
}

interface RawProduct {
  code: string;
  name: string;
  description: string | null;
  model: string | null;
  unit: string;
  costPrice: number | null;
  salePrice: number | null;
  status: string;
  brand: string | null;
  categoryLvl1: string | null;
  categoryLvl2: string | null;
  tags: string[];
}

interface CleanProduct {
  brand: string;
  categoryLvl1: string;
  categoryLvl2: string;
  model: string;
  name: string;
  description: string | null;
  unit: string;
  costPrice: number | null;
  tags: string[];
}

// 品牌英文/缩写别名（用于识别“型号段”其实是品牌自身）
const BRAND_ALIASES: Record<string, string[]> = {
  惠普: ['HP', 'hp'],
  戴尔: ['DELL', 'dell'],
  联想: ['Lenovo', 'lenovo', 'LENOVO'],
  三星: ['SAMSUNG', 'samsung'],
  英特尔: ['INTEL', 'intel'],
  爱普生: ['EPSON', 'epson', 'Epson'],
  佳能: ['CANON', 'canon', 'Canon'],
  东芝: ['TOSHIBA', 'toshiba'],
  兄弟: ['BROTHER', 'brother', 'Brother'],
  奔图: ['PANTUM', 'pantum'],
  京瓷: ['KYOCERA', 'kyocera'],
  理光: ['RICOH', 'ricoh'],
  富士施乐: ['XEROX', 'xerox', 'FujiXerox'],
  柯尼卡美能达: ['KONICA', 'konica', 'KonicaMinolta', 'KONICAMINOLTA'],
};

// 型号正式化：基于品牌 + 型号常识补全正式前缀。把握不准的返回原型号。
// 规则以 (品牌 -> 正则/前缀) 形式；匹配纯型号部分（已剥离品牌与品类词）。
const MODEL_FORMALIZE: Record<string, { test: RegExp; prefix: string }[]> = {
  惠普: [
    // 黑白激光消费/商用机型（含字母后缀）：1020/1007/1008/1106/1108/1136/126/132/P1007/P1008/P1106/P1108/P1566/P1606DN/M1005/M1136 等 -> LaserJet
    { test: /^(10(20|07|08)|11(06|08)|1136|126|132|1[2-9]\d|P(1\d{2,3}|1007|1008)|M(1005|1136|121[36]|128|15[26]|1[37]\d))\b/i, prefix: 'LaserJet ' },
    // 企业激光：M4xx/M5xx/M6xx/M7xx/M8xx 等（带字母后缀）-> LaserJet Pro / Enterprise，保守统一 LaserJet
    { test: /^M[4-9]\d{2}[A-Z]*\d*/i, prefix: 'LaserJet ' },
    // P15xx/P16xx/P20xx 系列
    { test: /^P(15|16|20)\d{2}/i, prefix: 'LaserJet ' },
    // 彩色激光：CP/CW 开头 -> Color LaserJet
    { test: /^CP\d|^CW\d/i, prefix: 'Color LaserJet ' },
  ],
  爱普生: [
    // L 系列墨仓式 -> EcoTank L
    { test: /^L\d/i, prefix: 'EcoTank ' },
    // 其它如 WF / XP / L 等保留
  ],
  佳能: [
    { test: /^LBP\d/i, prefix: 'LBP ' },
    { test: /^MF\d/i, prefix: 'imageCLASS MF' },
    { test: /^iP\d|^iX\d/i, prefix: 'PIXMA ' },
  ],
  兄弟: [
    { test: /^HL\d/i, prefix: 'HL-' },
    { test: /^DCP\d/i, prefix: 'DCP-' },
    { test: /^MFC\d/i, prefix: 'MFC-' },
  ],
  奔图: [
    { test: /^P\d{3,4}/i, prefix: 'P' }, // 奔图型号本就 P 开头，无需补
  ],
};

function formalizeModel(brand: string, model: string): string {
  const rules = MODEL_FORMALIZE[brand];
  if (!rules) return model;
  for (const r of rules) {
    if (r.test.test(model)) {
      // 避免重复前缀
      if (model.startsWith(r.prefix.trim())) return model;
      return `${r.prefix}${model}`;
    }
  }
  return model;
}

// 从一段文本中提取“型号”（剥离开头的品牌名 + 品类词 + 截断选配）
function extractModel(seg: string, brand: string): string {
  let s = seg.trim();
  // 0) 截断选配/配件：+ ＋ 及之后部分（如 C7721+双输 -> C7721）
  s = s.split(/[+＋]/)[0].trim();
  // 1) 去掉开头的品牌名（精确匹配前缀）
  if (brand && s.startsWith(brand)) {
    s = s.slice(brand.length).trim();
  }
  // 2) 去掉开头品牌英文别名（如 HP / DELL / Epson）
  const aliases = BRAND_ALIASES[brand] ?? [];
  for (const al of aliases) {
    if (s === al || s.startsWith(al)) {
      s = s.slice(al.length).trim();
    }
  }
  // 3) 去掉品类词（前缀/中缀/后缀）
  s = stripCategoryPrefix(s);
  return s;
}

function cleanProduct(p: RawProduct): CleanProduct | null {
  let brand = p.brand ?? '';
  if (DISCARD_BRANDS.has(brand.trim())) return null; // 废弃品牌丢弃
  if (isEdgeBrand(brand)) return null; // 边缘/非标混写品牌丢弃
  if (BRAND_MAP[brand.trim()]) brand = BRAND_MAP[brand.trim()];
  if (!brand) return null;

  const lvl1 = p.categoryLvl1 ?? '';
  const lvl2 = p.categoryLvl2 ?? '';
  if (!lvl1 || !lvl2) return null;

  const rawModel = (p.model ?? p.name ?? '').trim();
  // 切段：/ （ ） 以及空格后紧跟大写字母/型号符号的情况（保守仅用分隔符）
  const segments = rawModel
    .split(/[/（）()]/)
    .map((s) => s.trim())
    .filter(Boolean);

  let model = '';
  const params: string[] = [];
  let foundModel = false;
  const hasAlnum = (s: string) => /[A-Za-z0-9]/.test(s);
  for (const seg of segments) {
    // 先尝试剥离品牌+品类前缀，得到候选型号
    const candidate = extractModel(seg, brand);
    if (!foundModel) {
      // 跳过：空 / 纯品类词 / 纯中文无字母数字（如“黑白激光多功能”）
      if (candidate && !isCategorySegment(candidate) && hasAlnum(candidate)) {
        model = candidate;
        foundModel = true;
      }
      continue;
    } else {
      // 后续段：剥离后若不是品类词且含字母数字，视为参数
      const stripped = extractModel(seg, brand);
      if (stripped && !isCategorySegment(stripped) && hasAlnum(stripped)) {
        params.push(stripped);
      }
    }
  }

  // 兜底：没解析出型号，用剥离前缀后的整串
  if (!model) {
    model = extractModel(rawModel, brand) || rawModel;
    if (isCategorySegment(model)) model = rawModel; // 实在分不出就用原始
  }

  // 型号正式化（补全品牌型号前缀，仅对把握准确的规则应用）
  model = formalizeModel(brand, model);
  // 型号净化为干净文本：去 HTML 实体、压缩多余空格、去首尾空白
  model = model
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[　]/g, ' ')
    .trim();

  const name = `${brand} ${model}`.trim();

  const descParts: string[] = [];
  if (p.description && p.description.trim() && p.description.trim() !== p.name.trim() && p.description.trim() !== rawModel) {
    descParts.push(p.description.trim());
  }
  if (params.length) descParts.push(`参数：${params.join(' / ')}`);
  const description = descParts.length ? descParts.join('；') : null;

  return {
    brand,
    categoryLvl1: lvl1,
    categoryLvl2: lvl2,
    model,
    name,
    description,
    unit: p.unit || '台',
    costPrice: p.costPrice,
    tags: (p.tags || []).filter((t) => t && t.trim() && t.trim() !== brand.trim()),
  };
}

const TAG_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];
function tagColor(i: number): string {
  return TAG_COLORS[i % TAG_COLORS.length];
}

async function main() {
  if (!fs.existsSync(EXPORT_PATH)) {
    throw new Error(`找不到导出文件: ${EXPORT_PATH}，请先运行 pnpm db:dump-products`);
  }
  const raw = JSON.parse(fs.readFileSync(EXPORT_PATH, 'utf-8')) as { products: RawProduct[] };

  const cleaned: CleanProduct[] = [];
  const discarded: string[] = [];
  for (const p of raw.products) {
    const c = cleanProduct(p);
    if (!c) {
      discarded.push(`${p.code} (品牌:${p.brand}) ${p.name}`);
    } else {
      cleaned.push(c);
    }
  }

  // 不去重：保留全部清洗后条目（每条配置独立）
  const deduped = cleaned;

  const brands = Array.from(new Set(deduped.map((c) => c.brand))).sort();
  const categories = Array.from(
    new Set(deduped.map((c) => `${c.categoryLvl1}/${c.categoryLvl2}`)),
  ).sort();
  const tags = Array.from(new Set(deduped.flatMap((c) => c.tags))).sort();

  console.log(`模式：${EXECUTE ? '⚠️ 真实执行' : '🔍 仅统计（DRY-RUN）'}`);
  console.log(`原始产品: ${raw.products.length}`);
  console.log(`清洗后保留: ${cleaned.length}，丢弃(废弃品牌等): ${discarded.length}，最终导入: ${deduped.length}`);
  console.log(`品牌: ${brands.length}，二级分类: ${categories.length}，标签: ${tags.length}`);

  console.log('\n— 丢弃样例 —');
  discarded.slice(0, 20).forEach((d) => console.log(`   ${d}`));

  console.log('\n— 清洗后前 25 条样例 —');
  for (const c of deduped.slice(0, 25)) {
    console.log(`   [${c.brand}] ${c.name}  | model=${c.model} | ${c.categoryLvl1}/${c.categoryLvl2} | desc=${c.description ?? ''}`);
  }

  // 去重型号清单（按品牌），便于审阅型号正式化是否准确
  console.log('\n— 去重型号清单（按品牌）—');
  const byBrand = new Map<string, Set<string>>();
  for (const c of deduped) {
    if (!byBrand.has(c.brand)) byBrand.set(c.brand, new Set());
    byBrand.get(c.brand)!.add(`${c.model}  [${c.categoryLvl1}/${c.categoryLvl2}]`);
  }
  for (const b of [...byBrand.keys()].sort()) {
    const models = [...byBrand.get(b)!].sort();
    console.log(`\n  【${b}】(${models.length})`);
    models.forEach((m) => console.log(`     - ${m}`));
  }

  if (!EXECUTE) {
    console.log('\n未加 execute，未做任何修改。确认后运行：pnpm db:rebuild-products execute');
    return;
  }

  // ===== 真实执行：清空 + 重建 =====
  console.log('\n清空旧产品库数据...');
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

  // 分类树
  const lvl1Map = new Map<string, string>();
  for (const lvl1 of Array.from(new Set(categories.map((c) => c.split('/')[0])))) {
    const created = await prisma.category.create({ data: { name: lvl1, description: `${lvl1}（一级分类）`, sortOrder: 0 } });
    lvl1Map.set(lvl1, created.id);
  }
  const catMap = new Map<string, string>();
  const lvl2ByLvl1 = new Map<string, string[]>();
  for (const c of categories) {
    const [a, b] = c.split('/');
    if (!lvl2ByLvl1.has(a)) lvl2ByLvl1.set(a, []);
    if (!lvl2ByLvl1.get(a)!.includes(b)) lvl2ByLvl1.get(a)!.push(b);
  }
  for (const [a, bs] of lvl2ByLvl1) {
    let order = 0;
    for (const b of bs) {
      const created = await prisma.category.create({ data: { name: b, parentId: lvl1Map.get(a), description: `${a} / ${b}`, sortOrder: order++ } });
      catMap.set(`${a}/${b}`, created.id);
    }
  }
  console.log(`分类树: ${lvl1Map.size} 一级, ${catMap.size} 二级`);

  // 品牌
  const brandMap = new Map<string, string>();
  let bo = 0;
  for (const b of brands) {
    const created = await prisma.brand.create({ data: { name: b, sortOrder: bo++ } });
    brandMap.set(b, created.id);
  }
  console.log(`品牌: ${brandMap.size}`);

  // 标签
  const tagMap = new Map<string, string>();
  let to = 0;
  for (const t of tags) {
    const created = await prisma.productTag.create({ data: { name: t, color: tagColor(to++), description: `清洗生成标签：${t}` } });
    tagMap.set(t, created.id);
  }
  console.log(`标签: ${tagMap.size}`);

  // 产品
  let ok = 0;
  let skip = 0;
  let codeSeq = 1;
  for (const c of deduped) {
    const catId = catMap.get(`${c.categoryLvl1}/${c.categoryLvl2}`);
    const brandId = brandMap.get(c.brand);
    if (!catId || !brandId) {
      skip++;
      continue;
    }
    const tagIds = (c.tags || []).map((t) => tagMap.get(t)).filter((x): x is string => Boolean(x));
    await prisma.product.create({
      data: {
        code: `P${String(codeSeq++).padStart(6, '0')}`,
        name: c.name,
        description: c.description,
        model: c.model,
        unit: c.unit || '台',
        status: 'ACTIVE',
        isMarketProduct: false,
        costPrice: c.costPrice != null ? new Prisma.Decimal(c.costPrice) : null,
        salePrice: null,
        marketPrice: null,
        brandId,
        categoryId: catId,
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
    });
    ok++;
  }
  console.log(`导入完成: 成功 ${ok}, 跳过 ${skip}`);
  console.log('全部完成 ✅');
}

main()
  .catch((e) => {
    console.error('失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
