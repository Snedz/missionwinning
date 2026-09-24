import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { getExerciseById } from '@/data/exercises';
import { readJson } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import {
  BILLING_KEYS,
  SEED_PROGRAM,
  buildLocalProgram,
  clearSavedPrograms,
  containsBillingKey,
  listPrograms,
  parseProgram,
  saveProgram,
  sessionToTrainDraft,
} from './index';

const dir = path.join(import.meta.dirname);

test('the seed is one program tree and every lift is in the catalog', () => {
  const program = parseProgram(SEED_PROGRAM);
  assert.ok(program);
  assert.equal(program.level, 'beginner');
  assert.equal(program.durationWeeks, program.weeks.length);
  assert.equal(program.sessionsPerWeek, 2);
  assert.deepEqual(program.equipment, ['barbell', 'bodyweight']);
  assert.equal(program.weeks.length, 2);
  for (const week of program.weeks) {
    assert.equal(week.sessions.length, program.sessionsPerWeek);
    for (const session of week.sessions) {
      assert.ok(session.exercises.length > 0);
      for (const exercise of session.exercises) {
        assert.ok(getExerciseById(exercise.exerciseId), exercise.exerciseId);
        assert.ok(exercise.suggestedSets.length > 0);
      }
    }
  }
});

test('a billing key refuses the whole program', () => {
  assert.equal(parseProgram({ ...SEED_PROGRAM, isPremium: false }), null);
  assert.equal(parseProgram({ ...SEED_PROGRAM, paymentUrl: '' }), null);
  assert.equal(
    parseProgram({
      ...SEED_PROGRAM,
      weeks: SEED_PROGRAM.weeks.map((week, i) =>
        i === 0 ? { ...week, subscription: { status: 'ACTIVE' } } : week
      ),
    }),
    null
  );
  assert.equal(containsBillingKey({ nested: { stripePriceId: 'price_x' } }), true);
  for (const key of BILLING_KEYS) {
    assert.equal(parseProgram({ ...SEED_PROGRAM, [key]: 1 }), null, key);
  }
});

test('week count must match durationWeeks', () => {
  assert.equal(parseProgram({ ...SEED_PROGRAM, durationWeeks: 1 }), null);
  assert.equal(parseProgram({ ...SEED_PROGRAM, sessionsPerWeek: 1 }), null);
});

test('a template session becomes a logger draft and not a history row', () => {
  const session = SEED_PROGRAM.weeks[0].sessions[0];
  const draft = sessionToTrainDraft(session);
  assert.deepEqual(
    draft.map((row) => row.exerciseId),
    session.exercises.map((row) => row.exerciseId)
  );
  assert.equal(draft[0].sets.length, session.exercises[0].suggestedSets.length);
  assert.equal(draft[0].sets[0].reps, 8);
  assert.equal(draft[0].sets[0].weight, 0);
  assert.equal(draft[0].prescribed, true);
  assert.equal('startedAt' in draft[0], false);
  assert.equal('endedAt' in draft[0], false);

  const timed = sessionToTrainDraft({
    ...session,
    exercises: [
      {
        order: 1,
        exerciseId: 'plank',
        suggestedSets: [{ setIndex: 2, seconds: 30 }, { setIndex: 1, seconds: 20 }],
      },
    ],
  });
  assert.equal(timed[0].sets[0].durationSeconds, 20);
  assert.equal(timed[0].sets[1].durationSeconds, 30);
  assert.equal(timed[0].sets[0].reps, 1);
});

test('a named program saves on this device and the seed stays put', () => {
  clearSavedPrograms();
  try {
    const built = buildLocalProgram(
      {
        title: 'Garage push',
        level: 'intermediate',
        durationWeeks: 1,
        sessionsPerWeek: 1,
        equipment: ['dumbbell'],
      },
      []
    );
    assert.ok(built);
    assert.equal(built.weeks.length, 1);
    assert.equal(built.weeks[0].sessions.length, 1);
    assert.equal(saveProgram(SEED_PROGRAM), false);
    saveProgram(built);
    saveProgram(SEED_PROGRAM);
    const raw = readJson<{ programs: { id: string }[] }>(STORAGE_KEYS.programShell, { programs: [] });
    assert.equal(raw.programs.some((p) => p.id === SEED_PROGRAM.id), false);
    const listed = listPrograms();
    assert.equal(listed[0].id, SEED_PROGRAM.id);
    assert.equal(listed.some((p) => p.id === built.id), true);
    const billed = { ...built, isPremium: true };
    assert.equal(parseProgram(billed), null);
    assert.equal(saveProgram(billed as never), false);
  } finally {
    clearSavedPrograms();
  }
});

test('the shell folder does not import billing or the workout store', () => {
  const files = readdirSync(dir).filter((name) => name.endsWith('.ts') && !name.endsWith('.test.ts'));
  assert.ok(files.length >= 5);
  const joined = files.map((name) => readFileSync(path.join(dir, name), 'utf8')).join('\n');
  assert.doesNotMatch(joined, /from ['"]@\/lib\/(stripe|premium|checkout|cryptoCheckout|payments)/);
  assert.doesNotMatch(joined, /workoutStore|workoutHistory|prisma|supabase/i);
  assert.equal(STORAGE_KEYS.programShell.startsWith('mw_'), true);
});
