import { ref } from 'vue';
import type { z, ZodObject, ZodRawShape, ZodTypeAny } from 'zod';
import { collectZodMessages, type FieldMap } from 'src/utils/schemas';

export function useFormSchema<S extends ZodRawShape>(schema: ZodObject<S>) {
  const issues = ref<FieldMap>({});

  function check(data: unknown): data is z.infer<ZodObject<S>> {
    const result = schema.safeParse(data);
    if (result.success) {
      issues.value = {};
      return true;
    }
    issues.value = collectZodMessages(result.error);
    return false;
  }

  function checkField(name: keyof S & string, value: unknown): boolean {
    const field = schema.shape[name] as ZodTypeAny | undefined;
    if (!field) return true;

    const result = field.safeParse(value);
    if (result.success) {
      const next = { ...issues.value };
      delete next[name];
      issues.value = next;
      return true;
    }

    issues.value = {
      ...issues.value,
      [name]: result.error.issues[0]?.message ?? 'Неверное значение',
    };
    return false;
  }

  async function checkLater(name: string, runner: () => Promise<string | null>): Promise<boolean> {
    const message = await runner();
    if (message) {
      issues.value = { ...issues.value, [name]: message };
      return false;
    }
    const next = { ...issues.value };
    delete next[name];
    issues.value = next;
    return true;
  }

  function resetIssues(): void {
    issues.value = {};
  }

  return { issues, check, checkField, checkLater, resetIssues };
}
