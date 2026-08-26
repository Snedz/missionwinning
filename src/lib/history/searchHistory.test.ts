/**
 * Find a past session. Empty query invents nothing.
 * Title / template / date / lift / note. Tombs stay out.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { CompletedWorkoutLog } from '@/types';
import { localDateKeyFromIso } from '@/lib/time/localDate.ts';
import {
  decideSearchHistory,
  historySearchHaystack,
} from './searchHistory.ts';

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

describe('decideSearchHistory (.1008)', () => {
  it('empty / whitespace / non-string query returns the same live rows', () => {
    const mon = log({ id: 'log-mon', sessionTitle: 'Bogus Monday' });
    const tue = log({ id: 'log-tue', workoutName: 'Legs' });
    const rows = [mon, tue];
    for (const query of ['', '   ', null, 12, undefined]) {
      const found = decideSearchHistory({ query, rows });
      assert.equal(found.length, 2, String(query));
      assert.equal(found[0], mon);
      assert.equal(found[1], tue);
    }
  });

  it('null / non-array history invents nothing', () => {
    assert.deepEqual(decideSearchHistory({ query: 'Push', rows: null }), []);
    assert.deepEqual(decideSearchHistory({ query: '', rows: undefined }), []);
    assert.deepEqual(
      decideSearchHistory({
        query: 'Push',
        rows: { length: 1 } as unknown as CompletedWorkoutLog[],
      }),
      []
    );
  });

  it('tombstones stay out even when passed in', () => {
    const live = log({ id: 'log-mon', sessionTitle: 'Bogus Monday' });
    const tomb = log({
      id: 'log-gone',
      sessionTitle: 'Bogus Monday',
      deletedAt: '2026-08-25T12:00:00.000Z',
    });
    const empty = decideSearchHistory({
      query: '',
      rows: [live, tomb],
    });
    assert.deepEqual(
      empty.map((row) => row.id),
      ['log-mon']
    );
    assert.equal(empty[0], live);
    const named = decideSearchHistory({
      query: 'Bogus',
      rows: [live, tomb],
    });
    assert.deepEqual(
      named.map((row) => row.id),
      ['log-mon']
    );
  });

  it('matches title, template, date, lift, and note', () => {
    const titled = log({
      id: 'log-mon',
      sessionTitle: 'Bogus Monday',
      workoutName: 'Push',
    });
    const legs = log({
      id: 'log-tue',
      workoutName: 'Legs',
      completedAt: '2026-08-18T11:00:00.000Z',
      startedAt: '2026-08-18T10:00:00.000Z',
      exercises: [{ exerciseId: 'squats', sets: [{ reps: 5, weight: 185 }] }],
      sessionNote: 'heavy singles',
    });
    const rows = [titled, legs];

    assert.deepEqual(
      decideSearchHistory({ query: 'bogus', rows }).map((row) => row.id),
      ['log-mon']
    );
    assert.deepEqual(
      decideSearchHistory({ query: 'Legs', rows }).map((row) => row.id),
      ['log-tue']
    );
    const monKey = localDateKeyFromIso(titled.completedAt);
    assert.ok(monKey);
    assert.deepEqual(
      decideSearchHistory({ query: monKey, rows }).map((row) => row.id),
      ['log-mon']
    );
    assert.deepEqual(
      decideSearchHistory({
        query: '17 August',
        rows,
        dateText: (row) =>
          row.id === 'log-mon' ? '17 August 2026' : '18 August 2026',
      }).map((row) => row.id),
      ['log-mon']
    );
    assert.deepEqual(
      decideSearchHistory({ query: 'bench', rows }).map((row) => row.id),
      ['log-mon']
    );
    assert.deepEqual(
      decideSearchHistory({ query: 'bench press', rows }).map((row) => row.id),
      ['log-mon']
    );
    assert.deepEqual(
      decideSearchHistory({
        query: 'Front squat',
        rows,
        liftName: (id) => (id === 'squats' ? 'Front squat' : undefined),
      }).map((row) => row.id),
      ['log-tue']
    );
    assert.deepEqual(
      decideSearchHistory({ query: 'heavy singles', rows }).map((row) => row.id),
      ['log-tue']
    );
  });

  it('miss stays empty — does not invent a session', () => {
    const rows = [log({ id: 'log-mon', sessionTitle: 'Bogus Monday' })];
    assert.deepEqual(decideSearchHistory({ query: 'no-such-session', rows }), []);
  });

  it('haystack does not let a query span two fields', () => {
    const row = log({
      id: 'log-mon',
      sessionTitle: 'Mon',
      workoutName: 'day',
    });
    assert.equal(historySearchHaystack(row).includes('monday'), false);
    assert.deepEqual(
      decideSearchHistory({ query: 'monday', rows: [row] }),
      []
    );
  });
});
