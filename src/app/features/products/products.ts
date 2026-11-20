import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ProductService } from '../../core/product.service';
import { Product } from '../../core/models';
import { CATEGORY_LABELS, FASHION_CATEGORIES, FASHION_SET } from '../../core/categories';
import { Navbar } from '../../shared/navbar';
import { Footer } from '../../shared/footer';
import { ProductCard } from '../../shared/product-card';

@Component({
  selector: 'app-products',
  imports: [RouterLink, Navbar, Footer, ProductCard],
  templateUrl: './products.html',
})
export class Products {
  private readonly products = inject(ProductService);
  private readonly route = inject(ActivatedRoute);

  readonly list = this.products.list;
  readonly skeletons = [1, 2, 3, 4, 5, 6, 7, 8];
  readonly categories = FASHION_CATEGORIES;

  readonly cat = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('cat') ?? '')),
    { initialValue: '' },
  );
  readonly query = toSignal(
    this.route.queryParamMap.pipe(map((params) => (params.get('q') ?? '').trim().toLowerCase())),
    { initialValue: '' },
  );

  readonly categoryLabel = computed(() => {
    const cat = this.cat();
    return cat ? (CATEGORY_LABELS as Record<string, string>)[cat] ?? null : null;
  });

  readonly matching = computed<Product[]>(() => {
    const cat = this.cat();
    const q = this.query();
    return this.list
      .value()
      .products.filter((product) => FASHION_SET.has(product.category))
      .filter((product) => !cat || product.category === cat)
      .filter(
        (product) =>
          !q ||
          product.title.toLowerCase().includes(q) ||
          (product.brand ?? '').toLowerCase().includes(q) ||
          product.category.replace(/-/g, ' ').includes(q),
      )
      .sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title));
  });

  readonly limit = signal(12);
  readonly visible = computed(() => this.matching().slice(0, this.limit()));
  readonly hasMore = computed(() => this.limit() < this.matching().length);

  constructor() {
    effect(() => {
      this.cat();
      this.query();
      this.limit.set(12);
    });
  }

  chipClass(slug: string): string {
    const active = slug === '' ? !this.cat() : this.cat() === slug;
    const base =
      'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors';
    return active
      ? `${base} border-transparent bg-[var(--accent-bg)] text-white`
      : `${base} border-[var(--line)] text-ink-muted hover:text-ink`;
  }

  categoryName(slug: string): string {
    return (CATEGORY_LABELS as Record<string, string>)[slug] ?? slug;
  }

  loadMore(): void {
    this.limit.update((value) => value + 12);
  }

  reload(): void {
    this.list.reload();
  }
}
