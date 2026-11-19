# ShopFlow — design direction (locked, v2)

Lead: frontend-design. Support: taste (anti-slop) + impeccable (audit). Supersedes docs/design.md §6 "proposal awal". v2 applies the taste cross-check: accent moved off orange-red (≈ terracotta tell) to deep petrol teal; ground neutralised.

## Concept

"ShopFlow — an editorial marketplace." A curated-gallery feel, not a discount warehouse. One memorable move: the **price is the personality** — product prices set large in tabular figures, since commerce is the subject. A single **deep petrol teal** accent carries actions and the hero, against a neutral chalk ground + ink. Departs from the cobalt-blue reference (re-theme) and clears cream+serif+sage AND yellow-cream+terracotta tells.

## Color tokens (light)

- `--paper` `#F5F5F3` (neutral chalk floor)
- `--surface` `#FFFFFF`
- `--ink` `#1A1A18`
- `--ink-muted` `#6B6B66`
- `--line` `#E5E5E1`
- `--accent` `#0F6E5C` (deep petrol teal)
- `--accent-strong` `#0A5648`
- `--ok` `#1F7A44` (in-stock only)
- `--danger` `#C0392B`

## Color tokens (dark)

- `--paper` `#131412` · `--surface` `#1E1F1C` · `--ink` `#ECECE7` · `--ink-muted` `#9C9C93` · `--line` `#353633` · `--accent` `#2F9A84` · `--accent-strong` `#46B49E`

## Typography

- Display / headings / prices: **Sora** (600/700/800), tracking tight on headlines.
- Body / UI: **Plus Jakarta Sans** (400/500/600).
- Prices: Sora 600 with `font-variant-numeric: tabular-nums`.
- Scale: hero `clamp(2.5rem, 6vw, 4.5rem)`; h1 2rem/1.1; h2 1.5rem/1.2; h3 1.25rem/1.3; body 1rem/1.6; caption 0.75rem/1.4. Weight contrast 700 vs 400 (no 500-vs-600-only). No monospace, no ALL-CAPS eyebrows, no single-word accent styling.

## Radius / shadow / surface

- Radius: buttons/chips/badges **pill (999px)**, inputs **12px**, cards/tiles **16px**, hero panel **24px**. One rounded corner language.
- Shadow: soft diffuse (`--shadow-soft`) on cards and floating dropdowns; none on body text. No gradients, no glass.

## Layout per page

- **Login** — reference's centered card on neutral chalk, faint oversized cropped "ShopFlow" wordmark ghost behind it; at ≥1024px a split panel (form left, one transparent product cutout + one brand line right). Inputs sharp, teal `:focus-visible` 2px ring. "Login with Google" / "Forgot password?" / "Sign up" rendered at reduced opacity with a visible "demo" tag + `aria-disabled` + `title`, so they are obviously inert. Demo credentials in a small bordered note under the form.
- **Home** — sticky navbar (solid surface tone, subtle shadow on scroll, Sora wordmark, Home/Products links, dark-mode toggle, logout ghost button). No search/cart icons in the navbar (non-functional noise). Hero = **3 typographic color-block slides** (teal field · deep-ink panel · warm-sand panel), each a distinct editorial campaign with a large Sora headline left, one short line, one CTA, and a transparent product cutout anchored right. Autoplay ~6s, prev/next + dots, visible pause/play, stops on hover/focus, static under `prefers-reduced-motion`. Below: "Featured Products" = asymmetric **featured-first bento** (one large tile + staggered cards) over a clean repeatable card unit; borderless cards on warm-gray tiles, 4:5 image, price prominent, small rating; one data-driven "Bestseller" tag only.
- **Product detail** — sticky gallery left + scrollable info right (desktop), single column mobile with sticky bottom Add to Cart; breadcrumb Home > Products > {title}; large price + rating; tabs Description/Specifications/Reviews; "Add to Cart" (teal) with local feedback (button → "Added ✓" state + small count), "Add to Wishlist" (ghost) as a local toggle; long description ~65ch; real metadata (brand/stock/warranty/shipping).

## Motion

CSS-only transform/opacity. 150ms hover, 200ms opacity, 300ms panel/slide; one orchestrated entrance on the hero (not per-section fade). Skeleton shimmer on product load. All gated by `prefers-reduced-motion` (read via `matchMedia` change listener). The hero slider is the primary interactive moment; Add to Cart gives tactile feedback.

## Principles

- Boldness in one place (hero + price treatment); disciplined elsewhere.
- Anti-slop guardrails honored: no eyebrows/pill badges, no middle-dot meta, no mono data-labels, no '→' on every button, no identical-card shadow, no blue-purple gradient, no glass, no vanity numbers (real API prices/ratings only).
- A11y as token: contrast ≥4.5:1, `:focus-visible` 2px ring, ≥44px targets, semantic HTML, carousel follows W3C APG 2.2.2 (pause control, aria-roledescription).
- Dark-mode toggle: in navbar, accessible name, persists in localStorage, respects `prefers-color-scheme` on first load.

## Anti-slop self-review (what changed vs defaults)

- Palette: neutral chalk + **deep petrol teal** accent + sans type — clears cream+serif+sage, yellow-cream+terracotta, cobalt, and near-black+acid-green.
- Type: Sora + Plus Jakarta Sans (not Inter/Roboto/Poppins); no monospace labels.
- Grid: bento first row, not uniform identical icon-cards; borderless product cards on rounded tiles with a soft lift on hover.
- Hero: typographic color-block, not "image + centered tagline" or full-bleed photo; no backdrop blur.
