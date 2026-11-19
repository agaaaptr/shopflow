import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Blocks home + product detail for anonymous users and sends them to /login
 * with the attempted URL so the login page can return them afterwards.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
