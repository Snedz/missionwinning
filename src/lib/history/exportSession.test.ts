/**
 * This session as a file they own. Empty / missing / tomb invents nothing.
 * One session only. Columns shared with `.1011`. Re-imports via `.1013`.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog } from '@/types';
import { localDateKeyFromIso } from '@/lib/time/localDate.ts';
import { decideExportDiary, EXPORT_DIARY_CSV_HEADER } from './exportDiary.ts';
import { decideImportDiary } from './importDiary.ts';
import { decideExportSession, exportSessionFileName } from './exportSession.ts';

function log(
  over: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id'>
): CompletedWorkoutLog {
  return {
    clientId: `cid-${over.id}`,
    revision: 1,
    workoutName: 'Push',
    startedAt: '2026-08-17T10:00:00.000Z',
    completedAt: '2026-08-17T11:00:00.000Z',
    durationSeconds: 3600,
    totalVolume: 675,
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] }],
    ...over,
  };
}

const helperSrc = readFileSync(
  path.join(import.meta.dirname, 'exportSession.ts'),
  'utf8'
);

describe('decideExportSession (.1016)', () => {
  it('empty / missing sessionId invents nothing', () => {
    const history = [log({ id: 'log-mon' })];
    assert.deepEqual(decideExportSession({}), { kind: 'empty' });
    assert.deepEqual(decideExportSession({ sessionId: '', history }), { kind: 'empty' });
    assert.deepEqual(decideExportSession({ sessionId: '   ', history }), { kind: 'empty' });
    assert.deepEqual(decideExportSession({ sessionId: null, history }), { kind: 'empty' });
    assert.deepEqual(decideExportSession({ sessionId: undefined, history }), {
      kind: 'empty',
    });
  });

  it('missing history / missing session invents nothing', () => {
    assert.deepEqual(decideExportSession({ sessionId: 'log-mon' }), { kind: 'empty' });
    assert.deepEqual(decideExportSession({ sessionId: 'log-mon', history: [] }), {
      kind: 'empty',
    });
    assert.deepEqual(
      decideExportSession({ sessionId: 'log-missing', history: [log({ id: 'log-mon' })] }),
      { kind: 'empty' }
    );
  });

  it('tomb / hollow live invents nothing — Save stays disabled', () => {
    const tomb = log({
      id: 'log-gone',
      sessionTitle: 'Deleted Monday',
      deletedAt: '2026-08-25T12:00:00.000Z',
    });
    const hollow = log({
      id: 'log-hollow',
      exercises: [{ exerciseId: 'bench-press', sets: [] }],
    });
    assert.deepEqual(decideExportSession({ sessionId: 'log-gone', history: [tomb] }), {
      kind: 'empty',
    });
    assert.deepEqual(
      decideExportSession({ sessionId: 'log-hollow', history: [hollow] }),
      { kind: 'empty' }
    );
  });

  it('writes only that session — a second live log stays out', () => {
    const mon = log({
      id: 'log-mon',
      sessionTitle: 'Bogus Monday',
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] }],
    });
    const tue = log({
      id: 'log-tue',
      sessionTitle: 'Tuesday',
      workoutName: 'Pull',
      startedAt: '2026-08-18T10:00:00.000Z',
      completedAt: '2026-08-18T11:00:00.000Z',
      exercises: [{ exerciseId: 'squats', sets: [{ reps: 5, weight: 185 }] }],
    });
    const decided = decideExportSession({
      sessionId: 'log-tue',
      history: [mon, tue],
    });
    assert.equal(decided.kind, 'ready');
    if (decided.kind !== 'ready') return;
    assert.equal(decided.count, 1);
    assert.equal(decided.rows[0]?.sessionTitle, 'Tuesday');
    assert.equal(decided.rows[0]?.lift, 'squats');
    assert.equal(decided.csv.includes('Bogus Monday'), false);
    assert.equal(decided.csv.includes('bench press'), false);
    assert.equal(decided.json.includes('Bogus Monday'), false);
    const whole = decideExportDiary([mon, tue]);
    assert.equal(whole.kind, 'ready');
    if (whole.kind !== 'ready') return;
    assert.ok(whole.count > decided.count);
  });

  it('shares .1011 columns — no invented 1RM or duration', () => {
    const monKey = localDateKeyFromIso('2026-08-17T11:00:00.000Z') ?? '';
    const rowLog = log({
      id: 'log-mon',
      sessionTitle: 'Bogus Monday',
      sessionNote: 'felt heavy',
      durationSeconds: 3600,
      exercises: [
        {
          exerciseId: 'bench-press',
          note: 'paused',
          sets: [
            {
              reps: 5,
              weight: 135,
              kind: 'warmup',
              rpe10: 7,
              side: 'L',
            },
          ],
        },
      ],
    });
    const decided = decideExportSession({ sessionId: 'log-mon', history: [rowLog] });
    const whole = decideExportDiary([rowLog]);
    assert.equal(decided.kind, 'ready');
    assert.deepEqual(decided, whole);
    if (decided.kind !== 'ready') return;
    assert.ok(decided.csv.startsWith(`${EXPORT_DIARY_CSV_HEADER}\n`));
    assert.equal(decided.csv.includes('e1RM'), false);
    assert.equal(decided.csv.includes('1RM'), false);
    assert.deepEqual(decided.rows[0], {
      date: monKey,
      sessionTitle: 'Bogus Monday',
      workoutName: 'Push',
      lift: 'bench press',
      setType: 'warmup',
      kg: '135',
      reps: '5',
      rpe: '7',
      tags: 'W L',
      notes: 'felt heavy | paused',
      duration: '3600',
    });
    assert.equal(exportSessionFileName(decided, 'csv'), `mission-winning-session-${monKey}.csv`);
    assert.equal(exportSessionFileName(decided, 'json'), `mission-winning-session-${monKey}.json`);
  });

  it('duration 0 stays blank — does not invent from start/end', () => {
    const timedOff = log({
      id: 'log-off',
      durationSeconds: 0,
      startedAt: '2026-08-17T10:00:00.000Z',
      completedAt: '2026-08-17T11:30:00.000Z',
    });
    const decided = decideExportSession({ sessionId: 'log-off', history: [timedOff] });
    assert.equal(decided.kind, 'ready');
    if (decided.kind !== 'ready') return;
    assert.equal(decided.rows[0]?.duration, '');
  });

  it('the file re-imports through decideImportDiary (.1013)', () => {
    const live = log({
      id: 'log-tue',
      sessionTitle: 'Tuesday',
      workoutName: 'Pull',
      startedAt: '2026-08-18T10:00:00.000Z',
      completedAt: '2026-08-18T11:00:00.000Z',
      exercises: [{ exerciseId: 'squats', sets: [{ reps: 5, weight: 185 }] }],
    });
    const other = log({
      id: 'log-mon',
      sessionTitle: 'Monday',
    });
    const decided = decideExportSession({
      sessionId: 'log-tue',
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
    assert.equal(csvParsed.sessions[0]?.sessionTitle, 'Tuesday');
    assert.equal(csvParsed.sessions[0]?.workoutName, 'Pull');
    assert.equal(csvParsed.sessions[0]?.exercises[0]?.exerciseId, 'squats');
    assert.equal(jsonParsed.sessions[0]?.sessionTitle, 'Tuesday');
  });

  it('does not import Account interchange, share, or fold / search', () => {
    assert.match(helperSrc, /decideExportDiary\(\[found\]\)/);
    assert.match(helperSrc, /findFinishedSession/);
    assert.doesNotMatch(helperSrc, /buildWorkoutCsvDownload|workoutsToMwCsv|workoutsToSetTableBCsv/);
    assert.doesNotMatch(helperSrc, /foldHistoryFrom|historyForWeek|startHistoryFrom/);
    assert.doesNotMatch(helperSrc, /decideSearchHistory|decideImportApply/);
    assert.doesNotMatch(helperSrc, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(helperSrc, /e1RM|estimated 1RM|toISOString\(\)/);
    assert.doesNotMatch(helperSrc, /navigator\.share|mailto:|discord\.com/);
    assert.equal(exportSessionFileName({ kind: 'empty' }, 'csv'), 'mission-winning-session.csv');
  });
});
