/**
 * The path that decides whether the beta gate ever goes green.
 *
 * `.218` — invite landing, invite redemption and referral redemption were three
 * raw `void fetch(...).catch(() => {})` calls. One shot each, called once on
 * sign-in and never again, so a tester on a train lost the redemption
 * permanently.
 *
 * The lost row is not the damage. `first_landed_at` and `signed_up_user_id` are
 * what the founder invite panel reads, so a dropped redeem makes the dashboard
 * report **a tester who never arrived and never converted** — while they are
 * using the app. That is the instrument the beta is steered by, reporting the
 * opposite of what happened, on the exact metric REDTEAM A5 fires on.
 *
 * Two things are guarded here: the **delivery semantics** (what retries, what
 * completes, what collapses), and the **reachability** — that the attribution
 * write path cannot quietly go back to calling `fetch` itself.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  __resetForTests,
  __setClockForTests,
  __setJitterForTests,
  flush,
  getState,
  listPending,
  registerHandler,
} from '@/lib/sync/outbox';
import {
  attributionDeliveryDone,
  enqueueInviteLanded,
  enqueueInviteRedeem,
  enqueueReferralRedeem,
  registerAttributionSyncHandlers,
} from '@/lib/sync/attributionSync';
import { __resetForTests as resetStorage } from '@/lib/storage/safeStorage';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

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

test('attributionSync', async (t) => {
  /* ── Delivery semantics ────────────────────────────────────────────────── */

  await t.test('a network failure retries rather than dropping the redemption', async () => {
    /*
     * The defect, stated as a scenario. The old code was
     * `void fetch(...).catch(() => {})` called once from `syncJourneyOnSignIn`,
     * so this exact case — sign in, no signal — lost the invite forever.
     */
    const uninstall = setup();
    try {
      let attempts = 0;
      registerHandler('invite.redeem', async () => {
        attempts += 1;
        return attempts > 2;
      });

      enqueueInviteRedeem('MW-ABC12');
      await flush();
      assert.equal(getState().pending, 1, 'still queued after the first failure');

      now += 60_000;
      await flush();
      assert.equal(getState().pending, 1);

      now += 60_000;
      await flush();
      assert.equal(getState().pending, 0, 'delivered on the third attempt');
      assert.equal(attempts, 3);
    } finally {
      uninstall();
    }
  });

  await t.test('an already-redeemed code completes instead of going stuck', async () => {
    /*
     * 4xx is done, not retried. An invalid or already-used code cannot become
     * valid by asking again, so retrying would burn MAX_ATTEMPTS and then sit in
     * the queue marked `stuck` — permanently visible on the offline screen, and
     * alarming for something that actually worked.
     */
    const uninstall = setup();
    try {
      let calls = 0;
      registerHandler('invite.redeem', async () => {
        calls += 1;
        return attributionDeliveryDone(409);
      });

      enqueueInviteRedeem('MW-USED1');
      await flush();
      assert.equal(getState().pending, 0, 'a 4xx must complete the op');
      assert.equal(calls, 1, 'and must not be attempted again');
    } finally {
      uninstall();
    }
  });

  await t.test('signing in twice does not queue two redemptions', async () => {
    const uninstall = setup();
    try {
      registerHandler('invite.redeem', async () => false);

      enqueueInviteRedeem('MW-ABC12');
      enqueueInviteRedeem('MW-ABC12');
      enqueueInviteRedeem('MW-ABC12');
      assert.equal(getState().pending, 1, 'the dedupe key collapses repeats');

      // A different code is different work and must survive.
      enqueueInviteRedeem('MW-XYZ99');
      assert.equal(getState().pending, 2);
    } finally {
      uninstall();
    }
  });

  await t.test('all three helpers actually reach the queue', async () => {
    /*
     * What this does **not** prove: that the dedupe keys are distinct across
     * kinds. A mutant giving all three the same key survives, because the outbox
     * dedupes on `(kind, dedupeKey)` — so a shared key string is harmless by
     * construction and there is nothing here to defend. Claiming otherwise would
     * be a guard whose name promises more than it measures.
     *
     * What it does prove is that each helper enqueues at all. A no-op helper is
     * the fire-and-forget bug with extra steps.
     */
    const uninstall = setup();
    try {
      registerHandler('invite.landed', async () => false);
      registerHandler('invite.redeem', async () => false);
      registerHandler('referral.redeem', async () => false);

      enqueueInviteLanded('MW-ABC12');
      enqueueInviteRedeem('MW-ABC12');
      enqueueReferralRedeem('MW-ABC12');

      const kinds = listPending().map((p) => p.kind).sort();
      assert.deepEqual(kinds, ['invite.landed', 'invite.redeem', 'referral.redeem']);
    } finally {
      uninstall();
    }
  });

  await t.test('the real handler retries a thrown fetch and completes a 409', async () => {
    /*
     * Every case above registers a stub, so none of them touch `post()` — the
     * function that actually decides what happens when the network fails. A
     * mutant turning its `catch` into `return true` survived all of them, which
     * means the module's core error handling had no test at all. Eleventh
     * vacuous-coverage finding in this run of work: the tests exercised the
     * queue and never the thing being queued.
     *
     * So this one registers the **real** handlers and stubs `fetch` instead.
     */
    const uninstall = setup();
    const g = globalThis as { fetch?: typeof fetch };
    const prevFetch = g.fetch;
    try {
      registerAttributionSyncHandlers();

      let calls = 0;
      g.fetch = (async () => {
        calls += 1;
        throw new TypeError('Failed to fetch');
      }) as typeof fetch;

      enqueueInviteRedeem('MW-ABC12');
      await flush();
      assert.equal(calls, 1);
      assert.equal(
        getState().pending,
        1,
        'a thrown fetch must leave the op queued — this is the exact case the old ' +
          '`.catch(() => {})` swallowed'
      );

      // Now the server answers "already redeemed": done, not retried forever.
      g.fetch = (async () =>
        new Response(JSON.stringify({ error: 'used' }), { status: 409 })) as typeof fetch;
      now += 60_000;
      await flush();
      assert.equal(getState().pending, 0, 'a 409 completes the op');
    } finally {
      if (prevFetch === undefined) delete g.fetch;
      else g.fetch = prevFetch;
      uninstall();
    }
  });

  await t.test('the real handler keeps retrying while rate-limited', async () => {
    const uninstall = setup();
    const g = globalThis as { fetch?: typeof fetch };
    const prevFetch = g.fetch;
    try {
      registerAttributionSyncHandlers();
      g.fetch = (async () =>
        new Response(JSON.stringify({ error: 'Too many requests' }), {
          status: 429,
        })) as typeof fetch;

      enqueueInviteRedeem('MW-ABC12');
      await flush();
      assert.equal(
        getState().pending,
        1,
        'five sign-ins a minute from one gym wifi must not silently discard four of them'
      );
    } finally {
      if (prevFetch === undefined) delete g.fetch;
      else g.fetch = prevFetch;
      uninstall();
    }
  });

  await t.test('the status map draws the line where retry can help', () => {
    assert.equal(attributionDeliveryDone(200), true);
    assert.equal(attributionDeliveryDone(201), true);
    assert.equal(attributionDeliveryDone(400), true, 'malformed code — asking again cannot help');
    assert.equal(attributionDeliveryDone(404), true, 'unknown code');
    assert.equal(attributionDeliveryDone(409), true, 'already redeemed');
    assert.equal(attributionDeliveryDone(500), false, 'the server failed — retry');
    assert.equal(attributionDeliveryDone(502), false);

    /*
     * The exceptions inside 4xx, and not theoretical. All three routes limit to
     * 5/min/IP, and beta testers behind one gym's wifi or one carrier NAT share
     * an IP. Treating "try again shortly" as "done" would drop exactly the
     * redemptions this module exists to save — the original bug, reintroduced by
     * its own fix.
     */
    assert.equal(attributionDeliveryDone(429), false, 'rate limited must retry');
    assert.equal(attributionDeliveryDone(408), false, 'request timeout must retry');
  });

  /* ── Reachability ──────────────────────────────────────────────────────── */

  await t.test('the attribution write path cannot go back to a bare fetch', () => {
    /*
     * Scoped to the **write** functions, not the whole file. `getMyReferral`
     * legitimately fetches: it is a read whose failure costs nothing but a null,
     * and the screen asks again next time it opens. Banning `fetch` outright
     * would be a guard that names one thing and measures another — which is the
     * shape this run of work keeps finding.
     */
    const WRITERS: [string, string][] = [
      ['src/lib/invite.ts', 'markInviteLanded'],
      ['src/lib/invite.ts', 'redeemInviteFromAttribution'],
      ['src/lib/referral.ts', 'redeemReferralFromAttribution'],
    ];

    for (const [file, fn] of WRITERS) {
      const src = stripComments(read(file));
      const start = src.indexOf(`export function ${fn}(`);
      assert.ok(start !== -1, `${fn} moved or was renamed — re-read this guard`);
      const body = src.slice(start, src.indexOf('\n}', start));

      assert.doesNotMatch(
        body,
        /fetch\(/,
        `${fn} must not deliver its own request — one shot with a swallowing catch is how ` +
          'a tester who signed in on a train vanished from the founder panel'
      );
      assert.match(body, /enqueue[A-Za-z]*\(/, `${fn} must hand the write to the outbox`);
    }
  });

  await t.test('every attribution kind has a handler and an offline label', () => {
    /*
     * A declared kind with no handler is an op that can never complete. The
     * offline label is enforced by the compiler (`Record<OutboxKind, …>`), so
     * this asserts the half the type system cannot: that the handlers are
     * actually registered at boot rather than merely defined.
     */
    const sync = stripComments(read('src/lib/sync/attributionSync.ts'));
    for (const kind of ['invite.landed', 'invite.redeem', 'referral.redeem']) {
      assert.match(sync, new RegExp(`registerHandler\\('${kind.replace('.', '\\.')}'`), kind);
    }

    const drain = stripComments(read('src/hooks/useOutboxDrain.ts'));
    assert.match(
      drain,
      /registerAttributionSyncHandlers\(\)/,
      'defined but never registered is the same as not existing — the ops would sit forever'
    );
  });
});
