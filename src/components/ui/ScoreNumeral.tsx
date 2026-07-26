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
  /** Red numeral. The handoff gives this to the primary score only — one per band. */
  emphasis?: boolean;
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
  emphasis = false,
  size = 'lg',
  className,
}: ScoreNumeralProps) {
  const display = value === null ? '—' : value;
  const hasDelta = delta !== undefined && delta !== null && value !== null;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          'font-extrabold leading-[1] tabular-nums',
          size === 'lg' ? 'text-[56px]' : 'text-[40px]',
          emphasis && 'text-primary',
          value === null && 'text-muted-foreground'
        )}
      >
        {display}
      </span>
      {/*
       * The delta is muted ink whatever direction it points, and that is the
       * handoff's own answer, not a placeholder: every delta in the Today score
       * band ships as `class="text-muted"`. Colouring it would make the app
       * congratulate and scold, and the one colour available to do that with is
       * red — so "down 3" and "up 3" would both read as alarm. The number and
       * its sign carry the direction; the tone stays level.
       */}
      {(hasDelta || caption) && (
        <span className="mt-0.5 flex items-baseline gap-1.5 text-[12px] tabular-nums text-muted-foreground">
          {hasDelta && (
            <span className="font-semibold">
              {delta > 0 ? '+' : ''}
              {delta}
            </span>
          )}
          {caption && <span>{caption}</span>}
        </span>
      )}
    </div>
  );
}
