import { describe, it, expect } from 'vitest';
import { matchPinyin } from './pinyinFilter';

describe('matchPinyin', () => {
    it('原文包含命中（中文/大小写不敏感）', () => {
        expect(matchPinyin('小米科技', '小米')).toBe(true);
        expect(matchPinyin('X1 Pro', 'x1')).toBe(true);
        expect(matchPinyin('小米', 'XIAOMI'.toLowerCase() === 'xiaomi' ? '小米' : '')).toBe(true);
    });

    it('全拼包含命中', () => {
        expect(matchPinyin('小米', 'xiaomi')).toBe(true);
        expect(matchPinyin('小米', 'xiao')).toBe(true);
        expect(matchPinyin('电子设备/手机', 'shouji')).toBe(true);
    });

    it('首字母串命中', () => {
        expect(matchPinyin('小米', 'xm')).toBe(true);
        expect(matchPinyin('在售', 'zs')).toBe(true);
    });

    it('查询串忽略空格与大小写', () => {
        expect(matchPinyin('小米', ' Xiao Mi ')).toBe(true);
        expect(matchPinyin('小米', ' XIAOMI ')).toBe(true);
    });

    it('空查询视为全匹配（展示全部选项）', () => {
        expect(matchPinyin('小米', '')).toBe(true);
        expect(matchPinyin('小米', '   ')).toBe(true);
    });

    it('不相关查询不误命中', () => {
        expect(matchPinyin('小米', 'huawei')).toBe(false);
        expect(matchPinyin('小米', 'hw')).toBe(false);
        expect(matchPinyin('停售', 'zs')).toBe(false);
    });
});
