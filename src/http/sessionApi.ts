import { requestJson } from './client';
import type { Outcome } from 'src/types/outcome';
import type { Account, SignInPayload, SignInResult } from 'src/types/account';

interface AuthPayload {
  token?: string;
  accessToken?: string;
  user?: Account;
  account?: Account;
}

function toSignIn(payload: AuthPayload): Outcome<SignInResult> {
  const accessToken = payload.accessToken ?? payload.token ?? '';
  const account = payload.account ?? payload.user;
  if (!account || !accessToken) {
    return { ok: false, fault: { kind: 'transport', text: 'Некорректный ответ сервера' } };
  }
  return { ok: true, value: { accessToken, account } };
}

export function signInRequest(payload: SignInPayload): Promise<Outcome<SignInResult>> {
  return requestJson<AuthPayload>({
    path: '/auth/login',
    verb: 'POST',
    body: payload,
    anonymous: true,
  }).then((result) => {
    if (!result.ok) return result;
    return toSignIn(result.value);
  });
}

export function refreshRequest(token: string): Promise<Outcome<{ accessToken: string }>> {
  return requestJson<{ token?: string; accessToken?: string }>({
    path: '/auth/refresh',
    verb: 'POST',
    body: { token },
    anonymous: true,
  }).then((result) => {
    if (!result.ok) return result;
    return {
      ok: true,
      value: { accessToken: result.value.accessToken ?? result.value.token ?? token },
    };
  });
}
