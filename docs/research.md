# Research — Unictive Front End (Angular + Tailwind)

Adopted best practices untuk take-home Unictive (Angular 22 + Tailwind v4 + reqres.in + dummyjson). _Dihasilkan dari riset paralel 5 topik + pass verifikasi adversarial. Sumber URL dikutip inline. Semua angka diverifikasi live 2026-11-19._

## Corrections (pass verifikasi adversarial)

Klaim awal riset dicek ulang; berikut koreksi yang sudah dilipat ke `design.md`:

1. **Versi Angular:** stable terbaru adalah **22.3.0** (npm `latest`, 2026-11-18), bukan 22.2.6. → https://registry.npmjs.org/@angular/core ; https://endoflife.date/angular
2. **Mekanisme `@theme inline`:** default `@theme` meng-emit `:root { --x: var(--y) }`; inner `var()` di-resolve **di tempat deklarasi** (`:root`), jadi override `.dark` tidak berlaku. `@theme inline` menghindari ini untuk token yang mereferensikan variabel lain. → https://tailwindcss.com/docs/theme ; https://tailwindcss.com/blog/tailwindcss-v4-3
3. **Dark mode Tailwind v4:** `@custom-variant dark (&:where(.dark, .dark *))` adalah sintaks resmi; pola "two-layer bridge" (raw var di `:root`/`.dark` + semantic via `@theme inline`) adalah pola pihak ketiga yang direkomendasikan, bukan mandat docs. → https://tailwindcss.com/docs/dark-mode
4. **Struktur `DESIGN.md` Google Labs = 10 section, bukan 8:** Overview → Colors → Typography → Layout → Elevation & Depth → Shapes → **Motion & Micro-interaction** → **Voice & Content Strategy** → Components → Do's/Don'ts. → https://github.com/google-labs-code/design.md/blob/main/docs/spec.md
5. **Focus indicator 3:1 = WCAG 2.4.13 (AAA di 2.2),** bukan AA. Kontras teks 4.5:1 = SC 1.4.3 (AA); non-text 3:1 = SC 1.4.11 (AA). → https://www.w3.org/WAI/WCAG22/Understanding/
6. **Port shadcn/ui untuk Angular = "Spartan"** (`@spartan-ng/brain` + `@spartan-ng/cli`, spartan.ng), bukan "shadcn-ng". → https://spartan.ng
7. **reqres.in keyless = shared demo, daily limit rendah** (verifikasi live: respons menyatakan "low daily limit"; token login statis `QpwL5tke4Pnpja7X4`). Pertimbangkan fallback dummyjson `/auth/login`.

---

## 1. Angular 22 + Tailwind v4 (setup)

**Summary:** Angular 22 stable (rilis 2026-06-03). Idiomatik 2026: standalone components (default, `standalone` implied sejak v19), **Signals** sebagai model reaktivitas, built-in control flow (`@if`/`@for`/`@switch`), functional guard (`CanActivateFn`), **zoneless** (default v21+) + **OnPush** (default v22). Tailwind v4 CSS-first, integrasi Angular via **`@tailwindcss/postcss`** di `.postcssrc.json` (bukan Vite plugin, bukan `postcss.config.js`). `ng new` default CSR (tanpa SSR).

**Fakta terverifikasi:**
- Angular 22.3.0 = latest stable (2026-11-18). Scaffold `ng new`. Standalone default. — https://angular.dev/cli/new ; https://endoflife.date/angular
- Zoneless default v21+, OnPush default v22 (`ChangeDetectionStrategy.Default` deprecated → `Eager`). — https://angular.dev/guide/zoneless ; https://angular.dev/api/core/ChangeDetectionStrategy
- Tailwind v4 setup: `npm install tailwindcss @tailwindcss/postcss postcss` → `.postcssrc.json` `{"plugins":{"@tailwindcss/postcss":{}}}` → `@import "tailwindcss"` di `src/styles.css`. Builder Angular membaca `.postcssrc.json`. — https://angular.dev/guide/tailwind ; https://tailwindcss.com/docs/installation/framework-guides/angular
- CSR default; SSR hanya dengan `ng new --ssr`. — https://angular.dev/guide/ssr
- HttpClient standalone: `provideHttpClient(withInterceptors([...]))` di `app.config.ts`. v22 menghapus `withFetch()` (Fetch sudah default). — https://angular.dev/guide/http/setup

**Pitfalls:** zone.js tak auto-dihapus (hapus dari polyfills agar bundle mengecil) · Tailwind v4 tanpa `tailwind.config.js` (jangan paste direktif v3) · builder baca `.postcssrc.json` bukan `postcss.config.js` · state dari async unpatched (fetch/setTimeout/RxJS) tak re-render di zoneless kecuali ditulis ke signal.

**Rekomendasi:** `ng new --style css` (tanpa `--ssr`) + 3 perintah Tailwind v4 + `.postcssrc.json` + `@import "tailwindcss"`. Standalone + Signals + `@if`/`@for` + `CanActivateFn`. State = signal/computed biasa; tanpa store/SSR.

## 2. dummyjson — kontrak API

**Summary:** API gratis, keyless, **CORS open** (echo Origin, `allow-credentials:true`, jawab preflight 204). Produk: envelope `{products, total:194, skip, limit}`, 22 field per produk. Auth (bila dipakai sebagai fallback): `POST /auth/login {username,password}` → flat object; password = `username + "pass"` (208 user).

**Fakta terverifikasi (live 2026-11-19):**
- `GET /products` → `{products[], total:194, skip, limit}`; tiap produk 22 field (`title, description, category, price, discountPercentage, rating, stock, tags, brand, thumbnail, images[], reviews[], meta{...}`, dst). — https://dummyjson.com/docs/products
- `/products/{id}`, `/products/category-list` (array slug), `/products/category/{cat}`, `/products/search?q=`, pagination `limit/skip/select` (+`sortBy/order`). — https://dummyjson.com/docs/products
- Auth fallback: `POST /auth/login {username:'emilys', password:'emilyspass'}` → `{accessToken, refreshToken, id, username, email, firstName, lastName, gender, image}` (flat, tanpa wrapper). Hanya 208 user asli yang valid; password = username+'pass'. — https://dummyjson.com/docs/auth
- accessToken HS256 JWT, expiry 60 menit; dipakai sebagai `Authorization: Bearer`; validasi via `GET /auth/me`. — https://dummyjson.com/docs/auth
- CORS open: preflight 204, echo Origin, allow-credentials. Tanpa proxy dari browser Angular. — (diverifikasi live)

**Pitfalls:** login tidak terima kredensial sembarang (hanya 208 user asli) · respons flat (bukan `{user:{...}}`) · `/auth/me` mengembalikan `password/ssn/bank/crypto` (jangan log/persist) · writes tidak persist · `total` berubah-ubah (baca dari envelope, jangan hardcode) · `category-list` (array string) ≠ `/products/categories` (array objek).

**Rekomendasi:** produk read-only dari `GET /products` (+`/products/{id}`); tanpa proxy (CORS open). Bila login dialihkan ke sini, hardcode `emilys/emilyspass`.

## 3. Auth guard + login flow Angular

**Summary:** Idiomatik 2026: functional guard `CanActivateFn` + `inject()`, redirect via return `UrlTree`/`RedirectCommand` (bukan `router.navigate()`); functional interceptor `HttpInterceptorFn` via `withInterceptors`; token di `AuthService` (in-memory source of truth) + localStorage untuk persist refresh (demo); reactive form `Validators.required`/`email`; standalone `provideRouter` + lazy `loadComponent`; `environment.ts` dibuat manual (dihapus dari scaffold sejak v15) + `proxy.conf.json`.

**Fakta terverifikasi:**
- Guard: return `UrlTree`/`RedirectCommand`, jangan `false` + `navigate()`. — https://v20.angular.dev/guide/routing/route-guards
- Interceptor: `HttpInterceptorFn` + `req.clone({ setHeaders })`, register `withInterceptors`. — https://angular.dev/guide/http/interceptors
- Reactive form + `Validators.email`; custom validator return `ValidationErrors | null`. — https://v20.angular.dev/api/forms/Validators
- Lazy `loadComponent` via `provideRouter`. — https://v20.angular.dev/reference/migrations/route-lazy-loading
- `proxy.conf.json` hanya untuk `ng serve` (bukan produksi); `environment.ts` tak lagi di-scaffold sejak v15. — https://angular.dev/tools/cli/serve

**Pitfalls:** baca token langsung dari localStorage tiap request (request login pertama bisa miss) · 401 tanpa flag anti-loop (parallel request → navigasi berulang) · interceptor ikut fire di `/login` (loop) · sessionStorage per-tab (tab baru hilang auth).

**Rekomendasi:** `AuthService` (signal token, seed localStorage) + `authGuard: CanActivateFn` + satu `authInterceptor: HttpInterceptorFn` (Bearer + 401→login dengan flag) + reactive form login. Skip refresh-token/httpOnly-cookie (real backend, bukan demo).

## 4. Design system / token / anti-slop (2026)

**Summary:** Konsensus 2025–2026: hierarki token 3 lapis (**primitive → semantic → component**, lapis component opsional) dengan alias ke bawah. Tailwind v4 CSS-first: token di `@theme`; untuk semantic/dark-mode indirection **wajib `@theme inline`**. "AI slop" punya sidik jari terkodifikasi (Inter/Roboto type, gradient ungu-biru, grid 3-kolom identik, hero badge pill, semua-center, corner berlebihan, urutan section tetap) — **fix #1 = tipografi khas** (drop Inter, weight ekstrem, hero ≥3× body). Tell terbaru = "cream + serif (Fraunces/Instrument) + sage green" (house style Claude saat ini), jadi aturan universalnya: **pilihan yang disengaja & spesifik proyek, bukan tukar satu default dengan default lain**. Google Labs `DESIGN.md` (Apache-2.0) memformalkan doc token: YAML front matter + rasional Markdown, 10 section, Do's/Don'ts sebagai guardrail negatif. A11y di-encode sebagai token.

**Fakta terverifikasi:**
- 3 lapis token (component opsional). — https://zeroheight.com/learn/how-design-tokens-work-types-structure-and-hierarchy/
- `@theme` vs `@theme inline` (inline wajib bila token mereferensikan variabel lain). — https://tailwindcss.com/docs/theme ; https://tailwindcss.com/blog/tailwindcss-v4-3
- Dark mode v4: `@custom-variant dark (&:where(.dark, .dark *))`. — https://tailwindcss.com/docs/dark-mode
- Fingerprint AI-slop + fix tipografi. — https://raw.githubusercontent.com/Eneryleen/ai-web-design-codex/main/07-aesthetics-and-trends/avoiding-generic-ai-aesthetics.md
- Tell "tasteful default" (cream+serif+sage). — https://kylechayka.substack.com/p/the-generic-style-of-ai-web-design ; https://www.skills.sh/folkwayse/opencode-skills/unslop-ui
- Spec `DESIGN.md` Google Labs (10 section). — https://github.com/google-labs-code/design.md/blob/main/docs/spec.md
- A11y: 4.5:1 teks (SC 1.4.3 AA), 3:1 non-text (SC 1.4.11 AA), 3:1 focus (SC 2.4.13). — https://www.w3.org/WAI/WCAG22/Understanding/

**Pitfalls:** `@theme` (bukan `inline`) untuk token semantic/dark → var ter-flatten, dark override diam-diam gagal · komponen menunjuk primitive langsung (bukan semantic alias) · tukar satu default dengan default lain (cream+serif+sage sekarang juga tell) · pertahankan Inter/Roboto + kontras 400-vs-600 · hardcode px di markup alih-alih token · hapus/lewatkan Do's/Don'ts · a11y sebagai afterthought · copy pixel-perfect referensi.

**Rekomendasi:** ikuti `design.md` §6 (token dua lapis + `@theme inline` + guardrail Do's/Don'ts). Slicing: screenshot → ekstrak token (color/type/spacing/radius/shadow) → petakan ke primitive/semantic → tulis `design.md` → inventaris komponen → build. *Faithful-not-copy* = ekstrak struktur & proporsi, lalu tukar dengan palet/type/ritme sendiri dan justifikasi tiap pilihan.

## 5. Skill desain yang perlu di-install (2026)

**Summary:** Solusi "non-templated" adalah **workflow design-plan-then-self-review** (bukan menambah preset), dan failure mode utamanya adalah **precedence** saat banyak skill preset auto-fire & saling meniadakan. Stack yang direkomendasikan: `frontend-design` (lead — arah estetika + anti-slop), `ui-ux-pro-max:design-system` (support — token), `frontend-stack` (router precedence), dan **Spartan** (`@spartan-ng`) untuk komponen aksesibel Angular bila perlu. Motion = CSS-only (transform/opacity + reduced-motion); GSAP/Motion berlebihan untuk take-home ini. `dataviz` hanya bila ada chart.

**Fakta terverifikasi:**
- frontend-design = kanonik "plan → self-review → build → critique" (anti-default). — https://claude.com/blog/improving-frontend-design-through-skills (SKILL.md terpasang lokal)
- Precedence = failure mode utama stacking skill; router `frontend-stack` (satu lead + ≤2 support). — SKILL.md `frontend-stack` terpasang lokal
- Port shadcn/ui Angular = **Spartan** (`@spartan-ng`), bukan "shadcn-ng". — https://spartan.ng

**Pitfalls:** stacking banyak skill aesthetic-preset → output generik (rata-rata) · `ui-ux-pro-max` via "Upload a skill" gagal (repo >200 file) · GSAP/Motion overkill untuk micro-interaction e-commerce · skill token lama yang emit `tailwind.config.js` v3 konflik dengan Tailwind v4.

**Rekomendasi (untuk take-home ini):** pasang **`impeccable`** (baseline polish/audit), **`taste`** (anti-slop/redesign + preset estetika), **`emil-design-eng`** (motion craft) — melengkapi `frontend-design` + `ui-ux-pro-max` + `frontend-stack` yang sudah ada. Spartan opsional saat butuh primitive aksesibel. Skip `taste-imagegen` (perlu image-gen), `emil-native` (React Native/Swift), dan GSAP.
