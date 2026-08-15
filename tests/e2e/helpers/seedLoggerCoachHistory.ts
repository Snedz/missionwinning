/**
 * GNT-1 U3 — seed two logger histories without planting `mw_coach_plan`.
 *
 * Writes the same Zustand persist blob `/active` Finish writes
 * (`workout-tracker-storage`). Coach UI (`useCoachPlan.refresh`) generates the
 * week from those logs. Do **not** use `scripts/seed-coach-adapt-demo.mjs` —
 * that IIFE clobbers a real plan.
 *
 * Cold = empty history. Strained = 20 hard lower logs (same shape as
 * `src/lib/coach/gnt1HistoryDose.test.ts`).
 */
import type { Page } from '@playwright/test';

export type LoggerHistoryKind = 'cold' | 'strained';

function plantLoggerHistory(kind) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const iso = now.toISOString();

  localStorage.removeItem('mw_coach_plan');
  localStorage.setItem('mw_experience', 'intermediate');
  localStorage.setItem('mw_equipment', 'full-gym');
  localStorage.setItem('mw_primary_goal', 'goal:strength');
  localStorage.setItem('mw_goals', 'goal:strength');
  localStorage.setItem('mw_days_per_week', '4');
  localStorage.setItem('mw_locale_choice', '1');
  localStorage.setItem('mw_device_id', 'gnt1-u3');
  localStorage.setItem(
    'mw_last_assessment',
    JSON.stringify({ risk: 'low', date: today })
  );
  localStorage.setItem(
    'mw_journey_state',
    JSON.stringify({
      phase: 'readiness',
      iDay: { startedAt: iso, acceptedMissionAt: iso, completedAt: iso },
      basic: { workout: true, fuel: true, move: true, mind: true, learn: true },
      readiness: { parq: true, streakMet: false, winScoreSeen: true },
    })
  );

  const workoutHistory =
    kind === 'cold'
      ? []
      : Array.from({ length: 20 }, (_, i) => {
          const completedAt = new Date(now.getTime() - i * 86_400_000).toISOString();
          const startedAt = new Date(now.getTime() - i * 86_400_000 - 3_600_000).toISOString();
          return {
            id: `gnt1-hard-${i}`,
            clientId: `gnt1-hard-${i}`,
            workoutName: 'Hard lower',
            startedAt,
            completedAt,
            durationSeconds: 7_200,
            exercises: [
              {
                exerciseId: 'squat',
                muscleGroups: ['Legs'],
                sets: [{ reps: 5, weight: 140, kind: 'normal' }],
              },
            ],
            totalVolume: 80_000,
            revision: 1,
            updatedAt: completedAt,
          };
        });

  localStorage.setItem(
    'workout-tracker-storage',
    JSON.stringify({
      state: {
        workoutHistory,
        savedWorkouts: [],
        activeWorkout: null,
      },
      version: 1,
    })
  );
}

/**
 * Monday 09:30 of the current local week.
 *
 * Mid-week `generateWeek` only places remaining days, so a Saturday run would
 * show two sessions and could hide recovery. Monday gives the same full week
 * the engine pin uses. Hour 9 keeps Today’s evening cards off the budget.
 */
export function mondayMorningUncontended(): Date {
  const d = new Date();
  const day = d.getDay();
  const delta = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + delta);
  d.setHours(9, 30, 0, 0);
  return d;
}

export async function seedLoggerCoachHistory(
  page: Page,
  kind: LoggerHistoryKind
): Promise<void> {
  await page.addInitScript(plantLoggerHistory, kind);
  await page.evaluate(plantLoggerHistory, kind);
}
