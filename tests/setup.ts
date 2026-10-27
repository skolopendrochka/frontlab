import { vi } from 'vitest';

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() },
  Dark: { set: vi.fn() },
}));

Object.defineProperty(window, 'localStorage', {
  value: {
    store: {} as Record<string, string>,
    getItem(key: string) {
      return this.store[key] ?? null;
    },
    setItem(key: string, value: string) {
      this.store[key] = value;
    },
    removeItem(key: string) {
      delete this.store[key];
    },
    clear() {
      this.store = {};
    },
  },
  writable: true,
});
