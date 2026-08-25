import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  EXERCISE_NOTE_MAX,
  applyHistoryNote,
  noteFromHistory,
  seedExerciseNote,
} from '@/lib/workout/exerciseNote';
import type { CompletedWorkoutLog } from '@/types';

const root = path.join(import.meta.dirname, '..', '..', '..');

function ago(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

function log(
  completedAt: string,
  exercises: { exerciseId: string; note?: string }[]
): CompletedWorkoutLog {
  return {
    id: `log-${completedAt}`,
    workoutName: 'Session',
    startedAt: completedAt,
    completedAt,
    durationSeconds: 3600,
    totalVolume: 1000,
    exercises: exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      sets: [{ reps: 5, weight: 100 }],
      ...(ex.note !== undefined ? { note: ex.note } : {}),
    })),
  };
}

describe('seedExerciseNote', () => {
  it('prefills unset from the last cue, verbatim', () => {
    assert.equal(seedExerciseNote(undefined, 'belt on 3'), 'belt on 3');
  });

  it('clear is sticky — empty string is not unset', () => {
    assert.equal(seedExerciseNote('', 'belt on 3'), '');
  });

  it('keeps what they already typed', () => {
    assert.equal(seedExerciseNote('pause 2', 'belt on 3'), 'pause 2');
  });

  it('blank last is silence, never a placeholder', () => {
    assert.equal(seedExerciseNote(undefined, undefined), undefined);
    assert.equal(seedExerciseNote(undefined, '   '), undefined);
  });

  it('caps a seeded cue at EXERCISE_NOTE_MAX', () => {
    const last = 'x'.repeat(EXERCISE_NOTE_MAX + 40);
    const seeded = seedExerciseNote(undefined, last);
    assert.equal(seeded?.length, EXERCISE_NOTE_MAX);
  });
});

describe('noteFromHistory / applyHistoryNote', () => {
  const history = [
    log(ago(86_400_000), [{ exerciseId: 'squat', note: 'belt on 3' }]),
    log(ago(172_800_000), [{ exerciseId: 'bench-press', note: 'tuck elbows' }]),
  ];

  it('reads the last note for that exercise only', () => {
    assert.equal(noteFromHistory('squat', history), 'belt on 3');
    assert.equal(noteFromHistory('deadlift', history), undefined);
  });

  it('appearance drops a leaked prior note and does not seed History', () => {
    const swapped = applyHistoryNote(
      { exerciseId: 'squat', note: 'tuck elbows' },
      history
    );
    assert.equal('note' in swapped, false);
    const fresh = applyHistoryNote({ exerciseId: 'deadlift' }, history);
    assert.equal('note' in fresh, false);
  });
});

describe('exercise-note surface guards', () => {
  const libNotes = readdirSync(path.join(root, 'src/lib/workout')).filter((f) =>
    /^exerciseNote/i.test(f)
  );
  const uiNotes = readdirSync(path.join(root, 'src/components/workout')).filter((f) =>
    /^ExerciseNote/i.test(f)
  );

  it('discovers the seed module and the field — a rename fails this, not a silent miss', () => {
    assert.ok(libNotes.includes('exerciseNote.ts'), 'exerciseNote.ts must exist');
    assert.ok(uiNotes.includes('ExerciseNoteField.tsx'), 'ExerciseNoteField.tsx must exist');
  });

  it('new note modules stay a private diary — no identity, standing, or LLM', () => {
    const files = [
      ...libNotes.map((f) => path.join(root, 'src/lib/workout', f)),
      ...uiNotes.map((f) => path.join(root, 'src/components/workout', f)),
    ];
    for (const file of files) {
      if (file.endsWith('.test.ts')) continue;
      const src = readFileSync(file, 'utf8');
      assert.doesNotMatch(src, /from ['"]@\/lib\/identity/, `${file} must not import identity`);
      assert.doesNotMatch(src, /from ['"]@\/lib\/rewards/, `${file} must not import rewards`);
      assert.doesNotMatch(src, /from ['"]@\/lib\/leaderboard/, `${file} must not import leaderboard`);
      assert.doesNotMatch(src, /from ['"]@\/lib\/llm/, `${file} must not import llm`);
      assert.doesNotMatch(src, /from ['"]@\/lib\/coach\//, `${file} must not import the planner`);
      assert.doesNotMatch(src, /from ['"]@?mw-core/, `${file} must not import mw-core`);
    }
  });

  it('ExerciseNoteField does not steal first paint — no autoFocus, not primary-action', () => {
    const src = readFileSync(
      path.join(root, 'src/components/workout/ExerciseNoteField.tsx'),
      'utf8'
    );
    assert.doesNotMatch(src, /autoFocus/);
    assert.doesNotMatch(src, /primary-action|accent-poster|bg-primary-fill/);
    assert.match(src, /data-testid="exercise-note"/);
    assert.match(src, /min-h-\[44px\]/);
  });

  it('ActiveExerciseCard mounts the field after the set table, not above load/reps', () => {
    const src = readFileSync(
      path.join(root, 'src/components/workout/ActiveExerciseCard.tsx'),
      'utf8'
    );
    const table = src.indexOf('<SetLogTable');
    const field = src.indexOf('<ExerciseNoteField');
    const footer = src.indexOf('<ActiveExerciseFooter');
    assert.ok(table !== -1 && field !== -1 && footer !== -1);
    assert.ok(field > table, 'ExerciseNoteField must follow SetLogTable');
    assert.ok(field < footer, 'ExerciseNoteField must sit before the footer');
    assert.doesNotMatch(src, /lastNotesFor/, 'prefill is store-time, not render-time');
  });

  it('LogConsole still has exactly one primary-action (density .694)', () => {
    const src = readFileSync(path.join(root, 'src/components/workout/LogConsole.tsx'), 'utf8');
    assert.equal((src.match(/primary-action/g) || []).length, 1);
  });
});
