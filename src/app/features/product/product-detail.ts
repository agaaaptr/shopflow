import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { map } from 'rxjs';
import { Product } from '../../core/models';
import { DUMMYJSON } from '../../core/product.service';
import { CartService } from '../../core/cart.service';
import { Navbar } from '../../shared/navbar';
import { Footer } from '../../shared/footer';

type Tab = 'description' | 'specifications' | 'reviews';

const COLOR_OPTIONS = [
  { name: 'Ink', hex: '#1a1a18' },
  { name: 'Sand', hex: '#d8c8a8' },
  { name: 'Teal', hex: '#0f6e5c' },
  { name: 'Slate', hex: '#7a8699' },
];

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, Navbar, Footer],
  templateUrl: './product-detail.html',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly cart = inject(CartService);

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

  readonly colors = COLOR_OPTIONS;
  readonly activeImage = signal(0);
  readonly selectedColor = signal(0);
  readonly quantity = signal(1);
  readonly tab = signal<Tab>('description');
  readonly added = signal(false);
  readonly wishlisted = signal(false);

  constructor() {
    // Reset per-product UI state when the route id changes (component reuse).
    effect(() => {
      this.product.value()?.id;
      this.activeImage.set(0);
      this.selectedColor.set(0);
      this.quantity.set(1);
      this.added.set(false);
      this.wishlisted.set(false);
      this.tab.set('description');
    });
  }

  colorName(): string {
    return COLOR_OPTIONS[this.selectedColor()]?.name ?? 'Default';
  }

  selectColor(index: number): void {
    this.selectedColor.set(index);
    if (this.images().length > 1) {
      this.activeImage.set(index % this.images().length);
    }
  }

  decrement(): void {
    this.quantity.update((value) => Math.max(1, value - 1));
  }

  increment(): void {
    const stock = this.product.value()?.stock ?? 1;
    this.quantity.update((value) => Math.min(stock, value + 1));
  }

  addToCart(): void {
    const product = this.product.value();
    if (!product || product.stock === 0) return;
    this.cart.add(product, this.quantity(), this.colorName());
    this.added.set(true);
    setTimeout(() => this.added.set(false), 2000);
  }

  toggleWishlist(): void {
    this.wishlisted.update((value) => !value);
  }

  tabClass(name: Tab): string {
    const base = 'px-4 py-2 text-sm font-medium rounded-full transition-colors';
    return this.tab() === name
      ? `${base} bg-ink text-paper`
      : `${base} text-ink-muted hover:text-ink`;
  }

  formatPrice(value: number): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  retry(): void {
    this.product.reload();
  }
}
