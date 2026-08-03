/**
 * Seed workout history + a coach week with a missed session so axe can reach
 * History heatmap intensity and Coach "Missed" chrome (.256 / Kaizen K6).
 *
 * Zero-data a11y is necessary but not sufficient: contrast bugs that only
 * appear when `intensity > 0` or `status === 'missed'` were invisible forever.
 *
 * **Why the plan shape is odd:** `adaptPlan` drops every `missed` session when
 * any `planned` session remains (re-spread path). On Monday there is also no
 * prior dayOffset. So we plant: one `done` + more `missed` than remaining slots
 * with **zero** planned — the cold-start salvage keeps unplaced misses when
 * `doneSessions.length > 0`. That is the only shape that survives adapt and
 * still paints "Missed" on every weekday.
 */
import type { Page } from '@playwright/test';
import { seedLegacyOnboarding } from './journey';

function plantSeed(): void {
  const now = new Date();
  const completedAt = new Date(now.getTime() - 36e5).toISOString();
  const startedAt = new Date(now.getTime() - 72e5).toISOString();

  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
  const weekStart = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
  const todayOffset = Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
      Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate())) /
      86400000
  );
  const daysLeft = 7 - todayOffset;
  // One more miss than salvage slots so at least one stays `missed`.
  const missCount = daysLeft + 1;

  const sessions = [
    {
      id: 'seed-done',
      dayOffset: todayOffset,
      name: 'Done Seed',
      kind: 'strength' as const,
      focusGroups: ['Legs'],
      estMinutes: 40,
      status: 'done' as const,
      exercises: [
        {
          exerciseId: 'bodyweight-squat',
          sets: 3,
          reps: 12,
          weight: 0,
          whyKey: 'coachWhyHold',
        },
      ],
    },
    ...Array.from({ length: missCount }, (_, i) => ({
      id: `seed-missed-${i}`,
      dayOffset: Math.max(0, todayOffset - 1 - (i % Math.max(1, todayOffset))),
      name: i === 0 ? 'Missed Seed' : `Missed Seed ${i}`,
      kind: 'strength' as const,
      focusGroups: ['Chest'] as string[],
      estMinutes: 40,
      status: 'missed' as const,
      exercises: [
        {
          exerciseId: 'push-ups',
          sets: 3,
          reps: 10,
          weight: 0,
          whyKey: 'coachWhyHold',
        },
      ],
    })),
  ];

  localStorage.setItem(
    'workout-tracker-storage',
    JSON.stringify({
      state: {
        workoutHistory: [
          {
            id: 'seed-hist-1',
            workoutName: 'Seed Upper',
            startedAt,
            completedAt,
            durationSeconds: 2400,
            totalVolume: 4200,
            exercises: [
              {
                exerciseId: 'push-ups',
                muscleGroups: ['Chest', 'Arms'],
                sets: [
                  { reps: 12, weight: 0, kind: 'work' },
                  { reps: 10, weight: 0, kind: 'work' },
                  { reps: 8, weight: 0, kind: 'work' },
                ],
              },
              {
                exerciseId: 'bodyweight-squat',
                muscleGroups: ['Legs'],
                sets: [
                  { reps: 15, weight: 0, kind: 'work' },
                  { reps: 15, weight: 0, kind: 'work' },
                ],
              },
            ],
          },
        ],
        savedWorkouts: [],
        activeWorkout: null,
      },
      version: 1,
    })
  );

  localStorage.setItem(
    'mw_coach_plan',
    JSON.stringify({
      weekStart,
      revision: 2,
      daysPerWeek: Math.min(6, missCount),
      seedId: 'seed-a11y',
      contextHash: 'seed',
      generatedAt: completedAt,
      equipmentProfile: 'bodyweight',
      sessions,
    })
  );
}

export async function seedHistoryAndMissedCoach(page: Page): Promise<void> {
  await seedLegacyOnboarding(page);
  await page.addInitScript(plantSeed);
  await page.evaluate(plantSeed);
}
