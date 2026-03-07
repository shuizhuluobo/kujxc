import { getFileBaseURL } from '@/api/client';

export function resolveAssetUrl(path?: string | null): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    const baseUrl = getFileBaseURL();
    // 移除路径开头的斜杠，方便统一拼接
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    if (baseUrl) {
        // 确保 baseUrl 没有结尾斜杠
        const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        return `${normalizedBase}/${cleanPath}`;
    }
    // Web 环境下返回以单个 / 开头的相对路径
    return `/${cleanPath}`;
}

/**
 * Resolve all relative asset URLs within a markdown string to absolute URLs.
 */
export function resolveMarkdownAssets(content: string): string {
    if (!content) return '';
    const baseUrl = getFileBaseURL();

    // 处理 Markdown 图片语法: ![alt](/uploads/...) 或 ![alt](uploads/...)
    // 匹配 ![alt]( 后面紧跟 /uploads 或 uploads，且前面不是 http
    let processed = content.replace(/(!\[.*?\]\()(?!http)(\/)?(uploads\/|assets\/)/g, (_match, g1, _g2, g3) => {
        if (baseUrl) {
            const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            return `${g1}${normalizedBase}/${g3}`;
        }
        return `${g1}/${g3}`;
    });

    // 处理 HTML img 标签: src="/uploads/..." 或 src="uploads/..."
    processed = processed.replace(/(src=["'])(?!http)(\/)?(uploads\/|assets\/)/g, (_match, g1, _g2, g3) => {
        if (baseUrl) {
            const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            return `${g1}${normalizedBase}/${g3}`;
        }
        return `${g1}/${g3}`;
    });

    return processed;
}
