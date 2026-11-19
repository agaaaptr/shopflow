import { Component, computed, inject } from '@angular/core';
import { ProductService } from '../../core/product.service';
import { Product } from '../../core/models';
import { Navbar } from '../../shared/navbar';
import { Footer } from '../../shared/footer';
import { HeroSlider, Slide } from '../../shared/hero-slider';
import { ProductCard } from '../../shared/product-card';

const FASHION_CATEGORIES = new Set([
  'mens-shirts',
  'mens-shoes',
  'mens-watches',
  'womens-bags',
  'womens-dresses',
  'womens-shoes',
  'womens-watches',
  'womens-jewellery',
  'sunglasses',
  'tops',
]);

const CDN = 'https://cdn.dummyjson.com/product-images';

@Component({
  selector: 'app-home',
  imports: [Navbar, Footer, HeroSlider, ProductCard],
  templateUrl: './home.html',
})
export class Home {
  private readonly products = inject(ProductService);
  readonly list = this.products.list;
  readonly skeletons = [1, 2, 3, 4, 5, 6, 7, 8];

  readonly slides: Slide[] = [
    {
      kicker: 'New collection 2024',
      title: 'Discover style that inspires',
      line: 'Browse our latest collection of premium pieces, crafted for you.',
      cta: 'Shop featured',
      href: '#featured',
      image: `${CDN}/mens-shoes/puma-future-rider-trainers/thumbnail.webp`,
      imageAlt: 'Puma Future Rider trainers',
      panel: 'accent',
    },
    {
      kicker: 'Everyday icons',
      title: 'Time, well spent',
      line: 'A curated selection of watches and considered leather goods.',
      cta: 'Explore watches',
      href: '#featured',
      image: `${CDN}/mens-watches/rolex-cellini-date-black-dial/thumbnail.webp`,
      imageAlt: 'Rolex Cellini Date watch',
      panel: 'ink',
    },
    {
      kicker: 'Carry with intent',
      title: 'Bags that go anywhere',
      line: 'Structured leather and roomy silhouettes, made for the day.',
      cta: 'Explore bags',
      href: '#featured',
      image: `${CDN}/womens-bags/heshe-women's-leather-bag/thumbnail.webp`,
      imageAlt: "Heshe women's leather bag",
      panel: 'sand',
    },
  ];

  readonly featured = computed<Product[]>(() =>
    this.list
      .value()
      .products.filter((product) => FASHION_CATEGORIES.has(product.category))
      .sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title))
      .slice(0, 12),
  );

  reload(): void {
    this.list.reload();
  }
}
