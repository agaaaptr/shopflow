import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar';
import { Footer } from '../../shared/footer';

@Component({
  selector: 'app-about',
  imports: [RouterLink, Navbar, Footer],
  template: `
    <app-navbar />

    <main class="container-page pb-16 pt-6">
      <!-- Hero -->
      <section
        class="fade-up rounded-2xl p-8 text-white sm:p-14"
        style="background: var(--accent-bg)"
      >
        <h1 class="max-w-2xl font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl">
          Curated. Considered. Yours.
        </h1>
        <p class="mt-5 max-w-lg text-base" style="color: rgba(255, 255, 255, 0.92)">
          We pick watches, bags, and sneakers worth owning, so you don't have to scroll through
          thousands of products.
        </p>
        <a
          routerLink="/home"
          class="btn mt-8"
          style="background: #ffffff; color: #1a1a18"
          >Explore products</a
        >
      </section>

      <!-- Story -->
      <section class="mt-14 max-w-prose">
        <h2 class="font-display text-2xl font-bold tracking-tight">Why ShopFlow exists</h2>
        <p class="mt-4 leading-relaxed text-ink-muted">
          Shopping online means choosing between hundreds of near-identical options, most of which
          don't tell you what actually matters: what it's made of, how long it lasts, and whether it
          arrives as promised. ShopFlow is our answer to that noise.
        </p>
        <p class="mt-4 leading-relaxed text-ink-muted">
          We keep the catalog short and legible. Every item is checked against its category, rating,
          and stock before it shows up, and the details we'd want before buying: warranty, returns,
          and shipping live right on the product page.
        </p>
      </section>

      <!-- Values -->
      <section class="mt-12">
        <h2 class="font-display text-2xl font-bold tracking-tight">How we do it</h2>
        <div class="mt-6 grid gap-4 sm:grid-cols-3">
          <div class="rounded-2xl border p-6" style="border-color: var(--line); background: var(--surface)">
            <p class="font-display font-semibold">Curated, not crowded</p>
            <p class="mt-2 text-sm text-ink-muted">
              Every product clears a category, rating, and stock check before it appears.
            </p>
          </div>
          <div class="rounded-2xl border p-6" style="border-color: var(--line); background: var(--surface)">
            <p class="font-display font-semibold">Honest details</p>
            <p class="mt-2 text-sm text-ink-muted">
              Warranty, returns, and shipping are listed on every product page.
            </p>
          </div>
          <div class="rounded-2xl border p-6" style="border-color: var(--line); background: var(--surface)">
            <p class="font-display font-semibold">Demo-first</p>
            <p class="mt-2 text-sm text-ink-muted">
              This is a demonstration store; checkout and payments aren't wired up.
            </p>
          </div>
        </div>
      </section>

      <!-- How it works -->
      <section class="mt-12">
        <h2 class="font-display text-2xl font-bold tracking-tight">How it works</h2>
        <ol class="mt-6 grid gap-4 sm:grid-cols-3">
          <li class="rounded-2xl border p-6" style="border-color: var(--line); background: var(--surface)">
            <span class="text-sm font-semibold text-accent">01</span>
            <p class="mt-2 font-display font-semibold">Browse</p>
            <p class="mt-2 text-sm text-ink-muted">Filter by category or search for what you need.</p>
          </li>
          <li class="rounded-2xl border p-6" style="border-color: var(--line); background: var(--surface)">
            <span class="text-sm font-semibold text-accent">02</span>
            <p class="mt-2 font-display font-semibold">Pick</p>
            <p class="mt-2 text-sm text-ink-muted">Read real specs, ratings, and reviews.</p>
          </li>
          <li class="rounded-2xl border p-6" style="border-color: var(--line); background: var(--surface)">
            <span class="text-sm font-semibold text-accent">03</span>
            <p class="mt-2 font-display font-semibold">Add to cart</p>
            <p class="mt-2 text-sm text-ink-muted">See your selection in the cart (demo).</p>
          </li>
        </ol>
      </section>

      <!-- CTA -->
      <section class="mt-12 text-center">
        <a routerLink="/categories" class="btn btn-primary">Browse categories</a>
      </section>
    </main>

    <app-footer />
  `,
})
export class About {}
