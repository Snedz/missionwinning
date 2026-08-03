'use client';

/**
 * The adapt claim, made demonstrable.
 *
 * This used to auto-cycle three frames on a 2.8s interval, which meant the point
 * only landed if you happened to be looking at the right moment — the strongest
 * frame was invisible to anyone who scrolled past in under three seconds.
 *
 * Now the visitor causes it, the same way the hero works: press "miss Wednesday"
 * and watch the rest of the week move. Reduced-motion users get the outcome
 * immediately rather than a control that implies animation.
 */

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw } from 'lucide-react';
import { WeekStrip } from '@/components/coach/WeekStrip';
import type { PlanSession } from '@/lib/coach/types';
import { prefersReducedMotion } from '@/lib/motion';

function session(
  dayOffset: number,
  name: string,
  kind: PlanSession['kind'],
  status: PlanSession['status']
): PlanSession {
  return {
    id: `demo-${dayOffset}-${name}`,
    dayOffset,
    name,
    kind,
    status,
    focusGroups: ['Legs'],
    exercises: [],
    estMinutes: 32,
  };
}

/** Mon / Wed / Fri — the week as generated. */
const PLANNED: PlanSession[] = [
  session(0, 'Lower', 'strength', 'planned'),
  session(2, 'Upper', 'strength', 'planned'),
  session(4, 'Conditioning', 'conditioning', 'planned'),
];

/** Wednesday gone, and the two sessions after it pushed back a day each. */
const ADAPTED: PlanSession[] = [
  session(0, 'Lower', 'strength', 'planned'),
  session(2, 'Upper', 'strength', 'missed'),
  session(3, 'Upper', 'strength', 'planned'),
  session(5, 'Conditioning', 'conditioning', 'planned'),
];

export function CoachAdaptDemo() {
  const { t } = useTranslation();
  const reduced = prefersReducedMotion();
  // Reduced motion: start on the outcome, since there is no transition to watch.
  const [adapted, setAdapted] = useState(reduced);

  const toggle = useCallback(() => setAdapted((v) => !v), []);

  return (
    <div className="content-card p-5 sm:p-6">
      <p className="eyebrow mb-3">{t('coachDemoTitle', { defaultValue: 'Mission Coach' })}</p>

      <WeekStrip
        weekStart="2026-01-05"
        sessions={adapted ? ADAPTED : PLANNED}
        todayOffset={1}
      />

      <p
        className="mt-4 min-h-[2.75rem] text-sm leading-relaxed text-muted-foreground"
        aria-live="polite"
      >
        {adapted
          ? t('coachDemoAdaptedBody', {
              defaultValue:
                'Wednesday is gone, so upper body moved to Thursday and conditioning to Saturday. Same week, same dose.',
            })
          : t('coachDemoPlannedBody', {
              defaultValue: 'Three sessions, spaced from the days you said you can train.',
            })}
      </p>

      <button
        type="button"
        onClick={toggle}
        className="tap-target mt-2 flex w-full items-center justify-center gap-2 border-2 border-border bg-card py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-tint"
      >
        {adapted ? (
          <>
            <RotateCcw className="h-4 w-4" aria-hidden />
            {t('coachDemoReset', { defaultValue: 'Start over' })}
          </>
        ) : (
          t('coachDemoMissCta', { defaultValue: 'Miss Wednesday' })
        )}
      </button>
    </div>
  );
}
