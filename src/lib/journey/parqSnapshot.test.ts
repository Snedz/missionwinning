/**
 * The health screen ticks its box the moment it is finished.
 *
 * `.228` — `syncJourneyPhase` recomputed `s.basic`, then **returned** when Basic
 * was incomplete, and only recomputed `s.readiness` past that early return. So
 * `readiness.parq` was frozen for every athlete still in Basic. `AssessmentsPage`
 * writes `mw_last_assessment` and touches nothing else in journey state, which
 * meant finishing the PAR-Q left the flag false until a *workout* was logged.
 *
 * That flag is step six of the First Steps checklist, and the checklist's whole
 * audience on the lean shell is the Basic-phase athlete. The one screen built to
 * tell a new athlete what they had done was telling them they had not done the
 * thing they had just done.
 *
 * **Why `firstSteps.test.ts` could not see it.** That suite builds a
 * `JourneyState` literal and asks `getFirstSteps` about it — a fair test of the
 * checklist, and structurally blind to who fills the state in. The defect lived
 * entirely in the sentence that populates it. Same shape as `.205`
 * (`mergeBackup` was always correct; the caller after it was not), so this file
 * goes through `syncJourneyPhase` rather than around it.
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
    // `saveJourneyState` fires phase-transition analytics through
    // `window.dispatchEvent`; a bare `globalThis` has no such method, so the
    // stub supplies one rather than the test asserting around it.
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

/** I-Day answered, so the sync runs past its first gate. Nothing else logged. */
function seedIDayComplete(): void {
  localStorage.setItem('mw_experience', 'beginner');
  localStorage.setItem('mw_equipment', 'bodyweight');
  localStorage.setItem('mw_primary_goal', 'goal:general');
}

test('finishing the PAR-Q ticks the box before the first workout exists', async () => {
  const { syncJourneyPhase } = await import('@/lib/missionJourney');

  seedIDayComplete();
  const before = syncJourneyPhase([]);
  assert.equal(before.phase, 'basic', 'no workout yet, so still Basic');
  assert.equal(before.readiness.parq, false, 'nothing assessed yet');

  // Exactly what `AssessmentsPage` writes, and all it writes.
  localStorage.setItem(
    'mw_last_assessment',
    JSON.stringify({ risk: 'low', date: '2026-08-02' })
  );

  const after = syncJourneyPhase([]);
  assert.equal(
    after.readiness.parq,
    true,
    'the health screen is done — the snapshot must say so without waiting for a workout'
  );
});

/**
 * The fix moved a snapshot, not a gate.
 *
 * A recomputed `readiness` must not smuggle anyone up the ladder: Basic is
 * `allBasicDone`, which is `b.workout` and nothing else (`basicComplete.ts`, and
 * `.223` is what a second definition cost).
 */
test('a completed PAR-Q does not promote anyone out of Basic', async () => {
  const { syncJourneyPhase } = await import('@/lib/missionJourney');

  seedIDayComplete();
  localStorage.setItem(
    'mw_last_assessment',
    JSON.stringify({ risk: 'low', date: '2026-08-02' })
  );

  const s = syncJourneyPhase([]);
  assert.equal(s.phase, 'basic', 'the first workout is the only thing that leaves Basic');
  assert.equal(s.basic.workout, false);
  assert.equal(s.readiness.parq, true, 'and the snapshot is still honest about the PAR-Q');
});
