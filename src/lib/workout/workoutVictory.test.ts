import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  COACH_VICTORY_EARLY_WORKOUTS,
  buildProgressionInsight,
  formatProgressionInsight,
  formatVictorySignedDelta,
  progressionInsightKey,
  pickVictoryNextAction,
  shouldShowVictoryBackTodaySecondary,
  summarizeWorkoutVictory,
} from './workoutVictory.ts';
import type { CompletedWorkoutLog } from '@/types';
import fs from 'node:fs';
import path from 'node:path';

describe('pickVictoryNextAction', () => {
  it('after exactly one log prefers session 2 train over Coach (.412)', () => {
    const a = pickVictoryNextAction({
      completedWorkouts: 1,
      hasCoachPlan: true,
      proteinLoggedToday: false,
    });
    assert.equal(a.href, '/active');
    assert.equal(a.labelKey, 'week1SecondSessionCta');
    assert.match(a.defaultLabel, /session 2/i);
  });

  it(`prefers Coach for workouts 2–${COACH_VICTORY_EARLY_WORKOUTS} (after session-2 window)`, () => {
    const a = pickVictoryNextAction({
      completedWorkouts: 2,
      hasCoachPlan: true,
    });
    assert.equal(a.href, '/coach');
    const lateEarly = pickVictoryNextAction({
      completedWorkouts: COACH_VICTORY_EARLY_WORKOUTS,
      hasCoachPlan: true,
    });
    assert.equal(lateEarly.href, '/coach');
  });

  it('prefers Coach when no plan even after early window', () => {
    const a = pickVictoryNextAction({
      completedWorkouts: 10,
      hasCoachPlan: false,
      proteinLoggedToday: true,
      strainDelta: 0,
    });
    assert.equal(a.href, '/coach');
  });

  it('prefers Coach when plan exists (wedge stays in Train+Coach)', () => {
    const a = pickVictoryNextAction({
      proteinLoggedToday: false,
      completedWorkouts: 10,
      hasCoachPlan: true,
    });
    assert.equal(a.href, '/coach');
  });

  it('sends high strain to mind post-train collection — not generic tourism', () => {
    const a = pickVictoryNextAction({
      proteinLoggedToday: true,
      strainDelta: 8,
      completedWorkouts: 10,
      // omit hasCoachPlan so we exercise the recovery branch
    });
    assert.equal(a.href, '/mind?collection=post-train');
    assert.equal(a.labelKey, 'victoryNextRecoverMindLabel');
  });

  it('falls back to train when no plan and low strain outside early window', () => {
    const a = pickVictoryNextAction({
      proteinLoggedToday: true,
      strainDelta: 0,
      completedWorkouts: 10,
      hasCoachPlan: undefined,
    });
    assert.equal(a.href, '/active');
  });
});

describe('shouldShowVictoryBackTodaySecondary', () => {
  it('hides when primary is already Today (rest path)', () => {
    assert.equal(shouldShowVictoryBackTodaySecondary('/log'), false);
    assert.equal(shouldShowVictoryBackTodaySecondary('/log?x=1'), false);
  });

  it('shows for Coach / Train / recovery mind primaries', () => {
    assert.equal(shouldShowVictoryBackTodaySecondary('/coach'), true);
    assert.equal(shouldShowVictoryBackTodaySecondary('/active'), true);
    assert.equal(shouldShowVictoryBackTodaySecondary('/mind?collection=post-train'), true);
  });

  it('hides when there is no primary next', () => {
    assert.equal(shouldShowVictoryBackTodaySecondary(undefined), false);
    assert.equal(shouldShowVictoryBackTodaySecondary(null), false);
    assert.equal(shouldShowVictoryBackTodaySecondary(''), false);
  });

  it('WorkoutVictorySheet wires the helper and one Share control (.422)', () => {
    const src = fs.readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'WorkoutVictorySheet.tsx'),
      'utf8'
    );
    assert.match(src, /shouldShowVictoryBackTodaySecondary/);
    assert.match(src, /victoryShare/);
    assert.doesNotMatch(src, /victoryShareCard/);
    assert.doesNotMatch(src, /ImageIcon/);
    assert.match(src, /VictoryFeelStrip/);
    assert.match(src, /VictoryBodyDeltaStrip/);
    assert.match(src, /VictoryStatsStrip/);
    assert.match(src, /VictoryNextActionStrip/);
    assert.doesNotMatch(
      src,
      /formatVictorySignedDelta/,
      'signed delta formatting lives in VictoryBodyDeltaStrip'
    );
    assert.doesNotMatch(
      src,
      /victoryVolume/,
      'volume/sets grid lives in VictoryStatsStrip'
    );
    assert.doesNotMatch(
      src,
      /victoryNextLabel/,
      'next CTA lives in VictoryNextActionStrip'
    );
  });
});

describe('formatVictorySignedDelta', () => {
  it('prefixes positives and leaves zero/negatives bare (.429)', () => {
    assert.equal(formatVictorySignedDelta(3), '+3');
    assert.equal(formatVictorySignedDelta(0), '0');
    assert.equal(formatVictorySignedDelta(-2), '-2');
  });

  it('VictoryBodyDeltaStrip uses formatVictorySignedDelta (.444)', () => {
    const src = fs.readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'VictoryBodyDeltaStrip.tsx'),
      'utf8'
    );
    assert.match(src, /formatVictorySignedDelta\(/);
    assert.match(src, /victoryReadinessDelta/);
    assert.match(src, /victoryStrainDelta/);
    assert.match(src, /victoryRecoveryDelta/);
  });
});

describe('buildProgressionInsight', () => {
  const baseLog = (
    sets: { reps: number; weight: number; kind?: 'normal' | 'warmup' | 'failure' | 'drop' }[]
  ): CompletedWorkoutLog => ({
    id: '1',
    workoutName: 'Push',
    startedAt: '2026-07-01T10:00:00Z',
    completedAt: '2026-07-01T10:30:00Z',
    durationSeconds: 1800,
    totalVolume: 1000,
    exercises: [{ exerciseId: 'bench-press', sets }],
  });

  it('returns structured add_reps when below top of range', () => {
    const insight = buildProgressionInsight(baseLog([{ reps: 8, weight: 100 }]), 'metric', {
      min: 8,
      max: 12,
    });
    assert.ok(insight);
    assert.equal(insight!.reason, 'add_reps');
    assert.equal(insight!.reps, 9);
    assert.equal(insight!.weight, 100);
    assert.equal(insight!.bodyweight, false);
    assert.match(formatProgressionInsight(insight!), /9 × 100/);
    assert.equal(progressionInsightKey(insight!), 'victoryProgressAddReps');
  });

  it('includes bodyweight work (reps-based progress)', () => {
    const insight = buildProgressionInsight(
      {
        id: '1',
        workoutName: 'Pull',
        startedAt: '2026-07-01T10:00:00Z',
        completedAt: '2026-07-01T10:30:00Z',
        durationSeconds: 1800,
        totalVolume: 0,
        exercises: [{ exerciseId: 'pull-ups', sets: [{ reps: 8, weight: 0 }] }],
      },
      'metric',
      { min: 8, max: 12 }
    );
    assert.ok(insight);
    assert.equal(insight!.bodyweight, true);
    assert.equal(insight!.reason, 'add_reps');
    assert.equal(insight!.reps, 9);
    assert.equal(progressionInsightKey(insight!), 'victoryProgressAddRepsBw');
    assert.match(formatProgressionInsight(insight!), /9 reps/);
  });

  it('skips warmup-only sessions', () => {
    const insight = buildProgressionInsight(
      baseLog([{ reps: 10, weight: 40, kind: 'warmup' }]),
      'metric'
    );
    assert.equal(insight, undefined);
  });

  it('refuses freestyle progression after a Mission Coach prescribed session (.410)', () => {
    const log: CompletedWorkoutLog = {
      id: '1',
      workoutName: 'Coach Push',
      startedAt: '2026-07-01T10:00:00Z',
      completedAt: '2026-07-01T10:30:00Z',
      durationSeconds: 1800,
      totalVolume: 1500,
      exercises: [
        {
          exerciseId: 'bench-press',
          prescribed: true,
          sets: [{ reps: 5, weight: 100 }],
        },
      ],
    };
    const insight = buildProgressionInsight(log, 'metric', { min: 8, max: 12 });
    assert.equal(
      insight,
      undefined,
      'coached loads must not get freestyle double-progression copy'
    );
  });

  it('treats a mixed session with any prescribed lift as coached (.410)', () => {
    const log: CompletedWorkoutLog = {
      id: '1',
      workoutName: 'Mixed',
      startedAt: '2026-07-01T10:00:00Z',
      completedAt: '2026-07-01T10:30:00Z',
      durationSeconds: 1800,
      totalVolume: 2000,
      exercises: [
        { exerciseId: 'curl', sets: [{ reps: 12, weight: 20 }] },
        {
          exerciseId: 'bench-press',
          prescribed: true,
          sets: [{ reps: 5, weight: 100 }],
        },
      ],
    };
    assert.equal(buildProgressionInsight(log, 'metric'), undefined);
  });
});

describe('summarizeWorkoutVictory', () => {
  it('aggregates set and exercise counts', () => {
    const log: CompletedWorkoutLog = {
      id: '1',
      workoutName: 'Push',
      startedAt: '2026-07-01T10:00:00Z',
      completedAt: '2026-07-01T10:30:00Z',
      durationSeconds: 1800,
      totalVolume: 5000,
      exercises: [
        { exerciseId: 'bench', sets: [{ reps: 5, weight: 100 }, { reps: 5, weight: 100 }] },
        { exerciseId: 'ohp', sets: [{ reps: 8, weight: 50 }] },
      ],
    };
    const s = summarizeWorkoutVictory(log, 3);
    assert.equal(s.setCount, 3);
    assert.equal(s.exerciseCount, 2);
    assert.equal(s.streak, 3);
    assert.equal(s.workoutName, 'Push');
  });

  it('passes pickOpts through to next action', () => {
    const log: CompletedWorkoutLog = {
      id: '1',
      workoutName: 'Push',
      startedAt: '2026-07-01T10:00:00Z',
      completedAt: '2026-07-01T10:30:00Z',
      durationSeconds: 1800,
      totalVolume: 5000,
      exercises: [{ exerciseId: 'bench', sets: [{ reps: 5, weight: 100 }] }],
    };
    // First log → session-2 train (.412); Coach for early window after that.
    const first = summarizeWorkoutVictory(log, 1, undefined, undefined, undefined, {
      completedWorkouts: 1,
      hasCoachPlan: true,
    });
    assert.equal(first.nextAction?.href, '/active');
    const second = summarizeWorkoutVictory(log, 1, undefined, undefined, undefined, {
      completedWorkouts: 2,
      hasCoachPlan: true,
    });
    assert.equal(second.nextAction?.href, '/coach');
  });
});
