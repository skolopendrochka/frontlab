export type ColorMode = 'day' | 'night';

export interface LookSnapshot {
  mode: ColorMode;
  menuOpen: boolean;
}

export interface ToastPayload {
  tone: 'positive' | 'negative' | 'warning' | 'info';
  text: string;
  action?: { caption: string; run: () => void };
}
