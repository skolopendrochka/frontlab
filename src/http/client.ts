import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { fail, ok, type Outcome } from 'src/types/outcome';
import type { Fault } from 'src/types/fault';
import type { HttpCall } from './types';

const TTL = 25_000;

interface Slot {
  payload: unknown;
  until: number;
}

const cache = new Map<string, Slot>();

let readToken: () => string | null = () => null;
let renewToken: () => Promise<string | null> = async () => null;

export const transport = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 8_000,
  headers: { 'Content-Type': 'application/json' },
});

export function wireAuth(hooks: {
  token: () => string | null;
  renew: () => Promise<string | null>;
}): void {
  readToken = hooks.token;
  renewToken = hooks.renew;
}

transport.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = readToken();
  if (token && !config.headers['X-Anonymous']) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

transport.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { retried?: boolean };

    if (error.response?.status === 401 && original && !original.retried) {
      original.retried = true;
      const next = await renewToken();
      if (next) {
        original.headers.Authorization = `Bearer ${next}`;
        return transport(original);
      }
    }

    return Promise.reject(error);
  },
);

function cacheKey(call: HttpCall): string {
  return `${call.verb ?? 'GET'}::${call.path}::${JSON.stringify(call.query ?? {})}`;
}

function toFault(error: AxiosError<{ message?: string }>): Fault {
  const text = error.response?.data?.message ?? error.message;
  const status = error.response?.status;

  if (status === 401) {
    return { kind: 'transport', text: 'Нужна авторизация' };
  }
  if (status === 404) {
    return { kind: 'missing', text, entityId: 0 };
  }
  if (status === 400 || status === 422) {
    return { kind: 'input', text };
  }
  if (!error.response) {
    return { kind: 'transport', text: 'Сеть недоступна. Проверьте соединение.' };
  }
  return { kind: 'transport', text };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function requestJson<T>(call: HttpCall): Promise<Outcome<T>> {
  const verb = call.verb ?? 'GET';
  const attempts = call.attempts ?? 2;
  const key = cacheKey(call);

  if (verb === 'GET' && !call.fresh) {
    const hit = cache.get(key);
    if (hit && hit.until > Date.now()) {
      return ok(hit.payload as T);
    }
  }

  let round = 0;

  while (round <= attempts) {
    try {
      const config: AxiosRequestConfig = {
        url: call.path,
        method: verb,
        params: call.query,
        signal: call.abort,
        data: call.body,
      };

      if (call.anonymous) {
        config.headers = { 'X-Anonymous': 'true' };
      }

      const response = await transport.request<T>(config);

      if (verb === 'GET' && !call.fresh) {
        cache.set(key, { payload: response.data, until: Date.now() + TTL });
      }

      if (verb !== 'GET') {
        dropCache('/todos');
      }

      return ok(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      if (!axiosError.response && round < attempts) {
        round += 1;
        await wait(220 * round);
        continue;
      }
      return fail(toFault(axiosError));
    }
  }

  return fail({ kind: 'transport', text: 'Запрос не выполнен' });
}

export function dropCache(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.includes(prefix)) {
      cache.delete(key);
    }
  }
}

export function flushCache(): void {
  cache.clear();
}

export function makeAbort(): AbortController {
  return new AbortController();
}
