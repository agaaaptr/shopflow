import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Endpoints that must never receive a Bearer header (and never trigger the 401 redirect). */
const PUBLIC_ENDPOINTS = ['/auth/login', 'reqres.in/api/login'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isPublic = PUBLIC_ENDPOINTS.some((endpoint) => req.url.includes(endpoint));
  const token = auth.token();

  const authorizedReq =
    token && !isPublic
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authorizedReq).pipe(
    catchError((err: unknown) => {
      // Anti-loop: only react to 401s on protected calls, never on the login call itself.
      if (err instanceof HttpErrorResponse && err.status === 401 && !isPublic) {
        auth.logout();
        void router.navigate(['/login'], {
          queryParams: { returnUrl: router.url },
        });
      }
      return throwError(() => err);
    }),
  );
};
