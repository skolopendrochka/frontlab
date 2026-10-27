export interface Account {
  id: number;
  email: string;
  name: string;
}

export interface AccountPrefs {
  locale: 'ru' | 'en';
  toastEnabled: boolean;
}

export interface SessionSnapshot {
  account: Account | null;
  accessToken: string | null;
  prefs: AccountPrefs;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignInResult {
  accessToken: string;
  account: Account;
}
