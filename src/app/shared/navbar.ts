import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header
      class="sticky top-0 z-40 transition-shadow"
      [class.shadow-md]="scrolled()"
      style="background: var(--surface); border-bottom: 1px solid var(--line)"
    >
      <div class="container-page flex h-16 items-center justify-between gap-3">
        <a routerLink="/home" class="flex items-center gap-2" aria-label="ShopEase — home">
          <span
            class="grid h-7 w-7 place-items-center bg-accent font-display text-sm font-bold text-white"
            aria-hidden="true"
            >S</span
          >
          <span class="font-display text-lg font-bold tracking-tight">
            Shop<span class="text-accent">Ease</span>
          </span>
        </a>

        <nav class="flex items-center gap-4 sm:gap-6" aria-label="Primary">
          <a
            routerLink="/home"
            routerLinkActive="text-accent"
            [routerLinkActiveOptions]="{ exact: false }"
            class="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >Home</a
          >
          <a
            routerLink="/home"
            fragment="featured"
            class="hidden text-sm font-medium text-ink-muted transition-colors hover:text-ink sm:inline"
            >Products</a
          >
        </nav>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn btn-ghost h-11 w-11 p-0"
            (click)="toggleTheme()"
            [attr.aria-label]="dark() ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            @if (dark()) {
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            } @else {
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              </svg>
            }
          </button>

          @if (user(); as u) {
            <span class="hidden text-sm text-ink-muted md:inline">{{ u.firstName }}</span>
          }

          <button type="button" class="btn btn-outline" (click)="logout()">Logout</button>
        </div>
      </div>
    </header>
  `,
})
export class Navbar {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.auth.user;
  readonly scrolled = signal(false);
  readonly dark = signal(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  toggleTheme(): void {
    const next = !this.dark();
    this.dark.set(next);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', next);
    }
    try {
      localStorage.setItem('shopease-theme', next ? 'dark' : 'light');
    } catch {
      /* storage unavailable */
    }
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
