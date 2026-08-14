/**
 * The gated build, exercised — because nothing else in this repo exercises it.
 *
 * `scripts/gate.mjs` builds with `PRIVATE_MODE=false` (deliberately: that is what
 * compiles the service worker `offline.spec.ts` needs). So all 50 e2e cases and
 * all 33 a11y cases run against a configuration **no beta user will ever load**.
 * Production runs `PRIVATE_MODE=true`, and the one code path every invited tester
 * begins on had never been executed by a test.
 *
 * That is `.200`'s thesis — *a guard nobody runs is a guard that does not exist* —
 * applied to the deployed configuration, and it is the mechanical reason a
 * redirect that silently discarded every invite code survived nine waves.
 *
 * A second gated production build would cost the gate ~3 minutes. `proxy()` is
 * ordinary server code, so calling it directly is both faster and more precise:
 * these assert on the `Location` header the browser would actually follow.
 *
 * Runs in the `react-server` lane (`npm run test:routes`) because the gate's
 * Supabase helper transitively imports `server-only`.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { proxy } from '../../proxy.ts';
import { makeNextRequest } from '@/lib/api/testRequest';
import { restoreEnv, setTestEnv, snapshotEnv } from '@/lib/testEnv.ts';

const ORIGIN = 'https://www.missionwinning.com';

/** Where the gate would send this request, or null if it let it through. */
async function redirectFor(path: string): Promise<URL | null> {
  const res = await proxy(makeNextRequest(`${ORIGIN}${path}`));
  const location = res.headers.get('location');
  return location ? new URL(location, ORIGIN) : null;
}

describe('the private gate redirect (PRIVATE_MODE=true)', () => {
  let snapshot: ReturnType<typeof snapshotEnv>;

  beforeEach(() => {
    snapshot = snapshotEnv();
    setTestEnv('PRIVATE_MODE', 'true');
    // No access secret and no cookie: this is a cold visitor from an email.
    setTestEnv('PRIVATE_ACCESS_SECRET', '');
  });

  afterEach(() => {
    restoreEnv(snapshot);
  });

  /**
   * The whole bug, as the invited tester experienced it. The shipped
   * beta-invite email linked to `/?invite=CODE`; the code never reached the
   * screen that reads it, so `isInvitee` was false and they were shown the
   * public waitlist form with the code field folded inside a `<details>`.
   */
  it('carries the invite code through to the gate', async () => {
    const to = await redirectFor('/?invite=MW-B-ABC12');
    assert.ok(to, 'a cold visitor to / must be sent to the gate');
    assert.equal(to.pathname, '/private');
    assert.equal(
      to.searchParams.get('invite'),
      'MW-B-ABC12',
      'the invite code was dropped in transit — the invitee screen cannot render without it'
    );
  });

  /**
   * `?next=` is read at `PrivateTeaserClient.tsx:41` and `:71` and was set by
   * nothing, because this redirect was the only route to that page. Every deep
   * link — bookmark, push URL (`/log?src=push`), share link — therefore returned
   * the athlete to marketing rather than where they were going.
   */
  it('records the destination so the gate can return the visitor to it', async () => {
    const to = await redirectFor('/log?src=push');
    assert.ok(to);
    assert.equal(to.searchParams.get('next'), '/log');
    assert.equal(to.searchParams.get('src'), 'push', 'unrelated query params survive too');
  });

  it('records /coach for post-I-Day wedge navigation', async () => {
    const to = await redirectFor('/coach');
    assert.ok(to);
    assert.equal(to.pathname, '/private');
    assert.equal(to.searchParams.get('next'), '/coach');
  });

  it('does not name / as a destination — that is where the gate already sends you', async () => {
    const to = await redirectFor('/');
    assert.ok(to);
    assert.equal(to.searchParams.get('next'), null);
  });

  /**
   * An explicit `?next=` beats the inferred one. Otherwise a link built to send
   * someone to `/coach` would be rewritten to wherever the redirect happened to
   * fire, which is the same class of silent overwrite as the original bug.
   */
  it('leaves an explicit next alone', async () => {
    // `/log`, not `/active`: the free logger stopped redirecting in `.769`, so
    // asking it about `next` would only ever measure the public-path branch.
    const to = await redirectFor('/log?next=/coach');
    assert.ok(to);
    assert.equal(to.searchParams.get('next'), '/coach');
  });

  /**
   * Hard rule 2 at the proxy, not just in the list.
   *
   * `.769` made `/active` public while gated so a stranger can log a set. The
   * path list (`privateGate.test.ts`) and the middleware are two different
   * things — `.204` shipped a route the list called public and the proxy still
   * bounced — so the same fact is pinned in both places.
   */
  it('never sends the free logger to the gate, and still sends the rest', async () => {
    assert.equal(
      await redirectFor('/active'),
      null,
      'the free logger is never gated (hard rule 2)'
    );
    for (const gated of ['/log', '/coach', '/nutrition', '/history', '/profile', '/account']) {
      assert.ok(await redirectFor(gated), `${gated} must still require the cookie`);
    }
  });

  it('still lets the gate-public paths through', async () => {
    assert.equal(await redirectFor('/welcome'), null);
    assert.equal(await redirectFor('/private'), null);
    assert.equal(await redirectFor('/privacy'), null);
  });

  /** Admin share links and the beta email both land here — no redirect, invite intact. */
  it('serves /private?invite= directly without stripping the code', async () => {
    assert.equal(await redirectFor('/private?invite=MW-B-ABC12'), null);
  });
});
