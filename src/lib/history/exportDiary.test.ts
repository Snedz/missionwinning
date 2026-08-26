/**
 * Export this diary. Empty / missing invents nothing.
 * Tombs stay out. Start-from does not shrink the file.
 * Do not invent 1RM or duration.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog } from '@/types';
import { localDateKeyFromIso } from '@/lib/time/localDate.ts';
import { decideExportDiary, EXPORT_DIARY_CSV_HEADER } from './exportDiary.ts';

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
  path.join(import.meta.dirname, 'exportDiary.ts'),
  'utf8'
);

describe('decideExportDiary (.1011)', () => {
  it('empty / missing / non-array invents nothing', () => {
    assert.deepEqual(decideExportDiary(null), { kind: 'empty' });
    assert.deepEqual(decideExportDiary(undefined), { kind: 'empty' });
    assert.deepEqual(decideExportDiary([]), { kind: 'empty' });
    assert.deepEqual(
      decideExportDiary({ length: 1 } as unknown as CompletedWorkoutLog[]),
      { kind: 'empty' }
    );
  });

  it('live session with no sets invents nothing', () => {
    const hollow = log({
      id: 'log-hollow',
      exercises: [{ exerciseId: 'bench-press', sets: [] }],
    });
    assert.deepEqual(decideExportDiary([hollow]), { kind: 'empty' });
  });

  it('tombstones stay out even when passed in', () => {
    const live = log({
      id: 'log-mon',
      sessionTitle: 'Bogus Monday',
    });
    const tomb = log({
      id: 'log-gone',
      sessionTitle: 'Deleted Monday',
      deletedAt: '2026-08-25T12:00:00.000Z',
      exercises: [{ exerciseId: 'squats', sets: [{ reps: 5, weight: 185 }] }],
    });
    const decided = decideExportDiary([live, tomb]);
    assert.equal(decided.kind, 'ready');
    if (decided.kind !== 'ready') return;
    assert.equal(decided.count, 1);
    assert.equal(decided.rows[0]?.sessionTitle, 'Bogus Monday');
    assert.equal(decided.csv.includes('Deleted Monday'), false);
    assert.equal(decided.json.includes('Deleted Monday'), false);
  });

  it('restored row (no deletedAt) is in', () => {
    const restored = log({
      id: 'log-back',
      sessionTitle: 'Back',
      deletedAt: null,
    });
    const decided = decideExportDiary([restored]);
    assert.equal(decided.kind, 'ready');
    if (decided.kind !== 'ready') return;
    assert.equal(decided.rows[0]?.sessionTitle, 'Back');
  });

  it('older live rows stay — start-from is not an input', () => {
    const old = log({
      id: 'log-old',
      sessionTitle: 'Years ago',
      startedAt: '2020-01-02T10:00:00.000Z',
      completedAt: '2020-01-02T11:00:00.000Z',
    });
    const fresh = log({
      id: 'log-new',
      sessionTitle: 'This week',
      startedAt: '2026-08-24T10:00:00.000Z',
      completedAt: '2026-08-24T11:00:00.000Z',
    });
    const decided = decideExportDiary([fresh, old]);
    assert.equal(decided.kind, 'ready');
    if (decided.kind !== 'ready') return;
    assert.deepEqual(
      decided.rows.map((row) => row.sessionTitle),
      ['This week', 'Years ago']
    );
  });

  it('writes honest logged fields — no invented 1RM or duration', () => {
    const monKey = localDateKeyFromIso('2026-08-17T11:00:00.000Z') ?? '';
    const rowLog = log({
      id: 'log-mon',
      sessionTitle: 'Bogus Monday',
      workoutName: 'Push',
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
    const decided = decideExportDiary([rowLog]);
    assert.equal(decided.kind, 'ready');
    if (decided.kind !== 'ready') return;
    assert.equal(decided.count, 1);
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
    assert.ok(decided.csv.startsWith(`${EXPORT_DIARY_CSV_HEADER}\n`));
    assert.equal(decided.csv.includes('e1RM'), false);
    assert.equal(decided.csv.includes('1RM'), false);
    const parsed = JSON.parse(decided.json) as unknown;
    assert.deepEqual(parsed, decided.rows);
  });

  it('duration 0 / missing stays blank — does not invent from start/end', () => {
    const timedOff = log({
      id: 'log-off',
      durationSeconds: 0,
      startedAt: '2026-08-17T10:00:00.000Z',
      completedAt: '2026-08-17T11:30:00.000Z',
    });
    const decided = decideExportDiary([timedOff]);
    assert.equal(decided.kind, 'ready');
    if (decided.kind !== 'ready') return;
    assert.equal(decided.rows[0]?.duration, '');
  });

  it('set duration stays when they logged it; session 0 stays blank', () => {
    const hold = log({
      id: 'log-hold',
      durationSeconds: 0,
      exercises: [
        {
          exerciseId: 'plank',
          sets: [{ reps: 0, weight: 0, durationSeconds: 45 }],
        },
      ],
    });
    const decided = decideExportDiary([hold]);
    assert.equal(decided.kind, 'ready');
    if (decided.kind !== 'ready') return;
    assert.equal(decided.rows[0]?.duration, '45');
  });

  it('categorical RPE stays as logged — does not invent rpe10', () => {
    const easy = log({
      id: 'log-easy',
      durationSeconds: 0,
      exercises: [
        {
          exerciseId: 'bench-press',
          sets: [{ reps: 8, weight: 60, rpe: 'easy' }],
        },
      ],
    });
    const decided = decideExportDiary([easy]);
    assert.equal(decided.kind, 'ready');
    if (decided.kind !== 'ready') return;
    assert.equal(decided.rows[0]?.rpe, 'easy');
  });

  it('empty title / note / kind stay empty cells', () => {
    const bare = log({
      id: 'log-bare',
      durationSeconds: 0,
      workoutName: '',
    });
    const decided = decideExportDiary([bare]);
    assert.equal(decided.kind, 'ready');
    if (decided.kind !== 'ready') return;
    assert.equal(decided.rows[0]?.sessionTitle, '');
    assert.equal(decided.rows[0]?.workoutName, '');
    assert.equal(decided.rows[0]?.setType, '');
    assert.equal(decided.rows[0]?.rpe, '');
    assert.equal(decided.rows[0]?.tags, '');
    assert.equal(decided.rows[0]?.notes, '');
  });

  it('does not import Account interchange or fold / search', () => {
    assert.doesNotMatch(helperSrc, /buildWorkoutCsvDownload|workoutsToMwCsv|workoutsToSetTableBCsv/);
    assert.doesNotMatch(helperSrc, /foldHistoryFrom|historyForWeek|startHistoryFrom/);
    assert.doesNotMatch(helperSrc, /decideSearchHistory/);
    assert.doesNotMatch(helperSrc, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(helperSrc, /e1RM|estimated 1RM|toISOString\(\)/);
  });
});
