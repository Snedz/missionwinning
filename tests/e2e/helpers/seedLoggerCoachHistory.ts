/**
 * GNT-1 U3 — seed two logger histories without planting `mw_coach_plan`.
 *
 * Writes the same Zustand persist blob `/active` Finish writes
 * (`workout-tracker-storage`). Coach UI (`useCoachPlan.refresh`) generates the
 * week from those logs.
 *
 * Cold = one light bodyweight log (Basic = first workout; strain stays low).
 * Strained = 20 hard lower logs (same shape as `src/lib/coach/gnt1HistoryDose.test.ts`).
 *
 * This function is addInitScript-safe: no TypeScript in the body, no plan write.
 */
import type { Page } from '@playwright/test';

export type LoggerHistoryKind = 'cold' | 'strained';

function plantLoggerHistory(kind) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const iso = now.toISOString();

  if (!window.__gnt1_u3_seeded) {
    window.__gnt1_u3_plan_before = localStorage.getItem('mw_coach_plan');
    window.__gnt1_u3_seeded = true;
  }

  localStorage.setItem('mw_experience', 'intermediate');
  localStorage.setItem('mw_equipment', 'full-gym');
  localStorage.setItem('mw_primary_goal', 'goal:strength');
  localStorage.setItem('mw_goals', 'goal:strength');
  localStorage.setItem('mw_days_per_week', '4');
  localStorage.setItem('mw_locale_choice', '1');
  localStorage.setItem('mw_device_id', 'gnt1-u3');
  localStorage.setItem('mw_first_steps_dismissed', '1');
  localStorage.setItem(
    'mw_last_assessment',
    JSON.stringify({ risk: 'low', date: today })
  );
  localStorage.setItem(
    'mw_learn_completed',
    JSON.stringify(['gnt1-u3-learn'])
  );
  localStorage.setItem(
    'mw_guidebook_progress',
    JSON.stringify(['gnt1-u3-guide'])
  );
  localStorage.setItem(
    'mw_nutrition_log',
    JSON.stringify([{ date: today, name: 'seed meal', protein: 40, cals: 400 }])
  );
  localStorage.setItem(
    'mw_pillar_wins',
    JSON.stringify([
      { id: 'gnt1-move', pillar: 'move', title: 'Seed move', completedAt: iso },
      { id: 'gnt1-mind', pillar: 'mind', title: 'Seed mind', completedAt: iso },
    ])
  );
  localStorage.setItem(
    'mw_journey_state',
    JSON.stringify({
      phase: 'commissioned',
      commissionedAt: iso,
      iDay: { startedAt: iso, acceptedMissionAt: iso, completedAt: iso },
      basic: { workout: true, fuel: true, move: true, mind: true, learn: true },
      readiness: { parq: true, streakMet: true, winScoreSeen: true },
    })
  );

  const lightCompleted = new Date(now.getTime() - 3 * 86_400_000).toISOString();
  const lightStarted = new Date(now.getTime() - 3 * 86_400_000 - 600_000).toISOString();
  const coldHistory = [
    {
      id: 'gnt1-light-0',
      clientId: 'gnt1-light-0',
      workoutName: 'Light push',
      startedAt: lightStarted,
      completedAt: lightCompleted,
      durationSeconds: 600,
      exercises: [
        {
          exerciseId: 'push-ups',
          muscleGroups: ['Chest'],
          sets: [{ reps: 8, weight: 0, kind: 'normal' }],
        },
      ],
      totalVolume: 0,
      revision: 1,
      updatedAt: lightCompleted,
    },
  ];

  const workoutHistory =
    kind === 'cold'
      ? coldHistory
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
}
