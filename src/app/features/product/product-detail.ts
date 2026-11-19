import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { map } from 'rxjs';
import { Product } from '../../core/models';
import { DUMMYJSON } from '../../core/product.service';
import { Navbar } from '../../shared/navbar';
import { Footer } from '../../shared/footer';

type Tab = 'description' | 'specifications' | 'reviews';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, Navbar, Footer],
  templateUrl: './product-detail.html',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);

  readonly id = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: this.route.snapshot.paramMap.get('id') },
  );

  readonly product = httpResource<Product>(() => {
    const id = this.id();
    return id ? `${DUMMYJSON}/products/${id}` : undefined;
  });

  readonly images = computed<string[]>(() => {
    const product = this.product.value();
    if (!product) return [];
    return product.images?.length ? product.images : [product.thumbnail];
  });

  readonly activeImage = signal(0);
  readonly tab = signal<Tab>('description');
  readonly added = signal(false);
  readonly wishlisted = signal(false);
  readonly cartCount = signal(0);

  constructor() {
    // Reset per-product UI state when the route id changes (component reuse).
    effect(() => {
      this.product.value()?.id;
      this.activeImage.set(0);
      this.added.set(false);
      this.wishlisted.set(false);
      this.tab.set('description');
    });
  }

  formatPrice(value: number): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  addToCart(): void {
    const product = this.product.value();
    if (!product || product.stock === 0) return;
    this.cartCount.update((count) => count + 1);
    this.added.set(true);
    setTimeout(() => this.added.set(false), 2000);
  }

  toggleWishlist(): void {
    this.wishlisted.update((value) => !value);
  }

  tabClass(name: Tab): string {
    const base = 'px-3 py-2 text-sm font-medium transition-colors';
    return this.tab() === name
      ? `${base} bg-ink text-paper`
      : `${base} text-ink-muted hover:text-ink`;
  }

  retry(): void {
    this.product.reload();
  }
}
