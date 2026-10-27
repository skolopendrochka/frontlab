import { z } from 'zod';

export const mailRule = z.string().trim().min(1, 'Введите почту').email('Почта выглядит странно');

export const secretRule = z
  .string()
  .min(6, 'Пароль короче 6 символов')
  .max(64, 'Пароль длиннее 64 символов');

export const titleRule = z
  .string()
  .trim()
  .min(1, 'Пункт без названия нельзя сохранить')
  .max(160, 'Укоротите формулировку');

export const signInSchema = z.object({
  email: mailRule,
  password: secretRule,
});

export const newTaskSchema = z.object({
  title: titleRule,
});

export type FieldMap = Record<string, string>;

export function collectZodMessages(error: z.ZodError): FieldMap {
  const map: FieldMap = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? 'form';
    if (!map[key]) map[key] = issue.message;
  }
  return map;
}

export async function probeEmailTaken(email: string): Promise<string | null> {
  try {
    const base = import.meta.env.VITE_API_URL || '/api';
    const response = await fetch(`${base}/users?email=${encodeURIComponent(email)}`);
    if (!response.ok) return null;
    const rows = (await response.json()) as Array<{ email: string }>;
    return rows.length > 0 ? 'Такая почта уже есть в базе' : null;
  } catch {
    return null;
  }
}
