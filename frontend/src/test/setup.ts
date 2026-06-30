import { vi } from 'vitest';

// Mock localStorage
const localStorageMock: Storage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};

const globalScope = globalThis as unknown as {
  localStorage: Storage;
  fetch: typeof fetch;
  open: typeof window.open;
};

globalScope.localStorage = localStorageMock;

// Mock fetch
globalScope.fetch = vi.fn();

// Mock window.open
globalScope.open = vi.fn();
