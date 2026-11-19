import { Injectable, computed, signal } from '@angular/core';
import { Product } from './models';

export interface CartItem {
  product: Product;
  quantity: number;
  color: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();
  readonly count = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0),
  );
  readonly total = computed(() =>
    this._items().reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  );

  add(product: Product, quantity = 1, color = 'Default'): void {
    this._items.update((items) => {
      const existing = items.find(
        (item) => item.product.id === product.id && item.color === color,
      );
      if (existing) {
        return items.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [...items, { product, quantity, color }];
    });
  }

  remove(productId: number, color: string): void {
    this._items.update((items) =>
      items.filter((item) => !(item.product.id === productId && item.color === color)),
    );
  }

  clear(): void {
    this._items.set([]);
  }
}
