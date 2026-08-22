/**
 * 统一的文件下载工具：优先使用服务端响应头 Content-Disposition 中的文件名，
 * 失败时回退到传入的默认名。避免各页面重复硬编码下载文件名。
 */

/** 从 Content-Disposition 解析文件名（兼容 filename*=UTF-8'' 与 filename= 两种格式） */
export function parseDispositionFilename(disposition?: string): string | null {
    if (!disposition) return null;
    const star = disposition.match(/filename\*=(?:UTF-8'')?([^;]+)/i);
    if (star && star[1]) {
        const raw = star[1].trim().replace(/^"|"$/g, '');
        try {
            return decodeURIComponent(raw);
        } catch {
            return raw;
        }
    }
    const plain = disposition.match(/filename="?([^";]+)"?/i);
    if (plain && plain[1]) {
        return plain[1].trim();
    }
    return null;
}

/**
 * 触发浏览器下载一个 Blob。
 * @param blob 文件内容
 * @param fallbackName 默认文件名（服务端未返回文件名时使用）
 * @param headers 可选，axios 响应头；若包含 Content-Disposition 则优先解析文件名
 */
export function downloadBlob(
    blob: Blob,
    fallbackName: string,
    headers?: Record<string, string | undefined> | Headers,
): void {
    let disposition: string | undefined;
    if (headers instanceof Headers) {
        disposition = headers.get('content-disposition') ?? undefined;
    } else if (headers) {
        disposition = headers['content-disposition'] ?? headers['Content-Disposition'];
    }
    const filename = parseDispositionFilename(disposition) || fallbackName;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
