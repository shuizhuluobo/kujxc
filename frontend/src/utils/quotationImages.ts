import type { QuotationItem } from '@/types';
import { resolveAssetUrl } from '@/utils/url';

/**
 * 报价单「产品图片 / 产品证书」列的取数与缩略图加载（四端共用语义）：
 * - 预览 HTML 直接用 <img> 引用原始 URL；
 * - Excel/PDF 导出经 loadImageThumb 统一转码为 PNG dataURL 后嵌入；
 * - DOCX 由后端镜像实现同语义（backend quotations-docx.service.ts itemMediaEntries）。
 */

export interface MediaEntry {
    url: string;
    /**
     * 文本兜底展示名：证书优先 certNames 平行数组映射，缺失回退文件名；产品图片为空串。
     * 嵌图失败或为文档型证书（PDF）时导出该文本，避免把原始路径暴露给客户。
     */
    label: string;
}

/** 是否为媒体列（产品图片/产品证书），四个渲染器共用判断 */
export function isMediaColumnKey(key: string | undefined | null): boolean {
    return key === 'images' || key === 'certs';
}

/** 从 URL 提取文件名（去查询参数并解码），作为证书名称兜底 */
export function fileNameOfUrl(url: string): string {
    const clean = String(url ?? '').split(/[?#]/)[0];
    const last = clean.substring(clean.lastIndexOf('/') + 1);
    try {
        return decodeURIComponent(last);
    } catch {
        return last;
    }
}

/** 文档型证书（如 PDF 扫描件）：无法作为位图嵌入导出文件，保留名称文本 */
export function isDocumentMedia(url: string): boolean {
    return /\.pdf([?#]|$)/i.test(String(url ?? ''));
}

const toStrList = (value: unknown): string[] =>
    Array.isArray(value)
        ? value
              .map((x) =>
                  typeof x === 'object' && x !== null
                      ? String((x as { url?: unknown }).url ?? (x as { name?: unknown }).name ?? '')
                      : typeof x === 'string'
                        ? x
                        : '',
              )
              .filter(Boolean)
        : [];

/**
 * 明细行 → 指定媒体列的条目列表。取数口径与 quotationColumns.fieldValue 一致：
 * - images：selectedImages 优先，空则回退快照全量；
 * - certs：selectedCerts 优先，空则回退快照全量；名称经 snap.certs ↔ snap.certNames 平行数组映射。
 */
export function collectItemMediaEntries(item: QuotationItem | undefined | null, field: string): MediaEntry[] {
    if (!isMediaColumnKey(field)) return [];
    const snap = (item?.productSnapshot ?? {}) as Record<string, unknown>;
    if (field === 'images') {
        const list = item?.selectedImages?.length ? item.selectedImages : snap.images;
        return toStrList(list).map((url) => ({ url, label: '' }));
    }
    const certsRaw = item?.selectedCerts?.length ? item.selectedCerts : snap.certs;
    const allUrls = toStrList(snap.certs);
    const names = Array.isArray(snap.certNames) ? snap.certNames.filter((n): n is string => typeof n === 'string' && !!n) : [];
    return toStrList(certsRaw).map((url) => {
        const idx = allUrls.indexOf(url);
        return { url, label: idx >= 0 && names[idx] ? names[idx] : fileNameOfUrl(url) };
    });
}

export interface LoadedThumb {
    /** PNG dataURL（统一转码，规避 webp 等格式在 PDF/DOCX 渲染器的兼容问题） */
    dataUrl: string;
    width: number;
    height: number;
}

const thumbCache = new Map<string, Promise<LoadedThumb | null>>();

/**
 * 加载图片并等比缩放至 maxW×maxH 盒内，输出 PNG dataURL。
 * 结果按 URL + 尺寸缓存；任何失败（网络/解码/画布污染/非浏览器环境）返回 null，
 * 调用方应回退为文本展示，绝不让导出中断。
 */
export function loadImageThumb(rawUrl: string, maxW = 100, maxH = 75): Promise<LoadedThumb | null> {
    if (typeof window === 'undefined' || typeof document === 'undefined') return Promise.resolve(null);
    const key = `${rawUrl}|${maxW}x${maxH}`;
    let pending = thumbCache.get(key);
    if (!pending) {
        pending = decodeToThumb(rawUrl, maxW, maxH);
        thumbCache.set(key, pending);
    }
    return pending;
}

async function decodeToThumb(rawUrl: string, maxW: number, maxH: number): Promise<LoadedThumb | null> {
    try {
        const src = /^data:/i.test(rawUrl) ? rawUrl : resolveAssetUrl(rawUrl);
        const img = await decodeImage(src);
        if (!img.naturalWidth || !img.naturalHeight) return null;
        const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
        const width = Math.max(1, Math.round(img.naturalWidth * scale));
        const height = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        ctx.drawImage(img, 0, 0, width, height);
        // 跨域图片未经 CORS 允许会污染画布：toDataURL 抛错 → 回退文本
        const dataUrl = canvas.toDataURL('image/png');
        if (!dataUrl.startsWith('data:image/png')) return null;
        return { dataUrl, width, height };
    } catch {
        return null;
    }
}

function decodeImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`图片加载失败: ${src}`));
        img.src = src;
    });
}
