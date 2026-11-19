import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="mt-24 border-t" style="border-color: var(--line); background: var(--surface)">
      <div class="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p class="font-display text-lg font-bold tracking-tight">
            Shop<span class="text-accent">Ease</span>
          </p>
          <p class="mt-3 max-w-xs text-sm text-ink-muted">
            A curated demo marketplace for watches, bags, sneakers and essentials.
          </p>
        </div>

        <div>
          <p class="text-sm font-semibold">Explore</p>
          <ul class="mt-3 space-y-2 text-sm text-ink-muted">
            <li><a routerLink="/home" class="hover:text-ink">Home</a></li>
            <li><a routerLink="/home" fragment="featured" class="hover:text-ink">Products</a></li>
          </ul>
        </div>

        <div>
          <p class="text-sm font-semibold">Data</p>
          <ul class="mt-3 space-y-2 text-sm text-ink-muted">
            <li>
              <a
                href="https://dummyjson.com/docs/products"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-ink"
                >dummyjson API</a
              >
            </li>
            <li>Products are read-only demo data.</li>
          </ul>
        </div>

        <div>
          <p class="text-sm font-semibold">Built with</p>
          <ul class="mt-3 space-y-2 text-sm text-ink-muted">
            <li>Angular 22 · Signals</li>
            <li>Tailwind CSS v4</li>
          </ul>
        </div>
      </div>

      <div class="border-t" style="border-color: var(--line)">
        <div
          class="container-page flex flex-col items-start justify-between gap-2 py-5 text-xs text-ink-muted sm:flex-row sm:items-center"
        >
          <span>© 2024 ShopEase. Demo project — not a real store.</span>
          <span>Built for a front-end technical assessment.</span>
        </div>
      </div>
    </footer>
  `,
})
export class Footer {}
