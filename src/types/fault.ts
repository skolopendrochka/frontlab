export type FaultKind = 'input' | 'missing' | 'transport';

export type Fault =
  | { kind: 'input'; text: string; field?: string }
  | { kind: 'missing'; text: string; entityId: number }
  | { kind: 'transport'; text: string };
