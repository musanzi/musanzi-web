import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthStore } from './auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return toObservable(authStore.isVerifying).pipe(
    filter((isVerifying) => !isVerifying),
    take(1),
    map(() => {
      if (authStore.hasRights()) return true;

      return router.createUrlTree([authStore.user() ? '/locked' : '/auth/sign-in']);
    })
  );
};

export const lockedGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return toObservable(authStore.isVerifying).pipe(
    filter((isVerifying) => !isVerifying),
    take(1),
    map(() => {
      if (authStore.hasRights()) return router.createUrlTree(['/']);

      return authStore.user() ? true : router.createUrlTree(['/auth/sign-in']);
    })
  );
};

export const unauthGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return toObservable(authStore.isVerifying).pipe(
    filter((isVerifying) => !isVerifying),
    take(1),
    map(() => {
      if (authStore.hasRights()) return router.createUrlTree(['/']);
      if (authStore.user()) return router.createUrlTree(['/locked']);

      return true;
    })
  );
};
