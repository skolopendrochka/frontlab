import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TaskCard from 'src/components/TaskCard.vue';
import type { CheckItem } from 'src/types/task';

const sample: CheckItem = {
  id: 9,
  ownerId: 1,
  title: 'Сдать работу',
  done: false,
  dueAt: '2026-11-02',
  createdAt: '2026-03-01T00:00:00.000Z',
};

describe('CheckRow', () => {
  it('shows title and due date', () => {
    const wrapper = mount(TaskCard, {
      props: { item: sample },
      global: {
        stubs: {
          QItem: { template: '<div><slot /></div>' },
          QItemSection: { template: '<div><slot /></div>' },
          QItemLabel: { template: '<div><slot /></div>' },
          QCheckbox: true,
          QBtn: true,
        },
      },
    });
    expect(wrapper.text()).toContain('Сдать работу');
    expect(wrapper.text()).toContain('Срок');
  });
});
