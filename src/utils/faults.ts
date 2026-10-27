import type { Fault } from 'src/types/fault';

export type FaultGroup = 'net' | 'form' | 'logic' | 'other';

const TEXTS: Record<FaultGroup, string> = {
  net: 'Нет связи с сервером. Повторите попытку.',
  form: 'Проверьте заполненные поля.',
  logic: 'Операцию выполнить не удалось.',
  other: 'Что-то пошло не так.',
};

export function groupFault(fault: Fault): FaultGroup {
  if (fault.kind === 'input') return 'form';
  if (fault.kind === 'missing') return 'logic';
  if (fault.text.toLowerCase().includes('сет') || fault.text.toLowerCase().includes('связ')) {
    return 'net';
  }
  return 'net';
}

export function humanizeFault(fault: Fault): string {
  if (fault.kind === 'input' || fault.kind === 'missing') {
    return fault.text;
  }
  return TEXTS[groupFault(fault)];
}

export function dumpFault(fault: Fault, place?: string): void {
  if (import.meta.env.DEV) {
    console.error(place ? `[${place}]` : '[fault]', fault);
  }
}

type Resolver = (fault: Fault) => boolean;

const resolvers: Array<{ match: Resolver; text: (fault: Fault) => string }> = [
  {
    match: (fault) => fault.kind === 'input',
    text: (fault) => fault.text,
  },
  {
    match: (fault) => fault.kind === 'missing',
    text: (fault) => fault.text,
  },
  {
    match: (fault) => groupFault(fault) === 'net',
    text: () => TEXTS.net,
  },
];

export function pickFaultText(fault: Fault): string {
  const found = resolvers.find((item) => item.match(fault));
  return found ? found.text(fault) : humanizeFault(fault);
}
