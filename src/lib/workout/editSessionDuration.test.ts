/**
 * Edit this session's logged duration. 0 clears the clock.
 * Empty / junk / negative / over-cap / tomb / live invents nothing.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';
import {
  applyEditSessionDuration,
  currentSessionDuration,
  decideEditSessionDuration,
  parseEditSessionDuration,
  SESSION_DURATION_MAX,
} from './editSessionDuration.ts';

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

describe('parseEditSessionDuration (.1035)', () => {
  it('empty / junk / negative / over-cap invents nothing', () => {
    assert.equal(parseEditSessionDuration(''), null);
    assert.equal(parseEditSessionDuration('  '), null);
    assert.equal(parseEditSessionDuration(null), null);
    assert.equal(parseEditSessionDuration(undefined), null);
    assert.equal(parseEditSessionDuration('abc'), null);
    assert.equal(parseEditSessionDuration('1:30:00'), null);
    assert.equal(parseEditSessionDuration(-1), null);
    assert.equal(parseEditSessionDuration('-1'), null);
    assert.equal(parseEditSessionDuration(SESSION_DURATION_MAX + 1), null);
    assert.equal(parseEditSessionDuration(String(SESSION_DURATION_MAX + 1)), null);
    assert.equal(parseEditSessionDuration(Number.NaN), null);
    assert.equal(parseEditSessionDuration(Number.POSITIVE_INFINITY), null);
  });

  it('seconds or mm:ss — 0 clears, 90 minutes applies', () => {
    assert.equal(parseEditSessionDuration(0), 0);
    assert.equal(parseEditSessionDuration('0'), 0);
    assert.equal(parseEditSessionDuration('0:00'), 0);
    assert.equal(parseEditSessionDuration(90), 90);
    assert.equal(parseEditSessionDuration('1:30'), 90);
    assert.equal(parseEditSessionDuration(5400), 5400);
    assert.equal(parseEditSessionDuration('90:00'), 5400);
    assert.equal(parseEditSessionDuration(SESSION_DURATION_MAX), SESSION_DURATION_MAX);
  });
});

describe('decideEditSessionDuration (.1035)', () => {
  it('empty id invents nothing', () => {
    const history = [log({ id: 'log-mon' })];
    assert.equal(
      decideEditSessionDuration({ sessionId: '', durationSeconds: 90, history }).kind,
      'empty'
    );
    assert.equal(
      applyEditSessionDuration({ sessionId: '  ', durationSeconds: 90, history }),
      null
    );
  });

  it('junk / negative / over-cap invents nothing', () => {
    const history = [log({ id: 'log-mon' })];
    assert.equal(
      decideEditSessionDuration({ sessionId: 'log-mon', durationSeconds: 'nope', history })
        .kind,
      'empty'
    );
    assert.equal(
      decideEditSessionDuration({ sessionId: 'log-mon', durationSeconds: -8, history }).kind,
      'empty'
    );
    assert.equal(
      decideEditSessionDuration({
        sessionId: 'log-mon',
        durationSeconds: SESSION_DURATION_MAX + 1,
        history,
      }).kind,
      'empty'
    );
    assert.equal(
      applyEditSessionDuration({ sessionId: 'log-mon', durationSeconds: 'abc', history }),
      null
    );
  });

  it('missing / tombstone / live invents nothing', () => {
    const history = [
      log({ id: 'log-mon' }),
      log({ id: 'log-gone', deletedAt: '2026-08-25T12:00:00.000Z' }),
    ];
    assert.equal(
      decideEditSessionDuration({
        sessionId: 'missing',
        durationSeconds: 90,
        history,
      }).kind,
      'noop'
    );
    assert.equal(
      decideEditSessionDuration({
        sessionId: 'log-gone',
        durationSeconds: 90,
        history,
      }).kind,
      'noop'
    );
    const open = live();
    assert.equal(
      decideEditSessionDuration({
        sessionId: open.clientId,
        durationSeconds: 90,
        history: [log({ id: open.clientId ?? 'x', clientId: open.clientId })],
        live: open,
      }).kind,
      'noop'
    );
  });

  it('same value is a noop — missing current is 0', () => {
    const history = [log({ id: 'log-mon' })];
    assert.equal(
      decideEditSessionDuration({
        sessionId: 'log-mon',
        durationSeconds: 3600,
        history,
      }).kind,
      'noop'
    );
    assert.equal(
      decideEditSessionDuration({
        sessionId: 'log-mon',
        durationSeconds: '60:00',
        history,
      }).kind,
      'noop'
    );
    const missingClock = [log({ id: 'log-zero', durationSeconds: 0 })];
    assert.equal(currentSessionDuration(missingClock[0]), 0);
    assert.equal(
      decideEditSessionDuration({
        sessionId: 'log-zero',
        durationSeconds: 0,
        history: missingClock,
      }).kind,
      'noop'
    );
    const omitted = log({ id: 'log-omit' });
    delete (omitted as { durationSeconds?: number }).durationSeconds;
    assert.equal(currentSessionDuration(omitted), 0);
    assert.equal(
      decideEditSessionDuration({
        sessionId: 'log-omit',
        durationSeconds: 0,
        history: [omitted],
      }).kind,
      'noop'
    );
  });
});

describe('applyEditSessionDuration (.1035)', () => {
  it('0 apply clears the clock without rewriting the date or sets', () => {
    const original = log({ id: 'log-mon' });
    const history = [original];
    const applied = applyEditSessionDuration({
      sessionId: 'log-mon',
      durationSeconds: 0,
      history,
      now: '2026-08-25T16:00:00.000Z',
    });
    assert.ok(applied);
    assert.equal(applied?.next.id, 'log-mon');
    assert.equal(applied?.next.durationSeconds, 0);
    assert.equal(applied?.next.startedAt, original.startedAt);
    assert.equal(applied?.next.completedAt, original.completedAt);
    assert.equal(applied?.next.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(applied?.next.exercises, original.exercises);
    assert.equal(applied?.next.revision, 2);
    assert.equal(applied?.next.updatedAt, '2026-08-25T16:00:00.000Z');
  });

  it('90 minutes apply — startedAt unchanged', () => {
    const original = log({ id: 'log-mon' });
    const history = [original, log({ id: 'log-tue', workoutName: 'Legs' })];
    const applied = applyEditSessionDuration({
      sessionId: ' cid-log-mon ',
      durationSeconds: 5400,
      history,
      now: '2026-08-25T16:00:00.000Z',
    });
    assert.ok(applied);
    assert.equal(applied?.next.durationSeconds, 5400);
    assert.equal(applied?.next.startedAt, original.startedAt);
    assert.equal(applied?.next.completedAt, original.completedAt);
    assert.equal(applied?.next.workoutName, 'Push');
    assert.equal(history.find((row) => row.id === 'log-tue')?.durationSeconds, 3600);
    const mmss = applyEditSessionDuration({
      sessionId: 'log-mon',
      durationSeconds: '90:00',
      history,
      now: '2026-08-25T16:00:00.000Z',
    });
    assert.equal(mmss?.next.durationSeconds, 5400);
    assert.equal(mmss?.next.startedAt, original.startedAt);
  });
});

describe('editSessionDuration wiring', () => {
  it('stays one home — no store / feed / paywall / live Start / invented elapsed', () => {
    const src = read('src/lib/workout/editSessionDuration.ts');
    assert.match(src, /decideEditSessionDuration/);
    assert.match(src, /parseDurationSeconds/);
    assert.match(src, /from ['"]@\/lib\/workout\/setRowType['"]/);
    assert.doesNotMatch(src, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(src, /completedAt\s*-|startedAt\s*-/);
    assert.doesNotMatch(src, /toggleSessionClock|sessionElapsedSeconds/);
    assert.doesNotMatch(src, /isPremium|UnlockButton|permalink|discord\.com/i);
    assert.doesNotMatch(src, /fieldTest|pregnancy|pt-safety/i);
    assert.doesNotMatch(src, /localStorage/);
  });
});
