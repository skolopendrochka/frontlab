import { boot } from 'quasar/wrappers';
import { wireAuth } from 'src/http/client';
import { refreshRequest } from 'src/http/sessionApi';
import { useIdentityStore } from 'src/stores/sessionStore';

export default boot(() => {
  wireAuth({
    token: () => useIdentityStore().accessToken,
    renew: async () => {
      const identity = useIdentityStore();
      if (!identity.accessToken) return null;
      const result = await refreshRequest(identity.accessToken);
      if (!result.ok) {
        identity.leave();
        return null;
      }
      identity.putToken(result.value.accessToken);
      return result.value.accessToken;
    },
  });
});
