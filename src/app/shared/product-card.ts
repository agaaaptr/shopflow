import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../core/models';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  template: `
    <a [routerLink]="['/product', product().id]" class="group block">
      <div class="relative aspect-[4/5] overflow-hidden" style="background: var(--tile)">
        <img
          [src]="product().thumbnail"
          [alt]="product().title"
          loading="lazy"
          decoding="async"
          width="300"
          height="375"
          class="h-full w-full object-contain p-6 transition-transform duration-200 ease-out group-hover:scale-[1.03]"
        />
        @if (badge(); as label) {
          <span class="badge absolute left-3 top-3">{{ label }}</span>
        }
      </div>

      <div class="mt-3 flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="line-clamp-2 font-medium leading-snug">{{ product().title }}</p>
          <p class="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"
              />
            </svg>
            <span>{{ product().rating.toFixed(1) }}</span>
            <span aria-hidden="true">·</span>
            <span class="capitalize">{{ prettyCategory() }}</span>
          </p>
        </div>
        <p class="price shrink-0 text-right">\${{ formatPrice(product().price) }}</p>
      </div>
    </a>
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly badge = input<string | null>(null);

  prettyCategory(): string {
    return this.product().category.replace(/-/g, ' ');
  }

  formatPrice(value: number): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
