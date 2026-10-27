import { storeToRefs } from 'pinia';
import { useChecklistStore } from 'src/stores/taskStore';

export const FILTER_TABS = [
  { name: 'all', label: 'Все' },
  { name: 'todo', label: 'К выполнению' },
  { name: 'ready', label: 'Готово' },
];

export function useCheckQuery() {
  const store = useChecklistStore();
  const { filter, query, visible, emptyHint } = storeToRefs(store);
  return { filter, query, visible, emptyHint, tabs: FILTER_TABS };
}
