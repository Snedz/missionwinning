import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildJustGoSession,
  muscleFreshnessRows,
  previewJustGoForEquipment,
} from '@/lib/justGoSession';
import type { MuscleGroup } from '@/lib/muscleGroups';
import { MAJOR_GROUPS } from '@/lib/muscleGroups';
import type { ReadinessInfo } from '@/lib/score';

function readinessAll(days: number): Record<MuscleGroup, ReadinessInfo> {
  const out = {} as Record<MuscleGroup, ReadinessInfo>;
  for (const g of MAJOR_GROUPS) {
    out[g] = {
      days,
      statusKey: days >= 4 ? 'todayReadinessPrime' : 'todayReadinessGood',
    };
  }
  return out;
}

describe('justGoSession', () => {
  it('previews a first session from equipment alone', () => {
    const body = previewJustGoForEquipment('bodyweight');
    assert.ok(body.exercises.length >= 2);
    const gym = previewJustGoForEquipment('full-gym');
    assert.ok(gym.exercises.length >= 2);
  });

  it('builds a focus session with seeded exercises', () => {
    const session = buildJustGoSession({
      focus: { group: 'Chest', statusKey: 'todayReadinessPrime' },
      readiness: readinessAll(5),
      history: [],
      units: 'metric',
      equipment: 'full-gym',
    });
    assert.ok(session.exercises.length >= 2);
    assert.equal(session.focusGroup, 'Chest');
    assert.ok(session.source === 'focus' || session.source === 'starter');
    assert.match(session.name, /Just Go|Chest/i);
  });

  it('prefers coach today when available', () => {
    const session = buildJustGoSession({
      focus: { group: 'Legs', statusKey: 'todayReadinessPrime' },
      readiness: readinessAll(5),
      history: [],
      units: 'metric',
      coachToday: {
        name: 'Coach Upper',
        status: 'planned',
        focusGroups: ['Chest'],
        exercises: [
          { exerciseId: 'bench-press', sets: 3, reps: 8, weight: 60, loadPct: 80 },
          { exerciseId: 'overhead-press', sets: 3, reps: 8, weight: 40 },
        ],
      },
    });
    assert.equal(session.source, 'coach');
    assert.equal(session.name, 'Coach Upper');
    assert.equal(session.exercises[0].exerciseId, 'bench-press');
    assert.equal(session.exercises[0].sets.length, 3);
    assert.equal(session.exercises[0].sets[0].weight, 60);
    assert.equal(session.exercises[0].loadPct, 80);
  });

  it('skips done coach sessions', () => {
    const session = buildJustGoSession({
      focus: { group: 'Back', statusKey: 'todayReadinessPrime' },
      readiness: readinessAll(5),
      history: [],
      units: 'metric',
      coachToday: {
        name: 'Done day',
        status: 'done',
        exercises: [{ exerciseId: 'barbell-row', sets: 3, reps: 8, weight: 50 }],
      },
    });
    assert.notEqual(session.source, 'coach');
  });

  it('seeds weights from history via next-set targets', () => {
    const session = buildJustGoSession({
      focus: { group: 'Chest', statusKey: 'todayReadinessPrime' },
      readiness: readinessAll(5),
      history: [
        {
          id: 'w1',
          workoutName: 'Prior',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          durationSeconds: 1800,
          totalVolume: 1000,
          exercises: [
            {
              exerciseId: 'bench-press',
              sets: [
                { reps: 10, weight: 60 },
                { reps: 10, weight: 60 },
                { reps: 10, weight: 60 },
              ],
            },
          ],
        },
      ],
      units: 'metric',
      coachToday: {
        name: 'Bench day',
        status: 'planned',
        exercises: [{ exerciseId: 'bench-press', sets: 3, reps: 8, weight: 0 }],
      },
    });
    // 10 reps < 12 → add_reps → 11 @ 60
    assert.equal(session.exercises[0].sets[0].reps, 11);
    assert.equal(session.exercises[0].sets[0].weight, 60);
  });

  it('builds muscle freshness rows for all major groups', () => {
    const rows = muscleFreshnessRows(readinessAll(5));
    assert.equal(rows.length, MAJOR_GROUPS.length);
    assert.ok(rows.every((r) => r.recommended));
  });
});
