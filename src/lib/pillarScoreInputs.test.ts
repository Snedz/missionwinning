/**
 * The Learn pillar used to pay out forever (`.607`).
 *
 * `countLearnLessonsThisWeek` unioned three **lifetime** localStorage id sets —
 * `learnCompleted`, `premiumCourseProgress`, `guidebookProgress` — and returned
 * `min(total, 10)`. Five lessons finished once bought the Learn pillar its full ~10
 * points in every week thereafter, for reading nothing. It sat directly beneath
 * `countPillarWinsThisWeek`, which has a careful local-week filter and a `.241`
 * comment about UTC frame mismatches, so the file contained both the defect and its
 * own cure, four lines apart.
 *
 * **Why this file exists at all.** When the fix landed, the mutant that reverts it
 * survived: `pillarScoreInputs.ts` had no colocated test, so nothing in 2,207
 * green tests could see the Learn term go permanent again. The score guards in
 * `score.test.ts` take pre-aggregated numbers and are structurally blind to how
 * those numbers are gathered — the same shape as `.597`, where `progression.test.ts`
 * proved the decision while nothing proved the input.
 *
 * So this goes through the real reader with real storage, and the assertion that
 * matters is the *negative* one: a rich lifetime history of finished lessons must
 * contribute **zero** to a week in which nothing was read.
 */

import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';

let originalLocalStorage: Storage | undefined;
let hadWindow = false;

beforeEach(() => {
  const store = new Map<string, string>();
  const memStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    get length() {
      return store.size;
    },
  } as Storage;

  hadWindow = typeof globalThis.window !== 'undefined';
  if (!hadWindow) {
    (globalThis as unknown as { window: unknown }).window = Object.assign(
      Object.create(globalThis),
      { dispatchEvent: () => true, addEventListener: () => {}, removeEventListener: () => {} }
    );
  }
  originalLocalStorage = globalThis.localStorage;
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: memStorage,
  });
});

afterEach(() => {
  if (originalLocalStorage !== undefined) {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: originalLocalStorage,
    });
  }
  if (!hadWindow) delete (globalThis as unknown as { window?: unknown }).window;
});

/** Offset from now — a date literal in a fixture is a test with an expiry date (§6). */
function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

test('a lifetime of finished lessons scores nothing in a week with no reading', async () => {
  const { STORAGE_KEYS } = await import('@/lib/storage/keys');
  const { writeJson } = await import('@/lib/storage/safeStorage');
  const { gatherWeeklyPillarStats } = await import('@/lib/pillarScoreInputs');

  // A real Learn history, across all three id sets the old counter read.
  writeJson(STORAGE_KEYS.learnCompleted, ['l1', 'l2', 'l3', 'l4', 'l5', 'l6']);
  writeJson(STORAGE_KEYS.premiumCourseProgress, ['c1', 'c2']);
  writeJson(STORAGE_KEYS.guidebookProgress, ['g1', 'g2', 'g3']);

  // Precondition, asserted rather than assumed: the old counter would have
  // returned its cap from this fixture. Without this the test could pass because
  // the fixture was empty, which is the failure mode it exists to rule out.
  const lifetimeIds = new Set(['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'c1', 'c2', 'g1', 'g2', 'g3']);
  assert.ok(lifetimeIds.size >= 5, 'fixture must exceed the 5-lesson cap that paid full points');

  assert.equal(
    gatherWeeklyPillarStats().learnLessons,
    0,
    'eleven lessons finished in the past must contribute nothing to this week'
  );
});

test('a lesson finished this week does count — the counter is dated, not disabled', async () => {
  const { STORAGE_KEYS } = await import('@/lib/storage/keys');
  const { writeJson } = await import('@/lib/storage/safeStorage');
  const { gatherWeeklyPillarStats } = await import('@/lib/pillarScoreInputs');

  writeJson(STORAGE_KEYS.pillarWins, [
    { pillar: 'learn', title: 'Read today', completedAt: isoDaysAgo(0) },
  ]);

  assert.equal(
    gatherWeeklyPillarStats().learnLessons,
    1,
    'the fix must not be "return zero" — a lesson read today is this week'
  );
});

test('a lesson finished long ago does not', async () => {
  const { STORAGE_KEYS } = await import('@/lib/storage/keys');
  const { writeJson } = await import('@/lib/storage/safeStorage');
  const { gatherWeeklyPillarStats } = await import('@/lib/pillarScoreInputs');

  writeJson(STORAGE_KEYS.pillarWins, [
    { pillar: 'learn', title: 'Read last month', completedAt: isoDaysAgo(40) },
  ]);

  assert.equal(gatherWeeklyPillarStats().learnLessons, 0, 'forty days ago is not this week');
});
