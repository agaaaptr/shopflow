import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

function evaluate(authenticated: boolean, url = '/home') {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: { isAuthenticated: () => authenticated } },
    ],
  });
  return TestBed.runInInjectionContext(() =>
    authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
  );
}

describe('authGuard', () => {
  it('allows authenticated users', () => {
    expect(evaluate(true)).toBe(true);
  });

  it('redirects anonymous users to /login with returnUrl', () => {
    const result = evaluate(false, '/product/5');
    expect(result instanceof UrlTree).toBe(true);
    const serialized = String(result);
    expect(serialized).toContain('login');
    expect(serialized).toContain('returnUrl');
  });
});
