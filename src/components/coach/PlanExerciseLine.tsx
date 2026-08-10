'use client';

/**
 * One prescribed exercise: what to do, and why.
 *
 * Extracted from `PlanSessionCard` so Today shows the same three facts.
 * Why copy uses `coachWhyLine` (English floors) — same contract as CoachAdaptBanner
 * (`.642` / `.645`). Never blank on hydrate when the engine emitted a catalogued key;
 * never paint a bare key for unknown legacy keys (`coachWhyCompound`).
 */

import { useTranslation } from 'react-i18next';
import { getExerciseById } from '@/data/exercises';
import { coachWhyLine } from '@/lib/coach/coachWhyDefaults';
import type { PlanExercise } from '@/lib/coach/types';

type Props = {
  ex: PlanExercise;
  /** Weight unit label, e.g. "kg". */
  unit: string;
  /** Today's compact rendering drops the rationale line. */
  compact?: boolean;
};

export function PlanExerciseLine({ ex, unit, compact = false }: Props) {
  const { t } = useTranslation();
  const name = getExerciseById(ex.exerciseId)?.name ?? ex.exerciseId;

  const load =
    ex.loadPct != null && ex.loadPct > 0 && ex.weight > 0
      ? ` · ${ex.loadPct}% · ${ex.weight}${unit}`
      : ex.weight > 0
        ? ` @ ${ex.weight}${unit}`
        : '';

  const why = coachWhyLine(ex.whyKey, t);

  return (
    <li className={compact ? '' : 'border-b border-border pb-2 last:border-0'}>
      <div className={compact ? 'text-sm tabular-nums' : 'font-semibold'}>
        {name} — {ex.sets}×{ex.reps}
        {load}
      </div>
      {!compact && why ? <p className="text-xs text-muted-foreground mt-0.5">{why}</p> : null}
      {compact && why ? <p className="text-[11px] text-muted-foreground">{why}</p> : null}
    </li>
  );
}
