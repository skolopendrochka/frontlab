import { describe, expect, it } from 'vitest';
import { useFormSchema } from 'src/composables/useFormSchema';
import { newTaskSchema } from 'src/utils/schemas';

describe('useFormSchema', () => {
  it('fills issues when data is invalid', () => {
    const { issues, check } = useFormSchema(newTaskSchema);
    expect(check({ title: '' })).toBe(false);
    expect(issues.value.title).toBeTruthy();
  });

  it('clears issues when data is valid', () => {
    const { issues, check } = useFormSchema(newTaskSchema);
    check({ title: '' });
    expect(check({ title: 'Сдать лабу' })).toBe(true);
    expect(issues.value).toEqual({});
  });
});
