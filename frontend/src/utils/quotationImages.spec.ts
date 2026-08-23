import { describe, it, expect } from 'vitest';
import {
    collectItemMediaEntries,
    fileNameOfUrl,
    isDocumentMedia,
    isMediaColumnKey,
} from './quotationImages';
import type { QuotationItem } from '@/types';

const mkItem = (over: Partial<QuotationItem>): QuotationItem =>
    ({
        productSnapshot: {},
        quantity: 1,
        unitPrice: 0,
        subtotal: 0,
        displayOrder: 0,
        ...over,
    }) as QuotationItem;

describe('isMediaColumnKey / isDocumentMedia / fileNameOfUrl', () => {
    it('仅 images/certs 为媒体列', () => {
        expect(isMediaColumnKey('images')).toBe(true);
        expect(isMediaColumnKey('certs')).toBe(true);
        expect(isMediaColumnKey('certificates')).toBe(false);
        expect(isMediaColumnKey('name')).toBe(false);
        expect(isMediaColumnKey(undefined)).toBe(false);
    });

    it('PDF 为文档型证书，图片不是', () => {
        expect(isDocumentMedia('/uploads/a.pdf')).toBe(true);
        expect(isDocumentMedia('/uploads/a.PDF?x=1')).toBe(true);
        expect(isDocumentMedia('/uploads/a.pdf.bak')).toBe(false);
        expect(isDocumentMedia('/uploads/b.png')).toBe(false);
        expect(isDocumentMedia('https://cdn.example.com/c.jpg#page=1')).toBe(false);
    });

    it('fileNameOfUrl 去路径、去查询参数并解码', () => {
        expect(fileNameOfUrl('/uploads/dir/证 书.png?v=2')).toBe('证 书.png');
        expect(fileNameOfUrl('https://x.y/a/b%20c.jpg')).toBe('b c.jpg');
        expect(fileNameOfUrl('plain.png')).toBe('plain.png');
    });
});

describe('collectItemMediaEntries.images 取数语义', () => {
    it('selectedImages 优先于快照全量', () => {
        const item = mkItem({
            productSnapshot: { images: ['/uploads/1.png', '/uploads/2.png'] },
            selectedImages: ['/uploads/2.png'],
        });
        expect(collectItemMediaEntries(item, 'images').map((e) => e.url)).toEqual(['/uploads/2.png']);
    });

    it('未勾选时回退快照全量；非字符串项被过滤', () => {
        const item = mkItem({
            productSnapshot: { images: ['/uploads/1.png', null, { url: '/uploads/3.webp' }] },
        });
        expect(collectItemMediaEntries(item, 'images').map((e) => e.url)).toEqual([
            '/uploads/1.png',
            '/uploads/3.webp',
        ]);
    });
});

describe('collectItemMediaEntries.certs 取数语义（回归：必须尊重勾选子集）', () => {
    it('selectedCerts 子集优先，名称经 snap.certs↔snap.certNames 平行数组映射', () => {
        const item = mkItem({
            productSnapshot: {
                certs: ['/uploads/iso.pdf', '/uploads/ce.png'],
                certNames: ['ISO 证书', 'CE 证书'],
            },
            selectedCerts: ['/uploads/ce.png'],
        });
        // 回归：旧 fieldValue 忽略勾选恒返回全量名称
        expect(collectItemMediaEntries(item, 'certs')).toEqual([{ url: '/uploads/ce.png', label: 'CE 证书' }]);
    });

    it('勾选的 URL 不在快照列表中时回退文件名', () => {
        const item = mkItem({
            productSnapshot: { certs: ['/uploads/iso.pdf'], certNames: ['ISO 证书'] },
            selectedCerts: ['https://oss.example.com/new-cert.jpg?sign=x'],
        });
        expect(collectItemMediaEntries(item, 'certs')[0].label).toBe('new-cert.jpg');
    });

    it('未勾选时回退快照全量并带名称', () => {
        const item = mkItem({
            productSnapshot: {
                certs: ['/uploads/iso.pdf', '/uploads/ce.png'],
                certNames: ['ISO 证书', 'CE 证书'],
            },
        });
        expect(collectItemMediaEntries(item, 'certs').map((e) => e.label)).toEqual(['ISO 证书', 'CE 证书']);
    });

    it('对象形态的证书条目（{url}/{name}）兼容', () => {
        const item = mkItem({
            productSnapshot: { certs: [{ url: '/uploads/a.png', name: '证书A' }] },
        });
        expect(collectItemMediaEntries(item, 'certs')).toEqual([{ url: '/uploads/a.png', label: 'a.png' }]);
    });
});
