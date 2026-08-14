'use client';

/**
 * One prescribed exercise: what to do, and why.
 *
 * Extracted from `PlanSessionCard` so Today shows the same three facts.
 * Why copy uses `coachWhyLine` (English floors) — same contract as CoachAdaptBanner
 * (`.642` / `.645`). Never blank on hydrate when the engine emitted a catalogued key;
 * never paint a bare key for unknown legacy keys (`coachWhyCompound`).
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getExerciseById } from '@/data/exercises';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { GarageSwapList } from '@/components/workout/GarageSwapList';
import { coachWhyLine } from '@/lib/coach/coachWhyDefaults';
import { listGarageSwaps, shouldShowGarageSwap } from '@/lib/workout/garageSwap';
import type { PlanExercise } from '@/lib/coach/types';

type Props = {
  ex: PlanExercise;
  /** Weight unit label, e.g. "kg". */
  unit: string;
  /** Today's compact rendering drops the rationale line. */
  compact?: boolean;
  /** Garage swap — omitted on Today compact and on done sessions. */
  onSwap?: (toExerciseId: string) => void;
};

export function PlanExerciseLine({ ex, unit, compact = false, onSwap }: Props) {
  const { t } = useTranslation();
  const [swapOpen, setSwapOpen] = useState(false);
  const name = getExerciseById(ex.exerciseId)?.name ?? ex.exerciseId;
  const swapOptions = listGarageSwaps(ex.exerciseId);
  const showSwap = !compact && !!onSwap && shouldShowGarageSwap({
    hasCompletedSet: false,
    optionCount: swapOptions.length,
  });

  const load =
    ex.loadPct != null && ex.loadPct > 0 && ex.weight > 0
      ? ` · ${ex.loadPct}% · ${ex.weight}${unit}`
      : ex.weight > 0
        ? ` @ ${ex.weight}${unit}`
        : '';

  const why = coachWhyLine(ex.whyKey, t);

  return (
    <li className={compact ? '' : 'border-b border-border pb-2 last:border-0'}>
      <div className={compact ? 'text-sm tabular-nums' : 'flex items-start justify-between gap-2'}>
        <div className={compact ? undefined : 'font-semibold min-w-0'}>
          {name} — {ex.sets}×{ex.reps}
          {load}
        </div>
        {showSwap ? (
          <button
            type="button"
            className="shrink-0 min-h-[44px] px-2 text-sm text-primary hover:underline"
            onClick={() => setSwapOpen(true)}
          >
            {t('activeSwap', { defaultValue: 'Swap' })}
          </button>
        ) : null}
      </div>
      {!compact && why ? <p className="text-xs text-muted-foreground mt-0.5">{why}</p> : null}
      {compact && why ? <p className="text-[11px] text-muted-foreground">{why}</p> : null}
      {showSwap ? (
        <AdaptiveOverlay
          open={swapOpen}
          onClose={() => setSwapOpen(false)}
          size="sm"
          eyebrow={t('activeSwapEyebrow', { defaultValue: 'No machine' })}
          title={t('activeSwapTitle', { defaultValue: 'Swap' })}
          bodyClassName="p-4"
        >
          <GarageSwapList
            options={swapOptions}
            onChoose={(id) => {
              onSwap?.(id);
              setSwapOpen(false);
            }}
          />
        </AdaptiveOverlay>
      ) : null}
    </li>
  );
}
