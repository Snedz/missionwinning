/**
 * Private session notes (`.982`) — empty invents nothing; stored with the session.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { CompletedWorkoutLog } from '@/types';
import {
  SESSION_NOTE_MAX,
  attachSessionNote,
  normalizeSessionNote,
  preserveSessionNote,
} from './sessionNote.ts';
import { formatCloseReceiptText, buildCloseReceipt } from './victoryReceipt.ts';
import { mergeWorkoutHistories } from './workoutMerge.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const T0 = '2026-08-24T16:00:00.000Z';
const T1 = '2026-08-24T18:00:00.000Z';

function log(
  partial: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id'>
): CompletedWorkoutLog {
  return {
    workoutName: 'Push',
    startedAt: partial.startedAt ?? T0,
    completedAt: partial.completedAt ?? T0,
    durationSeconds: 1800,
    totalVolume: 1000,
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [{ reps: 5, weight: 100 }],
      },
    ],
    ...partial,
  };
}

describe('normalizeSessionNote', () => {
  it('empty / whitespace / non-string invent nothing', () => {
    assert.equal(normalizeSessionNote(undefined), undefined);
    assert.equal(normalizeSessionNote(null), undefined);
    assert.equal(normalizeSessionNote(''), undefined);
    assert.equal(normalizeSessionNote('   \n\t'), undefined);
    assert.equal(normalizeSessionNote(0), undefined);
    assert.equal(normalizeSessionNote(1230), undefined);
    assert.equal(normalizeSessionNote(true), undefined);
    assert.equal(normalizeSessionNote({ text: 'knee' }), undefined);
  });

  it('trims kept text and caps without inventing', () => {
    assert.equal(normalizeSessionNote('  knee twinge set 3  '), 'knee twinge set 3');
    const long = 'x'.repeat(SESSION_NOTE_MAX + 40);
    const kept = normalizeSessionNote(long);
    assert.equal(kept, 'x'.repeat(SESSION_NOTE_MAX));
    assert.equal(kept?.includes('volume'), false);
  });
});

describe('attachSessionNote', () => {
  it('attaches trimmed text and omits empty — never writes empty string', () => {
    const base = log({ id: 'a' });
    const kept = attachSessionNote(base, '  felt strong  ');
    assert.equal(kept.sessionNote, 'felt strong');
    const empty = attachSessionNote(base, '   ');
    assert.equal('sessionNote' in empty, false);
    const cleared = attachSessionNote({ ...base, sessionNote: 'old' }, '');
    assert.equal('sessionNote' in cleared, false);
    assert.notEqual(cleared.sessionNote, '');
  });

  it('does not invent a note from volume / duration / vs-last', () => {
    const heavy = log({ id: 'b', totalVolume: 1230, durationSeconds: 1800 });
    const out = attachSessionNote(heavy, '');
    assert.equal('sessionNote' in out, false);
    assert.equal(out.sessionNote, undefined);
    assert.equal(out.totalVolume, 1230);
    assert.equal(out.durationSeconds, 1800);
  });
});

describe('preserveSessionNote', () => {
  it('keeps a local diary when the cloud winner has none', () => {
    const local = log({ id: 'c', clientId: 'cid-1', sessionNote: 'knee twinge' });
    const cloud = log({ id: 'cloud-c', clientId: 'cid-1', revision: 2 });
    const merged = preserveSessionNote(cloud, local);
    assert.equal(merged.sessionNote, 'knee twinge');
    assert.equal(merged.revision, 2);
  });

  it('does not invent when neither side has a note', () => {
    const a = log({ id: 'd', clientId: 'cid-2' });
    const b = log({ id: 'cloud-d', clientId: 'cid-2', revision: 2 });
    assert.equal(preserveSessionNote(b, a).sessionNote, undefined);
  });
});

describe('close receipt text keep', () => {
  it('includes Notes only when present; empty keep has no Notes line', () => {
    const finished = log({ id: 'e', sessionNote: 'belt on 3' });
    const receipt = buildCloseReceipt(finished, []);
    assert.ok(receipt);
    const withNote = formatCloseReceiptText({
      workoutName: 'Push',
      durationSeconds: 1800,
      setCount: 1,
      volumeLabel: '1000 kg',
      receipt,
      sessionNote: finished.sessionNote,
    });
    assert.ok(withNote);
    assert.match(withNote, /^Push\n/);
    assert.match(withNote, /Notes belt on 3/);
    assert.doesNotMatch(withNote, /https?:\/\//);
    assert.doesNotMatch(withNote, /\/workout\//);
    const silent = formatCloseReceiptText({
      workoutName: 'Push',
      durationSeconds: 1800,
      setCount: 1,
      volumeLabel: '1000 kg',
      receipt,
    });
    assert.ok(silent);
    assert.doesNotMatch(silent, /Notes /);
    assert.doesNotMatch(silent, /belt on 3/);
  });

  it('does not mint a note from volume when sessionNote is empty', () => {
    const finished = log({ id: 'f', totalVolume: 1230 });
    const receipt = buildCloseReceipt(finished, []);
    assert.ok(receipt);
    const text = formatCloseReceiptText({
      workoutName: 'Push',
      durationSeconds: 0,
      setCount: 1,
      volumeLabel: '1230 kg',
      receipt,
      sessionNote: '',
    });
    assert.ok(text);
    assert.doesNotMatch(text, /Notes /);
    assert.doesNotMatch(text, /https?:\/\//);
  });
});

describe('cloud + desk→gym + share stay off the diary', () => {
  it('toSyncPayload lists no sessionNote field', () => {
    const src = read('src/lib/sync/workoutSync.ts');
    const payload = src.slice(src.indexOf('export function toSyncPayload'));
    const body = payload.slice(0, payload.indexOf('export function enqueueWorkoutUpsert'));
    assert.doesNotMatch(body, /sessionNote/);
  });

  it('desk→gym snapshot still strips sessionNote', () => {
    const src = read('src/lib/workout/openSessionContinuity.ts');
    assert.match(src, /sessionNote:\s*_journal/);
  });

  it('share card does not read sessionNote', () => {
    const src = read('src/lib/share/shareCard.ts');
    assert.doesNotMatch(src, /sessionNote/);
  });

  it('merge keeps a local note when cloud wins without one', () => {
    const local = log({
      id: 'g',
      clientId: 'cid-3',
      revision: 1,
      sessionNote: 'knee twinge',
      completedAt: T0,
    });
    const cloud = log({
      id: 'cloud-g',
      clientId: 'cid-3',
      revision: 2,
      completedAt: T1,
    });
    const merged = mergeWorkoutHistories([local], [cloud]);
    const row = merged.find((x) => x.clientId === 'cid-3');
    assert.ok(row);
    assert.equal(row.sessionNote, 'knee twinge');
  });
});

describe('helper stays free and off social', () => {
  it('does not import premium / trial / rewards / social / Health', () => {
    const src = read('src/lib/workout/sessionNote.ts');
    assert.doesNotMatch(src, /from ['"]@\/lib\/(premium|trial|bundle|rewards|social)/);
    assert.doesNotMatch(src, /HealthKit|discord\.com|WeChat|marketplace|likes/i);
  });
});
