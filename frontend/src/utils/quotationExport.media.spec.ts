/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { exportQuotationToPdf, exportQuotationToExcel } from './quotationExport';
import { loadImageThumb } from './quotationImages';
import type { Mock } from 'vitest';
import type { Quotation, QuotationTemplateColumn } from '@/types';

/**
 * 报价单导出——媒体列（产品图片/证书）回归测试：
 * 1. 结构断言：xlsx 内嵌 media/drawing、PDF 含 paintImageXObject 绘图指令；
 * 2. 路径泄漏断言：产物中不得出现 /uploads/ 原始路径文本（正是线上 bug 的形态）。
 */

// 1x1 PNG
const FAKE_PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

vi.mock('./quotationImages', async (importOriginal) => {
    const actual = await importOriginal<typeof import('./quotationImages')>();
    return {
        ...actual,
        // 默认全部加载成功；各用例可再覆盖返回值
        loadImageThumb: vi.fn(() =>
            Promise.resolve({ dataUrl: `data:image/png;base64,${FAKE_PNG_B64}`, width: 60, height: 45 }),
        ),
    };
});

let captured: Blob | null = null;

beforeAll(() => {
    const files: Record<string, string> = {
        '/fonts/simsun-subset.ttf': 'simsun-subset.ttf',
        '/fonts/notosans-bold-subset.ttf': 'notosans-bold-subset.ttf',
    };
    vi.stubGlobal('fetch', ((url: string) => {
        const name = files[url];
        if (!name) return { ok: false } as Response;
        const bytes = readFileSync(`${process.cwd()}/public/fonts/${name.split('/').pop()}`);
        return {
            ok: true,
            arrayBuffer: () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
        } as unknown as Response;
    }) as unknown as typeof fetch);

    Object.defineProperty(URL, 'createObjectURL', {
        value: (b: Blob) => {
            captured = b;
            return 'blob:x';
        },
        configurable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', { value: () => {}, configurable: true });
});

const col = (key: string, label: string): QuotationTemplateColumn =>
    ({ key, label, visible: true, type: 'field', field: key }) as QuotationTemplateColumn;

const mkItem = (over: Record<string, unknown>) => ({ ...over }) as unknown as Quotation['items'][number];

const mkQuotation = (items: Quotation['items']): Quotation =>
    ({
        code: 'BJ-2608-00010',
        customerName: '测试客户',
        taxRate: 13,
        totalAmount: 100,
        taxAmount: 13,
        finalAmount: 113,
        items,
    }) as unknown as Quotation;

const itemWithMedia = mkItem({
    productSnapshot: {
        code: 'P-1',
        name: '产品A',
        images: ['/uploads/a.png', '/uploads/b.jpg'],
        certs: ['/uploads/cert-ce.png'],
        certNames: ['CE 证书'],
    },
    selectedImages: ['/uploads/a.png'],
    selectedCerts: ['/uploads/cert-ce.png'],
});

describe('Excel 导出媒体列：结构 + 路径泄漏', () => {
    const cfg = {
        columns: [col('code', '产品编号'), col('images', '产品图片'), col('certs', '产品证书')],
        titleFormat: '报价单',
        showTax: false,
        mergeKey: 'code',
    };

    async function writeAndReload() {
        await exportQuotationToExcel(mkQuotation([itemWithMedia]), { config: cfg } as never);
        expect(captured).toBeTruthy();
        const bytes = new Uint8Array(await captured!.arrayBuffer());
        const ExcelJSNS = await import('exceljs');
        const ExcelJS = (ExcelJSNS as unknown as { default?: typeof ExcelJSNS }).default ?? ExcelJSNS;
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(bytes as unknown as Parameters<typeof wb.xlsx.load>[0]);
        return wb;
    }

    it('图片与证书以真实缩略图嵌入（media/drawing），单元格路径文本被清除', async () => {
        const wb = await writeAndReload();
        const ws = wb.getWorksheet(1)!;

        // 结构断言：2 张缩略图（1 产品图 + 1 证书）进入工作簿媒体库并锚定到工作表
        expect(wb.model.media?.length).toBe(2);
        expect(ws.getImages().length).toBe(2);

        // 数据行第 4 行：B=图片 C=证书，路径文本应清空
        expect(String(ws.getCell('B4').value ?? '')).not.toContain('/uploads/');
        expect(String(ws.getCell('C4').value ?? '')).not.toContain('/uploads/');

        // 路径泄漏断言：整个工作簿模型不出现 /uploads/
        expect(JSON.stringify(wb.model)).not.toContain('/uploads/');
    });

    it('缩略图加载失败时回退路径文本（导出不中断）', async () => {
        (loadImageThumb as unknown as Mock).mockResolvedValueOnce(null); // images 列唯一一张失败
        try {
            const wb = await writeAndReload();
            const ws = wb.getWorksheet(1)!;
            // 证书列仍成功嵌入 1 张；图片列回退路径文本
            expect(ws.getImages().length).toBe(1);
            expect(JSON.stringify(wb.model)).toContain('/uploads/a.png');
        } finally {
            (loadImageThumb as unknown as Mock).mockResolvedValue({
                dataUrl: `data:image/png;base64,${FAKE_PNG_B64}`,
                width: 60,
                height: 45,
            });
        }
    });

    it('混有 PDF 证书时整格回退名称文本（全有或全无，避免图压字）', async () => {
        (loadImageThumb as unknown as Mock).mockImplementationOnce(() =>
            Promise.resolve({ dataUrl: `data:image/png;base64,${FAKE_PNG_B64}`, width: 60, height: 45 }),
        );
        const mixed = mkItem({
            productSnapshot: {
                code: 'P-2',
                name: '产品B',
                certs: ['/uploads/iso.pdf', '/uploads/ce.png'],
                certNames: ['ISO 证书', 'CE 证书'],
            },
            selectedCerts: ['/uploads/iso.pdf', '/uploads/ce.png'],
        });
        await exportQuotationToExcel(mkQuotation([mixed]), { config: cfg } as never);
        const bytes = new Uint8Array(await captured!.arrayBuffer());
        const ExcelJSNS = await import('exceljs');
        const ExcelJS = (ExcelJSNS as unknown as { default?: typeof ExcelJSNS }).default ?? ExcelJSNS;
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(bytes as unknown as Parameters<typeof wb.xlsx.load>[0]);
        const ws = wb.getWorksheet(1)!;
        // 证书列零嵌图，显示名称而非路径
        expect(ws.getCell('C4').value).toBe('ISO 证书\nCE 证书');
        expect(JSON.stringify(wb.model)).not.toContain('/uploads/');
    });
});

describe('PDF 导出媒体列：结构 + 路径泄漏', () => {
    it('明细表包含图片绘制指令，提取文本不含原始路径', async () => {
        const ok = await exportQuotationToPdf(mkQuotation([itemWithMedia]), 'download', {
            config: {
                columns: [col('code', '产品编号'), col('images', '产品图片'), col('certs', '产品证书')],
                titleFormat: '报价单',
                showTax: false,
                mergeKey: 'code',
            } as never,
        });
        expect(ok).toBe(true);
        expect(captured).toBeTruthy();
        const bytes = new Uint8Array(await captured!.arrayBuffer());

        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        const doc = await pdfjs.getDocument({ data: bytes, useSystemFonts: false }).promise;
        let imageOps = 0;
        let text = '';
        for (let p = 1; p <= doc.numPages; p++) {
            const page = await doc.getPage(p);
            const ops = await page.getOperatorList();
            imageOps += ops.fnArray.filter((fn) => fn === pdfjs.OPS.paintImageXObject).length;
            const content = await page.getTextContent();
            text += content.items.map((i) => ('str' in i ? i.str : '')).join('');
        }
        // 结构：产品图 + 证书共 2 个图片对象被绘制
        expect(imageOps).toBeGreaterThanOrEqual(2);
        // 路径泄漏断言
        expect(text).not.toContain('/uploads/');
        expect(text).toContain('P-1');
    });
});
