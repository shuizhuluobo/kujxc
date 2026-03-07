import { pinyin } from 'pinyin-pro';

/**
 * Utility to generate pinyin and initials from Chinese text
 */
export function generatePinyinMeta(text: string): { pinyinStr: string; initials: string } {
    if (!text) return { pinyinStr: '', initials: '' };

    // Get full pinyin without tone
    const fullPinyin = pinyin(text, { toneType: 'none', type: 'array' }).join('');

    // Get initials
    const initials = pinyin(text, { pattern: 'initial', toneType: 'none', type: 'array' }).join('');

    return {
        pinyinStr: fullPinyin.toLowerCase(),
        initials: initials.toLowerCase()
    };
}
