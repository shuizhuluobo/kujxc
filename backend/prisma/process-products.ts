/**
 * 逐条处理产品库数据：按统一规则修正品牌、型号、参数、标签、分类，
 * 仅保留「电脑整机」和「打印机复印机整机」中的常识品牌。
 *
 * 处理流程：
 *  1. 读取导出的 products_export.json
 *  2. 逐条语义修正
 *  3. 输出清洗后的 JSON（temp/clean/products_clean.json）
 *  4. 清空数据库并重新导入
 *
 * 运行：
 *  pnpm db:dump-products          # 先导出最新数据
 *  pnpm db:process-products       # 处理 + 清空重建
 */
import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const EXECUTE = process.argv[2] === 'execute';

const EXPORT_PATH = path.resolve(__dirname, '..', 'temp', 'export', 'products_export.json');
const OUTPUT_PATH = path.resolve(__dirname, '..', 'temp', 'clean', 'products_clean.json');

// ============================================================
// 1. 品牌归一化映射
// ============================================================
const BRAND_MAP: Record<string, string> = {
  施乐: '富士施乐',
  汉印喷墨: '汉印',
  北洋身份证: '北洋',
  北洋二维码: '北洋',
  中铁信安保密: '中铁信安',
  惠郎: '惠朗',
};

// 废弃品牌（直接丢弃）
const DISCARD_BRANDS = new Set(['废', '旧', '报废', '保密']);

// 边缘/非标品牌关键词（非主流品牌，丢弃）
const EDGE_BRAND_KEYWORDS = [
  '白板', '多媒体教学', '教学', '升降', '户外灯箱', '灯箱', '访客',
  '核查测温', '测温', 'UV', '错题', '票据', '支票', '自动矫正',
  '触摸查询', '备份', '高精', '热敏', '条码', '标签', '便携式',
  '二维码', '身份证', '支票', '针式', '平推',
];

function isEdgeBrand(brand: string): boolean {
  const b = brand.trim();
  return EDGE_BRAND_KEYWORDS.some((k) => b.includes(k));
}

// ============================================================
// 2. 常识品牌列表（仅保留这些品牌的产品）
// ============================================================
const COMMON_BRANDS = new Set([
  // 电脑品牌
  '联想', 'ThinkPad', 'ThinkCentre', '戴尔', '惠普', '华硕', '宏基',
  '苹果', '华为', '小米', '海尔', '机械师', '机械革命', '微星',
  '技嘉', '精英', '清华同方', '方正', '长城', '中科可控', '百信太行',
  '浪潮', '海康威视', '海信', '松下', '荣耀', '三星',
  // 打印机/复印机品牌
  '惠普', '佳能', '爱普生', '兄弟', '联想', '富士施乐', '柯尼卡美能达',
  '东芝', '京瓷', '理光', '奔图', '三星', '松下', '理想', '光电通',
  '立思辰', '汉光', '恒安捷', '实达', '映美', '南天', '长城',
  '新北洋', '北洋', '惠朗', 'MAXHUB',
  // 其他可信品牌
  'IBM', '英特尔', 'INTEL', 'AMD', '微软', 'LG', 'AOC', '戴尔', '华硕',
]);

// ============================================================
// 3. 型号名称修正映射
// ============================================================
const MODEL_FIXES: Record<string, Record<string, string>> = {
  // 惠普型号修正
  '惠普': {
    'Colorlaserlet4650': 'Color LaserJet 4650',
    'Colorlaserlet3700': 'Color LaserJet 3700',
    '8300ELITEMT-C0Q62PA': 'Elite 8300 MT',
    'PR03380': 'Pro 3380 MT',
    'G645': 'Pro 3380 MT',  // G645 是 CPU，不是型号
    'p6-1490cn': 'P6-1490cn',
  },
  // 佳能型号修正
  '佳能': {
    'imageCLASS MFMF4410': 'imageCLASS MF4410',
    'imageCLASS MFMF4870DN': 'imageCLASS MF4870DN',
    'LDP6300DN': 'LBP6300DN',  // LDP 应该是 LBP
  },
  // 联想型号修正
  '联想': {
    'ThinkCentre.M6300T': 'ThinkCentre M6300T',
    'ThinkCentre.': 'ThinkCentre ',
  },
  
  // 柯尼卡美能达型号修正
  '柯尼卡美能达': {
    '7621': 'Bizhub 7621',
    'B7621': 'Bizhub 7621',
  },
  // 理想型号修正
  '理想': {
    '之友RM5023': '之友 RM5023',
  },
};

function fixModel(brand: string, model: string): string {
  // 清理 HTML 实体、多余空格
  let m = model
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[　]/g, ' ')
    .trim();

  // 应用品牌级型号修正
  const brandFixes = MODEL_FIXES[brand];
  if (brandFixes) {
    for (const [oldM, newM] of Object.entries(brandFixes)) {
      if (m === oldM) {
        m = newM;
        break;
      }
    }
  }

  return m;
}

// ============================================================
// 4. 分类修正映射
//    将一体机电脑从「打印设备/多功能一体机」修正到「电脑整机/台式机」
//    注意：必须区分「电脑一体机」和「打印机多功能一体机」
// ============================================================

// 打印机多功能一体机型号前缀（排除这些，它们是打印机不是电脑）
const PRINTER_MFP_MODEL_PREFIXES = [
  'LaserJet M', 'Officejet', 'Deskjet', 'LaserJet Pro',
  'HL-', 'DCP-', 'MFC-', 'FAX-',
  'imageCLASS MF', 'LBP', 'PIXMA',
  'EcoTank', 'WF-', 'L',
  'MG', 'MP', 'MX',
  'MFC', 'DCP',
];

// 电脑一体机品牌列表
const AIO_COMPUTER_BRANDS = ['联想', '戴尔', '惠普', '华硕', '苹果', '海尔', '清华同方', '方正', '长城'];

// 电脑一体机型号前缀/关键词
const AIO_COMPUTER_MODEL_PREFIXES = [
  '扬天S', '启天A', '扬天SOHO', 'Ideacentre AIO',
  'Inspiron 30', 'Inspiron 20', 'Inspiron 24',
  'C560', 'C540', 'C340', 'C240', 'C200',
  'B550', 'B540', 'B50', 'B40', 'B30',
  'MD087CH', 'MD093', 'MD094', 'MD095', 'MD096',
];

function isAIOComputer(name: string, model: string, description: string | null, brand: string): boolean {
  // 品牌必须是电脑品牌
  if (!AIO_COMPUTER_BRANDS.includes(brand)) return false;

  // 排除打印机多功能一体机型号（如 HP LaserJet M1136、兄弟 DCP-xxx 等）
  for (const prefix of PRINTER_MFP_MODEL_PREFIXES) {
    if (model.startsWith(prefix)) return false;
  }

  // 检查名称：包含"一体机"但排除"多功能一体机"、"打印一体机"、"喷墨一体机"
  if (name.includes('一体机') || name.includes('一体电脑')) {
    if (/打印|喷墨|多功能一体机/.test(name)) return false;
    return true;
  }

  // 检查描述：描述含"一体机"但排除"多功能一体机"模式
  if (description) {
    // 描述含"一体机"且不含"打印机"、"多功能"等打印机相关词
    if (/一体机|一体电脑/.test(description) &&
        !/打印机|多功能|喷墨|激光|打印一体/.test(description)) {
      return true;
    }
  }

  // 检查型号前缀
  for (const prefix of AIO_COMPUTER_MODEL_PREFIXES) {
    if (model.startsWith(prefix)) return true;
  }

  // 戴尔 OptiPlex 型号中的 AIO 特征（如 optiplen9010A 是 OptiPlex 9010 AIO）
  if (brand === '戴尔' && /optiplex|optiplen/i.test(model)) {
    // 排除纯台式机型号（无 AIO 特征）
    if (/aio|all.?in.?one/i.test(model)) return true;
  }

  // 苹果 MD/MC 开头（如 iMac 的型号 MD087CH）
  if (brand === '苹果' && /^MD|^MC/.test(model)) return true;

  return false;
}

// 判定是否为非电脑/非打印机的边缘产品
function isEdgeProduct(name: string, model: string, brand: string, categoryLvl2: string): boolean {
  const text = `${name} ${model}`.toLowerCase();

  // 手机
  const phoneKeywords = ['iphone', '手机', 'phone', 'i9300', 'i9500', 'galaxy s', 'galaxy note'];
  if (phoneKeywords.some((k) => text.includes(k))) return true;

  // 平板/学习机（非笔记本）
  const tabletExclude = ['乐PAD', 'T7', 'T7S', 'E人E本'];
  if (tabletExclude.some((k) => text.includes(k)) && categoryLvl2 !== '笔记本') return true;

  // 支票打印机/热敏打印机/票据打印机等非标打印设备
  const edgePrinterKeywords = ['支票', '热敏', '票据', '条码', '标签', '针式', '平推'];
  if (edgePrinterKeywords.some((k) => text.includes(k))) return true;

  return false;
}

// 生成标签
function generateTags(brand: string, categoryLvl1: string, categoryLvl2: string, name: string, description: string | null): string[] {
  const tags: string[] = [];
  const text = `${name} ${description ?? ''}`;

  // 按分类基础标签
  if (categoryLvl1 === '电脑整机') {
    tags.push(categoryLvl2 === '台式机' ? '台式机' : '笔记本');
  } else if (categoryLvl1 === '打印设备') {
    tags.push('打印机');
    switch (categoryLvl2) {
      case '喷墨打印机':
        tags.push('喷墨打印机');
        break;
      case '多功能一体机':
        tags.push('多功能一体机');
        break;
      case '复印机':
        tags.push('复印机');
        break;
      default:
        tags.push('打印机');
    }
  }

  // 颜色/幅面
  if (/(彩色|color|colour)/i.test(text) && !tags.includes('彩色')) tags.push('彩色');
  if (/(黑白|mono|b&w)/i.test(text) && !tags.includes('黑白')) tags.push('黑白');
  if (/(A3|A3幅面)/i.test(text) && !tags.includes('A3幅面')) tags.push('A3幅面');
  if (/(A4|A4幅面)/i.test(text) && !tags.includes('A4幅面')) tags.push('A4幅面');

  return tags;
}

// ============================================================
// 5. 接口定义
// ============================================================
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

// ============================================================
// 6. 逐条处理
// ============================================================
function processProduct(p: RawProduct): CleanProduct | null {
  // --- 品牌处理 ---
  let brand = p.brand ?? '';
  if (!brand || DISCARD_BRANDS.has(brand.trim())) return null;
  if (isEdgeBrand(brand)) return null;
  if (BRAND_MAP[brand.trim()]) brand = BRAND_MAP[brand.trim()];
  // 过滤非常识品牌
  if (!COMMON_BRANDS.has(brand)) return null;

  // --- 分类处理 ---
  const lvl1 = p.categoryLvl1 ?? '';
  const lvl2 = p.categoryLvl2 ?? '';
  if (!lvl1 || !lvl2) return null;

  // 仅保留电脑整机 和 打印设备
  let finalLvl1 = lvl1;
  let finalLvl2 = lvl2;

  // 修正：一体机电脑误分类到打印设备/多功能一体机
  if (lvl1 === '打印设备' && lvl2 === '多功能一体机') {
    const name = p.name ?? '';
    const model = p.model ?? '';
    const desc = p.description ?? '';
    if (isAIOComputer(name, model, desc, brand)) {
      finalLvl1 = '电脑整机';
      finalLvl2 = '台式机';
    }
  }

  // 仅保留电脑整机(台式机/笔记本) 和 打印设备(打印机/复印机/多功能一体机/激光打印机/喷墨打印机)
  if (finalLvl1 === '电脑整机') {
    if (!['台式机', '笔记本'].includes(finalLvl2)) return null;
  } else if (finalLvl1 === '打印设备') {
    const allowedPrintLvl2 = ['打印机', '复印机', '多功能一体机', '激光打印机', '喷墨打印机'];
    if (!allowedPrintLvl2.includes(finalLvl2)) return null;
  } else {
    return null;
  }

  // --- 边缘产品过滤 ---
  const rawName = p.name ?? '';
  const rawModel = p.model ?? '';
  if (isEdgeProduct(rawName, rawModel, brand, finalLvl2)) return null;

  // 特殊处理：苹果 iPhone 等非电脑产品
  if (brand === '苹果' && /iphone|ipad/i.test(rawName)) return null;
  // E人E本平板非电脑
  if (brand === 'E人E本') return null;
  // 联想乐PAD平板
  if (brand === '联想' && /乐PAD|乐pad/i.test(rawName)) return null;

  // --- 型号处理 ---
  const rawModelText = (p.model ?? p.name ?? '').trim();
  let model = rawModelText;

  // 从描述中提取真正的型号（如果当前型号是品类词或无意义）
  const desc = p.description ?? '';
  // 特殊型号修正：已知的误匹配
  if (model === 'A3' && brand === '联想' && /lj6150/i.test(desc)) {
    model = 'LJ6150';
  }

  // 去除开头品牌名
  if (brand && model.startsWith(brand)) {
    model = model.slice(brand.length).trim();
  }
  // 去除英文品牌别名
  const brandAliases: Record<string, string[]> = {
    '惠普': ['HP', 'hp', 'Hp'],
    '戴尔': ['DELL', 'dell', 'Dell'],
    '联想': ['Lenovo', 'lenovo'],
    '三星': ['SAMSUNG', 'samsung'],
    '佳能': ['CANON', 'canon'],
    '兄弟': ['BROTHER', 'brother'],
    '爱普生': ['EPSON', 'epson'],
    '富士施乐': ['XEROX', 'xerox', 'FujiXerox'],
    '柯尼卡美能达': ['KONICA', 'konica', 'KonicaMinolta', '美能达'],
  };
  const aliases = brandAliases[brand] ?? [];
  for (const al of aliases) {
    if (model === al || model.startsWith(al)) {
      model = model.slice(al.length).trim();
    }
  }

  // 去除品类前缀
  const catPrefixes = [
    '台式机', '笔记本', '打印机', '复印机', '激光打印机', '喷墨打印机',
    '多功能一体机', '彩色打印机', '一体机', '速印机', '主机', '一体电脑',
    '商用一体机', '照片打印机', '彩色激光打印机',
  ];
  for (const prefix of catPrefixes) {
    if (model.startsWith(prefix) && model.length > prefix.length) {
      model = model.slice(prefix.length).trim();
    }
    if (model.endsWith(prefix) && model.length > prefix.length) {
      model = model.slice(0, model.length - prefix.length).trim();
    }
  }

  // 去除非型号结尾的选配信息
  model = model.split(/[+＋]/)[0].trim();

  // 应用品牌级型号修正
  model = fixModel(brand, model);

  if (!model) model = rawModelText;

  // --- 名称生成 ---
  const name = `${brand} ${model}`.trim();

  // --- 描述处理 ---
  const descParts: string[] = [];
  if (desc && desc.trim() && desc.trim() !== p.name.trim() && desc.trim() !== rawModelText) {
    descParts.push(desc.trim());
  }
  const description = descParts.length ? descParts.join('；') : null;

  // --- 标签生成 ---
  const tags = generateTags(brand, finalLvl1, finalLvl2, name, description);

  return {
    brand,
    categoryLvl1: finalLvl1,
    categoryLvl2: finalLvl2,
    model,
    name,
    description,
    unit: p.unit || '台',
    costPrice: p.costPrice,
    tags,
  };
}

// ============================================================
// 7. 主流程
// ============================================================
const TAG_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

function tagColor(i: number): string {
  return TAG_COLORS[i % TAG_COLORS.length];
}

async function main() {
  if (!fs.existsSync(EXPORT_PATH)) {
    throw new Error(`找不到导出文件: ${EXPORT_PATH}，请先运行 pnpm db:dump-products`);
  }

  const raw = JSON.parse(fs.readFileSync(EXPORT_PATH, 'utf-8')) as { products: RawProduct[] };
  const total = raw.products.length;

  console.log(`模式：${EXECUTE ? '⚠️ 真实执行' : '🔍 仅统计（DRY-RUN）'}`);
  console.log(`原始产品总数: ${total}`);

  // ===== 逐条处理 =====
  const cleaned: CleanProduct[] = [];
  const discarded: { code: string; reason: string }[] = [];

  for (const p of raw.products) {
    const c = processProduct(p);
    if (!c) {
      discarded.push({ code: p.code, reason: `品牌:${p.brand} | 名称:${p.name}` });
    } else {
      cleaned.push(c);
    }
  }

  // ===== 统计 =====
  console.log(`\n=== 处理结果 ===`);
  console.log(`保留: ${cleaned.length}`);
  console.log(`丢弃: ${discarded.length}`);

  const brands = Array.from(new Set(cleaned.map((c) => c.brand))).sort();
  const categories = Array.from(
    new Set(cleaned.map((c) => `${c.categoryLvl1}/${c.categoryLvl2}`)),
  ).sort();
  const allTags = Array.from(new Set(cleaned.flatMap((c) => c.tags))).sort();

  console.log(`品牌数: ${brands.length}`);
  console.log(`分类数: ${categories.length}`);
  console.log(`标签数: ${allTags.length}`);

  console.log(`\n保留品牌: ${brands.join(', ')}`);
  console.log(`保留分类: ${categories.join(', ')}`);

  // ===== 丢弃样例 =====
  console.log(`\n— 丢弃样例（前 30） —`);
  discarded.slice(0, 30).forEach((d) => console.log(`  [${d.code}] ${d.reason}`));
  if (discarded.length > 30) console.log(`  ... 其余 ${discarded.length - 30} 条略`);

  // ===== 清洗后样例 =====
  console.log(`\n— 清洗后前 30 条样例 —`);
  for (const c of cleaned.slice(0, 30)) {
    console.log(`  [${c.brand}] ${c.name}  | model=${c.model} | ${c.categoryLvl1}/${c.categoryLvl2} | tags=[${c.tags.join(',')}]`);
  }

  // ===== 输出清洗后 JSON =====
  const outDir = path.dirname(OUTPUT_PATH);
  fs.mkdirSync(outDir, { recursive: true });

  const outputData = {
    categories: [...new Set(cleaned.map((c) => `${c.categoryLvl1}/${c.categoryLvl2}`))]
      .sort()
      .map((k) => {
        const [lvl1, lvl2] = k.split('/');
        return { lvl1, lvl2 };
      }),
    brands,
    products: cleaned.map((c) => ({
      name: c.name,
      model: c.model,
      brand: c.brand,
      categoryLvl1: c.categoryLvl1,
      categoryLvl2: c.categoryLvl2,
      unit: c.unit,
      price: c.costPrice,
      tags: c.tags,
    })),
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(outputData, null, 2), 'utf-8');
  console.log(`\n清洗数据已写入: ${OUTPUT_PATH}`);

  if (!EXECUTE) {
    console.log('\n未加 execute 参数，未修改数据库。确认后运行：');
    console.log('  pnpm db:process-products execute');
    return;
  }

  // ===== 真实执行：清空 + 重建 =====
  console.log('\n=== 清空旧产品库数据 ===');
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

  // ===== 创建分类树 =====
  console.log('创建分类树...');
  const lvl1Map = new Map<string, string>();
  for (const lvl1 of Array.from(new Set(categories.map((c) => c.split('/')[0])))) {
    const created = await prisma.category.create({
      data: { name: lvl1, description: `${lvl1}（一级分类）`, sortOrder: 0 },
    });
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
      const created = await prisma.category.create({
        data: { name: b, parentId: lvl1Map.get(a), description: `${a} / ${b}`, sortOrder: order++ },
      });
      catMap.set(`${a}/${b}`, created.id);
    }
  }
  console.log(`分类树: ${lvl1Map.size} 一级, ${catMap.size} 二级`);

  // ===== 创建品牌 =====
  console.log('创建品牌...');
  const brandMap = new Map<string, string>();
  let bo = 0;
  for (const b of brands) {
    const created = await prisma.brand.create({ data: { name: b, sortOrder: bo++ } });
    brandMap.set(b, created.id);
  }
  console.log(`品牌: ${brandMap.size}`);

  // ===== 创建标签 =====
  console.log('创建标签...');
  const tagMap = new Map<string, string>();
  let to = 0;
  for (const t of allTags) {
    const created = await prisma.productTag.create({
      data: { name: t, color: tagColor(to++), description: `自动生成标签：${t}` },
    });
    tagMap.set(t, created.id);
  }
  console.log(`标签: ${tagMap.size}`);

  // ===== 导入产品 =====
  console.log('导入产品...');
  let ok = 0;
  let skip = 0;
  let codeSeq = 1;
  for (const c of cleaned) {
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