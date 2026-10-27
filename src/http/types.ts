export interface HttpCall {
  path: string;
  verb?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number>;
  anonymous?: boolean;
  fresh?: boolean;
  abort?: AbortSignal;
  attempts?: number;
}
