import type { Router } from 'vue-router';
import { useIdentityStore } from 'src/stores/sessionStore';

export function attachGuards(router: Router): void {
  router.beforeEach((to, _from, next) => {
    const identity = useIdentityStore();

    if (to.meta.private && !identity.signedIn) {
      next({ name: 'auth', query: { back: to.fullPath } });
      return;
    }

    if (to.meta.publicOnly && identity.signedIn) {
      next({ name: 'home' });
      return;
    }

    next();
  });
}
