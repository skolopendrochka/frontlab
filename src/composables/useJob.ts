import { ref, type Ref } from 'vue';
import type { Outcome } from 'src/types/outcome';
import type { Fault } from 'src/types/fault';

export function useJob<T>(runner: () => Promise<Outcome<T>>) {
  const value = ref<T | null>(null) as Ref<T | null>;
  const busy = ref(false);
  const fault = ref<Fault | null>(null);

  async function run(): Promise<Outcome<T>> {
    busy.value = true;
    fault.value = null;
    const result = await runner();
    busy.value = false;
    if (result.ok) {
      value.value = result.value;
    } else {
      fault.value = result.fault;
    }
    return result;
  }

  function clear(): void {
    value.value = null;
    busy.value = false;
    fault.value = null;
  }

  return { value, busy, fault, run, clear };
}

export function useRemote<T>(loader: () => Promise<Outcome<T>>) {
  const job = useJob(loader);
  return { ...job, reload: () => job.run() };
}
