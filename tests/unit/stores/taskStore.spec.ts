import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import * as taskApi from 'src/http/taskApi';
import { useChecklistStore } from 'src/stores/taskStore';
import { useIdentityStore } from 'src/stores/sessionStore';

vi.mock('src/composables/useNotifyErrors', () => ({
  useNotifyErrors: () => ({ catchFault: vi.fn() }),
}));

vi.mock('src/http/taskApi', async () => {
  const actual = await vi.importActual<typeof import('src/http/taskApi')>('src/http/taskApi');
  return {
    ...actual,
    loadChecks: vi.fn(),
    postCheck: vi.fn(),
    patchCheck: vi.fn(),
    deleteCheck: vi.fn(),
  };
});

describe('checklistStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(taskApi.loadChecks).mockResolvedValue({ ok: true, value: [] });
    useIdentityStore().remember({ id: 1, email: 'user@test.com', name: 'Екатерина' }, 'token');
  });

  it('loads checklist items', async () => {
    vi.mocked(taskApi.loadChecks).mockResolvedValue({
      ok: true,
      value: [
        {
          id: 1,
          ownerId: 1,
          title: 'Глава про роутер',
          done: false,
          dueAt: '2026-10-30',
          createdAt: '2026-01-01',
        },
      ],
    });

    const store = useChecklistStore();
    const result = await store.reload();
    expect(result.ok).toBe(true);
    expect(store.items).toHaveLength(1);
  });

  it('records a validation fault', async () => {
    vi.mocked(taskApi.postCheck).mockResolvedValue({
      ok: false,
      fault: { kind: 'input', text: 'Название не может быть пустым' },
    });
    const store = useChecklistStore();
    const result = await store.add({ title: '' });
    expect(result.ok).toBe(false);
    expect(store.message).toBe('Название не может быть пустым');
  });

  it('sorts by due date', async () => {
    vi.mocked(taskApi.loadChecks).mockResolvedValue({
      ok: true,
      value: [
        {
          id: 1,
          ownerId: 1,
          title: 'Позже',
          done: false,
          dueAt: '2026-12-01',
          createdAt: '2026-01-01',
        },
        {
          id: 2,
          ownerId: 1,
          title: 'Раньше',
          done: false,
          dueAt: '2026-10-01',
          createdAt: '2026-01-01',
        },
      ],
    });
    const store = useChecklistStore();
    await store.reload();
    expect(store.visible[0]?.title).toBe('Раньше');
  });
});
