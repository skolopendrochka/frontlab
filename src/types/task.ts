export type CheckFilter = 'all' | 'todo' | 'ready';

export interface CheckItem {
  id: number;
  ownerId: number;
  title: string;
  done: boolean;
  dueAt: string | null;
  createdAt: string;
}

export interface NewCheckPayload {
  title: string;
  dueAt?: string | null;
}

export interface CheckViewState {
  filter: CheckFilter;
  query: string;
}
