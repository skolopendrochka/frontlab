import { z } from 'zod';
import { requestJson } from './client';
import { fail, ok, type Outcome } from 'src/types/outcome';
import type { CheckItem, NewCheckPayload } from 'src/types/task';
import { titleRule } from 'src/utils/schemas';

const createRule = z.object({ title: titleRule });

interface RemoteTask {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
  createdAt: string;
  dueAt?: string | null;
}

function fromRemote(row: RemoteTask): CheckItem {
  return {
    id: row.id,
    ownerId: row.userId,
    title: row.title,
    done: row.completed,
    dueAt: row.dueAt ?? null,
    createdAt: row.createdAt,
  };
}

export function checkNewItem(payload: NewCheckPayload): Outcome<NewCheckPayload> {
  const parsed = createRule.safeParse(payload);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const field = first?.path[0]?.toString();
    return fail({
      kind: 'input',
      text: first?.message ?? 'Данные не прошли проверку',
      ...(field ? { field } : {}),
    });
  }
  return ok(parsed.data);
}

export function findItem(list: CheckItem[], id: number): CheckItem | undefined {
  return list.find((item) => item.id === id);
}

export async function loadChecks(ownerId: number, abort?: AbortSignal): Promise<Outcome<CheckItem[]>> {
  const result = await requestJson<RemoteTask[]>({
    path: '/todos',
    verb: 'GET',
    query: { userId: ownerId },
    abort,
  });
  if (!result.ok) return result;
  return ok(result.value.map(fromRemote));
}

export async function postCheck(ownerId: number, payload: NewCheckPayload): Promise<Outcome<CheckItem>> {
  const checked = checkNewItem(payload);
  if (!checked.ok) return checked;

  const result = await requestJson<RemoteTask>({
    path: '/todos',
    verb: 'POST',
    body: {
      userId: ownerId,
      title: checked.value.title,
      completed: false,
      createdAt: new Date().toISOString(),
      dueAt: payload.dueAt ?? null,
      tagIds: [],
    },
  });
  if (!result.ok) return result;
  return ok(fromRemote(result.value));
}

export async function patchCheck(id: number, patch: Partial<CheckItem>): Promise<Outcome<CheckItem>> {
  const result = await requestJson<RemoteTask>({
    path: `/todos/${id}`,
    verb: 'PATCH',
    body: {
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.done !== undefined ? { completed: patch.done } : {}),
      ...(patch.dueAt !== undefined ? { dueAt: patch.dueAt } : {}),
    },
  });
  if (!result.ok) return result;
  return ok(fromRemote(result.value));
}

export async function deleteCheck(id: number): Promise<Outcome<{ id: number }>> {
  const result = await requestJson<void>({
    path: `/todos/${id}`,
    verb: 'DELETE',
  });
  if (!result.ok) return result;
  return ok({ id });
}
