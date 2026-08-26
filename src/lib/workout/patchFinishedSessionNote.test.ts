/**
 * Optional private session note on a finished History log.
 * Empty id / junk invent nothing. Non-string empty.
 * Apply "felt heavy". Blank clears. Same text noop.
 * Live-open / tomb noop. Over-cap truncates to 500.
 * Does not write sets / duration / name / lift notes.
 * Source is not mutated. No store. No LLM.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';
import { SESSION_NOTE_MAX } from './sessionNote.ts';
import {
  applyPatchFinishedSessionNote,
  decidePatchFinishedSessionNote,
} from './patchFinishedSessionNote.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function log(
  over: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id'>
): CompletedWorkoutLog {
  return {
    clientId: `cid-${over.id}`,
    revision: 1,
    workoutName: 'Push',
    sessionTitle: 'Monday push',
    startedAt: '2026-08-17T10:00:00.000Z',
    completedAt: '2026-08-17T11:00:00.000Z',
    durationSeconds: 3600,
    totalVolume: 675,
    exercises: [
      {
        exerciseId: 'bench-press',
        note: 'paused',
        sets: [{ reps: 5, weight: 135, rpe10: 8, rir: 2 }],
      },
    ],
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

describe('decidePatchFinishedSessionNote (.1046)', () => {
  it('empty id invents nothing', () => {
    const history = [log({ id: 'log-mon' })];
    assert.equal(
      decidePatchFinishedSessionNote({ sessionId: '', note: 'felt heavy', history }).kind,
      'empty'
    );
    assert.equal(
      applyPatchFinishedSessionNote({ sessionId: '  ', note: 'felt heavy', history }),
      null
    );
  });

  it('non-string junk invents nothing', () => {
    const history = [log({ id: 'log-mon' })];
    assert.equal(
      decidePatchFinishedSessionNote({ sessionId: 'log-mon', note: 0, history }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSessionNote({ sessionId: 'log-mon', note: true, history }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSessionNote({
        sessionId: 'log-mon',
        note: { text: 'felt heavy' },
        history,
      }).kind,
      'empty'
    );
    assert.equal(
      applyPatchFinishedSessionNote({ sessionId: 'log-mon', note: 1230, history }),
      null
    );
    assert.equal(history[0]?.sessionNote, undefined);
    assert.equal(history[0]?.exercises[0]?.sets[0]?.weight, 135);
  });

  it('missing / tombstone / live invents nothing', () => {
    const history = [
      log({ id: 'log-mon' }),
      log({ id: 'log-gone', deletedAt: '2026-08-25T12:00:00.000Z' }),
    ];
    assert.equal(
      decidePatchFinishedSessionNote({
        sessionId: 'missing',
        note: 'felt heavy',
        history,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSessionNote({
        sessionId: 'log-gone',
        note: 'felt heavy',
        history,
      }).kind,
      'noop'
    );
    const open = live();
    assert.equal(
      decidePatchFinishedSessionNote({
        sessionId: open.clientId,
        note: 'felt heavy',
        history: [log({ id: open.clientId ?? 'x', clientId: open.clientId })],
        live: open,
      }).kind,
      'noop'
    );
  });

  it('same normalized text is a noop — omitted current + blank is noop', () => {
    const history = [log({ id: 'log-mon', sessionNote: 'felt heavy' })];
    assert.equal(
      decidePatchFinishedSessionNote({
        sessionId: 'log-mon',
        note: 'felt heavy',
        history,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSessionNote({
        sessionId: 'log-mon',
        note: '  felt heavy  ',
        history,
      }).kind,
      'noop'
    );
    const omitted = [log({ id: 'log-omit' })];
    assert.equal(
      decidePatchFinishedSessionNote({
        sessionId: 'log-omit',
        note: '',
        history: omitted,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSessionNote({
        sessionId: 'log-omit',
        note: '   ',
        history: omitted,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSessionNote({
        sessionId: 'log-omit',
        note: null,
        history: omitted,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSessionNote({
        sessionId: 'log-omit',
        note: undefined,
        history: omitted,
      }).kind,
      'noop'
    );
  });
});

describe('applyPatchFinishedSessionNote (.1046)', () => {
  it('apply "felt heavy"; blank clears; field is absent after clear', () => {
    const original = log({ id: 'log-mon' });
    const history = [original];
    const applied = applyPatchFinishedSessionNote({
      sessionId: 'log-mon',
      note: 'felt heavy',
      history,
      now: '2026-08-25T16:00:00.000Z',
    });
    assert.ok(applied);
    assert.equal(applied?.next.id, 'log-mon');
    assert.equal(applied?.next.sessionNote, 'felt heavy');
    assert.equal(applied?.next.revision, 2);
    assert.equal(applied?.next.updatedAt, '2026-08-25T16:00:00.000Z');
    assert.equal(original.sessionNote, undefined);
    assert.equal(
      Object.prototype.hasOwnProperty.call(original, 'sessionNote'),
      false
    );

    const kept = [applied!.next];
    const cleared = applyPatchFinishedSessionNote({
      sessionId: 'log-mon',
      note: '',
      history: kept,
      now: '2026-08-25T16:01:00.000Z',
    });
    assert.ok(cleared);
    assert.equal(cleared?.next.sessionNote, undefined);
    assert.equal(
      Object.prototype.hasOwnProperty.call(cleared?.next ?? {}, 'sessionNote'),
      false,
      'clear must omit the field, not store undefined'
    );
    assert.equal(cleared?.next.revision, 3);

    const clearNull = applyPatchFinishedSessionNote({
      sessionId: 'log-mon',
      note: null,
      history: kept,
      now: '2026-08-25T16:02:00.000Z',
    });
    assert.ok(clearNull);
    assert.equal(
      Object.prototype.hasOwnProperty.call(clearNull?.next ?? {}, 'sessionNote'),
      false
    );
  });

  it('over-cap truncates to 500 — never empties, never pads', () => {
    const history = [log({ id: 'log-mon' })];
    const long = 'x'.repeat(SESSION_NOTE_MAX + 40);
    const applied = applyPatchFinishedSessionNote({
      sessionId: 'log-mon',
      note: long,
      history,
      now: '2026-08-25T16:00:00.000Z',
    });
    assert.ok(applied);
    assert.equal(applied?.next.sessionNote, 'x'.repeat(SESSION_NOTE_MAX));
    assert.equal(applied?.next.sessionNote?.length, SESSION_NOTE_MAX);
    assert.equal(history[0]?.sessionNote, undefined);
  });

  it('does not write sets / duration / name / lift notes', () => {
    const original = log({ id: 'log-mon', sessionNote: 'old' });
    const history = [original, log({ id: 'log-tue', workoutName: 'Legs' })];
    const applied = applyPatchFinishedSessionNote({
      sessionId: ' cid-log-mon ',
      note: 'felt heavy',
      history,
      now: '2026-08-25T16:00:00.000Z',
    });
    assert.ok(applied);
    assert.equal(applied?.next.sessionNote, 'felt heavy');
    assert.equal(applied?.next.durationSeconds, 3600);
    assert.equal(applied?.next.sessionTitle, 'Monday push');
    assert.equal(applied?.next.workoutName, 'Push');
    assert.equal(applied?.next.startedAt, original.startedAt);
    assert.equal(applied?.next.completedAt, original.completedAt);
    assert.equal(applied?.next.exercises, original.exercises);
    assert.equal(applied?.next.exercises[0]?.note, 'paused');
    assert.equal(applied?.next.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(applied?.next.exercises[0]?.sets[0]?.reps, 5);
    assert.equal(applied?.next.exercises[0]?.sets[0]?.rpe10, 8);
    assert.equal(history.find((row) => row.id === 'log-tue')?.sessionNote, undefined);
  });

  it('clones so the source history row is not mutated', () => {
    const original = log({ id: 'log-mon', sessionNote: 'old' });
    const history = [original];
    const applied = applyPatchFinishedSessionNote({
      sessionId: 'log-mon',
      note: 'felt heavy',
      history,
      now: '2026-08-25T16:00:00.000Z',
    });
    assert.ok(applied);
    applied!.next.sessionNote = 'wiped';
    applied!.next.durationSeconds = 1;
    applied!.next.sessionTitle = 'wiped';
    assert.equal(original.sessionNote, 'old');
    assert.equal(original.durationSeconds, 3600);
    assert.equal(original.sessionTitle, 'Monday push');
    assert.equal(original.exercises[0]?.note, 'paused');
    assert.equal(original.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(history[0]?.sessionNote, 'old');
  });
});

describe('patchFinishedSessionNote wiring', () => {
  it('stays one home — no store / LLM / volume invent / set-editor Save / live Start', () => {
    const src = read('src/lib/workout/patchFinishedSessionNote.ts').replace(
      /\/\*[\s\S]*?\*\//g,
      ''
    );
    assert.match(src, /decidePatchFinishedSessionNote/);
    assert.match(src, /attachSessionNote/);
    assert.match(src, /normalizeSessionNote/);
    assert.match(src, /from ['"]@\/lib\/workout\/sessionNote['"]/);
    assert.doesNotMatch(src, /from ['"]@\/store\/workoutStore['"]/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/llm/);
    assert.doesNotMatch(src, /decideEditSave|patchDraftSet/);
    assert.doesNotMatch(src, /lastNotesFor|cueMemory/);
    assert.doesNotMatch(src, /totalVolume|vsLast/);
    assert.doesNotMatch(src, /startWorkout|protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(src, /readJson|writeJson|STORAGE_KEYS/);
    assert.doesNotMatch(src, /localStorage/);
    assert.doesNotMatch(src, /isPremium|UnlockButton|permalink|discord\.com/i);
    assert.doesNotMatch(src, /fieldTest|pregnancy|pt-safety/i);
  });
});
