/** Shared motion tokens and reduced-motion helper. */

export const MOTION_DURATION_FAST = 200;
export const MOTION_DURATION = 300;
export const MOTION_DURATION_SLOW = 450;

export const MOTION_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Animate a number from `from` to `to` over `durationMs` (skipped when reduced motion). */
export function animateCount(
  from: number,
  to: number,
  durationMs: number,
  onFrame: (value: number) => void,
  onDone?: () => void
): () => void {
  if (prefersReducedMotion() || from === to) {
    onFrame(to);
    onDone?.();
    return () => {};
  }
  const start = performance.now();
  let raf = 0;
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = 1 - Math.pow(1 - t, 3);
    onFrame(Math.round(from + (to - from) * eased));
    if (t < 1) raf = requestAnimationFrame(tick);
    else onDone?.();
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
