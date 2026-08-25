/**
 * Free set tags (.966) — optional W / D / F on the set row.
 * Warmup is not evidence for Prev / vs-last / Wednesday / Repeat last.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import { toggleSetTag } from '@/lib/workout/setKind';
import { templateFromCompletedLog } from '@/lib/workout/historyRetrain';
import { formatPrevSetLabels } from '@/lib/workout/activeWorkoutHelpers';
import { formatVsLastSetDeltas } from '@/lib/workout/vsLastSet';
import { resolveAfterCompleteCite } from '@/lib/workout/setRowAdjacency';
import { nextDayFromLogs } from '@/lib/coach/nextDayFromLogs';
import { finishPartialFromActive } from '@/lib/workout/sessionResume';
import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function history(
  sets: { reps: number; weight: number; kind?: 'normal' | 'warmup' | 'failure' | 'drop' }[]
): CompletedWorkoutLog[] {
  return [
    {
      id: 'h1',
      workoutName: 'Push',
      startedAt: '2026-08-17T10:00:00.000Z',
      completedAt: '2026-08-17T11:00:00.000Z',
      durationSeconds: 3600,
      totalVolume: 100,
      exercises: [{ exerciseId: 'bench-press', sets }],
    },
  ];
}

describe('set row tags (.966)', () => {
  it('tags are optional — work is the cleared state', () => {
    assert.equal(toggleSetTag(undefined, 'warmup'), 'warmup');
    assert.equal(toggleSetTag('warmup', 'warmup'), 'normal');
    assert.equal(toggleSetTag('normal', 'drop'), 'drop');
    assert.equal(toggleSetTag('drop', 'failure'), 'failure');
  });

  it('Prev / vs-last / after-complete cite ignore warmup-tagged sets', () => {
    const last = history([
      { reps: 8, weight: 40, kind: 'warmup' },
      { reps: 5, weight: 100, kind: 'normal' },
    ]);
    const current = [
      { completed: true, reps: 8, weight: 45, kind: 'warmup' as const },
      { completed: true, reps: 5, weight: 102.5, kind: 'normal' as const },
    ];
    assert.deepEqual(
      formatPrevSetLabels(last, 'bench-press', 2, { currentSets: current }),
      [null, '5 × 100']
    );
    const vs = formatVsLastSetDeltas(last, 'bench-press', current, 'kg', {
      same: 'same',
      rep: 'rep',
      reps: 'reps',
    });
    assert.equal(vs[0], null);
    assert.equal(vs[1], '+2.5 kg');
    assert.equal(
      resolveAfterCompleteCite({
        workoutHistory: last,
        exerciseId: 'bench-press',
        sessionSets: current,
        completedSetIdx: 0,
        units: 'metric',
        lastRestSeconds: null,
      }),
      null
    );
  });

  it('Wednesday / Repeat last drop warmup slots; warmup-only invents nothing', () => {
    const mixed = history([
      { reps: 8, weight: 40, kind: 'warmup' },
      { reps: 5, weight: 100, kind: 'normal' },
    ]);
    const cite = nextDayFromLogs({
      history: [
        mixed[0]!,
        {
          ...mixed[0]!,
          id: 'pull',
          workoutName: 'Pull',
          completedAt: '2026-08-18T11:00:00.000Z',
          exercises: [{ exerciseId: 'barbell-row', sets: [{ reps: 8, weight: 80 }] }],
        },
        {
          ...mixed[0]!,
          id: 'legs',
          workoutName: 'Legs',
          completedAt: '2026-08-19T11:00:00.000Z',
          exercises: [{ exerciseId: 'squats', sets: [{ reps: 5, weight: 140 }] }],
        },
      ],
      now: { weekStart: '2026-08-17', dayOffset: 0 },
    });
    assert.equal(cite?.name, 'Push');
    assert.equal(cite?.template?.exercises[0]?.sets.length, 1);
    assert.equal(cite?.template?.exercises[0]?.sets[0]?.weight, 100);

    assert.equal(
      templateFromCompletedLog({
        workoutName: 'Push',
        exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 8, weight: 40, kind: 'warmup' }] }],
      }),
      null
    );
  });

  it('Finish-partial keeps a completed warmup tag and invents no leftover volume', () => {
    const active: ActiveWorkout = {
      workoutName: 'Push',
      startedAt: '2026-08-25T10:00:00.000Z',
      exercises: [
        {
          exerciseId: 'bench-press',
          sets: [
            {
              id: 's0',
              reps: 8,
              weight: 40,
              completed: true,
              kind: 'warmup',
            },
            {
              id: 's1',
              reps: 5,
              weight: 100,
              completed: true,
              kind: 'normal',
            },
            {
              id: 's2',
              reps: 0,
              weight: 0,
              completed: false,
              kind: 'normal',
            },
          ],
        },
      ],
    };
    const out = finishPartialFromActive(active);
    assert.ok(out);
    assert.equal(out!.exercises[0]!.sets.length, 2);
    assert.equal(out!.exercises[0]!.sets[0]!.kind, 'warmup');
    assert.equal(out!.volume, 500);
  });

  it('SetLogTable exposes free W / D / F chips and Log set stays ungated', () => {
    const table = read('src/components/workout/SetLogTable.tsx');
    assert.match(table, /onSetKind\?:/);
    assert.match(table, /set-table-set-tags/);
    assert.match(table, /set-table-tag-\$\{tag\}/);
    assert.match(table, /SET_ROW_TAGS/);
    assert.match(table, /toggleSetTag/);
    const kinds = read('src/lib/workout/setKind.ts');
    assert.match(kinds, /SET_ROW_TAGS[\s\S]*warmup[\s\S]*drop[\s\S]*failure/);
    const logBtn = table.slice(table.indexOf('data-testid="set-table-log-set"'));
    assert.doesNotMatch(logBtn.slice(0, 400), /onSetKind|premium|UnlockButton/);
  });

  it('tag path never consults premium; no Force Sync / Feed / four-scene door', () => {
    const files = [
      'src/lib/workout/setKind.ts',
      'src/lib/workout/historyRetrain.ts',
      'src/lib/workout/activeWorkoutHelpers.ts',
      'src/components/workout/SetLogTable.tsx',
      'src/store/workoutStore.ts',
    ];
    for (const rel of files) {
      const src = read(rel);
      assert.doesNotMatch(src, /premiumServer|isPremium|UnlockButton|\/bundle/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /injury|pregnan|physical therapist/i, rel);
    }
    const table = read('src/components/workout/SetLogTable.tsx');
    assert.doesNotMatch(table, /planWarmupRamp|WARMUP_STEPS/);
    const teaser = read('app/private/GateTeaser.tsx');
    assert.doesNotMatch(teaser, /CinematicWww/);
  });
});
