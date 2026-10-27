import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { usePersist } from 'src/composables/usePersist';
import { useNotifyErrors } from 'src/composables/useNotifyErrors';
import { refreshRequest, signInRequest } from 'src/http/sessionApi';
import type { Outcome } from 'src/types/outcome';
import type { Account, AccountPrefs, SessionSnapshot, SignInPayload, SignInResult } from 'src/types/account';
import { tryGuestLogin } from 'src/utils/offlineAuth';

const KEY = 'checkly-identity';

const defaultPrefs: AccountPrefs = {
  locale: 'ru',
  toastEnabled: true,
};

const empty: SessionSnapshot = {
  account: null,
  accessToken: null,
  prefs: defaultPrefs,
};

export const useIdentityStore = defineStore('identity', () => {
  const snapshot = usePersist<SessionSnapshot>(KEY, empty);
  const busy = ref(false);
  const lastFault = ref<string | null>(null);
  const { catchFault } = useNotifyErrors();

  const account = computed(() => snapshot.value.account);
  const accessToken = computed(() => snapshot.value.accessToken);
  const prefs = computed(() => snapshot.value.prefs);
  const signedIn = computed(() => snapshot.value.accessToken !== null && snapshot.value.account !== null);

  function remember(next: Account, token: string): void {
    snapshot.value = { ...snapshot.value, account: next, accessToken: token };
  }

  function putToken(token: string): void {
    snapshot.value = { ...snapshot.value, accessToken: token };
  }

  async function enter(payload: SignInPayload): Promise<Outcome<SignInResult>> {
    busy.value = true;
    lastFault.value = null;
    const result = await signInRequest(payload);
    busy.value = false;

    if (!result.ok) {
      const guest = tryGuestLogin(payload.email, payload.password);
      if (guest) {
        remember(guest.account, guest.accessToken);
        return { ok: true, value: guest };
      }
      lastFault.value = result.fault.text;
      catchFault(result.fault, 'identity.enter');
      return result;
    }

    remember(result.value.account, result.value.accessToken);
    return result;
  }

  async function renew(): Promise<Outcome<{ accessToken: string }>> {
    if (!snapshot.value.accessToken) {
      return { ok: false, fault: { kind: 'transport', text: 'Токен отсутствует' } };
    }
    const result = await refreshRequest(snapshot.value.accessToken);
    if (result.ok) putToken(result.value.accessToken);
    return result;
  }

  function leave(): void {
    snapshot.value = { ...snapshot.value, account: null, accessToken: null };
    lastFault.value = null;
  }

  function patchPrefs(patch: Partial<AccountPrefs>): void {
    snapshot.value = {
      ...snapshot.value,
      prefs: { ...snapshot.value.prefs, ...patch },
    };
  }

  return {
    account,
    accessToken,
    prefs,
    signedIn,
    busy,
    lastFault,
    enter,
    renew,
    leave,
    patchPrefs,
    remember,
    putToken,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useIdentityStore, import.meta.hot));
}
