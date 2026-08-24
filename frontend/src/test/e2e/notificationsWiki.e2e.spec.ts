/**
 * 通知与知识库模块 E2E 流程测试（vitest + jsdom）
 *
 * 覆盖 notificationsApi / wikiApi 经过真实 api client 的调度：
 * 未读统计、批量已读、清空，文章 CRUD 与点赞。
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    requests,
    reply,
    resetMockServer,
    resetSharedMocks,
} from './helpers/mockServer';

vi.mock('axios', async () => {
    const m = await import('./helpers/mockServer');
    return m.buildAxiosMock();
});
vi.mock('@/stores/auth', async () => {
    const m = await import('./helpers/mockServer');
    return m.buildAuthStoreMock();
});
vi.mock('@/api/csrf', async () => {
    const m = await import('./helpers/mockServer');
    return m.buildCsrfMock();
});

import { notificationsApi, wikiApi } from '@/api';

beforeEach(() => {
    resetSharedMocks();
    resetMockServer();
});

describe('通知 API 端到端流程', () => {
    it('未读数量：GET 不携带 CSRF', async () => {
        reply(200, { count: 5 });

        const res = await notificationsApi.getUnreadCount();

        expect(res.data.count).toBe(5);
        expect(requests[0]).toMatchObject({ method: 'GET', url: '/notifications/unread-count' });
        expect(requests[0].headers['X-CSRF-Token']).toBeUndefined();
    });

    it('批量已读：POST 请求体携带 ids 且带 CSRF', async () => {
        reply(200, {});

        await notificationsApi.markRead(['n1', 'n2']);

        const req = requests[0];
        expect(req).toMatchObject({ method: 'POST', url: '/notifications/mark-read' });
        expect(req.data).toEqual({ ids: ['n1', 'n2'] });
        expect(req.headers['X-CSRF-Token']).toBe('mock-csrf-token');
    });

    it('全部已读 / 删除 / 清空：均映射到对应 POST 端点', async () => {
        reply(200, {});
        await notificationsApi.markAllRead();
        reply(200, {});
        await notificationsApi.deleteNotification(['n3']);
        reply(200, {});
        await notificationsApi.clearAll();

        expect(requests.map((r) => `${r.method} ${r.url}`)).toEqual([
            'POST /notifications/mark-all-read',
            'POST /notifications/delete',
            'POST /notifications/clear-all',
        ]);
        expect(requests[1].data).toEqual({ ids: ['n3'] });
    });
});

describe('知识库 API 端到端流程', () => {
    it('分类与标签：GET 全量读取', async () => {
        reply(200, [{ id: 'cat1' }]);
        await wikiApi.getCategories();
        reply(200, [{ id: 'tag1' }]);
        await wikiApi.getTags();

        expect(requests.map((r) => r.url)).toEqual(['/wiki/categories', '/wiki/tags']);
    });

    it('文章列表：筛选参数透传', async () => {
        reply(200, { data: [{ id: 'a1' }], total: 1 });

        await wikiApi.getArticles({ page: 1, pageSize: 5, categoryId: 'cat1' });

        expect(requests[0]).toMatchObject({ method: 'GET', url: '/wiki/articles' });
        expect(requests[0].params).toEqual({ page: 1, pageSize: 5, categoryId: 'cat1' });
    });

    it('文章生命周期：创建 → 更新 → 点赞 → 删除，写操作带 CSRF', async () => {
        reply(201, { id: 'a1', title: '交换机配置指南' });
        await wikiApi.createArticle({ title: '交换机配置指南', content: '# 步骤', categoryId: 'cat1' });

        reply(200, { id: 'a1', isLiked: true });
        await wikiApi.toggleLike('a1');

        reply(200, { id: 'a1', title: '交换机配置指南 v2' });
        await wikiApi.updateArticle('a1', { title: '交换机配置指南 v2' });

        reply(204, undefined);
        await wikiApi.deleteArticle('a1');

        expect(requests.map((r) => `${r.method} ${r.url}`)).toEqual([
            'POST /wiki/articles',
            'POST /wiki/articles/a1/like',
            'PATCH /wiki/articles/a1',
            'DELETE /wiki/articles/a1',
        ]);
        for (const r of requests) {
            expect(r.headers['X-CSRF-Token']).toBe('mock-csrf-token');
        }
        expect(requests[0].data).toMatchObject({ title: '交换机配置指南' });
    });
});
