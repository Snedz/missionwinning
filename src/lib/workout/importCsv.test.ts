import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectCsvFormat,
  exerciseIdForName,
  mergeImportedLogs,
  parseDurationSeconds,
  parseWorkoutCsv,
  splitCsvRecords,
} from '@/lib/workout/importCsv';
import { sessionLoad } from '@/lib/coach/load';
import type { CompletedWorkoutLog } from '@/types';

let n = 0;
const testId = () => `t-${++n}`;

const HEVY = [
  'title,start_time,end_time,description,exercise_title,superset_id,exercise_notes,set_index,set_type,weight_kg,reps,distance_km,duration_seconds,rpe',
  '"Push Day","14 Jul 2026, 18:05","14 Jul 2026, 19:10",,"Bench Press (Barbell)",,,0,normal,100,5,,,8',
  '"Push Day","14 Jul 2026, 18:05","14 Jul 2026, 19:10",,"Bench Press (Barbell)",,,1,normal,100,5,,,9',
  '"Push Day","14 Jul 2026, 18:05","14 Jul 2026, 19:10",,"Bench Press (Barbell)",,"note with, comma',
  'and a newline",2,failure,100,3,,,10',
  '"Push Day","14 Jul 2026, 18:05","14 Jul 2026, 19:10",,"Lateral Raise (Dumbbell)",,,0,warmup,8,15,,,',
  '"Leg Day","16 Jul 2026, 18:00","16 Jul 2026, 19:00",,"Squat (Barbell)",,,0,normal,140,5,,,8',
].join('\n');

const STRONG = [
  'Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Weight Unit,Reps,RPE,Notes',
  '2026-07-14 18:05:00,"Push Day","1h 5m","Bench Press (Barbell)",1,100,kg,5,8,',
  '2026-07-14 18:05:00,"Push Day","1h 5m","Bench Press (Barbell)",2,100,kg,5,9,',
  '2026-07-16 18:00:00,"Leg Day","55m","Squat (Barbell)",1,140,kg,5,8,',
].join('\n');

describe('importCsv', () => {
  it('detects format from the header, not the filename', () => {
    assert.equal(detectCsvFormat(HEVY), 'hevy');
    assert.equal(detectCsvFormat(STRONG), 'strong');
    assert.equal(detectCsvFormat('a,b,c\n1,2,3'), null);
  });

  it('a quoted field with a newline stays one record', () => {
    // Hevy exercise notes routinely contain newlines. `text.split('\n')` here is the
    // bug that imports a 400-session export as garbage.
    const records = splitCsvRecords(HEVY);
    assert.equal(records.length, 6, 'header + 5 data rows despite the embedded newline');
    assert.match(records[3][6], /note with, comma\nand a newline/);
  });

  it('rebuilds a Hevy export into native nested workouts', () => {
    const r = parseWorkoutCsv(HEVY, 'metric', testId);
    assert.equal(r.format, 'hevy');
    assert.equal(r.error, undefined);
    assert.equal(r.workouts.length, 2);

    const push = r.workouts.find((w) => w.workoutName === 'Push Day');
    assert.ok(push);
    assert.equal(push.exercises.length, 2, 'bench + lateral raise, nested');
    const bench = push.exercises.find((e) => e.exerciseId === 'bench-press');
    assert.ok(bench, 'Bench Press (Barbell) must match the catalog id');
    assert.equal(bench.sets.length, 3);
    assert.equal(bench.sets[0].rpe, 'med', 'RPE 8 → med via the shared Android mapping');
    assert.equal(bench.sets[1].rpe, 'hard', 'RPE 9 → hard');
    assert.equal(bench.sets[2].kind, 'failure');
    // Duration from start/end when no explicit duration exists.
    assert.equal(push.durationSeconds, 65 * 60);
  });

  it('rebuilds a Strong export, reading the per-row weight unit', () => {
    const r = parseWorkoutCsv(STRONG, 'metric', testId);
    assert.equal(r.format, 'strong');
    assert.equal(r.workouts.length, 2);
    const leg = r.workouts.find((w) => w.workoutName === 'Leg Day');
    assert.ok(leg);
    assert.equal(leg.durationSeconds, 55 * 60, 'Strong "55m" duration string');
    assert.equal(leg.exercises[0].sets[0].weight, 140);
  });

  it('converts units to the athlete display preference', () => {
    const imperial = parseWorkoutCsv(HEVY, 'imperial', testId);
    const bench = imperial.workouts
      .find((w) => w.workoutName === 'Push Day')!
      .exercises.find((e) => e.exerciseId === 'bench-press')!;
    assert.equal(bench.sets[0].weight, 220.5, '100 kg → 220.5 lb');
  });

  it('an imported session and a natively logged twin produce identical sessionLoad', () => {
    // The whole payoff: the load/PR engines must treat imported history as history.
    const r = parseWorkoutCsv(STRONG, 'metric', testId);
    const imported = r.workouts.find((w) => w.workoutName === 'Leg Day')!;
    const native: CompletedWorkoutLog = {
      id: 'n1',
      workoutName: 'Leg Day',
      startedAt: imported.startedAt,
      completedAt: imported.completedAt,
      durationSeconds: 55 * 60,
      exercises: [
        { exerciseId: 'squats', sets: [{ reps: 5, weight: 140, rpe: 'med' }] },
      ],
      totalVolume: 700,
    };
    assert.deepEqual(sessionLoad(imported), sessionLoad(native));
  });

  it('unknown exercises become slug ids — a set is never lost to matching', () => {
    assert.equal(exerciseIdForName('Bench Press (Barbell)'), 'bench-press');
    assert.equal(
      exerciseIdForName('Bulgarian Ring Flye Deluxe'),
      'bulgarian-ring-flye-deluxe'
    );
  });

  it('re-importing the same file is a no-op', () => {
    const first = parseWorkoutCsv(HEVY, 'metric', testId);
    const second = parseWorkoutCsv(HEVY, 'metric', testId);
    const once = mergeImportedLogs([], first.workouts);
    assert.equal(once.added, 2);
    const twice = mergeImportedLogs(once.merged, second.workouts);
    assert.equal(twice.added, 0, 'every workout in a re-import is a duplicate');
    assert.equal(twice.duplicates, 2);
    assert.equal(twice.merged.length, 2);
  });

  it('existing history wins over an import at the same identity', () => {
    const r = parseWorkoutCsv(STRONG, 'metric', testId);
    const native = { ...r.workouts[0], id: 'native-1', totalVolume: 999_999 };
    const { merged, added } = mergeImportedLogs([native], [r.workouts[0]]);
    assert.equal(added, 0);
    assert.equal(merged.find((l) => l.totalVolume === 999_999)?.id, 'native-1');
  });

  it('reports skipped rows instead of swallowing them', () => {
    const withJunk = HEVY + '\n"Push Day","x","y",,"",,,0,normal,100,5,,,';
    const r = parseWorkoutCsv(withJunk, 'metric', testId);
    assert.equal(r.skippedRows, 1, 'blank exercise name is skipped and counted');
  });

  it('Strong duration strings parse in all three shapes', () => {
    assert.equal(parseDurationSeconds('1h 5m'), 3900);
    assert.equal(parseDurationSeconds('45m'), 2700);
    assert.equal(parseDurationSeconds('32s'), 32);
  });
});
