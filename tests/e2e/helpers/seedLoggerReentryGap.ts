/**
 * GNT-1 U4 — seed a missed-day gap from logger persist, not shame copy.
 *
 * Writes the same Zustand persist blob `/active` Finish writes
 * (`workout-tracker-storage`). Today (`computeReentry` + `TodayReentryCard`)
 * reads that history. Does not plant `mw_coach_plan`. Does not use
 * `seed-coach-adapt-demo.mjs`.
 *
 * Gap is local calendar days (same unit as `reentry.ts`), not elapsed 24h
 * blocks and not Duo streak-break chrome.
 *
 * This function is addInitScript-safe: no TypeScript in the body, no plan write.
 */
import type { Page } from '@playwright/test';

export type ReentryGapDays = 3 | 7 | 14;

function plantLoggerReentryGap(days) {
  const now = new Date();
  const completed = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - days,
    12,
    0,
    0
  );
  const started = new Date(completed.getTime() - 40 * 60 * 1000);
  const completedAt = completed.toISOString();
  const startedAt = started.toISOString();
  const iso = now.toISOString();

  window.__gnt1_u4_gap_days = days;
  window.__gnt1_u4_completed_at = completedAt;

  localStorage.removeItem('mw_coach_plan');
  localStorage.setItem('mw_experience', 'beginner');
  localStorage.setItem('mw_equipment', 'bodyweight');
  localStorage.setItem('mw_primary_goal', 'goal:general');
  localStorage.setItem('mw_goals', 'goal:general');
  localStorage.setItem('mw_locale_choice', '1');
  localStorage.setItem('mw_device_id', 'gnt1-u4');
  localStorage.setItem('mw_first_steps_dismissed', '1');
  localStorage.setItem(
    'mw_journey_state',
    JSON.stringify({
      phase: 'basic',
      iDay: { startedAt: iso, acceptedMissionAt: iso, completedAt: iso },
      basic: { workout: true, fuel: false, move: false, mind: false, learn: false },
      readiness: { parq: false, streakMet: false, winScoreSeen: false },
    })
  );

  const workoutHistory = [
    {
      id: 'gnt1-u4-last',
      clientId: 'gnt1-u4-last',
      workoutName: 'Light push',
      startedAt,
      completedAt,
      durationSeconds: 2400,
      exercises: [
        {
          exerciseId: 'push-ups',
          muscleGroups: ['Chest'],
          sets: [{ reps: 8, weight: 0, kind: 'normal' }],
        },
      ],
      totalVolume: 0,
      revision: 1,
      updatedAt: completedAt,
    },
  ];

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

export async function seedLoggerReentryGap(
  page: Page,
  days: ReentryGapDays
): Promise<void> {
  await page.addInitScript(plantLoggerReentryGap, days);
}
