'use client';
/**
 * E-Adjacency stack: TARGET (+ log cite or honest empty) above PREVIOUS.
 * Compact row and desktop Prev cell share this grammar — not a HUD overlay.
 * Target paints only when the parent says this is the live row (`showTarget`).
 */

import { cn } from '@/lib/utils';

type Props = {
  targetWord: string;
  targetLabel: string | null;
  citeLine: string | null;
  /** DESIGN_NEXT §A: no invented number — TARGET eyebrow + this copy. */
  emptyLine: string | null;
  prevWord: string;
  prevLabel: string | null;
  /** Live incomplete row only — planned rows keep PREVIOUS, not a tripled stack. */
  showTarget: boolean;
  testIdPrefix: 'set-row' | 'set-table';
};

export function SetLogAdjacencyStack({
  targetWord,
  targetLabel,
  citeLine,
  emptyLine,
  prevWord,
  prevLabel,
  showTarget,
  testIdPrefix,
}: Props) {
  const prevShown = prevLabel?.trim() || '—';
  const showNumber = Boolean(showTarget && targetLabel);
  const showEmpty = Boolean(showTarget && !targetLabel && emptyLine);
  const show = showNumber || showEmpty;

  return (
    <span
      className="flex min-w-[7.25rem] shrink-0 flex-col justify-center leading-none"
      data-testid={`${testIdPrefix}-adjacency`}
    >
      {showNumber ? (
        <span data-testid={`${testIdPrefix}-target`} data-target-anchor="true">
          <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {targetWord}
          </span>
          <span className="mt-0.5 block truncate text-[13px] font-semibold tabular-nums text-foreground">
            {targetLabel}
          </span>
          {citeLine ? (
            <span
              data-testid={`${testIdPrefix}-target-cite`}
              className="mt-0.5 block truncate text-[13px] text-muted-foreground"
            >
              {citeLine}
            </span>
          ) : null}
        </span>
      ) : null}
      {showEmpty ? (
        <span data-testid={`${testIdPrefix}-target-empty`} data-target-anchor="empty">
          <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {targetWord}
          </span>
          <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
            {emptyLine}
          </span>
        </span>
      ) : null}
      <span
        className={cn('flex flex-col justify-center', show && 'mt-1')}
        data-testid={`${testIdPrefix}-prev`}
        data-prev-anchor={prevLabel ? 'true' : 'empty'}
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {prevWord}
        </span>
        <span
          className={cn(
            'mt-0.5 truncate text-[13px] tabular-nums',
            prevLabel ? 'font-semibold text-foreground' : 'text-muted-foreground'
          )}
        >
          {prevShown}
        </span>
      </span>
    </span>
  );
}
