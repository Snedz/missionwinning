import { cn } from '@/lib/utils';

/**
 * The MW monogram — Modernist plain ink square, paper letters, zero radius
 * (rebrand wave D5; the rounded emerald mark is retired everywhere, favicon and
 * PWA icons included). Ink on paper is ~15:1, but `data-brand-monogram` stays so
 * the axe exemption in tests/e2e/a11y.spec.ts keeps matching if a reversed or
 * red poster variant is ever placed on a tinted field.
 */
export function BrandMonogram({
  className,
  display,
}: {
  className?: string;
  /** Use the display face — for the guide/gate shells that set the wordmark in the display font. */
  display?: boolean;
}) {
  return (
    <span
      data-brand-monogram
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-none bg-foreground font-extrabold tracking-[-0.04em] text-background',
        display && 'font-display',
        className ?? 'h-8 w-8 text-sm'
      )}
    >
      MW
    </span>
  );
}
