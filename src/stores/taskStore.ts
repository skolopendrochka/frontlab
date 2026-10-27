import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { usePersist } from 'src/composables/usePersist';
import { useNotifyErrors } from 'src/composables/useNotifyErrors';
import { deleteCheck, findItem, loadChecks, patchCheck, postCheck } from 'src/http/taskApi';
import { useIdentityStore } from 'src/stores/sessionStore';
import type { Outcome } from 'src/types/outcome';
import type { CheckFilter, CheckItem, CheckViewState, NewCheckPayload } from 'src/types/task';
import { isGuestToken } from 'src/utils/offlineAuth';

const VIEW_KEY = 'checkly-filter';

const defaultView: CheckViewState = {
  filter: 'all',
  query: '',
};

export const useChecklistStore = defineStore('checklist', () => {
  const viewState = usePersist<CheckViewState>(VIEW_KEY, defaultView);
  const identity = useIdentityStore();
  const { catchFault } = useNotifyErrors();

  const items = ref<CheckItem[]>([]);
  const busy = ref(false);
  const message = ref<string | null>(null);

  const filter = computed({
    get: (): CheckFilter => viewState.value.filter,
    set: (next: CheckFilter) => {
      viewState.value = { ...viewState.value, filter: next };
    },
  });

  const query = computed({
    get: (): string => viewState.value.query,
    set: (next: string) => {
      viewState.value = { ...viewState.value, query: next };
    },
  });

  const total = computed(() => items.value.length);
  const leftover = computed(() => items.value.filter((item) => !item.done).length);
  const ready = computed(() => items.value.filter((item) => item.done).length);
  const progress = computed(() => (total.value === 0 ? 0 : Math.round((ready.value / total.value) * 100)));

  const visible = computed((): CheckItem[] => {
    let rows = [...items.value];
    if (filter.value === 'todo') rows = rows.filter((item) => !item.done);
    if (filter.value === 'ready') rows = rows.filter((item) => item.done);

    const needle = query.value.trim().toLowerCase();
    if (needle) rows = rows.filter((item) => item.title.toLowerCase().includes(needle));

    return rows.sort((a, b) => {
      if (!a.dueAt && !b.dueAt) return 0;
      if (!a.dueAt) return 1;
      if (!b.dueAt) return -1;
      return a.dueAt.localeCompare(b.dueAt);
    });
  });

  const emptyHint = computed((): string => {
    if (items.value.length === 0) return 'Чек-лист пуст — запишите пункт и срок, если он есть.';
    return 'По текущему фильтру пунктов нет.';
  });

  function boxKey(): string {
    return `checkly-box-${identity.account?.id ?? 0}`;
  }

  function readBox(): CheckItem[] {
    const raw = localStorage.getItem(boxKey());
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as CheckItem[]) : [];
    } catch {
      return [];
    }
  }

  function writeBox(rows: CheckItem[]): void {
    localStorage.setItem(boxKey(), JSON.stringify(rows));
  }

  function guestMode(): boolean {
    return isGuestToken(identity.accessToken);
  }

  function sample(): CheckItem[] {
    const ownerId = identity.account?.id ?? 0;
    return [
      {
        id: 21,
        ownerId,
        title: 'Прочитать главу про Vue Router',
        done: false,
        dueAt: '2026-10-30',
        createdAt: new Date().toISOString(),
      },
      {
        id: 22,
        ownerId,
        title: 'Сдать лабораторную по Pinia',
        done: true,
        dueAt: null,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  async function reload(): Promise<Outcome<CheckItem[]>> {
    if (!identity.account) {
      items.value = [];
      return { ok: false, fault: { kind: 'transport', text: 'Войдите, чтобы увидеть список' } };
    }

    if (guestMode()) {
      let rows = readBox();
      if (rows.length === 0) {
        rows = sample();
        writeBox(rows);
      }
      items.value = rows;
      return { ok: true, value: rows };
    }

    busy.value = true;
    message.value = null;
    const result = await loadChecks(identity.account.id);
    busy.value = false;
    if (!result.ok) {
      message.value = result.fault.text;
      catchFault(result.fault, 'checklist.reload', () => {
        void reload();
      });
      return result;
    }
    items.value = result.value;
    return result;
  }

  async function add(payload: NewCheckPayload): Promise<Outcome<CheckItem>> {
    if (!identity.account) {
      const fault = { kind: 'transport' as const, text: 'Нужна авторизация' };
      message.value = fault.text;
      catchFault(fault, 'checklist.add');
      return { ok: false, fault };
    }

    if (guestMode()) {
      const created: CheckItem = {
        id: Date.now(),
        ownerId: identity.account.id,
        title: payload.title,
        done: false,
        dueAt: payload.dueAt ?? null,
        createdAt: new Date().toISOString(),
      };
      items.value = [created, ...items.value];
      writeBox(items.value);
      return { ok: true, value: created };
    }

    busy.value = true;
    message.value = null;
    const result = await postCheck(identity.account.id, payload);
    busy.value = false;
    if (!result.ok) {
      message.value = result.fault.text;
      catchFault(result.fault, 'checklist.add');
      return result;
    }
    items.value = [result.value, ...items.value];
    return result;
  }

  async function toggle(id: number): Promise<Outcome<CheckItem>> {
    const current = findItem(items.value, id);
    if (!current) {
      const fault = { kind: 'missing' as const, text: 'Пункт не найден', entityId: id };
      message.value = fault.text;
      catchFault(fault, 'checklist.toggle');
      return { ok: false, fault };
    }

    if (guestMode()) {
      const next = { ...current, done: !current.done };
      items.value = items.value.map((item) => (item.id === id ? next : item));
      writeBox(items.value);
      return { ok: true, value: next };
    }

    busy.value = true;
    message.value = null;
    const result = await patchCheck(id, { done: !current.done });
    busy.value = false;
    if (!result.ok) {
      message.value = result.fault.text;
      catchFault(result.fault, 'checklist.toggle', () => {
        void toggle(id);
      });
      return result;
    }
    items.value = items.value.map((item) => (item.id === id ? result.value : item));
    return result;
  }

  async function remove(id: number): Promise<Outcome<{ id: number }>> {
    const current = findItem(items.value, id);
    if (!current) {
      const fault = { kind: 'missing' as const, text: 'Пункт не найден', entityId: id };
      message.value = fault.text;
      catchFault(fault, 'checklist.remove');
      return { ok: false, fault };
    }

    if (guestMode()) {
      items.value = items.value.filter((item) => item.id !== id);
      writeBox(items.value);
      return { ok: true, value: { id } };
    }

    busy.value = true;
    message.value = null;
    const result = await deleteCheck(id);
    busy.value = false;
    if (!result.ok) {
      message.value = result.fault.text;
      catchFault(result.fault, 'checklist.remove', () => {
        void remove(id);
      });
      return result;
    }
    items.value = items.value.filter((item) => item.id !== id);
    return result;
  }

  function setMessage(text: string | null): void {
    message.value = text;
  }

  watch(
    () => identity.signedIn,
    (on) => {
      if (on) void reload();
      else items.value = [];
    },
    { immediate: true },
  );

  return {
    items,
    filter,
    query,
    visible,
    emptyHint,
    total,
    leftover,
    ready,
    progress,
    busy,
    message,
    reload,
    add,
    toggle,
    remove,
    setMessage,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useChecklistStore, import.meta.hot));
}
