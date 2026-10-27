import { describe, expect, it } from 'vitest';
import { groupFault, pickFaultText } from 'src/utils/faults';

describe('faults', () => {
  it('maps input faults to form group', () => {
    expect(groupFault({ kind: 'input', text: 'Пусто' })).toBe('form');
  });

  it('returns original text for missing entities', () => {
    expect(pickFaultText({ kind: 'missing', text: 'Нет задачи', entityId: 4 })).toBe('Нет задачи');
  });

  it('uses network copy for transport issues', () => {
    const text = pickFaultText({ kind: 'transport', text: 'Сеть недоступна' });
    expect(text.toLowerCase()).toContain('сервер');
  });
});
