import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { CompletedWorkoutLog } from '@/types';
import {
  repeatLastSessionTemplate,
  shouldRepeatLastOnToday,
} from './repeatLastSession.ts';
import { resolveActiveEmptyStart } from './resolveActiveEmptyStart.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function log(over: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id'>): CompletedWorkoutLog {
  return {
    workoutName: 'Push',
    startedAt: '2026-08-01T10:00:00.000Z',
    completedAt: '2026-08-01T11:00:00.000Z',
    durationSeconds: 3600,
    totalVolume: 1000,
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [
          { reps: 5, weight: 100 },
          { reps: 5, weight: 102.5 },
        ],
      },
    ],
    ...over,
  };
}

describe('repeatLastSessionTemplate', () => {
  it('copies exercise ids, set counts, and last loads/reps from the newest log', () => {
    const t = repeatLastSessionTemplate([
      log({ id: 'newer', workoutName: 'Push A' }),
      log({
        id: 'older',
        workoutName: 'Pull',
        exercises: [{ exerciseId: 'pull-ups', sets: [{ reps: 8, weight: 0 }] }],
      }),
    ]);
    assert.ok(t);
    assert.equal(t!.name, 'Push A');
    assert.equal(t!.exercises.length, 1);
    assert.equal(t!.exercises[0]!.exerciseId, 'bench-press');
    assert.equal(t!.exercises[0]!.sets.length, 2);
    assert.equal(t!.exercises[0]!.sets[0]!.reps, 5);
    assert.equal(t!.exercises[0]!.sets[0]!.weight, 100);
    assert.equal(t!.exercises[0]!.sets[1]!.weight, 102.5);
    assert.equal(
      'prescribed' in (t!.exercises[0] as object) &&
        (t!.exercises[0] as { prescribed?: boolean }).prescribed,
      false
    );
  });

  it('empty history → null (shame-free empty logger, not a generated session)', () => {
    assert.equal(repeatLastSessionTemplate([]), null);
  });

  it('skips tombstones and empty logs, then takes the next viable', () => {
    const t = repeatLastSessionTemplate([
      log({ id: 'gone', deletedAt: '2026-08-02T00:00:00.000Z' }),
      log({ id: 'empty', exercises: [] }),
      log({
        id: 'live',
        workoutName: 'Legs',
        exercises: [{ exerciseId: 'squats', sets: [{ reps: 5, weight: 140 }] }],
      }),
    ]);
    assert.ok(t);
    assert.equal(t!.name, 'Legs');
    assert.equal(t!.exercises[0]!.exerciseId, 'squats');
  });

  it('wraps templateFromCompletedLog rather than forking the mapper', () => {
    const src = read('src/lib/workout/repeatLastSession.ts');
    assert.match(src, /from '@\/lib\/workout\/historyRetrain'/);
    assert.match(src, /templateFromCompletedLog\(/);
    assert.doesNotMatch(src, /suggestNextSetTarget/);
    assert.doesNotMatch(src, /startRestTimer/);
    assert.doesNotMatch(src, /prescribed:\s*true/);
  });
});

describe('shouldRepeatLastOnToday', () => {
  it('yields last session when Coach does not own the hero', () => {
    const t = shouldRepeatLastOnToday({
      hasLiveCoach: false,
      history: [log({ id: 'w1' })],
    });
    assert.equal(t?.name, 'Push');
  });

  it('defers to live Coach — this control does not auto-start Coach', () => {
    assert.equal(
      shouldRepeatLastOnToday({
        hasLiveCoach: true,
        history: [log({ id: 'w1' })],
      }),
      null
    );
  });
});

describe('resolveActiveEmptyStart (.717 repeat last)', () => {
  it('cold history → empty freestyle', () => {
    assert.deepEqual(resolveActiveEmptyStart([]), { kind: 'empty' });
  });

  it('with a last session → repeat_last, not Just Go', () => {
    const r = resolveActiveEmptyStart([log({ id: 'w1', workoutName: 'Upper' })]);
    assert.equal(r.kind, 'repeat_last');
    if (r.kind !== 'repeat_last') return;
    assert.equal(r.name, 'Upper');
    assert.ok(r.exercises.length >= 1);
  });

  it('does not import Just Go or Coach on the Active empty path', () => {
    const src = read('src/lib/workout/resolveActiveEmptyStart.ts');
    assert.doesNotMatch(src, /justGoSession|buildJustGoSession|loadCoachToday|doseScale/);
    assert.match(src, /repeatLastSessionTemplate/);
  });
});

const GUILT = /you (missed|skipped|haven'?t)|streak.?loss|get back on|guilt copy/i;

describe('empty-history copy stays shame-free', () => {
  it('Active empty + local-first strings do not guilt a first open', () => {
    const empty = read('src/components/workout/ActiveEmptyState.tsx');
    const local = read('src/lib/localFirstCopy.ts');
    assert.doesNotMatch(empty, GUILT);
    assert.doesNotMatch(local, GUILT);
  });
});

describe('wiring: one control, compose with F-013, do not rewrite #489', () => {
  it('Active empty start uses resolveActiveEmptyStart + startWorkout, never rest', () => {
    const src = read('src/page-components/ActiveWorkoutPage.tsx');
    assert.match(src, /resolveActiveEmptyStart\(/);
    assert.match(src, /kind === 'repeat_last'/);
    assert.match(src, /startEmptyWorkout\(\)/);
    assert.doesNotMatch(src, /buildJustGoSession/);
    const emptyFn = src.slice(src.indexOf('handleEmptyStart'), src.indexOf('if (!activeWorkout)'));
    assert.doesNotMatch(emptyFn, /startRestTimer/);
    assert.doesNotMatch(emptyFn, /loadCoachTodayOptional/);
  });

  it('Today primary repeats last before Just Go when Coach is not live', () => {
    const src = read('src/lib/todayPrimaryAction.ts');
    assert.match(src, /shouldRepeatLastOnToday\(/);
    assert.match(src, /from:\s*'today'/);
    assert.match(src, /history_train_again/);
  });

  it('hero source repeat_last exists and does not say Just Go', () => {
    const src = read('src/lib/justGoHeroMeta.ts');
    assert.match(src, /repeat_last/);
    assert.match(src, /todayRepeatLastCta/);
    const copyFn = src.slice(src.indexOf('if (meta.source === \'repeat_last\')'));
    const block = copyFn.slice(0, copyFn.indexOf('if (meta.source === \'coach\')'));
    assert.doesNotMatch(block, /Just Go/);
  });

  it('does not rewrite resolveSetInput order (F-013 / #489 compose)', () => {
    const src = read('src/lib/workout/activeWorkoutHelpers.ts');
    const fn = src.slice(src.indexOf('export function resolveSetInput'));
    const body = fn.slice(0, fn.indexOf('\nexport function'));
    assert.match(body, /if \(manual\) return manual/);
    assert.match(body, /sessionCarry/);
    assert.match(body, /lastPerformance/);
    assert.match(body, /suggestion/);
  });
});
