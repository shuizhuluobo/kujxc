import { pinyin } from 'pinyin-pro';

export interface PinyinFields {
  /** 全拼小写，如 hangtianrunpu */
  full: string;
  /** 拼音首字母小写，如 htrp */
  initials: string;
}

/**
 * 中文名称 → 拼音检索字段（产品模糊搜索 + 导入表头智能匹配共用）。
 * 非 CJK 字符（字母/数字）原样保留并转小写，其余符号剔除。
 */
export function toPinyinFields(name?: string | null): PinyinFields {
  const clean = String(name ?? '').trim();
  if (!clean) return { full: '', initials: '' };
  const full = pinyin(clean, {
    toneType: 'none',
    type: 'array',
    nonZh: 'consecutive',
  })
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const initials = pinyin(clean, {
    pattern: 'first',
    toneType: 'none',
    type: 'array',
    nonZh: 'consecutive',
  })
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  return { full, initials };
}
