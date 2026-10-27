import { describe, expect, it } from 'vitest';
import { FILTER_TABS } from 'src/composables/useTaskQuery';

describe('useCheckQuery', () => {
  it('has three filter tabs', () => {
    expect(FILTER_TABS.map((tab) => tab.name)).toEqual(['all', 'todo', 'ready']);
  });
});
