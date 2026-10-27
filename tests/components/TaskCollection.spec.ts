import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TaskCollection from 'src/components/TaskCollection.vue';

describe('CheckPanel', () => {
  it('renders empty hint', () => {
    const wrapper = mount(TaskCollection, {
      props: { items: [], hint: 'Чек-лист пуст' },
      global: {
        stubs: {
          QBanner: { template: '<div><slot /><slot name="avatar" /></div>' },
          QIcon: true,
          CheckRow: true,
        },
      },
    });
    expect(wrapper.text()).toContain('Чек-лист пуст');
  });
});
