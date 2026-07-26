'use client';

import { cn } from '@/lib/utils';

export type ScoreNumeralProps = {
  /** Caps label above the numeral — "MISSION SCORE", "READINESS". */
  label: string;
  /**
   * `null` renders an em-dash. First-run screens show em-dash scores rather
   * than a zero, because a 0 reads as failure on day one when the real state
   * is "not measured yet" (handoff first-run spec).
   */
  value: number | string | null;
  /** Change vs. the previous period. Omit when there is nothing to compare to. */
  delta?: number | null;
  /** Unit or qualifier under the delta — "vs last week". */
  caption?: string;
  /**
   * Whether a rising number is a good outcome. True for Mission Score and
   * volume; false for the metrics where lower is the win (stress, resting HR).
   */
  higherIsBetter?: boolean;
  size?: 'md' | 'lg';
  className?: string;
};

/**
 * Big tabular numeral + delta line — the Modernist replacement for a
 * ProgressRing score. Rings are deleted system-wide: a number is read faster
 * than an arc, and 800-weight Archivo at 40–56px is the system's loudest
 * non-red emphasis.
 */
export function ScoreNumeral({
  label,
  value,
  delta,
  caption,
  higherIsBetter = true,
  size = 'lg',
  className,
}: ScoreNumeralProps) {
  const display = value === null ? '—' : value;
  const hasDelta = delta !== undefined && delta !== null && value !== null;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          'font-extrabold leading-[0.95] tabular-nums',
          size === 'lg' ? 'text-[56px]' : 'text-[40px]',
          value === null && 'text-muted-foreground'
        )}
      >
        {display}
      </span>
      {(hasDelta || caption) && (
        <span className="flex items-baseline gap-1.5 text-[12px] tabular-nums">
          {hasDelta && (
            <span className={cn('font-semibold', deltaToneClass(delta, higherIsBetter))}>
              {delta > 0 ? '+' : ''}
              {delta}
            </span>
          )}
          {caption && <span className="text-muted-foreground">{caption}</span>}
        </span>
      )}
    </div>
  );
}

/**
 * Decide how a delta is coloured.
 *
 * TODO(founder): implement. This is a product-tone call, not a styling detail —
 * see the note in chat. Returns a Tailwind text-colour class.
 *
 * Available: `text-primary` (#ae1800, the AA-safe red — reads as emphasis, and
 * in this system red is the only colour, so it means "notable", not "bad"),
 * `text-foreground` (plain ink), `text-muted-foreground` (recessive).
 * Do NOT introduce green — the palette is one red on paper by design.
 */
function deltaToneClass(delta: number, higherIsBetter: boolean): string {
  return 'text-muted-foreground';
}
