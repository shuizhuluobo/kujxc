import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';

vi.mock('@/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('initial state', () => {
    it('starts with no user and no token', () => {
      const store = useAuthStore();
      
      expect(store.user).toBeNull();
      expect(store.token).toBeFalsy();
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears user and token', () => {
      const store = useAuthStore();
      
      store.token = 'test-token';
      store.user = {
        id: '1',
        username: 'testuser',
        name: 'Test User',
        role: { code: 'admin', permissions: ['*'] },
      } as any;

      store.logout();

      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('returns true when user has admin role', () => {
      const store = useAuthStore();
      store.user = {
        id: '1',
        username: 'admin',
        name: 'Admin',
        role: { code: 'admin', permissions: ['*'] },
      } as any;

      expect(store.isAdmin).toBe(true);
    });

    it('returns false when user has different role', () => {
      const store = useAuthStore();
      store.user = {
        id: '1',
        username: 'engineer',
        name: 'Engineer',
        role: { code: 'engineer', permissions: ['workOrder:view'] },
      } as any;

      expect(store.isAdmin).toBe(false);
    });

    it('returns false when no user', () => {
      const store = useAuthStore();
      
      expect(store.isAdmin).toBe(false);
    });
  });

  describe('isEngineer', () => {
    it('returns true when user has engineer role', () => {
      const store = useAuthStore();
      store.user = {
        id: '1',
        username: 'engineer',
        name: 'Engineer',
        role: { code: 'engineer', permissions: ['workOrder:view'] },
      } as any;

      expect(store.isEngineer).toBe(true);
    });

    it('returns false when user has different role', () => {
      const store = useAuthStore();
      store.user = {
        id: '1',
        username: 'admin',
        name: 'Admin',
        role: { code: 'admin', permissions: ['*'] },
      } as any;

      expect(store.isEngineer).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when token and user exist', () => {
      const store = useAuthStore();
      store.token = 'valid-token';
      store.user = {
        id: '1',
        username: 'testuser',
        name: 'Test User',
        role: { code: 'admin', permissions: ['*'] },
      } as any;
      
      expect(store.isAuthenticated).toBe(true);
    });

    it('returns false when token is null', () => {
      const store = useAuthStore();
      store.token = null;
      store.user = {
        id: '1',
        username: 'testuser',
        name: 'Test User',
        role: { code: 'admin', permissions: ['*'] },
      } as any;
      
      expect(store.isAuthenticated).toBe(false);
    });

    it('returns false when user is null', () => {
      const store = useAuthStore();
      store.token = 'valid-token';
      store.user = null;
      
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('roleCode', () => {
    it('returns the role code when user exists', () => {
      const store = useAuthStore();
      store.user = {
        id: '1',
        username: 'admin',
        name: 'Admin',
        role: { code: 'admin', permissions: ['*'] },
      } as any;

      expect(store.roleCode).toBe('admin');
    });

    it('returns undefined when no user', () => {
      const store = useAuthStore();
      
      expect(store.roleCode).toBeUndefined();
    });
  });
});
