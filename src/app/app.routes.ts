import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Sign in · ShopFlow',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: 'home',
    title: 'ShopFlow — Curated marketplace',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'product/:id',
    title: 'Product · ShopFlow',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/product/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'categories',
    title: 'Categories · ShopFlow',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/categories/categories').then((m) => m.Categories),
  },
  {
    path: 'about',
    title: 'About · ShopFlow',
    canActivate: [authGuard],
    loadComponent: () => import('./features/about/about').then((m) => m.About),
  },
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: '**', redirectTo: 'home' },
];
