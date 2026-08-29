'use client';

/**
 * One-tap last working-set ghost (.738). Outline ink — Log set owns poster red.
 * Compact (ink dock) and desktop (paper table) share this control.
 */

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  formatLastSetGhostExtras,
  shouldOfferLastSetGhost,
  type LastSetGhost,
} from '@/lib/workout/lastSetGhost';
import { formatSetRowPrev, type SetRowType } from '@/lib/workout/setRowType';

type Props = {
  ghost: LastSetGhost | null | undefined;
  dial: { reps: number; weight: number; durationSeconds?: number };
  onAccept: (ghost: { reps: number; weight: number; durationSeconds?: number }) => void;
  /** Ink dock vs paper table. */
  tone: 'ink' | 'paper';
  rowType?: SetRowType;
  bodyweightLabel?: string;
};

export function LastSetGhostButton({
  ghost,
  dial,
  onAccept,
  tone,
  rowType = 'weight',
  bodyweightLabel,
}: Props) {
  const { t } = useTranslation();
  if (!shouldOfferLastSetGhost(ghost, dial) || !ghost) return null;
  const extras = formatLastSetGhostExtras(ghost);
  const bw = bodyweightLabel ?? t('activeSetBodyweight', { defaultValue: 'BW' });
  const line = t('activeLastPerformance', {
    line: formatSetRowPrev({
      type: rowType,
      reps: ghost.reps,
      weight: ghost.weight,
      bodyweightLabel: bw,
      durationSeconds: ghost.durationSeconds,
    }),
    defaultValue: 'Last: {{line}}',
  });

  return (
    <button
      type="button"
      onClick={() =>
        onAccept({
          reps: ghost.reps,
          weight: ghost.weight,
          ...(ghost.durationSeconds && ghost.durationSeconds > 0
            ? { durationSeconds: ghost.durationSeconds }
            : {}),
        })
      }
      data-testid="last-set-ghost"
      data-ghost-reps={ghost.reps}
      data-ghost-weight={ghost.weight}
      aria-label={t('activeCopyLast', { defaultValue: 'Copy last' })}
      className={cn(
        'min-h-[44px] w-full tap-target',
        tone === 'ink'
          ? 'mt-1.5 border border-neutral-500 bg-transparent px-3 text-start text-sm font-semibold tabular-nums text-neutral-100'
          : 'house-btn house-btn-ghost house-last-ghost mt-1.5 w-full justify-start tabular-nums'
      )}
    >
      {line}
      {extras}
    </button>
  );
}
