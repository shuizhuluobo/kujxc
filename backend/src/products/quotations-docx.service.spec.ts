import { ImageRun, TextRun } from 'docx';
import { QuotationsDocxService } from './quotations-docx.service';

// 隔离依赖链中的 ESM 包（uuid@13）与外部服务，仅测纯构建逻辑
jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('./quotations.service', () => ({ QuotationsService: class {} }));

/**
 * 报价单 DOCX 导出——媒体列（产品图片/证书）回归测试：
 * 1. 证书列必须尊重 selectedCerts 勾选子集（修复恒显示全量 certNames 的 bug）；
 * 2. 图片/证书以真实缩略图（ImageRun）嵌入，而非把 /uploads/ 路径当文本输出；
 * 3. 加载失败时回退为名称文本（证书），不静默丢信息。
 */

function buildService(): QuotationsDocxService {
  // 仅测纯构建逻辑，不触库
  return new QuotationsDocxService({} as never, {} as never);
}

/** 待测私有成员的类型化访问入口 */
interface Privates {
  fieldValue(item: unknown, idx: number, field: string): string;
  parseImageBytes(
    buf: Buffer,
  ): { type: string; width: number; height: number } | null;
  loadEmbeddedImage(url: string): Promise<{
    data: Buffer;
    type: 'png' | 'jpg' | 'gif' | 'bmp';
    width: number;
    height: number;
  } | null>;
  buildPriceTable(quotation: unknown, template: unknown): Promise<unknown>;
}
const priv = (s: QuotationsDocxService): Privates => s as unknown as Privates;

/** 构造仅含魔数+尺寸头部的最小图片缓冲（parseImageBytes 只读偏移，无需完整文件） */
function pngHeader(w: number, h: number): Buffer {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrLen = Buffer.from([0, 0, 0, 13]);
  const ihdrType = Buffer.from('IHDR', 'ascii');
  const dims = Buffer.alloc(8);
  dims.writeUInt32BE(w, 0);
  dims.writeUInt32BE(h, 4);
  return Buffer.concat([sig, ihdrLen, ihdrType, dims, Buffer.alloc(17)]);
}

function jpegHeader(w: number, h: number): Buffer {
  const soi = Buffer.from([0xff, 0xd8]);
  const sof = Buffer.from([
    0xff,
    0xc0,
    0x00,
    0x11,
    0x08,
    (h >> 8) & 0xff,
    h & 0xff,
    (w >> 8) & 0xff,
    w & 0xff,
  ]);
  return Buffer.concat([soi, sof, Buffer.alloc(16)]);
}

const gifHeader = (w: number, h: number): Buffer => {
  const b = Buffer.concat([Buffer.from('GIF89a', 'ascii'), Buffer.alloc(30)]);
  b.writeUInt16LE(w, 6);
  b.writeUInt16LE(h, 8);
  return b;
};

const bmpHeader = (w: number, h: number): Buffer => {
  const b = Buffer.alloc(40);
  b.write('BM', 0, 'ascii');
  b.writeInt32LE(w, 18);
  b.writeInt32LE(h, 22);
  return b;
};

/** 遍历 docx 对象树收集指定类实例（XmlComponent 均以 .root 数组承载子节点） */
function collectInstances<T>(
  node: unknown,
  klass: new (...args: never[]) => T,
): T[] {
  const out: T[] = [];
  const seen = new Set<unknown>();
  const walk = (cur: unknown): void => {
    if (cur == null || typeof cur !== 'object' || seen.has(cur)) return;
    seen.add(cur);
    if (cur instanceof klass) {
      out.push(cur);
      return;
    }
    const root = (cur as { root?: unknown }).root;
    if (root !== undefined) {
      walk(root);
      return;
    }
    if (Array.isArray(cur)) {
      cur.forEach(walk);
      return;
    }
    for (const value of Object.values(cur as Record<string, unknown>))
      walk(value);
  };
  walk(node);
  return out;
}

/** 遍历 docx 对象树收集全部可见文本（TextRun 的 root 内字符串） */
function collectText(node: unknown): string[] {
  return collectInstances(node, TextRun).map((run) =>
    collectStrings((run as unknown as { root: unknown }).root).join(''),
  );
}

function collectStrings(node: unknown): string[] {
  const out: string[] = [];
  const seen = new Set<unknown>();
  const walk = (cur: unknown): void => {
    if (cur == null || seen.has(cur)) return;
    seen.add(cur);
    if (typeof cur === 'string' || typeof cur === 'number') {
      out.push(String(cur));
      return;
    }
    if (Array.isArray(cur)) {
      cur.forEach(walk);
      return;
    }
    if (typeof cur === 'object') {
      for (const value of Object.values(cur as Record<string, unknown>))
        walk(value);
    }
  };
  walk(node);
  return out;
}

const mkItem = (over: Record<string, unknown>) => ({ ...over }) as never;

describe('QuotationsDocxService 证书列取数语义', () => {
  it('fieldValue("certs") 尊重 selectedCerts 勾选子集并映射 certNames', () => {
    const service = buildService();
    const item = mkItem({
      productSnapshot: {
        certs: ['/uploads/cert-iso.pdf', '/uploads/cert-ce.png'],
        certNames: ['ISO 证书', 'CE 证书'],
      },
      selectedCerts: ['/uploads/cert-ce.png'],
    });
    const value = priv(service).fieldValue(item, 0, 'certs');
    // 回归：旧逻辑忽略勾选，恒返回「ISO 证书\nCE 证书」
    expect(value).toBe('CE 证书');
  });

  it('certNames 缺失时回退为文件名而非原始路径拼接', () => {
    const service = buildService();
    const item = mkItem({
      productSnapshot: { certs: ['/uploads/a/b%20证.png'] },
      selectedCerts: ['/uploads/a/b%20证.png'],
    });
    const value = priv(service).fieldValue(item, 0, 'certs');
    expect(value).toBe('b 证.png');
  });

  it('未勾选时回退快照全量证书', () => {
    const service = buildService();
    const item = mkItem({
      productSnapshot: {
        certs: ['/uploads/x.pdf', '/uploads/y.png'],
        certNames: ['甲', '乙'],
      },
    });
    const value = priv(service).fieldValue(item, 0, 'certs');
    expect(value.split('\n')).toEqual(['甲', '乙']);
  });
});

describe('QuotationsDocxService.parseImageBytes', () => {
  let service: QuotationsDocxService;
  beforeAll(() => {
    service = buildService();
  });

  const parse = (buf: Buffer) => priv(service).parseImageBytes(buf);

  it('识别 PNG 并读取宽高', () => {
    expect(parse(pngHeader(800, 600))).toMatchObject({
      type: 'png',
      width: 800,
      height: 600,
    });
  });
  it('识别 JPEG 并读取宽高', () => {
    expect(parse(jpegHeader(640, 480))).toMatchObject({
      type: 'jpg',
      width: 640,
      height: 480,
    });
  });
  it('识别 GIF 并读取宽高', () => {
    expect(parse(gifHeader(320, 240))).toMatchObject({
      type: 'gif',
      width: 320,
      height: 240,
    });
  });
  it('识别 BMP 并读取宽高', () => {
    expect(parse(bmpHeader(100, 50))).toMatchObject({
      type: 'bmp',
      width: 100,
      height: 50,
    });
  });
  it('PDF 证书不支持位图嵌入返回 null', () => {
    const pdf = Buffer.concat([
      Buffer.from('%PDF-1.4\n', 'ascii'),
      Buffer.alloc(40),
    ]);
    expect(parse(pdf)).toBeNull();
  });
});

describe('QuotationsDocxService.buildPriceTable 媒体列嵌图', () => {
  const columns = [
    {
      key: 'name',
      label: '产品名称',
      type: 'field',
      field: 'name',
      visible: true,
    },
    {
      key: 'images',
      label: '产品图片',
      type: 'field',
      field: 'images',
      visible: true,
    },
    {
      key: 'certs',
      label: '产品证书',
      type: 'field',
      field: 'certs',
      visible: true,
    },
  ];
  const template = { config: { columns, mergeKey: 'name' } };

  const quotationWithMedia = {
    items: [
      mkItem({
        productSnapshot: {
          name: '产品A',
          images: ['/uploads/a.png', '/uploads/b.jpg'],
          certs: ['/uploads/cert-iso.pdf', '/uploads/cert-ce.png'],
          certNames: ['ISO 证书', 'CE 证书'],
        },
        selectedImages: ['/uploads/a.png'],
        // 勾选含 PDF 证书的混合子集：位图嵌图、PDF 走名称文本
        selectedCerts: ['/uploads/cert-iso.pdf', '/uploads/cert-ce.png'],
      }),
    ],
  };

  it('图片与位图证书以 ImageRun 嵌入，路径不再作为文本泄漏', async () => {
    const service = buildService();
    jest.spyOn(priv(service), 'loadEmbeddedImage').mockResolvedValue({
      data: pngHeader(800, 600),
      type: 'png',
      width: 800,
      height: 600,
    });

    const table = await priv(service).buildPriceTable(
      quotationWithMedia,
      template,
    );

    const images = collectInstances(table, ImageRun);
    // 产品图片 1 张 + 位图证书 1 张（PDF 证书走名称文本）
    expect(images.length).toBe(2);
    // 嵌图成功时整表不应出现任何 /uploads/ 路径文本
    const texts = collectText(table).join('\n');
    expect(texts).not.toContain('/uploads/');
    // 混合选择中的 PDF 证书保留名称兜底
    expect(texts).toContain('ISO 证书');
  });

  it('加载失败回退：证书显示名称、图片显示路径，不中断导出', async () => {
    const service = buildService();
    jest.spyOn(priv(service), 'loadEmbeddedImage').mockResolvedValue(null);

    const table = await priv(service).buildPriceTable(
      quotationWithMedia,
      template,
    );

    expect(collectInstances(table, ImageRun).length).toBe(0);
    const texts = collectText(table).join('\n');
    expect(texts).toContain('/uploads/a.png'); // 图片回退路径
    expect(texts).toContain('ISO 证书'); // 勾选的证书回退名称
    expect(texts).toContain('CE 证书');
  });
});
