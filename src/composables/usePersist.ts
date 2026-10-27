import { onScopeDispose, ref, watch, type Ref } from 'vue';

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function usePersist<T>(key: string, fallback: T): Ref<T> {
  const box = ref<T>(read(key, fallback)) as Ref<T>;

  const stop = watch(
    box,
    (next) => {
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // quota / private mode
      }
    },
    { deep: true },
  );

  onScopeDispose(() => {
    stop();
  });

  return box;
}
