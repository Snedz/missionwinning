import { test } from 'node:test';
import assert from 'node:assert/strict';
import { storageFailureCopy } from './StorageFailureNotice';

/**
 * What this device is allowed to tell an athlete about its own storage.
 *
 * The e2e proves the notice *appears on Train*. This proves what it is allowed to
 * say once it is there, which is the half a screenshot cannot check and the half
 * that would rot quietly: both messages existed in this repo for a long time before
 * anything rendered them anywhere an athlete would see.
 *
 * The honesty property is the point. `safeStorage` falls back to an in-memory map,
 * so the tab keeps working and every tap looks like it landed — which is precisely
 * why the copy has to say out loud that it will not be there next time. A message
 * that softened that would be worse than no message: it would convert a silent
 * data-loss bug into a silent one the product has told the user about.
 */

/** Persists past a reload — the promise a memory fallback cannot keep. */
const FORBIDDEN_PROMISE = /will (?:be )?(?:saved|there|keep it|persist)/i;

test('a full disk says so, and says the session is not safe', () => {
  const copy = storageFailureCopy('quota');
  assert.equal(copy.key, 'syncStorageFull');
  assert.match(copy.fallback, /out of storage space/i);
  // Actionable: the one thing a user can actually do about a full disk.
  assert.match(copy.fallback, /clear some space/i);
  assert.doesNotMatch(copy.fallback, FORBIDDEN_PROMISE);
});

test('a refusing browser names private browsing, not a bug', () => {
  const copy = storageFailureCopy('denied');
  assert.equal(copy.key, 'syncStorageDenied');
  assert.match(copy.fallback, /private browsing/i);
  assert.doesNotMatch(copy.fallback, FORBIDDEN_PROMISE);
});

test('"unknown" must not borrow the private-browsing excuse', () => {
  /*
   * The fallback branch is where a copy bug hides: an unclassified failure rendered
   * as "private browsing does this" tells the user to go and change a setting that
   * is not the cause. It must read as the generic refusal instead.
   */
  const copy = storageFailureCopy('unknown');
  assert.equal(copy.key, 'syncStorageUnknown');
  assert.doesNotMatch(copy.fallback, /private browsing does this/i);
  assert.doesNotMatch(copy.fallback, FORBIDDEN_PROMISE);
  // Still actionable — "we don't know why" is not an excuse to say nothing.
  assert.match(copy.fallback, /export a backup/i);
});

test('the two reasons cannot be swapped for one another', () => {
  const quota = storageFailureCopy('quota');
  const denied = storageFailureCopy('denied');
  assert.notEqual(quota.key, denied.key);
  assert.notEqual(quota.fallback, denied.fallback);
  assert.doesNotMatch(quota.fallback, /private browsing/i);
  assert.doesNotMatch(denied.fallback, /out of storage space/i);
});

test('both messages say the session will not survive a reload', () => {
  /*
   * The one sentence the athlete is owed. Without it the notice reads as a
   * housekeeping warning about a browser setting, and they finish the workout
   * believing it was saved.
   */
  for (const reason of ['quota', 'denied'] as const) {
    assert.match(
      storageFailureCopy(reason).fallback,
      /next time|new sessions save|clear some space/i,
      `${reason} copy never says the session is at risk`
    );
  }
});