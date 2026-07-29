'use client';

/**
 * One prescribed exercise: what to do, and why.
 *
 * Extracted from `PlanSessionCard` so Today can show the same three facts without a
 * second copy of the `i18n.exists` guard below — the guard is the whole reason this
 * is a component rather than two similar JSX blocks.
 */

import { useTranslation } from 'react-i18next';
import { getExerciseById } from '@/data/exercises';
import type { PlanExercise } from '@/lib/coach/types';

type Props = {
  ex: PlanExercise;
  /** Weight unit label, e.g. "kg". */
  unit: string;
  /** Today's compact rendering drops the rationale line. */
  compact?: boolean;
};

export function PlanExerciseLine({ ex, unit, compact = false }: Props) {
  const { t, i18n } = useTranslation();
  const name = getExerciseById(ex.exerciseId)?.name ?? ex.exerciseId;

  const load =
    ex.loadPct != null && ex.loadPct > 0 && ex.weight > 0
      ? ` · ${ex.loadPct}% · ${ex.weight}${unit}`
      : ex.weight > 0
        ? ` @ ${ex.weight}${unit}`
        : '';

  /*
   * `i18n.exists`, not a falsy `defaultValue`: i18next treats `defaultValue: ''` as
   * absent and hands back the key. That is how `coachWhyCompound` — a key baked into
   * plans persisted by an older build — printed raw on screen under a real set, and
   * since plans regenerate only weekly it showed for days. A missing rationale is
   * strictly better than machine text.
   */
  const why = i18n.exists(ex.whyKey) ? t(ex.whyKey) : '';

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
