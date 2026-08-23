/**
 * 精准扫描：仅找出“型号/名称本身即配件/耗材/非整机”的产品（内存条、SSD、主板、CPU、装订器等），
 * 排除整机（其描述含配置词但本身是整机）。供逐条语义判断。仅统计，不改库。
 * 运行：pnpm db:scan-accessories
 */
import * as fs from 'fs';
import * as path from 'path';

const FILE = path.resolve(__dirname, '..', 'temp', 'export', 'products_export.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf-8')) as {
  products: {
    code: string; name: string; description: string | null; model: string | null;
    brand: string | null; categoryLvl1: string | null; categoryLvl2: string | null;
    tags: string[];
  }[];
};

// 型号/名称本身即配件品类（精确）
const ACCESSORY_PATTERNS: { kind: string; re: RegExp }[] = [
  { kind: '内存', re: /(^|\s)(DDR\d|DDR|SDRAM|内存|RAM|Memory|mem)\b|^\d+G$|^\d+g$|^\d+G\d|^[\d.]+G?DDR|固态|SSD|ssd|NVMe|硬盘/i },
  { kind: '主板', re: /主板|主板$|M\.?ATX|\b(B\d{2,3}[AM]?\d*|H\d{2,3}[AM]?\d*|H[ABC]\d{2,3}|Z\d{2,3}[AM]?\d*|X\d{2,3}[AM]?\d*|Q\d{2,3}[AM]?\d*)\b.*主板/i },
  { kind: 'CPU', re: /^(i\d|I\d|Ryzen|锐龙|酷睿|Core|AMD|INTEL|CPU|处理器|ultra\s*\d)/i },
  { kind: '选配件', re: /^(装订|装订器|纸盒|双面器|分页|进纸|出纸|下纸盒|上纸盒|多纸盒|转印|感光鼓|硒鼓|鼓|墨盒|墨仓|碳粉|粉盒|色带|墨水|打印头|喷头|定影|搓纸|废粉|显影|载体|芯片|清洁|刮板|辊|支架|底座|托架|电源|适配器|数据线|连接线|排插|插排|螺丝|工具|套装|扩展坞|集线器|hub|读卡器|光驱)\b/i },
];

// 已知整机系列（出现则视为整机，不算配件）
const WHOLE_UNIT = /(Bizhub|启天|扬天|Think|Idea|Inspiron|OptiPlex|Vostro|Precision|ProDesk|EliteDesk|EliteBook|ProBook|MacBook|Macbook|MateBook|MateStation|拯救者|小新|天逸|刃|开天|超锐|超翔|逸|XPS|ROG|星|Storage|IPC|NAS|CM\d|CP\d|HL-|DCP-|MFC-|LBP|EcoTank|LaserJet|MateB|Mateb)/i;

const results: { kind: string; p: any }[] = [];
let wholeUnitSkipped = 0;
for (const p of data.products) {
  const text = `${p.brand} ${p.model} ${p.name}`.trim();
  if (WHOLE_UNIT.test(text)) {
    wholeUnitSkipped++;
    continue;
  }
  for (const { kind, re } of ACCESSORY_PATTERNS) {
    if (re.test(p.model ?? '') || re.test(p.name ?? '')) {
      results.push({ kind, p });
      break;
    }
  }
}

console.log(`精准命中疑似配件: ${results.length}（已排除整机系列 ${wholeUnitSkipped} 条）\n`);
const byKind: Record<string, number> = {};
for (const r of results) byKind[r.kind] = (byKind[r.kind] ?? 0) + 1;
console.log('按类型:', byKind, '\n');
for (const { kind, p } of results) {
  console.log(`[${kind}] ${p.categoryLvl1}/${p.categoryLvl2} | ${p.brand} | ${p.name} | model=${p.model}`);
}
