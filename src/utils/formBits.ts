import type { FieldMap } from './schemas';

export function fieldMessage(map: FieldMap, name: string): string {
  return map[name] ?? '';
}

export function formHasIssues(map: FieldMap): boolean {
  return Object.keys(map).length > 0;
}

export function dropField(map: FieldMap, name: string): FieldMap {
  const next = { ...map };
  delete next[name];
  return next;
}
