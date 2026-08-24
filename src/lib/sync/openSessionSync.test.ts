import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

describe('openSessionSync', () => {
  it('signed-out and missing column ACK — no Force Sync, no backoff spin', () => {
    const src = stripComments(read('src/lib/sync/openSessionSync.ts'));
    assert.match(src, /if \(!user\) return true/);
    assert.match(src, /isMissingOpenSessionColumn/);
    assert.match(src, /return true/);
    assert.doesNotMatch(src, /Force Sync|Session Expired/);
    assert.match(src, /enqueue\('workout\.active', 'active'/);
  });

  it('handler is registered at boot', () => {
    const sync = stripComments(read('src/lib/sync/openSessionSync.ts'));
    assert.match(sync, /registerHandler\('workout\.active'/);
    const drain = stripComments(read('src/hooks/useOutboxDrain.ts'));
    assert.match(drain, /registerOpenSessionSyncHandler\(\)/);
  });

  it('SIGNED_IN history adopt also enqueues the open session', () => {
    const store = read('src/store/workoutStore.ts');
    const fn = store.slice(store.indexOf('syncCurrentHistoryToCloud: async'));
    assert.match(fn, /enqueueOpenSession\(open\)/);
    assert.ok(
      fn.indexOf('enqueueWorkoutUpsert') < fn.indexOf('enqueueOpenSession(open)'),
      'history rows queue first; open session rides the same flush'
    );
  });

  it('handler writes the enqueued snapshot — a store re-read would resurrect', () => {
    const src = stripComments(read('src/lib/sync/openSessionSync.ts'));
    assert.match(src, /registerHandler\('workout\.active', pushOpenSession\)/);
    assert.match(src, /open_session: snapshot/);
    assert.doesNotMatch(src, /useWorkoutStore|getState\(\)\.activeWorkout/);
  });

  it('SIGNED_IN reconciles the open session without a tap', () => {
    const src = read('src/hooks/useJourneySync.ts');
    const signedIn = src.slice(
      src.indexOf("event === 'SIGNED_IN'"),
      src.indexOf("event === 'TOKEN_REFRESHED'")
    );
    assert.match(signedIn, /syncCurrentHistoryToCloud/);
    assert.match(signedIn, /reconcileOpenSession/);
    assert.ok(
      signedIn.indexOf('syncCurrentHistoryToCloud') < signedIn.indexOf('reconcileOpenSession'),
      'history adopt runs before open-session reconcile so foreign replace cannot enqueue leftovers'
    );
    assert.doesNotMatch(
      stripComments(signedIn),
      /Force Sync|Session Expired|sign in to (?:keep|save) these sets/
    );
  });
});
