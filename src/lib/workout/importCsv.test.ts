import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  csvEscape,
  detectCsvFormat,
  exerciseIdForName,
  formatDurationSeconds,
  formatSetTableALocal,
  mergeImportedLogs,
  parseProgramLogDate,
  parseDurationSeconds,
  parseWorkoutCsv,
  splitCsvRecords,
  workoutsToSetTableACsv,
  workoutsToMwCsv,
  workoutsToSetTableBCsv,
} from '@/lib/workout/importCsv';
import { sessionLoad } from '@/lib/coach/load';
import { localDateKeyFromIso } from '@/lib/time/localDate';
import type { CompletedWorkoutLog } from '@/types';

let n = 0;
const testId = () => `t-${++n}`;

const fixture = (name: string) =>
  readFileSync(path.join(import.meta.dirname, 'fixtures', name), 'utf8');

const SET_TABLE_A = fixture('set-table-a-sample.csv');
const SET_TABLE_B = fixture('set-table-b-sample.csv');
const PROGRAM_LOG = fixture('program-log-sample.csv');
const PROGRAM_LOG_FLAT = fixture('program-log-flatten-sample.csv');
const MW = fixture('mw-native-sample.csv');

describe('importCsv', () => {
  it('detects format from the header, not the filename', () => {
    assert.equal(detectCsvFormat(SET_TABLE_A), 'set-table-a');
    assert.equal(detectCsvFormat(SET_TABLE_B), 'set-table-b');
    assert.equal(detectCsvFormat(PROGRAM_LOG), 'program-log');
    assert.equal(detectCsvFormat(PROGRAM_LOG_FLAT), 'program-log');
    assert.equal(detectCsvFormat(MW), 'mw');
    assert.equal(detectCsvFormat('a,b,c\n1,2,3'), null);
  });

  it('a UTF-8 BOM does not hide a Strong header', () => {
    assert.equal(detectCsvFormat(`\uFEFF${SET_TABLE_B}`), 'set-table-b');
    const r = parseWorkoutCsv(`\uFEFF${SET_TABLE_B}`, 'metric', testId);
    assert.equal(r.format, 'set-table-b');
    assert.equal(r.workouts.length, 2);
  });

  it('a quoted field with a newline stays one record', () => {
    // the set-table logger exercise notes routinely contain newlines. `text.split('\n')` here is the
    // bug that imports a 400-session export as garbage.
    const records = splitCsvRecords(SET_TABLE_A);
    assert.equal(records.length, 6, 'header + 5 data rows despite the embedded newline');
    assert.match(records[3][6], /note with, comma\nand a newline/);
  });

  it('rebuilds a the set-table logger export into native nested workouts', () => {
    const r = parseWorkoutCsv(SET_TABLE_A, 'metric', testId);
    assert.equal(r.format, 'set-table-a');
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
    const r = parseWorkoutCsv(SET_TABLE_B, 'metric', testId);
    assert.equal(r.format, 'set-table-b');
    assert.equal(r.workouts.length, 2);
    const leg = r.workouts.find((w) => w.workoutName === 'Leg Day');
    assert.ok(leg);
    assert.equal(leg.durationSeconds, 55 * 60, 'Strong "55m" duration string');
    assert.equal(leg.exercises[0].sets[0].weight, 140);
  });

  it('rebuilds a a program-log app History→CSV dump (per-set, slash dates)', () => {
    const r = parseWorkoutCsv(PROGRAM_LOG, 'metric', testId);
    assert.equal(r.format, 'program-log');
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

  it('rebuilds a a program-log app flatten CSV (session_date + archived weight)', () => {
    const r = parseWorkoutCsv(PROGRAM_LOG_FLAT, 'metric', testId);
    assert.equal(r.format, 'program-log');
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
    const imperial = parseWorkoutCsv(SET_TABLE_A, 'imperial', testId);
    const bench = imperial.workouts
      .find((w) => w.workoutName === 'Push Day')!
      .exercises.find((e) => e.exerciseId === 'bench-press')!;
    assert.equal(bench.sets[0].weight, 220.5, '100 kg → 220.5 lb');
  });

  it('an imported session and a natively logged twin produce identical sessionLoad', () => {
    // The whole payoff: the load/PR engines must treat imported history as history.
    const r = parseWorkoutCsv(SET_TABLE_B, 'metric', testId);
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

  it('a program-log app import matches a native twin in sessionLoad', () => {
    const r = parseWorkoutCsv(PROGRAM_LOG, 'metric', testId);
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
    const first = parseWorkoutCsv(SET_TABLE_A, 'metric', testId);
    const second = parseWorkoutCsv(SET_TABLE_A, 'metric', testId);
    const once = mergeImportedLogs([], first.workouts);
    assert.equal(once.added, 2);
    const twice = mergeImportedLogs(once.merged, second.workouts);
    assert.equal(twice.added, 0, 'every workout in a re-import is a duplicate');
    assert.equal(twice.duplicates, 2);
    assert.equal(twice.merged.length, 2);
  });

  it('existing history wins over an import at the same identity', () => {
    const r = parseWorkoutCsv(SET_TABLE_B, 'metric', testId);
    const native = { ...r.workouts[0], id: 'native-1', totalVolume: 999_999 };
    const { merged, added } = mergeImportedLogs([native], [r.workouts[0]]);
    assert.equal(added, 0);
    assert.equal(merged.find((l) => l.totalVolume === 999_999)?.id, 'native-1');
  });

  it('reports skipped rows instead of swallowing them', () => {
    const withJunk = SET_TABLE_A + '\n"Push Day","x","y",,"",,,0,normal,100,5,,,';
    const r = parseWorkoutCsv(withJunk, 'metric', testId);
    assert.equal(r.skippedRows, 1, 'blank exercise name is skipped and counted');
  });

  it('skips a program-log app flatten rows marked skipped', () => {
    const csv =
      PROGRAM_LOG_FLAT.trimEnd() +
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
    assert.equal(formatDurationSeconds(3900), '1h 5m');
    assert.equal(formatDurationSeconds(2700), '45m');
    assert.equal(formatDurationSeconds(32), '32s');
    assert.equal(parseDurationSeconds(formatDurationSeconds(3661)), 3661);
  });

  it('a program-log app slash dates follow the unit column (kg = EU, lb = US)', () => {
    assert.equal(localDateKeyFromIso(parseProgramLogDate('03/04/26', 'kg')!), '2026-04-03');
    assert.equal(localDateKeyFromIso(parseProgramLogDate('03/04/26', 'lb')!), '2026-03-04');
  });

  it('a date-only ISO is the local calendar day, not UTC midnight', () => {
    const csv =
      'session_date,session_title,exercise_name,set_index,set_value_weight,set_amount_reps,set_weight_unit\n' +
      '2026-07-14,Noon,Squat (Barbell),1,140,5,kg\n';
    const r = parseWorkoutCsv(csv, 'metric', testId);
    assert.equal(localDateKeyFromIso(r.workouts[0].completedAt), '2026-07-14');
  });

  it('round-trip: native logs → MW CSV → parse → merge is a no-op', () => {
    const imported = parseWorkoutCsv(SET_TABLE_B, 'metric', testId);
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

  it('round-trip: Strong fixture → session CSV → parse → merge is a no-op', () => {
    const imported = parseWorkoutCsv(SET_TABLE_B, 'metric', testId);
    const csv = workoutsToSetTableBCsv(imported.workouts, 'metric');
    assert.match(csv, /^Date,Workout Name,Duration,Exercise Name,Set Order/);
    assert.match(csv, /1h 5m/);
    assert.match(csv, /55m/);
    const back = parseWorkoutCsv(csv, 'metric', testId);
    assert.equal(back.format, 'set-table-b');
    assert.equal(back.workouts.length, 2);
    for (const w of imported.workouts) {
      const twin = back.workouts.find((b) => b.workoutName === w.workoutName);
      assert.ok(twin);
      assert.deepEqual(sessionLoad(twin), sessionLoad(w));
    }
    const { added, duplicates } = mergeImportedLogs(imported.workouts, back.workouts);
    assert.equal(added, 0, 'Strong in+out must not duplicate');
    assert.equal(duplicates, 2);
  });

  it('round-trip: the set-table logger fixture → the set-table logger CSV → parse → merge is a no-op', () => {
    const imported = parseWorkoutCsv(SET_TABLE_A, 'metric', testId);
    const csv = workoutsToSetTableACsv(imported.workouts, 'metric');
    assert.match(csv, /^title,start_time,end_time,description,exercise_title/);
    assert.match(csv, /set_type,weight_kg/);
    assert.match(csv, /,failure,/);
    assert.match(csv, /,warmup,/);
    const back = parseWorkoutCsv(csv, 'metric', testId);
    assert.equal(back.format, 'set-table-a');
    assert.equal(back.workouts.length, 2);
    const push = back.workouts.find((w) => w.workoutName === 'Push Day');
    assert.ok(push);
    const bench = push.exercises.find((e) => e.exerciseId === 'bench-press');
    assert.ok(bench);
    assert.equal(bench.sets[2].kind, 'failure');
    assert.equal(push.durationSeconds, 65 * 60);
    for (const w of imported.workouts) {
      const twin = back.workouts.find((b) => b.workoutName === w.workoutName);
      assert.ok(twin);
      assert.deepEqual(sessionLoad(twin), sessionLoad(w));
    }
    const { added, duplicates } = mergeImportedLogs(imported.workouts, back.workouts);
    assert.equal(added, 0, 'the set-table logger in+out must not duplicate');
    assert.equal(duplicates, 2);
  });

  it('export skips tombstoned logs', () => {
    const live = parseWorkoutCsv(MW, 'metric', testId).workouts[0];
    const dead: CompletedWorkoutLog = { ...live, id: 'dead', deletedAt: '2026-07-20T00:00:00.000Z' };
    const mw = workoutsToMwCsv([live, dead], 'metric');
    assert.equal(mw.split('\n').filter((l) => l.startsWith('dead,')).length, 0);
    assert.match(mw, new RegExp(`^${live.id},`, 'm'));
    const dialectALive = workoutsToSetTableACsv([live], 'metric');
    const dialectAMixed = workoutsToSetTableACsv([live, dead], 'metric');
    assert.equal(dialectAMixed, dialectALive, 'set-table-a export must drop tombstones');
    const strongLive = workoutsToSetTableBCsv([live], 'metric');
    const strongMixed = workoutsToSetTableBCsv([live, dead], 'metric');
    assert.equal(strongMixed, strongLive, 'Strong export must drop tombstones');
  });

  it('the set-table logger and Strong export dates use local fields, not UTC ISO slices', () => {
    // Pacific/Kiritimati is UTC+14: 10:05 local on the 14th is still the 13th in UTC.
    // Slicing toISOString() would write 13 Jul / 2026-07-13 — the defect that shipped
    // a wrong shared week east of UTC everywhere else in this repo.
    const previous = process.env.TZ;
    process.env.TZ = 'Pacific/Kiritimati';
    try {
      const started = new Date(2026, 6, 14, 10, 5, 0);
      const completed = new Date(2026, 6, 14, 11, 10, 0);
      const log: CompletedWorkoutLog = {
        id: 'local-1',
        workoutName: 'Push Day',
        startedAt: started.toISOString(),
        completedAt: completed.toISOString(),
        durationSeconds: 65 * 60,
        exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
        totalVolume: 500,
      };
      assert.equal(formatSetTableALocal(log.startedAt), '14 Jul 2026, 10:05');
      const dialectA = workoutsToSetTableACsv([log], 'metric');
      assert.match(dialectA, /14 Jul 2026, 10:05/);
      assert.match(dialectA, /14 Jul 2026, 11:10/);
      assert.doesNotMatch(dialectA, /13 Jul 2026/);
      const strong = workoutsToSetTableBCsv([log], 'metric');
      assert.match(strong, /2026-07-14 10:05:00/);
      assert.doesNotMatch(strong, /2026-07-13/);
    } finally {
      if (previous === undefined) delete process.env.TZ;
      else process.env.TZ = previous;
    }
  });

  it('csvEscape quotes commas, quotes, and newlines', () => {
    assert.equal(csvEscape('plain'), 'plain');
    assert.equal(csvEscape('a,b'), '"a,b"');
    assert.equal(csvEscape('say "hi"'), '"say ""hi"""');
    assert.equal(csvEscape('line\nbreak'), '"line\nbreak"');
  });
});
