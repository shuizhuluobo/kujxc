/**
 * 一次性脚本：为存量产品生成常用快速筛选标签。
 *
 * 标签按产品 name（品牌型号）关键词 + 分类兜底自动匹配，跨分类平铺，
 * 供报价单选择器「平铺标签快速筛选」使用。
 *
 * 运行：pnpm db:gen-tags
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TagDef {
  name: string;
  color: string;
  description: string;
  /** 产品名称关键词（正则片段） */
  keywords: string[];
  /** 分类兜底：命中这些分类也打上标签 */
  categories?: string[];
}

const TAGS: TagDef[] = [
  {
    name: '打印耗材',
    color: '#E6A23C',
    description: '墨盒/硒鼓/碳粉/色带等打印机消耗品',
    keywords: [
      '墨盒', '硒鼓', '碳粉', '色带', '粉仓', '粉盒', '粉筒', '显影', '定影',
      '清洁纸', '搓纸轮', '感光鼓', '套鼓', '鼓芯', '鼓组件', '热辊', '定影膜',
      '载体', '废粉', '刮板', '充电辊', '定影器', '芯片',
    ],
  },
  {
    name: '打印设备',
    color: '#409EFF',
    description: '打印机/复印机/传真机等办公输出设备',
    keywords: ['打印机', '复印机', '传真机', '多功能一体机', '激光一体机', '喷墨一体机', '打印一体机', '速印机'],
  },
  {
    name: '电脑整机',
    color: '#409EFF',
    description: '台式机/笔记本/一体机/服务器等整机',
    keywords: ['台式', '笔记本', '平板', '一体机', '主机', '工作站', '服务器', '迷你主机', '迷你电脑', 'mini主机', 'mini电脑', '瘦客户机'],
  },
  {
    name: '电脑配件',
    color: '#67C23A',
    description: '显卡/主板/内存/键盘等电脑升级部件',
    keywords: ['显卡', '主板', 'CPU', '处理器', '散热', '风扇', '键盘', '鼠标', '机箱', '光驱', '声卡', '网卡', '内存', '固态', 'SSD', '硬盘', 'U盘'],
  },
  {
    name: '网络设备',
    color: '#B37FEB',
    description: '交换机/路由器/无线/防火墙等网络设备',
    keywords: [
      '交换机', '路由器', '无线', '防火墙', '网关', '网桥', '光猫', '收发器',
      '光模块', '负载均衡', 'AP面板', '无线网卡', '调制解调器',
    ],
    categories: ['网络安全'],
  },
  {
    name: '监控安防',
    color: '#F56C6C',
    description: '摄像头/录像机/门禁等监控安防设备',
    keywords: ['摄像头', '摄像机', '监控', '录像机', 'NVR', 'DVR', '门禁', '报警', '拾音', '红外对射', '声光报警'],
    categories: ['监控设备'],
  },
  {
    name: '存储介质',
    color: '#909399',
    description: 'U盘/硬盘/存储卡/光盘等存储介质',
    keywords: ['U盘', '存储卡', 'SD卡', '内存卡', '移动硬盘', '固态', 'SSD', '硬盘', '光盘', '光驱', '刻录', '闪存', '读卡器'],
  },
  {
    name: '线材线缆',
    color: '#67C23A',
    description: '网线/电源线/HDMI/数据线等线材线缆',
    keywords: ['网线', '电源线', 'HDMI', 'VGA', '数据线', '充电线', '音频线', '光纤', '线缆', '排线', '视频线', '连接线', '转接线', 'USB线', '线材', '话筒线', '转接头'],
    categories: ['线材'],
  },
  {
    name: '电源配件',
    color: '#E6A23C',
    description: '适配器/充电器/电池/UPS 等电源配件',
    keywords: ['适配器', '充电器', '充电头', '充电宝', '移动电源', '电池', 'UPS', '稳压', '变压器', '电源板', '电源模块', '电源'],
  },
  {
    name: '音频设备',
    color: '#B37FEB',
    description: '音响/话筒/耳机/声卡等音频设备',
    keywords: ['音响', '音箱', '话筒', '麦克风', '耳机', '耳麦', '声卡', '功放', '调音台', '喇叭', '拾音器', '监听', '扩音', '回音壁'],
    categories: ['音响设备', '音响'],
  },
  {
    name: '办公文具',
    color: '#909399',
    description: '订书机/文件夹/计算器/笔等办公文具',
    keywords: ['订书机', '文件夹', '档案盒', '计算器', '胶带', '回形针', '起钉器', '打孔器', '剪刀', '裁纸', '白板', '订书钉', '笔筒', '标签纸', '便签', '圆珠笔', '钢笔', '签字笔', '马克笔', '白板笔', '铅笔', '水笔', '记号笔', '荧光笔'],
    categories: ['办公用品'],
  },
  {
    name: '投影显示',
    color: '#409EFF',
    description: '投影机/幕布/显示器等显示设备',
    keywords: ['投影', '幕布', '显示器', '液晶', 'LED屏', '拼接屏', '电子白板', '教学一体机'],
  },
];

function main() {
  return prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        category: { select: { name: true } },
      },
    });

    const defs = TAGS.map((def) => {
      const regex = new RegExp(def.keywords.join('|'));
      const catSet = new Set(def.categories ?? []);
      return { ...def, regex, catSet };
    });

    const productTags: Array<{ productId: string; tagName: string }> = [];
    for (const p of products) {
      for (const def of defs) {
        const hit =
          def.regex.test(p.name) || def.catSet.has(p.category?.name ?? '');
        if (hit) productTags.push({ productId: p.id, tagName: def.name });
      }
    }

    for (const def of defs) {
      await tx.productTag.upsert({
        where: { name: def.name },
        update: { color: def.color, description: def.description },
        create: { name: def.name, color: def.color, description: def.description },
      });
    }

    const tagRows = await tx.productTag.findMany({ where: { name: { in: defs.map((d) => d.name) } } });
    const tagIdByName = new Map(tagRows.map((t) => [t.name, t.id]));

    const relations = productTags
      .filter((r) => tagIdByName.has(r.tagName))
      .map((r) => ({ productId: r.productId, tagId: tagIdByName.get(r.tagName) as string }));

    await tx.productTagRelation.createMany({ data: relations, skipDuplicates: true });

    const counts = new Map<string, number>();
    for (const r of relations) counts.set(r.tagId, (counts.get(r.tagId) ?? 0) + 1);

    for (const def of defs) {
      const id = tagIdByName.get(def.name);
      console.log(`${def.name}: ${id ? (counts.get(id) ?? 0) : 0} 个产品`);
    }
    console.log(`合计: ${relations.length} 条标签关联, 覆盖 ${new Set(relations.map((r) => r.productId)).size} 个产品`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });