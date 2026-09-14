/**
 * Victory next-env cite — only when adapt wrote a next session from this log.
 * Source-guard locks finish → adapt → Victory testid wiring (.1066).
 */
import { describe, it, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { CompletedWorkoutLog } from '@/types';
import { adaptPlan } from '@/lib/coach/adapt';
import { buildCoachContextFromInputs } from '@/lib/coach/contextBuilder';
import { generateWeek } from '@/lib/coach/planEngine';
import type { CoachPlan, PlanSession } from '@/lib/coach/types';
import {
  didAdaptWriteNextEnvFromLog,
  VICTORY_NEXT_ENV_CITE_DEFAULT,
} from '@/lib/coach/victoryNextEnvCite';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function session(partial: Partial<PlanSession> & Pick<PlanSession, 'id' | 'dayOffset'>): PlanSession {
  return {
    kind: 'strength',
    name: 'Session',
    focusGroups: ['Chest'],
    exercises: [{ exerciseId: 'bench-press', sets: 3, reps: 8, weight: 60, whyKey: 'coachWhyHold' }],
    estMinutes: 45,
    status: 'planned',
    ...partial,
  };
}

function plan(sessions: PlanSession[], revision = 1): CoachPlan {
  return {
    weekStart: '2026-07-06',
    revision,
    generatedAt: '2026-07-06T00:00:00.000Z',
    equipmentProfile: 'full-gym',
    daysPerWeek: sessions.length || 3,
    contextHash: 'victory-next-env-test',
    sessions,
  };
}

describe('didAdaptWriteNextEnvFromLog', () => {
  it('false when no prior plan', () => {
    assert.equal(
      didAdaptWriteNextEnvFromLog({
        before: null,
        after: plan([session({ id: 'a', dayOffset: 0, status: 'done' })]),
      }),
      false
    );
  });

  it('false when sessions did not change', () => {
    const p = plan([
      session({ id: 'a', dayOffset: 0 }),
      session({ id: 'b', dayOffset: 2 }),
    ]);
    assert.equal(didAdaptWriteNextEnvFromLog({ before: p, after: p }), false);
  });

  it('false when adapt only marked misses — not from this workout', () => {
    const before = plan([
      session({ id: 'a', dayOffset: 0 }),
      session({ id: 'b', dayOffset: 2 }),
      session({ id: 'c', dayOffset: 4 }),
    ]);
    const after = plan(
      [
        session({ id: 'a', dayOffset: 0, status: 'missed' }),
        session({ id: 'b', dayOffset: 3 }),
        session({ id: 'c', dayOffset: 5 }),
      ],
      2
    );
    assert.equal(didAdaptWriteNextEnvFromLog({ before, after }), false);
  });

  it('true when this log marked a session done and a next session remains', () => {
    const before = plan([
      session({ id: 'a', dayOffset: 0 }),
      session({ id: 'b', dayOffset: 2 }),
      session({ id: 'c', dayOffset: 4 }),
    ]);
    const after = plan(
      [
        session({ id: 'a', dayOffset: 0, status: 'done' }),
        session({ id: 'b', dayOffset: 2 }),
        session({ id: 'c', dayOffset: 4 }),
      ],
      2
    );
    assert.equal(didAdaptWriteNextEnvFromLog({ before, after }), true);
  });

  it('false when the finished session was the last open day', () => {
    const before = plan([session({ id: 'a', dayOffset: 0 })]);
    const after = plan([session({ id: 'a', dayOffset: 0, status: 'done' })], 2);
    assert.equal(didAdaptWriteNextEnvFromLog({ before, after }), false);
  });

  it('true after real adaptPlan marks done from a matching log', () => {
    const ctx0 = buildCoachContextFromInputs({
      history: [],
      experience: 'beginner',
      equipment: 'full-gym',
      goal: 'goal:general',
      daysPerWeek: 3,
      seedId: 'victory-next-env',
      includeCheckIn: false,
    });
    const before = generateWeek(ctx0, '2026-07-06');
    const target = before.sessions.find((s) => s.status === 'planned');
    assert.ok(target, 'need a planned session');
    assert.ok(target.exercises.length > 0, 'planned session needs lifts');

    const log: CompletedWorkoutLog = {
      id: 'log-1',
      clientId: 'log-1',
      workoutName: target.name,
      startedAt: '2026-07-06T10:00:00.000Z',
      completedAt: '2026-07-06T11:00:00.000Z',
      durationSeconds: 3600,
      exercises: target.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        muscleGroups: [...target.focusGroups],
        sets: Array.from({ length: ex.sets }, () => ({
          reps: ex.reps,
          weight: ex.weight,
          kind: 'normal' as const,
        })),
      })),
      totalVolume: 1000,
      revision: 1,
      updatedAt: '2026-07-06T11:00:00.000Z',
    };

    const ctx = buildCoachContextFromInputs({
      history: [log],
      experience: 'beginner',
      equipment: 'full-gym',
      goal: 'goal:general',
      daysPerWeek: 3,
      seedId: 'victory-next-env',
      includeCheckIn: false,
    });
    const after = adaptPlan(before, ctx, '2026-07-06');
    assert.equal(
      didAdaptWriteNextEnvFromLog({ before, after }),
      true,
      'matching log must mark done and leave a next session for the cite'
    );
  });
});

test('Victory sheet paints muted victory-next-env-cite only when nextEnvFromLog', () => {
  const sheet = read('src/components/workout/WorkoutVictorySheet.tsx');
  assert.match(sheet, /data-testid="victory-next-env-cite"/);
  assert.match(sheet, /summary\.nextEnvFromLog/);
  assert.match(sheet, /text-muted-foreground/);
  assert.match(sheet, /victoryNextEnvCite/);
  assert.match(sheet, /Next session updated from this workout/);
  // Cite sits in the next dock — not a Feed.
  const dock = sheet.indexOf('data-testid="victory-next-dock"');
  const cite = sheet.indexOf('data-testid="victory-next-env-cite"');
  assert.ok(dock >= 0 && cite > dock, 'cite lives inside victory-next-dock');
});

test('Finish wires adaptPlanAfterFinishedLog onto Victory summary', () => {
  const page = read('src/page-components/ActiveWorkoutPage.tsx');
  assert.match(page, /adaptPlanAfterFinishedLog/);
  assert.match(page, /wroteNextEnv/);
  assert.match(page, /nextEnvFromLog\s*=\s*true/);
  assert.doesNotMatch(page, /victory-feed|VictoryFeed|invented load/i);
});

test('Helper default copy stays plain athlete language', () => {
  assert.equal(VICTORY_NEXT_ENV_CITE_DEFAULT, 'Next session updated from this workout');
  const helper = read('src/lib/coach/victoryNextEnvCite.ts');
  assert.match(helper, /didAdaptWriteNextEnvFromLog/);
  assert.match(helper, /adaptPlanAfterFinishedLog/);
  assert.match(helper, /markSessionsFromExternalWorkouts|adaptPlan/);
  // Comment may name the anti-pattern ("no Feed"); product copy must stay plain.
  assert.doesNotMatch(helper, /\bRSI\b|recursive self/i);
});
