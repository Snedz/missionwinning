import { cn } from '@/lib/utils';

/**
 * The MW monogram — rounded emerald square, white letters.
 *
 * Six near-identical copies of this existed inline; this is the single source so the
 * mark stays consistent with `/favicon.svg` and the PWA rasters, all of which use
 * `hsl(158 64% 42%)` (the `--primary` accent, not `--primary-fill`).
 *
 * It deliberately keeps the accent value even though white-on-accent is 2.77:1:
 * WCAG 1.4.3 exempts logotypes from contrast requirements, and darkening only the
 * in-app mark would put it out of step with the icon files it is supposed to match.
 * `data-brand-monogram` marks it so the axe suite can exempt it by selector rather
 * than by blanket-disabling the color-contrast rule — see tests/e2e/a11y.spec.ts.
 */
export function BrandMonogram({
  className,
  display,
}: {
  className?: string;
  /** Use the display face — for the guide/gate shells that set the wordmark in Barlow. */
  display?: boolean;
}) {
  return (
    <span
      data-brand-monogram
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground',
        display && 'font-display',
        className ?? 'h-8 w-8 text-sm'
      )}
    >
      MW
    </span>
  );
}
