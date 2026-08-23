/**
 * 分析当前导出产品（temp/export/products_export.json）的命名问题，
 * 仅统计输出，不修改数据库。为制定统一命名/清洗规则提供依据。
 * 运行：pnpm db:analyze-products
 */
import * as fs from 'fs';
import * as path from 'path';

const FILE = path.resolve(__dirname, '..', 'temp', 'export', 'products_export.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf-8')) as {
  brands: string[];
  categories: string[];
  products: {
    code: string;
    name: string;
    description: string | null;
    model: string | null;
    unit: string;
    brand: string | null;
    categoryLvl1: string | null;
    categoryLvl2: string | null;
    tags: string[];
  }[];
};

const products = data.products;

// 1) 型号为空
const emptyModel = products.filter((p) => !p.model || !p.model.trim());
// 2) 型号=品牌（无意义）
const modelEqBrand = products.filter((p) => p.model && p.brand && p.model.trim() === p.brand.trim());
// 3) 型号含品类前缀（以 台式机/笔记本/打印机/复印机/激光打印机/喷墨打印机/多功能一体机/彩色打印机 等开头，含 "/" 分隔）
const PREFIXES = [
  '台式机', '笔记本', '打印机', '复印机', '激光打印机', '喷墨打印机',
  '多功能一体机', '彩色打印机', '一体机', '速印机',
];
const modelHasPrefix = products.filter((p) => {
  const m = (p.model ?? '').trim();
  return PREFIXES.some((pre) => m === pre || m.startsWith(pre + '/') || m.startsWith(pre + '('));
});
// 4) name 与 model 完全相同
const nameEqModel = products.filter((p) => p.model && p.name.trim() === p.model.trim());
// 5) name 以品类前缀开头
const nameHasPrefix = products.filter((p) => {
  const n = p.name.trim();
  return PREFIXES.some((pre) => n.startsWith(pre + '/') || n.startsWith(pre + '(') || n === pre);
});
// 6) 疑似脏品牌（含非标准字符、长度异常、含品类/用途词）
//    这里只列出可疑模式，供人工核对
const SUSPECT = ['废', '旧', '报废', '身份证', '二维码', '喷墨', '保密', '白板', '错题', '自动矫正', '多媒体教学', '触摸查询', '升降', '户外灯箱', '备份', '核查测温', '票据', '支票', '热敏', 'UV', '高精'];
const suspectBrands = data.brands.filter((b) => SUSPECT.some((s) => b.includes(s)) || b.length > 8);
// 7) 品牌疑似重复/别名（粗略：包含关系）
const dupBrands: string[] = [];
for (let i = 0; i < data.brands.length; i++) {
  for (let j = 0; j < data.brands.length; j++) {
    if (i !== j) {
      const a = data.brands[i];
      const b = data.brands[j];
      if (a.includes(b) && a.length > b.length && b.length >= 2) {
        dupBrands.push(`${a}  ⊂  ${b}`);
      }
    }
  }
}

console.log(`总产品数: ${products.length}`);
console.log(`空型号: ${emptyModel.length}`);
console.log(`型号=品牌(无意义): ${modelEqBrand.length}`);
console.log(`型号含品类前缀: ${modelHasPrefix.length}`);
console.log(`名称=型号: ${nameEqModel.length}`);
console.log(`名称含品类前缀: ${nameHasPrefix.length}`);
console.log(`\n品牌总数: ${data.brands.length}`);
console.log(`疑似脏/异常品牌(${suspectBrands.length}):`);
suspectBrands.forEach((b) => console.log(`   - ${b}`));
console.log(`\n疑似品牌别名(集合关系, ${dupBrands.length}):`);
dupBrands.forEach((d) => console.log(`   - ${d}`));

// 各二级分类下型号含前缀数量
console.log(`\n各二级分类 型号含品类前缀 计数:`);
const byCat = new Map<string, { total: number; bad: number }>();
for (const p of products) {
  const k = `${p.categoryLvl1}/${p.categoryLvl2}`;
  if (!byCat.has(k)) byCat.set(k, { total: 0, bad: 0 });
  byCat.get(k)!.total++;
  if (modelHasPrefix.includes(p)) byCat.get(k)!.bad++;
}
for (const [k, v] of byCat) console.log(`   ${k}: ${v.bad}/${v.total}`);
