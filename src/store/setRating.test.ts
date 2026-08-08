import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * The effort signal, from the thumb that logs it to the plan that reads it.
 *
 * `logSetAndAdvance` — the only path any UI logs through — used to pass `'med'`
 * to `logSet`. One literal, and the entire RPE feature was fiction in both
 * directions:
 *
 *   - **In.** `SetLogRow` and `SetLogTable` render the Easy/Med/Hard buttons
 *     only when `!set.rpe`. A stamped set can never offer them, so the athlete
 *     had no way to rate anything — while `ActiveSessionChrome` displayed
 *     "Rate Easy / Med / Hard after each set so Coach can learn."
 *   - **Out.** `coach/progression.ts`'s `allEasy` / `anyHardOnTwoPlus` /
 *     `allHard` branches and `coach/load.ts`'s `sessionRpe` were structurally
 *     unreachable. The Coach's load-up and deload decisions could not fire, and
 *     session RPE was the constant 7 for every athlete forever.
 *
 * **2152 tests were green over that**, `progression.test.ts` among them — it
 * hands RPE values straight to `nextTargets`, so it proved the *decision* while
 * nothing proved the *input*. That is the gap this file exists to close, so the
 * assertions below deliberately drive the real store and feed its real output
 * into the real planner rather than hand-building a history fixture.
 */

const storageMap = new Map<string, string>();
(globalThis as { localStorage?: Storage }).localStorage = {
  getItem: (k: string) => storageMap.get(k) ?? null,
  setItem: (k: string, v: string) => void storageMap.set(k, v),
  removeItem: (k: string) => void storageMap.delete(k),
  clear: () => storageMap.clear(),
  key: (i: number) => [...storageMap.keys()][i] ?? null,
  get length() {
    return storageMap.size;
  },
} as unknown as Storage;

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

/** Every member of the `Rpe` union — the closed list of things that could be stamped. */
const RPE_VALUES = ['easy', 'med', 'hard'] as const;

test('set rating', async (t) => {
  // Dynamic, so the localStorage stub is in place before zustand's persist
  // middleware reads storage during module init.
  const { useWorkoutStore } = await import('@/store/workoutStore');
  const { nextTargets } = await import('@/lib/coach/progression');

  const template = (exerciseId = 'bench-press', setCount = 2) => [
    { exerciseId, sets: Array.from({ length: setCount }, () => ({ reps: 8, weight: 60 })) },
  ];

  function freshSession() {
    useWorkoutStore.setState({ activeWorkout: null, workoutHistory: [] });
    useWorkoutStore.getState().startWorkout('Push', template());
  }

  const firstSet = () => useWorkoutStore.getState().activeWorkout!.exercises[0].sets[0];

  await t.test('a logged set arrives unrated, so the athlete can rate it', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);

    const set = firstSet();
    assert.equal(set.completed, true, 'precondition: the set must actually be logged');
    assert.equal(
      set.rpe,
      undefined,
      'a set the athlete has not rated must carry no rating — stamping one is how the ' +
        'Coach came to read a number nobody gave it'
    );
  });

  await t.test('the rating controls can actually appear', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);

    // This is the exact gate both render sites use. Asserting the *condition*
    // rather than the markup means the test still means something if the buttons
    // are restyled, and fails if the store starts pre-filling the value again.
    assert.ok(
      !firstSet().rpe,
      'SetLogRow/SetLogTable render Easy/Med/Hard only when `!set.rpe`; a truthy value here ' +
        'means the buttons are unreachable no matter how they are styled'
    );

    for (const file of ['src/components/workout/SetLogRow.tsx', 'src/components/workout/SetLogTable.tsx']) {
      assert.match(
        stripComments(read(file)),
        /!set\.rpe/,
        `${file} no longer gates the rating controls on \`!set.rpe\` — re-read the assertion above, ` +
          'it is pinned to a condition this file is expected to keep'
      );
    }
  });

  await t.test('rating a set records what the athlete said, and only that', () => {
    for (const rpe of RPE_VALUES) {
      freshSession();
      useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);
      useWorkoutStore.getState().rateSet(0, 0, rpe);
      assert.equal(firstSet().rpe, rpe, `rateSet('${rpe}') must store '${rpe}'`);
    }
  });

  /**
   * The end the unit tests could not reach: a real session, logged and rated
   * through the store, changing what the Coach prescribes next. With `'med'`
   * stamped this was unreachable — every session looked identical to the planner.
   */
  await t.test('a rated session reaches the planner and moves the next target', () => {
    function historyRatedAll(rpe: (typeof RPE_VALUES)[number]) {
      useWorkoutStore.setState({ activeWorkout: null, workoutHistory: [] });
      useWorkoutStore.getState().startWorkout('Push', template());
      for (const setIndex of [0, 1]) {
        useWorkoutStore.getState().logSetAndAdvance(0, setIndex, 8, 60);
        useWorkoutStore.getState().rateSet(0, setIndex, rpe);
      }
      const log = useWorkoutStore.getState().completeActiveWorkout();
      assert.ok(log, 'precondition: the session must complete into history');
      return [log];
    }

    const easy = nextTargets('bench-press', historyRatedAll('easy'), 'metric', 'strength', 'intermediate');
    assert.equal(
      easy.whyKey,
      'coachWhyLoadUp',
      'two easy sets logged through the real store must reach the load-up branch'
    );

    const hard = nextTargets('bench-press', historyRatedAll('hard'), 'metric', 'strength', 'intermediate');
    assert.equal(
      hard.whyKey,
      'coachWhyDeload',
      'two hard sets logged through the real store must reach the deload branch'
    );

    assert.notEqual(
      easy.weight,
      hard.weight,
      'if effort does not change the prescribed weight, the athlete rated their sets for nothing'
    );
  });

  /**
   * The source half. The behavioural tests above cover `logSetAndAdvance`; this
   * covers the next one somebody adds. Scoped to the store because that is where
   * a set is written, and closed over the full `Rpe` union rather than the single
   * spelling that caused the defect — `'med'` was the value that shipped, but
   * `'easy'` or `'hard'` hardcoded there would be the same bug wearing a
   * different word.
   */
  await t.test('no store path hands `logSet` a rating the athlete did not give', () => {
    const src = stripComments(read('src/store/workoutStore.ts'));
    const calls = src.match(/logSet\([^)]*\)/g) ?? [];
    assert.ok(calls.length > 0, 'found no logSet call at all — this guard has stopped reading the store');

    const offenders = calls.filter((call) =>
      RPE_VALUES.some((v) => call.includes(`'${v}'`) || call.includes(`"${v}"`))
    );
    assert.deepEqual(
      offenders,
      [],
      'a literal rating passed into logSet is a rating the athlete never gave — it also hides the ' +
        `Easy/Med/Hard buttons, which only render when the value is absent:\n  ${offenders.join('\n  ')}`
    );

    // The list above is closed because the union has exactly these three members;
    // if a fourth is added, the filter would silently stop covering it.
    const types = read('src/types/index.ts');
    const union = /export type Rpe\s*=\s*([^;]+);/.exec(types);
    assert.ok(union, 'could not find the Rpe union — re-read RPE_VALUES in this file');
    for (const v of RPE_VALUES) {
      assert.match(union[1], new RegExp(`'${v}'`), `Rpe no longer includes '${v}'`);
    }
    assert.equal(
      (union[1].match(/'/g) ?? []).length / 2,
      RPE_VALUES.length,
      'the Rpe union gained or lost a member — RPE_VALUES above is now an incomplete enumeration'
    );
  });
});
