import { describe, expect, it } from 'vitest';
import { collectZodMessages, newTaskSchema, signInSchema, titleRule } from 'src/utils/schemas';

describe('checkly schemas', () => {
  it('accepts login data', () => {
    expect(signInSchema.safeParse({ email: 'user@test.com', password: '123456' }).success).toBe(true);
  });

  it('rejects a short password', () => {
    const result = signInSchema.safeParse({ email: 'user@test.com', password: '1' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(collectZodMessages(result.error).password).toMatch(/короче/i);
    }
  });

  it('rejects a blank checklist title', () => {
    expect(newTaskSchema.safeParse({ title: '  ' }).success).toBe(false);
  });

  it('trims titles', () => {
    const result = titleRule.safeParse('  Лабораторная  ');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe('Лабораторная');
  });
});
