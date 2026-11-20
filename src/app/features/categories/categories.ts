import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/product.service';
import { CATEGORY_LABELS, FASHION_CATEGORIES, CategorySlug } from '../../core/categories';
import { Navbar } from '../../shared/navbar';
import { Footer } from '../../shared/footer';

interface CategoryTile {
  slug: CategorySlug;
  label: string;
  count: number;
  image: string;
}

@Component({
  selector: 'app-categories',
  imports: [RouterLink, Navbar, Footer],
  template: `
    <app-navbar />

    <main class="container-page pb-16 pt-6">
      <div class="fade-up max-w-2xl">
        <h1 class="font-display text-3xl font-bold tracking-tight sm:text-4xl">Categories</h1>
        <p class="mt-2 text-ink-muted">Browse our fashion collection by category.</p>
      </div>

      @if (list.isLoading()) {
        <div class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3" aria-busy="true" aria-label="Loading categories">
          @for (n of skeletons; track n) {
            <div class="skeleton aspect-[4/5] rounded-2xl"></div>
          }
        </div>
      } @else if (list.error()) {
        <div class="mt-8 rounded-2xl border p-10 text-center" style="border-color: var(--line)" role="alert">
          <p class="font-display text-lg font-semibold">We couldn't load categories</p>
          <p class="mt-1 text-sm text-ink-muted">Check your connection and try again.</p>
          <button type="button" class="btn btn-primary mt-5" (click)="reload()">Retry</button>
        </div>
      } @else {
        <div class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          @for (tile of tiles(); track tile.slug; let i = $index) {
            <a
              [routerLink]="['/products']"
              [queryParams]="{ cat: tile.slug }"
              [class]="tileClass(i)"
              [attr.aria-label]="tile.label + ', ' + tile.count + ' products'"
              style="background: var(--tile)"
            >
              <div
                class="relative flex-1 overflow-hidden"
                [style.aspect-ratio]="i === 0 ? 'auto' : '4 / 5'"
              >
                <img
                  [src]="tile.image"
                  [alt]="tile.label"
                  loading="lazy"
                  decoding="async"
                  class="h-full w-full object-contain transition-transform duration-200 ease-out group-hover:scale-[1.04]"
                  [class.p-6]="i !== 0"
                  [class.p-12]="i === 0"
                />
              </div>
              <div class="p-4">
                <p class="font-display font-semibold">{{ tile.label }}</p>
                <p class="mt-1 text-sm text-ink-muted">{{ tile.count }} products</p>
              </div>
            </a>
          }
        </div>
      }
    </main>

    <app-footer />
  `,
})
export class Categories {
  private readonly products = inject(ProductService);
  readonly list = this.products.list;
  readonly skeletons = [1, 2, 3, 4, 5, 6, 7, 8];

  readonly tiles = computed<CategoryTile[]>(() => {
    const all = this.list.value().products;
    return FASHION_CATEGORIES.map((slug) => {
      const items = all.filter((product) => product.category === slug);
      return {
        slug,
        label: CATEGORY_LABELS[slug],
        count: items.length,
        image: items[0]?.thumbnail ?? '',
      };
    });
  });

  tileClass(index: number): string {
    const base =
      'group flex flex-col overflow-hidden rounded-2xl transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl';
    return index === 0 ? `${base} md:col-span-2 md:row-span-2` : base;
  }

  reload(): void {
    this.list.reload();
  }
}
