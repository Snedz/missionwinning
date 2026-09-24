/**
 * Workout CSV into local History. Empty invents nothing.
 * Session export is the dialect. Set-table export rides the same parser.
 * Confirm merges. A second drop of the same file adds nothing.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import { getExerciseById } from '@/data/exercises';
import { localDateKeyFromIso } from '@/lib/time/localDate.ts';
import { exerciseIdForName } from '@/lib/workout/importCsv.ts';
import type { CompletedWorkoutLog } from '@/types';
import { decideApplySessionCsv, decideImportSessionCsv } from './importSessionCsv.ts';

const fixture = (name: string) =>
  readFileSync(path.join(import.meta.dirname, 'fixtures', name), 'utf8');

const SESSION = fixture('session-export-sample.csv');
const SET_TABLE = fixture('set-export-sample.csv');

describe('exerciseIdForName loose library match', () => {
  it('strips parenthetical equipment and maps a unique plural', () => {
    assert.equal(exerciseIdForName('Bench Press (Barbell)'), 'bench-press');
    assert.equal(exerciseIdForName('Squat (Barbell)'), 'squats');
    assert.equal(exerciseIdForName('Front Squat'), 'front-squat');
    assert.equal(exerciseIdForName('Front Squats'), 'front-squat');
    assert.equal(getExerciseById('squats')?.name, 'Squats');
  });

  it('does not collapse a different lift into the plural parent', () => {
    assert.notEqual(exerciseIdForName('Front Squat'), 'squats');
    assert.equal(exerciseIdForName('Zercher Carry'), 'zercher-carry');
    assert.equal(getExerciseById('zercher-carry'), undefined);
  });

  it('a leading equipment word is not stripped', () => {
    assert.equal(exerciseIdForName('Barbell Bench Press'), 'barbell-bench-press');
    assert.notEqual(exerciseIdForName('Barbell Bench Press'), 'bench-press');
  });
});

describe('decideImportSessionCsv', () => {
  it('blank, diary, native, and program-log invent nothing', () => {
    assert.deepEqual(decideImportSessionCsv(null, 'metric'), {
      kind: 'empty',
      reason: 'blank',
    });
    assert.deepEqual(decideImportSessionCsv('   ', 'metric'), {
      kind: 'empty',
      reason: 'blank',
    });
    assert.equal(
      decideImportSessionCsv(
        'date,sessionTitle,workoutName,lift,setType,kg,reps,rpe,tags,notes,duration\n',
        'metric'
      ).kind,
      'empty'
    );
    const nativeDump = decideImportSessionCsv(
      'workout_id,workout_name,completed_at,exercise_name,reps,weight\n',
      'metric'
    );
    assert.equal(nativeDump.kind, 'empty');
    if (nativeDump.kind === 'empty') assert.equal(nativeDump.reason, 'other_dialect');
    const programLog = decideImportSessionCsv(
      'session_date,exercise_name,set_index,reps\n2026-07-14,Squat,1,5\n',
      'metric'
    );
    assert.equal(programLog.kind, 'empty');
    if (programLog.kind === 'empty') assert.equal(programLog.reason, 'other_dialect');
  });

  it('header-only session export invents nothing', () => {
    const header = SESSION.split('\n')[0] ?? '';
    assert.deepEqual(decideImportSessionCsv(`${header}\n`, 'metric'), {
      kind: 'empty',
      reason: 'no_rows',
    });
  });

  it('session export keeps the sets, maps library ids, and skips a blank name', () => {
    const parsed = decideImportSessionCsv(SESSION, 'metric');
    assert.equal(parsed.kind, 'ready');
    if (parsed.kind !== 'ready') return;
    assert.equal(parsed.format, 'set-table-b');
    assert.equal(parsed.workouts.length, 2);
    assert.equal(parsed.skippedRows, 1);
    assert.equal(parsed.setCount, 4);
    const push = parsed.workouts.find((w) => w.workoutName === 'Push Day');
    assert.ok(push);
    assert.equal(localDateKeyFromIso(push.completedAt), '2026-07-14');
    assert.equal(push.durationSeconds, 65 * 60);
    const bench = push.exercises.find((e) => e.exerciseId === 'bench-press');
    assert.ok(bench);
    assert.equal(bench.sets.length, 2);
    assert.equal(bench.sets[0]?.weight, 100);
    assert.equal(bench.sets[0]?.reps, 5);
    assert.equal(bench.sets[0]?.rpe, 'med');
    assert.equal(bench.note, 'pause, chest');
    const leg = parsed.workouts.find((w) => w.workoutName === 'Leg Day');
    assert.ok(leg);
    assert.equal(leg.durationSeconds, 55 * 60);
    assert.equal(leg.exercises[0]?.exerciseId, 'squats');
    assert.equal(leg.exercises[1]?.exerciseId, 'zercher-carry');
    assert.deepEqual(parsed.unmatchedIds, ['zercher-carry']);
  });

  it('a row weight unit wins over the device preference', () => {
    const parsed = decideImportSessionCsv(SESSION, 'imperial');
    assert.equal(parsed.kind, 'ready');
    if (parsed.kind !== 'ready') return;
    const bench = parsed.workouts
      .find((w) => w.workoutName === 'Push Day')
      ?.exercises.find((e) => e.exerciseId === 'bench-press');
    assert.equal(bench?.sets[0]?.weight, 220.5);
  });

  it('set-table export is the same door', () => {
    const parsed = decideImportSessionCsv(SET_TABLE, 'metric');
    assert.equal(parsed.kind, 'ready');
    if (parsed.kind !== 'ready') return;
    assert.equal(parsed.format, 'set-table-a');
    assert.equal(parsed.workouts.length, 1);
    assert.equal(parsed.skippedRows, 0);
    const push = parsed.workouts[0];
    assert.equal(push?.workoutName, 'Push Day');
    assert.equal(push?.exercises[0]?.exerciseId, 'bench-press');
    assert.equal(push?.exercises[1]?.exerciseId, 'front-squat');
    assert.equal(push?.exercises[1]?.sets[0]?.kind, 'warmup');
    assert.equal(push?.exercises[1]?.note, 'brace');
    assert.deepEqual(parsed.unmatchedIds, []);
  });

  it('confirm on an empty parse writes nothing', () => {
    const empty = decideImportSessionCsv(null, 'metric');
    assert.deepEqual(decideApplySessionCsv({ history: [], parsed: empty }), { kind: 'empty' });
  });

  it('confirm merges, and the same file again adds nothing', () => {
    const parsed = decideImportSessionCsv(SESSION, 'metric');
    const first = decideApplySessionCsv({ history: [], parsed });
    assert.equal(first.kind, 'apply');
    if (first.kind !== 'apply') return;
    assert.equal(first.added, 2);
    assert.equal(first.next.length, 2);
    const second = decideApplySessionCsv({ history: first.next, parsed });
    assert.deepEqual(second, { kind: 'already', duplicates: 2 });
  });

  it('an existing native session with the same fingerprint is not replaced', () => {
    const parsed = decideImportSessionCsv(SESSION, 'metric');
    assert.equal(parsed.kind, 'ready');
    if (parsed.kind !== 'ready') return;
    const incoming = parsed.workouts.find((w) => w.workoutName === 'Push Day');
    assert.ok(incoming);
    const native: CompletedWorkoutLog = {
      ...incoming,
      id: 'native-push',
      clientId: 'native-push',
      workoutName: 'Push Day',
    };
    const applied = decideApplySessionCsv({
      history: [native],
      parsed,
    });
    assert.equal(applied.kind, 'apply');
    if (applied.kind !== 'apply') return;
    assert.equal(applied.added, 1);
    const push = applied.next.find((w) => w.workoutName === 'Push Day');
    assert.equal(push?.id, 'native-push');
  });
});
