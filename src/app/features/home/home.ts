import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ProductService } from '../../core/product.service';
import { Product } from '../../core/models';
import { CATEGORY_LABELS, FASHION_SET } from '../../core/categories';
import { Navbar } from '../../shared/navbar';
import { Footer } from '../../shared/footer';
import { HeroSlider, Slide } from '../../shared/hero-slider';
import { ProductCard } from '../../shared/product-card';

const CDN = 'https://cdn.dummyjson.com/product-images';

@Component({
  selector: 'app-home',
  imports: [Navbar, Footer, HeroSlider, ProductCard, RouterLink],
  templateUrl: './home.html',
})
export class Home {
  private readonly products = inject(ProductService);
  private readonly route = inject(ActivatedRoute);

  readonly list = this.products.list;
  readonly skeletons = [1, 2, 3, 4, 5, 6, 7, 8];

  readonly query = toSignal(
    this.route.queryParamMap.pipe(map((params) => (params.get('q') ?? '').trim().toLowerCase())),
    { initialValue: '' },
  );

  readonly cat = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('cat') ?? '')),
    { initialValue: '' },
  );

  readonly categoryLabel = computed(() => {
    const cat = this.cat();
    return cat && (CATEGORY_LABELS as Record<string, string>)[cat]
      ? (CATEGORY_LABELS as Record<string, string>)[cat]
      : null;
  });

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

  readonly matching = computed<Product[]>(() => {
    const q = this.query();
    const cat = this.cat();
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

  readonly featured = computed<Product[]>(() => this.matching().slice(0, 12));

  reload(): void {
    this.list.reload();
  }
}
