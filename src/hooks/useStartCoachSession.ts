'use client';

/**
 * Start a Mission Coach session — the one wiring point.
 *
 * Three components each built this by hand (`CoachTodayCard`,
 * `PlanSessionCard`, and `CoachAdaptBanner`, which did not build it at all and
 * shipped a bare `<Link href="/active">` under the label "Start this session").
 * Each hand-rolled copy was a chance to forget the re-entry dose, and all three
 * did.
 *
 * The dose is read from the store here rather than threaded through props on
 * purpose: a prop is something a fourth caller can omit, and omitting it is
 * exactly the defect. Reading history at the call site means a new caller gets
 * the eased session by construction.
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutStore } from '@/store/workoutStore';
import { resolveCoachSessionStart } from '@/lib/coach/coachSessionStart';
import { track } from '@/lib/analytics';
import type { PlanSession } from '@/lib/coach/types';

export type StartCoachSessionOpts = {
  /** Analytics origin — `home`, `coach`, `reentry`. */
  from?: string;
};

export function useStartCoachSession() {
  const router = useRouter();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);

  return useCallback(
    (session: PlanSession, opts?: StartCoachSessionOpts) => {
      // Every decision — the `done` guard, the re-entry read, the scaling —
      // lives in `resolveCoachSessionStart`, which is pure and unit-tested. This
      // hook is wiring only, so there is no branch here to get wrong and nothing
      // untested hiding behind the React boundary.
      const start = resolveCoachSessionStart(session, workoutHistory, Date.now());
      if (!start) return;

      startWorkout(start.name, start.templates);
      track('coach_session_started', {
        kind: session.kind,
        ...(opts?.from ? { from: opts.from } : {}),
        ...(start.doseScale < 1 ? { doseScale: start.doseScale } : {}),
      });
      router.push('/active');
    },
    [router, startWorkout, workoutHistory]
  );
}
