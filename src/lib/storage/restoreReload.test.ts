/**
 * A function that writes storage behind a live store must say how the store learns.
 *
 * `.205` — this is the worst defect the `.204`–`.213` audits found, because it
 * destroys data the athlete deliberately asked the app to protect.
 *
 * `backup.ts` and `importCsvRestore.ts` write the zustand persist payload
 * straight to `WORKOUT_STORE_KEY` and, by design, leave the refresh to the
 * caller — the pure merge stays testable, the browser half stays thin. Both
 * callers then ran `setTimeout(() => router.refresh(), 1200)`, and
 * `router.refresh()` **preserves client-side React state by design**. The store
 * was already hydrated. It never re-read storage.
 *
 *   New phone → restore 300 workouts → toast says "300 workouts merged…
 *   Reloading…" → nothing reloads → History still empty → athlete logs one set →
 *   `persist` writes its in-memory state over the file → **300 workouts gone.**
 *
 * `backup.test.ts` covers `mergeBackup` thoroughly and could not see this: the
 * merge was always correct. The defect lived entirely in the sentence after it.
 *
 * So the guard reads call sites, not merge results. Source-text in the
 * `surfaceReality.test.ts` idiom, because "which function did you call after
 * writing" is a fact about the code, not about a return value.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { RESTORE_RELOAD_DELAY_MS, reloadAfterRestore } from '@/lib/storage/reloadAfterRestore';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

/**
 * Every component that restores device storage behind the hydrated store. Adding
 * a third restore surface without adding it here is the gap this guard exists to
 * close, so the list is asserted non-empty and each entry is checked twice.
 */
const RESTORE_CALLERS = [
  'src/components/profile/ProfileBackupCard.tsx',
  'src/components/profile/ProfileImportCard.tsx',
];

test('no restore path relies on router.refresh()', () => {
  const offenders = RESTORE_CALLERS.filter((f) => /router\.refresh\(/.test(stripComments(read(f))));
  assert.deepEqual(
    offenders,
    [],
    'router.refresh() preserves client React state, so the hydrated zustand store never re-reads ' +
      'the storage the restore just rewrote — and the next logged set overwrites it:\n  ' +
      offenders.join('\n  ')
  );
});

test('every restore path reloads the document', () => {
  for (const file of RESTORE_CALLERS) {
    assert.match(
      stripComments(read(file)),
      /reloadAfterRestore\(/,
      `${file} writes storage behind a live store and never says how the store learns`
    );
  }
});

/**
 * The copy is part of the contract. Both toasts end "Reloading…", which is a
 * promise the athlete acts on — they wait, see the old history, and conclude the
 * restore failed. If the reload ever goes away, the sentence must go with it.
 */
test('the toast only promises a reload where one happens', () => {
  for (const file of RESTORE_CALLERS) {
    const src = read(file);
    if (!/Reloading/.test(src)) continue;
    assert.match(
      stripComments(src),
      /reloadAfterRestore\(/,
      `${file} tells the athlete it is reloading and does not reload`
    );
  }
});

test('the reload is a real document reload, not a router call', () => {
  const src = stripComments(read('src/lib/storage/reloadAfterRestore.ts'));
  assert.match(src, /window\.location\.reload\(\)/);
  assert.doesNotMatch(
    src,
    /router/,
    'the whole point is to leave no stale in-memory writer behind — a router call cannot do that'
  );
});

test('the reload waits long enough for the toast to be read', () => {
  assert.ok(
    RESTORE_RELOAD_DELAY_MS >= 1000,
    'reloading before the athlete can read "300 workouts merged" turns a success into a flicker'
  );
});

/** SSR-safe: the route-test lane imports this graph with no `window`. */
test('calling it without a window is a no-op rather than a throw', () => {
  assert.doesNotThrow(() => reloadAfterRestore(0));
});
