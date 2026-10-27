import type { SignInResult } from 'src/types/account';

const PEOPLE = [
  { id: 1, email: 'user@test.com', password: '123456', name: 'Екатерина' },
  { id: 2, email: 'admin@test.com', password: 'admin123', name: 'Куратор' },
] as const;

export function isGuestToken(token: string | null): boolean {
  return token?.startsWith('guest-key-') ?? false;
}

export function tryGuestLogin(email: string, password: string): SignInResult | null {
  const person = PEOPLE.find(
    (item) => item.email === email.trim().toLowerCase() && item.password === password,
  );
  if (!person) return null;
  return {
    accessToken: `guest-key-${person.id}`,
    account: { id: person.id, email: person.email, name: person.name },
  };
}
