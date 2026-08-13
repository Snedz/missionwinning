import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  csvEscape,
  detectCsvFormat,
  exerciseIdForName,
  mergeImportedLogs,
  parseBoostcampDate,
  parseDurationSeconds,
  parseWorkoutCsv,
  splitCsvRecords,
  workoutsToMwCsv,
} from '@/lib/workout/importCsv';
import { sessionLoad } from '@/lib/coach/load';
import { localDateKeyFromIso } from '@/lib/time/localDate';
import type { CompletedWorkoutLog } from '@/types';

let n = 0;
const testId = () => `t-${++n}`;

const fixture = (name: string) =>
  readFileSync(path.join(import.meta.dirname, 'fixtures', name), 'utf8');

const HEVY = fixture('hevy-sample.csv');
const STRONG = fixture('strong-sample.csv');
const BOOSTCAMP = fixture('boostcamp-sample.csv');
const BOOSTCAMP_FLAT = fixture('boostcamp-flatten-sample.csv');
const MW = fixture('mw-native-sample.csv');

describe('importCsv', () => {
  it('detects format from the header, not the filename', () => {
    assert.equal(detectCsvFormat(HEVY), 'hevy');
    assert.equal(detectCsvFormat(STRONG), 'strong');
    assert.equal(detectCsvFormat(BOOSTCAMP), 'boostcamp');
    assert.equal(detectCsvFormat(BOOSTCAMP_FLAT), 'boostcamp');
    assert.equal(detectCsvFormat(MW), 'mw');
    assert.equal(detectCsvFormat('a,b,c\n1,2,3'), null);
  });

  it('a UTF-8 BOM does not hide a Strong header', () => {
    assert.equal(detectCsvFormat(`\uFEFF${STRONG}`), 'strong');
    const r = parseWorkoutCsv(`\uFEFF${STRONG}`, 'metric', testId);
    assert.equal(r.format, 'strong');
    assert.equal(r.workouts.length, 2);
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

  it('rebuilds a Boostcamp History→CSV dump (per-set, slash dates)', () => {
    const r = parseWorkoutCsv(BOOSTCAMP, 'metric', testId);
    assert.equal(r.format, 'boostcamp');
    assert.equal(r.error, undefined);
    assert.equal(r.workouts.length, 2);
    const first = r.workouts.find((w) => w.workoutName === 'Bullmastiff');
    assert.ok(first);
    assert.equal(localDateKeyFromIso(first.completedAt), '2026-07-14');
    const bench = first.exercises.find((e) => e.exerciseId === 'bench-press');
    assert.ok(bench);
    assert.equal(bench.sets.length, 2);
    assert.equal(bench.sets[0].weight, 100);
  });

  it('rebuilds a Boostcamp flatten CSV (session_date + archived weight)', () => {
    const r = parseWorkoutCsv(BOOSTCAMP_FLAT, 'metric', testId);
    assert.equal(r.format, 'boostcamp');
    assert.equal(r.workouts.length, 2);
    const push = r.workouts.find((w) => w.workoutName === 'Push Day');
    assert.ok(push);
    assert.equal(localDateKeyFromIso(push.completedAt), '2026-07-14');
    assert.equal(push.exercises[0].sets.length, 2);
  });

  it('rebuilds Mission Winning native CSV, keeping workout ids', () => {
    const r = parseWorkoutCsv(MW, 'metric', testId);
    assert.equal(r.format, 'mw');
    assert.equal(r.workouts.length, 2);
    const push = r.workouts.find((w) => w.workoutName === 'Push Day');
    assert.ok(push);
    assert.equal(push.id, 'w1');
    assert.equal(push.durationSeconds, 3900);
    const bench = push.exercises.find((e) => e.exerciseId === 'bench-press');
    assert.ok(bench);
    assert.equal(bench.sets[0].rpe, 'med');
    assert.equal(bench.sets[1].rpe, 'hard');
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

  it('Boostcamp import matches a native twin in sessionLoad', () => {
    const r = parseWorkoutCsv(BOOSTCAMP, 'metric', testId);
    const imported = r.workouts.find(
      (w) => w.workoutName === 'Bullmastiff' && localDateKeyFromIso(w.completedAt) === '2026-07-16'
    )!;
    const native: CompletedWorkoutLog = {
      id: 'n-bc',
      workoutName: 'Bullmastiff',
      startedAt: imported.startedAt,
      completedAt: imported.completedAt,
      durationSeconds: imported.durationSeconds,
      exercises: [{ exerciseId: 'squats', sets: [{ reps: 5, weight: 140 }] }],
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

  it('skips Boostcamp flatten rows marked skipped', () => {
    const csv =
      BOOSTCAMP_FLAT.trimEnd() +
      '\n2026-07-14,Push Day,Ghost Press,3,100,5,kg,100,5,true\n';
    const r = parseWorkoutCsv(csv, 'metric', testId);
    assert.equal(r.skippedRows, 1);
    const push = r.workouts.find((w) => w.workoutName === 'Push Day')!;
    assert.equal(
      push.exercises.reduce((n, e) => n + e.sets.length, 0),
      2,
      'the skipped ghost set must not land in history'
    );
  });

  it('Strong duration strings parse in all three shapes', () => {
    assert.equal(parseDurationSeconds('1h 5m'), 3900);
    assert.equal(parseDurationSeconds('45m'), 2700);
    assert.equal(parseDurationSeconds('32s'), 32);
  });

  it('Boostcamp slash dates follow the unit column (kg = EU, lb = US)', () => {
    assert.equal(localDateKeyFromIso(parseBoostcampDate('03/04/26', 'kg')!), '2026-04-03');
    assert.equal(localDateKeyFromIso(parseBoostcampDate('03/04/26', 'lb')!), '2026-03-04');
  });

  it('a date-only ISO is the local calendar day, not UTC midnight', () => {
    const csv =
      'session_date,session_title,exercise_name,set_index,set_value_weight,set_amount_reps,set_weight_unit\n' +
      '2026-07-14,Noon,Squat (Barbell),1,140,5,kg\n';
    const r = parseWorkoutCsv(csv, 'metric', testId);
    assert.equal(localDateKeyFromIso(r.workouts[0].completedAt), '2026-07-14');
  });

  it('round-trip: native logs → MW CSV → parse → merge is a no-op', () => {
    const imported = parseWorkoutCsv(STRONG, 'metric', testId);
    assert.equal(imported.workouts.length, 2);
    const csv = workoutsToMwCsv(imported.workouts, 'metric');
    assert.match(csv, /^workout_id,workout_name,completed_at/);
    const back = parseWorkoutCsv(csv, 'metric', testId);
    assert.equal(back.format, 'mw');
    assert.equal(back.workouts.length, 2);
    for (const w of imported.workouts) {
      const twin = back.workouts.find((b) => b.workoutName === w.workoutName);
      assert.ok(twin);
      assert.deepEqual(sessionLoad(twin), sessionLoad(w));
    }
    const { added, duplicates } = mergeImportedLogs(imported.workouts, back.workouts);
    assert.equal(added, 0, 'exporting then importing the same log must not duplicate');
    assert.equal(duplicates, 2);
  });

  it('export skips tombstoned logs', () => {
    const live = parseWorkoutCsv(MW, 'metric', testId).workouts[0];
    const dead: CompletedWorkoutLog = { ...live, id: 'dead', deletedAt: '2026-07-20T00:00:00.000Z' };
    const csv = workoutsToMwCsv([live, dead], 'metric');
    assert.equal(csv.split('\n').filter((l) => l.startsWith('dead,')).length, 0);
    assert.match(csv, new RegExp(`^${live.id},`, 'm'));
  });

  it('csvEscape quotes commas, quotes, and newlines', () => {
    assert.equal(csvEscape('plain'), 'plain');
    assert.equal(csvEscape('a,b'), '"a,b"');
    assert.equal(csvEscape('say "hi"'), '"say ""hi"""');
    assert.equal(csvEscape('line\nbreak'), '"line\nbreak"');
  });
});
