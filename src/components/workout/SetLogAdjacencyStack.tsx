'use client';
/**
 * Live set row: TARGET above PREVIOUS.
 * Target is the earned next number, or an honest empty. Never a second Prev.
 */

import { cn } from '@/lib/utils';

type Props = {
  targetWord: string;
  targetLabel: string | null;
  citeLine: string | null;
  /** No invented number — TARGET eyebrow + this copy. */
  emptyLine: string | null;
  prevWord: string;
  prevLabel: string | null;
  /** Live incomplete row only — planned rows keep PREVIOUS. */
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
    <span className="house-set-stack-in" data-testid={`${testIdPrefix}-adjacency`}>
      {showNumber ? (
        <span data-testid={`${testIdPrefix}-target`} data-target-anchor="true">
          <span className="house-set-kicker">{targetWord}</span>
          <span className="house-set-target">{targetLabel}</span>
          {citeLine ? (
            <span className="house-set-prev" data-testid={`${testIdPrefix}-target-cite`}>
              {citeLine}
            </span>
          ) : null}
        </span>
      ) : null}
      {showEmpty ? (
        <span data-testid={`${testIdPrefix}-target-empty`} data-target-anchor="empty">
          <span className="house-set-kicker">{targetWord}</span>
          <span className="house-lede">{emptyLine}</span>
        </span>
      ) : null}
      <span
        className={cn('house-set-prev', show && 'is-under-target')}
        data-testid={`${testIdPrefix}-prev`}
        data-prev-anchor={prevLabel ? 'true' : 'empty'}
      >
        <span className="house-set-kicker">{prevWord}</span>
        <span className="house-set-prev-value">{prevShown}</span>
      </span>
    </span>
  );
}
