import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Slide {
  kicker: string;
  title: string;
  line: string;
  cta: string;
  cat: string | null;
  image: string;
  imageAlt: string;
  panel: 'accent' | 'ink' | 'sand';
}

@Component({
  selector: 'app-hero-slider',
  imports: [RouterLink],
  template: `
    <section
      class="container-page pt-6"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      (focusin)="focused.set(true)"
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

      <div
        class="relative overflow-hidden"
        aria-live="off"
        style="border-radius: var(--radius-lg)"
      >
        <div class="grid">
          @for (slide of slides(); track slide.title; let i = $index) {
            <div
              role="group"
              aria-roledescription="slide"
              [attr.aria-label]="i + 1 + ' of ' + slides().length"
              [attr.aria-hidden]="i === index() ? null : 'true'"
              [inert]="i !== index()"
              class="col-start-1 row-start-1 grid min-h-[460px] items-center gap-6 overflow-hidden p-8 transition-transform duration-500 ease-out md:grid-cols-2 md:p-14"
              [style.background]="panelBackground(slide.panel)"
              [style.color]="panelColor(slide.panel)"
              [style.transform]="'translateX(' + (i - index()) * 100 + '%)'"
            >
              <div class="max-w-md">
                <p class="text-sm font-medium" style="opacity: 0.85">{{ slide.kicker }}</p>
                <h2
                  class="mt-3 font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl"
                >
                  {{ slide.title }}
                </h2>
                <p class="mt-4 max-w-sm text-base" style="opacity: 0.92">{{ slide.line }}</p>
                <a
                  [routerLink]="['/products']"
                  [queryParams]="slide.cat ? { cat: slide.cat } : {}"
                  class="btn mt-7"
                  [style.background]="slide.panel === 'sand' ? '#1a1a18' : '#ffffff'"
                  [style.color]="slide.panel === 'sand' ? '#ffffff' : '#1a1a18'"
                  (mouseenter)="hovering.set(true)"
                  (mouseleave)="hovering.set(false)"
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
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <div class="flex w-56 items-center gap-1.5" role="group" aria-label="Choose slide">
          @for (slide of slides(); track slide.title; let i = $index) {
            <button
              type="button"
              class="relative h-1.5 flex-1 overflow-hidden rounded-full"
              style="background: var(--line)"
              [attr.aria-label]="'Go to slide ' + (i + 1)"
              [attr.aria-current]="i === index() ? 'true' : null"
              (click)="goTo(i)"
            >
              @if (i === index()) {
                <span
                  class="absolute inset-y-0 left-0 rounded-full"
                  style="background: var(--accent); animation: hero-fill 4000ms linear"
                  [style.animation-play-state]="paused() ? 'paused' : 'running'"
                ></span>
              }
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            class="btn btn-outline h-11 w-11 p-0"
            (click)="next()"
            aria-label="Next slide"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
  readonly hovering = signal(false);
  readonly focused = signal(false);
  /** Bumped on manual navigation so the autoplay timer restarts from zero. */
  readonly resetTick = signal(0);
  readonly paused = computed(
    () => this.hovering() || this.focused() || !this.playing(),
  );

  private timer: ReturnType<typeof setInterval> | null = null;

  // Fixed brand panels (theme-independent) so contrast holds in light and dark.
  private static readonly PANELS: Record<Slide['panel'], { bg: string; fg: string }> = {
    accent: { bg: '#0f6e5c', fg: '#ffffff' },
    ink: { bg: '#1a1a18', fg: '#ffffff' },
    sand: { bg: '#e7e0d3', fg: '#1a1a18' },
  };

  constructor() {
    const destroyRef = inject(DestroyRef);

    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reduceMotion.set(mq.matches);
      mq.addEventListener?.('change', (event) => this.reduceMotion.set(event.matches));
    }

    effect(() => {
      const count = this.slides().length;
      // Reading resetTick re-subscribes this effect so a manual nav restarts the timer.
      void this.resetTick();
      const paused =
        this.hovering() || this.focused() || !this.playing() || this.reduceMotion();

      this.stopTimer();
      if (!paused && count > 1) {
        this.timer = setInterval(() => this.index.update((i) => (i + 1) % count), 4000);
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
    this.resetTick.update((value) => value + 1);
  }

  toggle(): void {
    this.playing.update((value) => !value);
  }

  onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    const current = event.currentTarget as HTMLElement;
    if (!next || !current.contains(next)) this.focused.set(false);
  }

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
