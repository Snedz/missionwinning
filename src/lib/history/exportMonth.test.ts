/**
 * This month as a file they own. Empty / missing / junk invents nothing.
 * Only that month's live rows. Columns shared with `.1011`.
 * Paging the calendar changes the file. Whole-diary export stays whole.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog } from '@/types';
import { localDateKeyFromIso } from '@/lib/time/localDate.ts';
import { decideExportDiary, EXPORT_DIARY_CSV_HEADER } from './exportDiary.ts';
import { decideImportDiary } from './importDiary.ts';
import { decideExportMonth, exportMonthFileName } from './exportMonth.ts';

function isoOnLocalDay(year: number, month: number, day: number, hour = 12): string {
  return new Date(year, month - 1, day, hour).toISOString();
}

function log(
  over: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id'>
): CompletedWorkoutLog {
  return {
    clientId: `cid-${over.id}`,
    revision: 1,
    workoutName: 'Push',
    startedAt: isoOnLocalDay(2026, 7, 2, 10),
    completedAt: isoOnLocalDay(2026, 7, 2, 11),
    durationSeconds: 3600,
    totalVolume: 675,
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] }],
    ...over,
  };
}

const helperSrc = readFileSync(path.join(import.meta.dirname, 'exportMonth.ts'), 'utf8');
const diarySrc = readFileSync(path.join(import.meta.dirname, 'exportDiary.ts'), 'utf8');

const JULY_ISO = isoOnLocalDay(2026, 7, 2, 11);
const JUNE_ISO = isoOnLocalDay(2026, 6, 20, 11);
const JULY_KEY = (localDateKeyFromIso(JULY_ISO) ?? '').slice(0, 7);
const JUNE_KEY = (localDateKeyFromIso(JUNE_ISO) ?? '').slice(0, 7);
const EMPTY_KEY = '2026-01';

describe('decideExportMonth (.1029)', () => {
  it('empty / missing / junk monthKey invents nothing — Save stays disabled', () => {
    const history = [log({ id: 'log-jul' })];
    assert.deepEqual(decideExportMonth({}), { kind: 'empty' });
    assert.deepEqual(decideExportMonth({ monthKey: '', history }), { kind: 'empty' });
    assert.deepEqual(decideExportMonth({ monthKey: '   ', history }), { kind: 'empty' });
    assert.deepEqual(decideExportMonth({ monthKey: null, history }), { kind: 'empty' });
    assert.deepEqual(decideExportMonth({ monthKey: undefined, history }), { kind: 'empty' });
    assert.deepEqual(decideExportMonth({ monthKey: '2026-13', history }), { kind: 'empty' });
    assert.deepEqual(decideExportMonth({ monthKey: '2026-00', history }), { kind: 'empty' });
    assert.deepEqual(decideExportMonth({ monthKey: '07', history }), { kind: 'empty' });
    assert.deepEqual(decideExportMonth({ monthKey: localDateKeyFromIso(JULY_ISO), history }), {
      kind: 'empty',
    });
  });

  it('empty month / missing history invents nothing — Save stays disabled', () => {
    assert.deepEqual(decideExportMonth({ monthKey: JULY_KEY }), { kind: 'empty' });
    assert.deepEqual(decideExportMonth({ monthKey: JULY_KEY, history: [] }), { kind: 'empty' });
    assert.deepEqual(decideExportMonth({ monthKey: JULY_KEY, history: null }), { kind: 'empty' });
    const juneOnly = log({
      id: 'log-jun',
      startedAt: isoOnLocalDay(2026, 6, 20, 10),
      completedAt: JUNE_ISO,
    });
    assert.deepEqual(decideExportMonth({ monthKey: EMPTY_KEY, history: [juneOnly] }), {
      kind: 'empty',
    });
    assert.deepEqual(decideExportMonth({ monthKey: JULY_KEY, history: [juneOnly] }), {
      kind: 'empty',
    });
  });

  it('tomb / hollow live invents nothing — Save stays disabled', () => {
    const tomb = log({
      id: 'log-gone',
      sessionTitle: 'Deleted July',
      deletedAt: isoOnLocalDay(2026, 7, 4, 12),
    });
    const hollow = log({
      id: 'log-hollow',
      exercises: [{ exerciseId: 'bench-press', sets: [] }],
    });
    assert.deepEqual(decideExportMonth({ monthKey: JULY_KEY, history: [tomb] }), {
      kind: 'empty',
    });
    assert.deepEqual(decideExportMonth({ monthKey: JULY_KEY, history: [hollow] }), {
      kind: 'empty',
    });
  });

  it('a live month writes only that month’s rows', () => {
    const july = log({
      id: 'log-jul',
      sessionTitle: 'July squat',
      exercises: [{ exerciseId: 'squats', sets: [{ reps: 5, weight: 185 }] }],
    });
    const june = log({
      id: 'log-jun',
      sessionTitle: 'June bench',
      workoutName: 'Push',
      startedAt: isoOnLocalDay(2026, 6, 20, 10),
      completedAt: JUNE_ISO,
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] }],
    });
    const decided = decideExportMonth({
      monthKey: JULY_KEY,
      history: [july, june],
    });
    assert.equal(decided.kind, 'ready');
    if (decided.kind !== 'ready') return;
    assert.equal(decided.count, 1);
    assert.equal(decided.rows[0]?.sessionTitle, 'July squat');
    assert.equal(decided.rows[0]?.lift, 'squats');
    assert.equal(decided.csv.includes('June bench'), false);
    assert.equal(decided.csv.includes('bench press'), false);
    assert.equal(decided.json.includes('June bench'), false);
  });

  it('paging to another month changes the file', () => {
    const july = log({
      id: 'log-jul',
      sessionTitle: 'July squat',
      exercises: [{ exerciseId: 'squats', sets: [{ reps: 5, weight: 185 }] }],
    });
    const june = log({
      id: 'log-jun',
      sessionTitle: 'June bench',
      startedAt: isoOnLocalDay(2026, 6, 20, 10),
      completedAt: JUNE_ISO,
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] }],
    });
    const history = [july, june];
    const onScreenJuly = decideExportMonth({ monthKey: JULY_KEY, history });
    const pagedJune = decideExportMonth({ monthKey: JUNE_KEY, history });
    assert.equal(onScreenJuly.kind, 'ready');
    assert.equal(pagedJune.kind, 'ready');
    if (onScreenJuly.kind !== 'ready' || pagedJune.kind !== 'ready') return;
    assert.notEqual(onScreenJuly.csv, pagedJune.csv);
    assert.notEqual(onScreenJuly.json, pagedJune.json);
    assert.equal(onScreenJuly.rows[0]?.sessionTitle, 'July squat');
    assert.equal(pagedJune.rows[0]?.sessionTitle, 'June bench');
    assert.equal(exportMonthFileName(JULY_KEY, 'csv'), `mission-winning-month-${JULY_KEY}.csv`);
    assert.equal(exportMonthFileName(JUNE_KEY, 'csv'), `mission-winning-month-${JUNE_KEY}.csv`);
    assert.notEqual(exportMonthFileName(JULY_KEY, 'csv'), exportMonthFileName(JUNE_KEY, 'csv'));
  });

  it('overflow diary export still writes the whole diary', () => {
    const july = log({
      id: 'log-jul',
      sessionTitle: 'July squat',
    });
    const june = log({
      id: 'log-jun',
      sessionTitle: 'June bench',
      startedAt: isoOnLocalDay(2026, 6, 20, 10),
      completedAt: JUNE_ISO,
    });
    const monthFile = decideExportMonth({ monthKey: JULY_KEY, history: [july, june] });
    const whole = decideExportDiary([july, june]);
    assert.equal(monthFile.kind, 'ready');
    assert.equal(whole.kind, 'ready');
    if (monthFile.kind !== 'ready' || whole.kind !== 'ready') return;
    assert.ok(whole.count > monthFile.count);
    assert.equal(whole.csv.includes('July squat'), true);
    assert.equal(whole.csv.includes('June bench'), true);
    assert.equal(monthFile.csv.includes('June bench'), false);
    assert.match(diarySrc, /export function decideExportDiary/);
    assert.doesNotMatch(diarySrc, /monthKey/);
  });

  it('start-from fold does not shrink the file', () => {
    const older = log({
      id: 'log-jun',
      sessionTitle: 'June bench',
      startedAt: isoOnLocalDay(2026, 6, 20, 10),
      completedAt: JUNE_ISO,
    });
    const decided = decideExportMonth({
      monthKey: JUNE_KEY,
      history: [older],
      startFrom: '2026-07-01',
    });
    assert.equal(decided.kind, 'ready');
    if (decided.kind !== 'ready') return;
    assert.equal(decided.rows[0]?.sessionTitle, 'June bench');
  });

  it('shares .1011 columns — no invented 1RM or duration', () => {
    const julyDay = localDateKeyFromIso(JULY_ISO) ?? '';
    const rowLog = log({
      id: 'log-jul',
      sessionTitle: 'July squat',
      sessionNote: 'felt heavy',
      durationSeconds: 3600,
      exercises: [
        {
          exerciseId: 'squats',
          note: 'paused',
          sets: [
            {
              reps: 5,
              weight: 185,
              kind: 'warmup',
              rpe10: 7,
              side: 'L',
            },
          ],
        },
      ],
    });
    const decided = decideExportMonth({ monthKey: JULY_KEY, history: [rowLog] });
    const whole = decideExportDiary([rowLog]);
    assert.equal(decided.kind, 'ready');
    assert.deepEqual(decided, whole);
    if (decided.kind !== 'ready') return;
    assert.ok(decided.csv.startsWith(`${EXPORT_DIARY_CSV_HEADER}\n`));
    assert.equal(decided.csv.includes('e1RM'), false);
    assert.equal(decided.csv.includes('1RM'), false);
    assert.deepEqual(decided.rows[0], {
      date: julyDay,
      sessionTitle: 'July squat',
      workoutName: 'Push',
      lift: 'squats',
      setType: 'warmup',
      kg: '185',
      reps: '5',
      rpe: '7',
      tags: 'W L',
      notes: 'felt heavy | paused',
      duration: '3600',
    });
    assert.equal(exportMonthFileName(JULY_KEY, 'json'), `mission-winning-month-${JULY_KEY}.json`);
  });

  it('the month file re-imports through decideImportDiary (.1013)', () => {
    const live = log({
      id: 'log-jul',
      sessionTitle: 'July squat',
      exercises: [{ exerciseId: 'squats', sets: [{ reps: 5, weight: 185 }] }],
    });
    const other = log({
      id: 'log-jun',
      sessionTitle: 'June bench',
      startedAt: isoOnLocalDay(2026, 6, 20, 10),
      completedAt: JUNE_ISO,
    });
    const decided = decideExportMonth({
      monthKey: JULY_KEY,
      history: [other, live],
    });
    assert.equal(decided.kind, 'ready');
    if (decided.kind !== 'ready') return;
    const csvParsed = decideImportDiary(decided.csv);
    const jsonParsed = decideImportDiary(decided.json);
    assert.equal(csvParsed.kind, 'ready');
    assert.equal(jsonParsed.kind, 'ready');
    if (csvParsed.kind !== 'ready' || jsonParsed.kind !== 'ready') return;
    assert.equal(csvParsed.sessions.length, 1);
    assert.equal(jsonParsed.sessions.length, 1);
    assert.equal(csvParsed.sessions[0]?.sessionTitle, 'July squat');
    assert.equal(csvParsed.sessions[0]?.exercises[0]?.exerciseId, 'squats');
  });

  it('does not import Account interchange, share, or fold / search', () => {
    assert.match(helperSrc, /decideExportDiary\(/);
    assert.match(helperSrc, /startFrom/);
    assert.doesNotMatch(helperSrc, /buildWorkoutCsvDownload|workoutsToMwCsv|workoutsToSetTableBCsv/);
    assert.doesNotMatch(helperSrc, /foldHistoryFrom|historyForWeek|startHistoryFrom/);
    assert.doesNotMatch(helperSrc, /decideSearchHistory|decideImportApply/);
    assert.doesNotMatch(helperSrc, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(helperSrc, /e1RM|estimated 1RM|toISOString\(\)/);
    assert.doesNotMatch(helperSrc, /navigator\.share|mailto:|discord\.com/);
    assert.equal(exportMonthFileName({ kind: 'empty' }, 'csv'), 'mission-winning-month.csv');
    assert.equal(exportMonthFileName('', 'json'), 'mission-winning-month.json');
  });
});
