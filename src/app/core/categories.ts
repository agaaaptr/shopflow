export const FASHION_CATEGORIES = [
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
] as const;

export type CategorySlug = (typeof FASHION_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  'mens-shirts': "Men's Shirts",
  'mens-shoes': "Men's Shoes",
  'mens-watches': "Men's Watches",
  'womens-bags': "Women's Bags",
  'womens-dresses': "Women's Dresses",
  'womens-shoes': "Women's Shoes",
  'womens-watches': "Women's Watches",
  'womens-jewellery': "Women's Jewellery",
  'sunglasses': 'Sunglasses',
  'tops': 'Tops',
};

export const FASHION_SET = new Set<string>(FASHION_CATEGORIES);
