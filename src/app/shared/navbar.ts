import { Component, ElementRef, HostListener, computed, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { CartService } from '../core/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  template: `
    <header
      class="sticky top-0 z-40 transition-shadow"
      [class.shadow-md]="scrolled()"
      style="background: var(--surface); border-bottom: 1px solid var(--line)"
    >
      <div class="container-page flex h-16 items-center justify-between gap-3">
        <a routerLink="/home" class="flex shrink-0 items-center gap-2" aria-label="ShopFlow — home">
          <span
            class="grid h-8 w-8 place-items-center rounded-full font-display text-sm font-bold text-white"
            style="background: var(--accent-bg)"
            aria-hidden="true"
            >S</span
          >
          <span class="font-display text-lg font-bold tracking-tight">
            Shop<span class="text-accent">Flow</span>
          </span>
        </a>

        <nav class="hidden items-center gap-6 md:flex" aria-label="Primary">
          <a
            routerLink="/home"
            class="relative py-1 text-sm font-medium transition-colors"
            [class]="onHome() ? 'text-ink' : 'text-ink-muted hover:text-ink'"
          >
            Home
            @if (onHome()) {
              <span class="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full" style="background: var(--accent)"></span>
            }
          </a>
          <a
            routerLink="/home"
            fragment="featured"
            class="relative py-1 text-sm font-medium transition-colors"
            [class]="onProducts() ? 'text-ink' : 'text-ink-muted hover:text-ink'"
          >
            Products
            @if (onProducts()) {
              <span class="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full" style="background: var(--accent)"></span>
            }
          </a>
        </nav>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="btn btn-ghost h-11 w-11 p-0"
            (click)="toggleSearch()"
            [attr.aria-expanded]="searchOpen()"
            aria-label="Search products"
            title="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>

          <button
            type="button"
            class="btn btn-ghost h-11 w-11 p-0"
            (click)="toggleTheme()"
            [attr.aria-label]="dark() ? 'Switch to light mode' : 'Switch to dark mode'"
            title="Toggle theme"
          >
            @if (dark()) {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              </svg>
            }
          </button>

          <div class="relative">
            <button
              type="button"
              class="btn btn-ghost relative h-11 w-11 p-0"
              (click)="toggleCart()"
              [attr.aria-expanded]="cartOpen()"
              aria-label="Cart"
              title="Cart"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.5 2.5h2l2.6 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
              </svg>
              @if (cart.count() > 0) {
                <span
                  class="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold text-white"
                  style="background: var(--accent-bg)"
                  >{{ cart.count() }}</span
                >
              }
            </button>

            @if (cartOpen()) {
              <div
                class="absolute right-0 top-12 z-50 w-80 rounded-2xl border p-4 shadow-lg max-sm:fixed max-sm:inset-x-4 max-sm:top-20 max-sm:w-auto"
                style="background: var(--surface); border-color: var(--line); box-shadow: var(--shadow-float)"
              >
                <p class="font-display font-semibold">Your cart</p>
                @if (cart.items().length === 0) {
                  <p class="mt-3 text-sm text-ink-muted">
                    No items yet. Add something from a product page.
                  </p>
                } @else {
                  <ul class="mt-3 max-h-72 space-y-3 overflow-auto">
                    @for (item of cart.items(); track item.product.id + item.color) {
                      <li class="flex items-center gap-3">
                        <img
                          [src]="item.product.thumbnail"
                          alt=""
                          class="h-12 w-12 rounded-lg object-contain"
                          style="background: var(--tile)"
                        />
                        <div class="min-w-0 flex-1">
                          <p class="truncate text-sm font-medium">{{ item.product.title }}</p>
                          <p class="text-xs text-ink-muted">{{ item.quantity }} × {{ item.color }}</p>
                        </div>
                        <button
                          type="button"
                          class="text-xs text-ink-muted transition-colors hover:text-danger"
                          (click)="cart.remove(item.product.id, item.color)"
                          [attr.aria-label]="'Remove ' + item.product.title"
                          >Remove</button
                        >
                      </li>
                    }
                  </ul>
                  <div class="mt-3 flex items-center justify-between border-t pt-3" style="border-color: var(--line)">
                    <span class="text-sm text-ink-muted">Total</span>
                    <span class="price">\${{ money(cart.total()) }}</span>
                  </div>
                }
                <p class="mt-3 rounded-lg px-3 py-2 text-xs" style="background: var(--tile); color: var(--ink-muted)">
                  Checkout is disabled in this demo.
                </p>
              </div>
            }
          </div>

          <div class="relative">
            <button
              type="button"
              class="btn btn-ghost h-11 w-11 p-0"
              (click)="toggleProfile()"
              [attr.aria-expanded]="profileOpen()"
              aria-label="Account"
              title="Account"
            >
              <span
                class="grid h-7 w-7 place-items-center rounded-full text-sm font-semibold text-white"
                style="background: var(--accent-bg)"
                >{{ initial() }}</span
              >
            </button>

            @if (profileOpen()) {
              <div
                class="absolute right-0 top-12 z-50 w-60 rounded-2xl border p-4 shadow-lg max-sm:fixed max-sm:inset-x-4 max-sm:top-20 max-sm:w-auto"
                style="background: var(--surface); border-color: var(--line); box-shadow: var(--shadow-float)"
              >
                @if (user(); as u) {
                  <p class="break-words font-semibold">{{ u.firstName }} {{ u.lastName }}</p>
                  <p class="break-words text-sm text-ink-muted">{{ u.email }}</p>
                }
                <button type="button" class="btn btn-outline mt-3 w-full" (click)="logout()">Logout</button>
              </div>
            }
          </div>
        </div>
      </div>

      <div
        [class]="searchBarClass()"
        [inert]="!searchOpen()"
        [attr.aria-hidden]="searchOpen() ? null : 'true'"
      >
        <div role="search" class="flex items-center gap-2">
          <input
            #searchInput
            [value]="query()"
            (input)="query.set($any($event.target).value)"
            (keydown.enter)="submitSearch()"
            class="input flex-1"
            placeholder="Search products…"
            aria-label="Search products"
          />
          <button type="button" class="btn btn-primary shrink-0" (click)="submitSearch()">
            Search
          </button>
        </div>
      </div>
    </header>
  `,
})
export class Navbar {
  private readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  readonly user = this.auth.user;
  readonly scrolled = signal(false);
  readonly dark = signal(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );
  readonly searchOpen = signal(false);
  readonly cartOpen = signal(false);
  readonly profileOpen = signal(false);
  readonly query = signal('');
  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly url = signal(this.router.url);
  readonly onHome = computed(() => this.url() === '/home');
  readonly onProducts = computed(() => this.url().startsWith('/product'));
  readonly initial = computed(() =>
    (this.auth.user()?.firstName ?? 'G').charAt(0).toUpperCase(),
  );

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.url.set((event as NavigationEnd).urlAfterRedirects);
        this.searchOpen.set(false);
        this.cartOpen.set(false);
        this.profileOpen.set(false);
      });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.cartOpen.set(false);
      this.profileOpen.set(false);
    }
  }

  toggleSearch(): void {
    this.cartOpen.set(false);
    this.profileOpen.set(false);
    this.searchOpen.update((value) => !value);
    if (this.searchOpen()) {
      setTimeout(() => this.searchInput()?.nativeElement.focus());
    }
  }

  searchBarClass(): string {
    const base = 'container-page overflow-hidden transition-all duration-300 ease-out';
    return this.searchOpen()
      ? `${base} max-h-28 translate-y-0 pt-3 pb-6 opacity-100`
      : `${base} max-h-0 -translate-y-1 pt-0 pb-0 opacity-0 pointer-events-none`;
  }

  toggleCart(): void {
    this.profileOpen.set(false);
    this.cartOpen.update((value) => !value);
  }

  toggleProfile(): void {
    this.cartOpen.set(false);
    this.profileOpen.update((value) => !value);
  }

  submitSearch(): void {
    const raw = this.searchInput()?.nativeElement.value ?? this.query();
    const q = raw.trim();
    this.searchOpen.set(false);
    void this.router.navigate(['/home'], { queryParams: q ? { q } : {} });
  }

  toggleTheme(): void {
    const next = !this.dark();
    this.dark.set(next);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', next);
    }
    try {
      localStorage.setItem('shopflow-theme', next ? 'dark' : 'light');
    } catch {
      /* storage unavailable */
    }
  }

  logout(): void {
    this.auth.logout();
    this.profileOpen.set(false);
    void this.router.navigate(['/login']);
  }

  money(value: number): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
