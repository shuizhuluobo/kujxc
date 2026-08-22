import { pinyin } from 'pinyin-pro';

interface PinyinMeta {
    /** 全拼（无声调，小写，无分隔）：小米 → xiaomi */
    full: string;
    /** 首字母串（小写）：小米 → xm */
    initials: string;
}

const metaCache = new Map<string, PinyinMeta>();

function metaOf(text: string): PinyinMeta {
    let m = metaCache.get(text);
    if (!m) {
        const full = pinyin(text, { toneType: 'none', type: 'array' })
            .join('')
            .replace(/\s+/g, '')
            .toLowerCase();
        const initials = pinyin(text, { pattern: 'first', toneType: 'none', type: 'array' })
            .join('')
            .replace(/\s+/g, '')
            .toLowerCase();
        m = { full, initials };
        metaCache.set(text, m);
    }
    return m;
}

/**
 * 标签拼音模糊匹配（筛选栏/下拉选项通用）：
 * 命中任一即匹配——原文包含、全拼包含、首字母串包含；大小写不敏感，查询串忽略空格。
 * 示例：小米 ← xr / xiaomi / 小 / XIAOMI
 */
export function matchPinyin(label: string, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    if (label.toLowerCase().includes(q)) return true;
    const compact = q.replace(/\s+/g, '');
    if (!compact) return false;
    const m = metaOf(label);
    return m.full.includes(compact) || m.initials.includes(compact);
}
