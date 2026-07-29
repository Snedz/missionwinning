import test from 'node:test';
import assert from 'node:assert/strict';
import {
  __resetForTests,
  __setClockForTests,
  __setJitterForTests,
  flush,
  getState,
  registerHandler,
} from '@/lib/sync/outbox';
import {
  enqueueFeedback,
  feedbackDeliveryDone,
  type FeedbackPayload,
} from '@/lib/sync/feedbackSync';
import { __resetForTests as resetStorage } from '@/lib/storage/safeStorage';

function installStorage(): () => void {
  const map = new Map<string, string>();
  const g = globalThis as { localStorage?: Storage };
  const prev = g.localStorage;
  g.localStorage = {
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  } as unknown as Storage;
  return () => {
    if (prev === undefined) delete g.localStorage;
    else g.localStorage = prev;
  };
}

let now = 1_000_000;

function setup() {
  const uninstall = installStorage();
  resetStorage();
  __resetForTests();
  now = 1_000_000;
  __setClockForTests(() => now);
  __setJitterForTests(() => 0.5);
  return uninstall;
}

function entry(id: string): FeedbackPayload {
  return {
    name: 'Beta Contributor',
    email: `${id}@example.com`,
    goals: `Results: r\nTestimonial: t\nRating: 5\nMassive action: a`,
    package_interest: 'beta-feedback',
    source: 'feedback-page',
    message: 't',
  };
}

test('feedbackSync', async (t) => {
  await t.test('a failed submission is retried, not dropped', async () => {
    // The `.170` bug, third instance: FeedbackPage called submitLead, discarded the
    // result, and showed "Thank you" over a dropped note. Through the outbox, a
    // network failure must leave the op queued. Reverting the page to a direct
    // fire-and-forget call makes this scenario unrepresentable — which is the point.
    const uninstall = setup();
    try {
      let attempts = 0;
      registerHandler('feedback.submit', async () => {
        attempts += 1;
        return attempts >= 2; // first delivery fails, second lands
      });

      enqueueFeedback(entry('a'), '2026-07-29T10:00:00.000Z');
      await flush();
      assert.equal(attempts, 1);
      assert.equal(getState().pending, 1, 'failed op must stay queued');

      now += 60_000;
      await flush();
      assert.equal(attempts, 2);
      assert.equal(getState().pending, 0, 'delivered op must clear');
    } finally {
      uninstall();
    }
  });

  await t.test('two entries are two ops — feedback is per-entity, not latest-state', async () => {
    // Keying on a shared constant would collapse a Tuesday note into a Friday note.
    // Two notes a week apart must both arrive.
    const uninstall = setup();
    try {
      const delivered: string[] = [];
      registerHandler('feedback.submit', async (payload) => {
        delivered.push((payload as FeedbackPayload).email);
        return true;
      });

      enqueueFeedback(entry('first'), '2026-07-21T10:00:00.000Z');
      enqueueFeedback(entry('second'), '2026-07-28T10:00:00.000Z');
      await flush();

      assert.deepEqual(delivered.sort(), ['first@example.com', 'second@example.com']);
    } finally {
      uninstall();
    }
  });

  await t.test('delivery verdict: HTTP failure retries; demo env and 202 do not', () => {
    // The old page discarded submitLead's result entirely. This mapping is the fix,
    // and each direction has a failure mode: swallowing `ok: false` re-creates the
    // dropped-note bug; retrying `localOnly` (demo env, no Supabase URL) strands
    // every op on such devices at MAX_ATTEMPTS → stuck.
    assert.equal(feedbackDeliveryDone({ ok: false }), false, 'network failure must retry');
    assert.equal(feedbackDeliveryDone({ ok: true }), true);
    assert.equal(
      feedbackDeliveryDone({ ok: true, localOnly: true }),
      true,
      'demo-env fallback must not retry forever'
    );
  });

  await t.test('resubmitting the same entry does not double-deliver', async () => {
    const uninstall = setup();
    try {
      let count = 0;
      registerHandler('feedback.submit', async () => {
        count += 1;
        return true;
      });

      enqueueFeedback(entry('a'), '2026-07-29T10:00:00.000Z');
      enqueueFeedback(entry('a'), '2026-07-29T10:00:00.000Z'); // double-tap on Submit
      await flush();

      assert.equal(count, 1, 'same dedupeKey must collapse to one delivery');
    } finally {
      uninstall();
    }
  });
});
