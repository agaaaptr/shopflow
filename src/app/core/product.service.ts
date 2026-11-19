import { Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ProductsResponse } from './models';

export const DUMMYJSON = 'https://dummyjson.com';

const LIST_FIELDS = [
  'id',
  'title',
  'description',
  'price',
  'discountPercentage',
  'rating',
  'stock',
  'brand',
  'category',
  'thumbnail',
  'images',
  'availabilityStatus',
  'warrantyInformation',
  'shippingInformation',
  'returnPolicy',
].join(',');

@Injectable({ providedIn: 'root' })
export class ProductService {
  /** All products with the fields the grid needs (one request, ~194 items). */
  readonly list = httpResource<ProductsResponse>(
    () => `${DUMMYJSON}/products?limit=0&select=${LIST_FIELDS}`,
    { defaultValue: { products: [], total: 0, skip: 0, limit: 0 } },
  );

  productUrl(id: string): string {
    return `${DUMMYJSON}/products/${id}`;
  }
}
