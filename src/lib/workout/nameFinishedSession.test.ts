/**
 * Name this finished session. Empty title is the date.
 * Empty / missing / tombstone / live invents nothing.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';
import { localDateKeyFromIso } from '@/lib/time/localDate.ts';
import {
  applyNameFinishedSession,
  decideNameFinishedSession,
  historySessionLabel,
  normalizeSessionTitle,
  SESSION_TITLE_MAX,
} from './nameFinishedSession.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

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

function live(): ActiveWorkout {
  return {
    workoutName: 'Live',
    startedAt: '2026-08-25T10:00:00.000Z',
    clientId: 'cid-live',
    exercises: [{ exerciseId: 'row', sets: [] }],
  };
}

describe('decideNameFinishedSession (.1007)', () => {
  it('empty id invents nothing', () => {
    const history = [log({ id: 'log-mon' })];
    assert.equal(
      decideNameFinishedSession({ sessionId: '', title: 'A', history }).kind,
      'empty'
    );
    assert.equal(applyNameFinishedSession({ sessionId: '  ', title: 'A', history }), null);
  });

  it('missing / tombstone / live invents nothing', () => {
    const history = [
      log({ id: 'log-mon' }),
      log({ id: 'log-gone', deletedAt: '2026-08-25T12:00:00.000Z' }),
    ];
    assert.equal(
      decideNameFinishedSession({ sessionId: 'missing', title: 'A', history }).kind,
      'noop'
    );
    assert.equal(
      decideNameFinishedSession({ sessionId: 'log-gone', title: 'A', history }).kind,
      'noop'
    );
    const open = live();
    assert.equal(
      decideNameFinishedSession({
        sessionId: open.clientId,
        title: 'A',
        history: [log({ id: open.clientId ?? 'x', clientId: open.clientId })],
        live: open,
      }).kind,
      'noop'
    );
  });

  it('same title is a noop', () => {
    const history = [log({ id: 'log-mon', sessionTitle: 'Bogus Monday' })];
    assert.equal(
      decideNameFinishedSession({
        sessionId: 'log-mon',
        title: '  Bogus Monday  ',
        history,
      }).kind,
      'noop'
    );
  });

  it('empty title is allowed — field omitted, date is the label', () => {
    const history = [log({ id: 'log-mon', sessionTitle: 'Bogus Monday' })];
    const applied = applyNameFinishedSession({
      sessionId: 'log-mon',
      title: '   ',
      history,
      now: '2026-08-25T16:00:00.000Z',
    });
    assert.ok(applied);
    assert.equal(applied?.next.sessionTitle, undefined);
    assert.equal(applied?.next.workoutName, 'Push');
    assert.equal(
      historySessionLabel(applied!.next),
      localDateKeyFromIso('2026-08-17T11:00:00.000Z')
    );
  });
});

describe('applyNameFinishedSession (.1007)', () => {
  it('names one finished log without renaming the template', () => {
    const history = [log({ id: 'log-mon' }), log({ id: 'log-tue', workoutName: 'Legs' })];
    const applied = applyNameFinishedSession({
      sessionId: ' cid-log-mon ',
      title: 'Bogus Monday',
      history,
      now: '2026-08-25T16:00:00.000Z',
    });
    assert.ok(applied);
    assert.equal(applied?.next.sessionTitle, 'Bogus Monday');
    assert.equal(applied?.next.workoutName, 'Push');
    assert.equal(applied?.next.revision, 2);
    assert.equal(history.find((row) => row.id === 'log-tue')?.workoutName, 'Legs');
  });

  it('caps a paste rather than inventing from volume', () => {
    assert.equal(normalizeSessionTitle('x'.repeat(SESSION_TITLE_MAX + 8))?.length, SESSION_TITLE_MAX);
  });
});

describe('cloud omits the private title', () => {
  it('toSyncPayload lists no sessionTitle field', () => {
    const src = read('src/lib/sync/workoutSync.ts');
    const payload = src.slice(src.indexOf('export function toSyncPayload'));
    assert.doesNotMatch(payload.slice(0, 800), /sessionTitle/);
  });
});

describe('nameFinishedSession wiring', () => {
  it('stays one home — no store / feed / paywall / live Start', () => {
    const src = read('src/lib/workout/nameFinishedSession.ts');
    assert.match(src, /decideNameFinishedSession/);
    assert.doesNotMatch(src, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(src, /workoutName\s*=/);
    assert.doesNotMatch(src, /isPremium|UnlockButton|permalink|discord\.com/i);
    assert.doesNotMatch(src, /fieldTest|pregnancy|pt-safety/i);
  });
});
