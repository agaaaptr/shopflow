import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthUser, LoginResponse } from './models';

const TOKEN_KEY = 'shopflow-token';
const USER_KEY = 'shopflow-user';
const LOGIN_URL = 'https://dummyjson.com/auth/login';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _token = signal<string | null>(readLocal(TOKEN_KEY));
  private readonly _user = signal<AuthUser | null>(readUser());

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);

  login(username: string, password: string, remember = true): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(LOGIN_URL, { username, password, expiresInMins: 60 })
      .pipe(
        tap((res) => {
          const user: AuthUser = {
            id: res.id,
            username: res.username,
            email: res.email,
            firstName: res.firstName,
            lastName: res.lastName,
            image: res.image,
          };
          this._token.set(res.accessToken);
          this._user.set(user);
          if (remember) {
            writeLocal(TOKEN_KEY, res.accessToken);
            writeLocal(USER_KEY, JSON.stringify(user));
          } else {
            // Session-only sign-in: keep the token in memory, don't persist across reloads.
            removeLocal(TOKEN_KEY);
            removeLocal(USER_KEY);
          }
        }),
      );
  }

  logout(): void {
    this._token.set(null);
    this._user.set(null);
    removeLocal(TOKEN_KEY);
    removeLocal(USER_KEY);
  }
}

function readLocal(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode) — in-memory signal still works */
  }
}

function removeLocal(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function readUser(): AuthUser | null {
  const raw = readLocal(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}
