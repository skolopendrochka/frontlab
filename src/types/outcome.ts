import type { Fault } from './fault';

export type Outcome<T> = { ok: true; value: T } | { ok: false; fault: Fault };

export function ok<T>(value: T): Outcome<T> {
  return { ok: true, value };
}

export function fail<T = never>(fault: Fault): Outcome<T> {
  return { ok: false, fault };
}
