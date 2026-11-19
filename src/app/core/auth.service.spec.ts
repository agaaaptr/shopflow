import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  function setup(): void {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  }

  beforeEach(() => localStorage.clear());
  afterEach(() => http?.verify());

  it('starts unauthenticated', () => {
    setup();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('seeds a persisted token from localStorage', () => {
    localStorage.setItem('shopease-token', 'persisted-token');
    setup();
    expect(service.isAuthenticated()).toBe(true);
  });

  it('stores the access token after a successful login', () => {
    setup();
    service.login('emilys', 'emilyspass').subscribe();

    const req = http.expectOne('https://dummyjson.com/auth/login');
    expect(req.request.method).toBe('POST');

    req.flush({
      id: 1,
      username: 'emilys',
      email: 'emily@example.com',
      firstName: 'Emily',
      lastName: 'Johnson',
      gender: 'female',
      image: '',
      accessToken: 'access-123',
      refreshToken: 'refresh-456',
    });

    expect(service.isAuthenticated()).toBe(true);
    expect(service.token()).toBe('access-123');
  });

  it('clears the session on logout', () => {
    localStorage.setItem('shopease-token', 'persisted-token');
    setup();
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('shopease-token')).toBeNull();
  });
});
