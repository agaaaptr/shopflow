# ShopFlow — Design & Keputusan Terkunci

Front-end e-commerce take-home untuk **Unictive** (Angular + Tailwind CSS). Referensi: screenshot "ShopEase".

Sumber brief: [`docs/brief.md`](./brief.md). Riset best practice + sumber URL: [`docs/research.md`](./research.md).

> **Verified 2026-11-19** lewat riset paralel (5 topik, ~142 tool call) + verifikasi adversarial klaim kritis. Koreksi penting tercantum di `research.md` §Corrections.

## 1. Intent

Tiga halaman e-commerce: **login** (email+password via reqres.in), **home** (1 slider + grid produk dummyjson), **detail produk**. Hanya user login yang bisa akses home & detail (route guard) + tombol logout. "Tampilan dibuat semenarik mungkin."

## 2. Keputusan terkunci (disetujui user)

| # | Keputusan | Pilihan |
|---|---|---|
| D1 | Scope | **Frontend saja.** Challenge TS (hal. 2 PDF) = file contoh terpisah, dihapus setelah copy-paste. |
| D2 | Login API | **reqres.in** `/api/login` (email+password). Produk = **dummyjson**. |
| D3 | Arah desain | **Elevated & khas** (struktur ShopEase, art direction lebih berani — bukan clone persis). |
| D4 | Submission | **GitHub repo + README** (tanpa live URL). |
| D5 | Nama | Folder/repo `shopflow`; brand app **"ShopEase"** (dari referensi). |

**Catatan risiko (D2):** reqres.in keyless adalah *shared demo* dengan **daily limit rendah**. Login hanya butuh 1 request saat demo; kredensial demo = `eve.holt@reqres.in` / `cityslicka` (token statis `QpwL5tke4Pnpja7X4`). Fallback bila quota habis: ganti ke dummyjson `/auth/login` (username+password, `emilys`/`emilyspass`) — dokumentasikan di README.

## 3. Stack (terverifikasi)

- **Angular 22** (latest stable **22.3.0**, 2026-11-18). Standalone components (default), **Signals** sebagai model reaktivitas, **zoneless** (default v21+) + **OnPush** (default v22), control flow `@if`/`@for`, functional guard `CanActivateFn`, `provideHttpClient(withInterceptors)`.
- **Tailwind CSS v4** (CSS-first): `npm install tailwindcss @tailwindcss/postcss postcss` → buat **`.postcssrc.json`** (bukan `postcss.config.js`) dengan plugin `@tailwindcss/postcss` → `@import "tailwindcss"` di `src/styles.css`. **Tanpa** `tailwind.config.js` — token di blok `@theme`.
- **Tanpa SSR** (CSR adalah default `ng new`; jangan pakai `--ssr`). Node 20+, TypeScript 6.

## 4. Arsitektur app

- Scaffold: `ng new shopflow --style css` (tanpa `--ssr`).
- `app.config.ts`: `provideRouter(routes)` + `provideHttpClient(withInterceptors([authInterceptor]))`.
- Routing (standalone, lazy `loadComponent`):
  - `/login` → LoginPage (public)
  - `/home` → HomePage (`canActivate: [authGuard]`)
  - `/product/:id` → ProductDetailPage (`canActivate: [authGuard]`)
  - `''` → redirect `/home`; `**` → redirect `/home`
- Auth:
  - `AuthService` — token di `signal`, seeded dari localStorage (persist refresh), source of truth untuk guard/interceptor.
  - `auth.guard.ts` — `CanActivateFn` + `inject()`; return `RedirectCommand(router.parseUrl('/login'), { info: { returnUrl: state.url } })` — **bukan** return `false` lalu `router.navigate()`.
  - `auth.interceptor.ts` — `HttpInterceptorFn`; clone request + `Authorization: Bearer`; 401 → redirect login (flag anti-loop, skip endpoint login).
- Services: `auth.service`, `product.service` (dummyjson). Login pakai **reactive form** (`Validators.required` + `Validators.email`).
- Folder: `core/` (services/guard/interceptor), `features/login|home|product/`, `shared/` (product-card, slider, button, input, badge).

## 5. API integration

**Login (reqres.in)** — terverifikasi live 2026-11-19:
- `POST https://reqres.in/api/login` `{email, password}` → `200 {token}` sukses (`eve.holt@reqres.in`/`cityslicka` → token `QpwL5tke4Pnpja7X4`); `400 {error:"user not found"}` gagal.
- Token **tidak** divalidasi di request berikutnya (mock stateless) → guard cukup cek token ada.

**Produk (dummyjson)** — terverifikasi:
- `GET https://dummyjson.com/products` → `{products[], total:194, skip, limit}`. Setiap produk punya 22 field: `title, description, category, price, discountPercentage, rating, stock, tags, brand, thumbnail, images[], reviews[], meta{...}`, dst.
- `GET /products/{id}`, `/products/category-list`, `/products/search?q=`, pagination `limit/skip/select`.
- **CORS open** (tanpa proxy). Writes tidak persist → read-only untuk demo.

## 6. Design system — tema "elevated & khas" (anti-slop)

### 6.1 Art direction

> **"Quiet premium marketplace."** Krom UI netral (ink + paper), **satu aksen hangat yang tegas**, dan foto produk dummyjson yang membawa warna. Tipografi khas (bukan Inter/Roboto), satu momen memorable, motion halus CSS-only.

**Anti-slop guardrails (diverifikasi):** jangan Inter/Roboto/Poppins · jangan gradient ungu-biru · jangan grid 3-kolom identik · jangan pill badge hero · jangan semua-center · jangan corner berlebihan · dan jangan "cream + serif + sage green" (tell terbaru). Jangan clone pixel-perfect referensi — ekstrak struktur, lalu *re-theme*.

### 6.2 Token (Tailwind v4 `@theme inline`)

Dua lapis **primitive → semantic** (lapis component opsional). Semantic **wajib `@theme inline`** agar `var()` tidak di-resolve di `:root` dan dark mode tidak rusak.

```css
/* src/styles.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --paper: #F7F5F1;          /* bg halaman */
  --surface: #FFFFFF;        /* kartu */
  --ink: #1B1917;            /* teks utama */
  --ink-muted: #6B675F;      /* teks sekunder */
  --line: #E5E1D8;           /* border */
  --accent: #A05A2C;         /* aksi primer / fokus (copper) */
  --accent-strong: #7C4420;  /* hover */
  --ok: #1F7A44; --danger: #C0392B;
}
.dark {
  --paper: #161513; --surface: #201E1B; --ink: #F0EDE7;
  --ink-muted: #A39D92; --line: #3A3732; --accent: #C9804E;
}

@theme inline {
  --color-paper: var(--paper);
  --color-surface: var(--surface);
  --color-ink: var(--ink);
  --color-ink-muted: var(--ink-muted);
  --color-line: var(--line);
  --color-accent: var(--accent);
  --color-accent-strong: var(--accent-strong);
  --color-ok: var(--ok);
  --color-danger: var(--danger);
  --color-surface-hover: color-mix(in oklab, var(--surface), black 6%);
  --radius-card: 12px;
  --shadow-card: 0 1px 2px rgb(0 0 0 / .06), 0 8px 24px rgb(0 0 0 / .06);
  --font-display: "Sora", sans-serif;
  --font-body: "Plus Jakarta Sans", sans-serif;
}
```

> Palet + type di atas adalah **proposal awal** (anti-slop). Di sesi build, pass desain (`frontend-design` sebagai lead) boleh menyempurnakan warna/type **dalam arah yang sama**, dengan self-review anti-slop — selama tetap khas & tidak masuk daftar tell.

### 6.3 Tipografi

- Display **Sora** (600/700/800) untuk judul/hero; body **Plus Jakarta Sans** (400/500/700). Google Fonts — bukan Inter/Roboto/Poppins.
- Skala: display `clamp(2.25rem, 6vw, 3rem)`/1.05 · h1 2rem/1.1 · h2 1.5rem/1.2 · h3 1.25rem/1.3 · body-lg 1.125rem/1.6 · body 1rem/1.6 · body-sm .875rem/1.5 · caption .75rem/1.4.
- Kontras berat: display bold vs body regular.

### 6.4 Layout, radius, shadow, motion, a11y

- Spacing 4px base (4/8/12/16/24/32/48/64). Container max ~1200px, gutter 16px mobile.
- Radius: sm 4 / md 8 / lg 12 / xl 16 / full — satu bahasa sudut.
- Shadow: 2 level saja (subtle + card), tanpa glow.
- Motion CSS-only (gate `prefers-reduced-motion`): 150ms hover/warna, 200ms opacity, 300ms panel; slider = transform/opacity.
- A11y sebagai token: kontras ≥4.5:1 teks, focus ring 2px `--color-accent` di `:focus-visible`, tap target ≥44px.

## 7. Component inventory

- **LoginPage** — form email/password + validasi + error state.
- **HomePage** — hero slider (1) + grid "Featured Products".
- **ProductCard** — thumbnail, title, price, rating, CTA.
- **ProductDetailPage** — breadcrumb, gallery, harga, deskripsi, Add to Cart / Wishlist.
- **Navbar** — logo + tombol logout (tampil saat login).
- **Button** (primary/secondary/ghost), **Input**, **Badge**, **Spinner/Empty state**, **Toast** (opsional).

## 8. Non-goals

Tanpa sign-up · tanpa cart/wishlist persisten (tombol boleh state lokal/dekoratif) · tanpa payment · tanpa dark mode (nice-to-have) · tanpa SSR · tanpa store (ngrx) · tanpa GSAP · search server-side opsional.

## 9. Sesi berikutnya

Scaffold `ng new` + Tailwind v4 → bangun routing + auth → 3 halaman dengan pass desain (`frontend-design` lead) → review (`impeccable audit` + `emil-design-eng review-animations`). Deliverable: `README.md` (setup + kredensial demo + keputusan teknis). Setelah user copy-paste `docs/challenge-typescript.md`, **hapus file itu**.
