'use client';

import { cn } from '@/lib/utils';

export type MeterBarProps = {
  /** Visible label, flush left above the bar. Pass '' to render the bar alone. */
  label?: string;
  /** Filled amount. Clamped to 0–`max`. */
  value: number;
  max?: number;
  /**
   * Right-aligned readout above the bar — "132 / 180 g". Callers format it,
   * because the unit and rounding are theirs to decide, not this component's.
   */
  readout?: string;
  /**
   * Over-budget bars fill to 100% and recolor rather than overflowing their
   * track. Fuel needs this (eating 2400 of a 2000 kcal target is a real state);
   * a session-progress bar never goes over and can ignore it.
   */
  over?: boolean;
  /**
   * Which ground the bar is sitting on. The paper track and the accent fill
   * both invert on an ink panel — neutral-300 disappears into neutral-900, and
   * primary-fill is too dark to read against it.
   */
  tone?: 'paper' | 'ink';
  size?: 'sm' | 'md';
  className?: string;
};

/**
 * Square meter bar — the Modernist replacement for a ProgressRing budget.
 *
 * Accent fill on a neutral-200 track, 6px (sm) or 8px (md) tall, radius 0. The
 * fill is `--primary-fill`, not poster red: these sit in rows of three or four
 * and poster is reserved for the one red field per screen.
 */
export function MeterBar({
  label,
  value,
  max = 100,
  readout,
  over = false,
  tone = 'paper',
  size = 'md',
  className,
}: MeterBarProps) {
  const onInk = tone === 'ink';
  const safeMax = max > 0 ? max : 1;
  const clamped = Math.max(0, Math.min(safeMax, value));
  const pct = (clamped / safeMax) * 100;
  const isOver = over && value > safeMax;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || readout) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && (
            <span
              className={cn(
                'text-[11px] font-semibold uppercase tracking-[0.08em]',
                onInk ? 'text-neutral-400' : 'text-muted-foreground'
              )}
            >
              {label}
            </span>
          )}
          {readout && (
            <span className="text-[13px] font-semibold tabular-nums">{readout}</span>
          )}
        </div>
      )}
      {/* neutral-300, not the handoff sheet's neutral-200. That value assumes
          the bar sits on the paper ground; #eae7e7 on a --card panel (#eae9e9)
          is a 1.01:1 difference and the empty track simply vanishes — which is
          exactly the state a budget bar spends its morning in. */}
      <div
        className={cn(
          'w-full',
          onInk ? 'bg-neutral-700' : 'bg-neutral-300',
          size === 'sm' ? 'h-1.5' : 'h-2'
        )}
        role="progressbar"
        aria-label={label || undefined}
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={Math.round(safeMax)}
        aria-valuetext={readout}
      >
        <div
          className={cn(
            'h-full transition-[width] duration-500 ease-out motion-reduce:transition-none',
            isOver ? 'bg-accent-700' : onInk ? 'bg-accent-400' : 'bg-primary-fill'
          )}
          style={{ width: `${isOver ? 100 : pct}%` }}
        />
      </div>
    </div>
  );
}
