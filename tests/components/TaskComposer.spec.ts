import { ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TaskComposer from 'src/components/TaskComposer.vue';
import { useChecklistStore } from 'src/stores/taskStore';

vi.mock('src/composables/useNotifyErrors', () => ({
  useNotifyErrors: () => ({ catchFault: vi.fn() }),
}));

const checkMock = vi.fn();

vi.mock('src/composables/useFormSchema', () => ({
  useFormSchema: () => ({
    issues: ref({}),
    check: checkMock,
    checkField: vi.fn(() => true),
    checkLater: vi.fn(async () => true),
    resetIssues: vi.fn(),
  }),
}));

describe('NewEntryForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    checkMock.mockReset();
  });

  it('renders', () => {
    const wrapper = shallowMount(TaskComposer, {
      global: { stubs: { QCard: true, QCardSection: true, QInput: true, QBtn: true, HintLine: true } },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('does not add an invalid item', () => {
    checkMock.mockReturnValue(false);
    const store = useChecklistStore();
    const add = vi.spyOn(store, 'add');
    expect(checkMock({ title: '' })).toBe(false);
    expect(add).not.toHaveBeenCalled();
  });
});
