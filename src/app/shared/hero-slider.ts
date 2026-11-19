import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';

export interface Slide {
  kicker: string;
  title: string;
  line: string;
  cta: string;
  href: string;
  image: string;
  imageAlt: string;
  panel: 'accent' | 'ink' | 'sand';
}

@Component({
  selector: 'app-hero-slider',
  template: `
    <section
      class="container-page pt-6"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      (mouseenter)="interacting.set(true)"
      (mouseleave)="interacting.set(false)"
      (focusin)="interacting.set(true)"
      (focusout)="onFocusOut($event)"
    >
      <div class="mb-3 flex items-center justify-end">
        <button
          type="button"
          class="btn btn-outline"
          (click)="toggle()"
          [attr.aria-label]="playing() ? 'Pause slide rotation' : 'Start slide rotation'"
        >
          @if (playing()) {
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
            Pause
          } @else {
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 4v16l13-8Z" />
            </svg>
            Play
          }
        </button>
      </div>

      <div class="relative overflow-hidden" aria-live="off">
        @for (slide of slides(); track slide.title; let i = $index) {
          @if (i === index()) {
            <div
              role="group"
              aria-roledescription="slide"
              [attr.aria-label]="i + 1 + ' of ' + slides().length"
              class="grid min-h-[460px] items-center gap-6 p-8 md:grid-cols-2 md:p-14"
              [style.background]="panelBackground(slide.panel)"
              [style.color]="panelColor(slide.panel)"
            >
              <div class="max-w-md">
                <p class="text-sm font-medium" style="opacity: 0.82">{{ slide.kicker }}</p>
                <h2
                  class="mt-3 font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl"
                >
                  {{ slide.title }}
                </h2>
                <p class="mt-4 max-w-sm text-base" style="opacity: 0.9">{{ slide.line }}</p>
                <a
                  [href]="slide.href"
                  class="btn mt-7"
                  [style.background]="slide.panel === 'sand' ? '#1a1a18' : '#ffffff'"
                  [style.color]="slide.panel === 'sand' ? '#ffffff' : '#1a1a18'"
                  >{{ slide.cta }}</a
                >
              </div>
              <div class="flex items-center justify-center">
                <img
                  [src]="slide.image"
                  [alt]="slide.imageAlt"
                  fetchpriority="high"
                  class="max-h-[300px] w-auto object-contain sm:max-h-[360px]"
                />
              </div>
            </div>
          }
        }
      </div>

      <div class="mt-4 flex items-center justify-between">
        <div class="flex items-center gap-2" role="group" aria-label="Choose slide">
          @for (slide of slides(); track slide.title; let i = $index) {
            <button
              type="button"
              class="grid h-11 w-11 place-items-center"
              [attr.aria-label]="'Go to slide ' + (i + 1)"
              [attr.aria-current]="i === index() ? 'true' : null"
              (click)="goTo(i)"
            >
              <span
                class="h-2.5 w-2.5"
                [style.background]="i === index() ? 'var(--accent)' : 'var(--line)'"
              ></span>
            </button>
          }
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="btn btn-outline h-11 w-11 p-0"
            (click)="prev()"
            aria-label="Previous slide"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            class="btn btn-outline h-11 w-11 p-0"
            (click)="next()"
            aria-label="Next slide"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  `,
})
export class HeroSlider {
  readonly slides = input.required<Slide[]>();

  readonly index = signal(0);
  readonly playing = signal(true);
  readonly reduceMotion = signal(false);
  readonly interacting = signal(false);

  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);

    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reduceMotion.set(mq.matches);
      mq.addEventListener?.('change', (event) => this.reduceMotion.set(event.matches));
    }

    effect(() => {
      const count = this.slides().length;
      const shouldPlay = this.playing() && !this.reduceMotion() && !this.interacting();
      this.stopTimer();
      if (shouldPlay && count > 1) {
        this.timer = setInterval(() => this.index.update((i) => (i + 1) % count), 6000);
      }
    });

    destroyRef.onDestroy(() => this.stopTimer());
  }

  next(): void {
    this.goTo(this.index() + 1);
  }

  prev(): void {
    this.goTo(this.index() - 1);
  }

  goTo(index: number): void {
    const count = this.slides().length;
    this.index.set(((index % count) + count) % count);
  }

  toggle(): void {
    this.playing.update((value) => !value);
  }

  onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    const current = event.currentTarget as HTMLElement;
    if (!next || !current.contains(next)) this.interacting.set(false);
  }

  // Fixed brand panels (theme-independent) so contrast holds in light and dark.
  private static readonly PANELS: Record<
    Slide['panel'],
    { bg: string; fg: string }
  > = {
    accent: { bg: '#0f6e5c', fg: '#ffffff' },
    ink: { bg: '#1a1a18', fg: '#ffffff' },
    sand: { bg: '#e7e0d3', fg: '#1a1a18' },
  };

  panelBackground(panel: Slide['panel']): string {
    return HeroSlider.PANELS[panel].bg;
  }

  panelColor(panel: Slide['panel']): string {
    return HeroSlider.PANELS[panel].fg;
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
