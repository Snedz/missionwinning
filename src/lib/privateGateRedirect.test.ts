/**
 * The gate must not throw away what the gate reads.
 *
 * `PrivateTeaserClient` reads two query params off its own URL:
 *
 *   - `?invite=` (`:22`) — decides whether the invitee screen renders at all.
 *   - `?next=`   (`:41`, `:71`) — where it returns you after you enter a code.
 *
 * `proxy.ts` was the only redirect to that page, and it built the destination
 * with `new URL('/private', request.url)`. The `URL` constructor replaces the
 * path **and the query**. So:
 *
 *   - the shipped beta-invite email linked to `/?invite=CODE`, the code was
 *     stripped in transit, and every invited tester was shown the **public
 *     waitlist form** instead of the screen written for them. The private beta
 *     could not onboard an invitee through its own invite email.
 *   - `?next=` was dead code — nothing in the repo ever set it — so every deep
 *     link (bookmark, push URL, share link) returned to marketing.
 *
 * Two features, one line, and no test could see either: the constructor call
 * looks exactly like a correct one.
 *
 * The first test below is the real proof — it exercises the platform behaviour
 * that caused the bug, rather than trusting a reading of it.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

/**
 * Comments are not code. This guard failed on its own first run because the fix
 * it enforces ships with a comment quoting the broken spelling — the same trap
 * `ciTruth.test.ts` fell into when a workflow header mentioning `secrets:scan`
 * counted as running it. A guard that reads prose as behaviour will eventually
 * be satisfied by an apology for the bug.
 */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

test('the constructor spelling really does drop the query', () => {
  const dropped = new URL('/private', 'https://www.missionwinning.com/?invite=MW-B-ABC12');
  assert.equal(
    dropped.searchParams.get('invite'),
    null,
    'if this ever starts preserving the query, this whole guard can be deleted'
  );

  const url = new URL('https://www.missionwinning.com/?invite=MW-B-ABC12');
  url.pathname = '/private';
  assert.equal(url.searchParams.get('invite'), 'MW-B-ABC12', 'assigning pathname keeps the query');
});

test('the gate redirect clones the request URL instead of constructing one', () => {
  const src = stripComments(read('proxy.ts'));
  assert.doesNotMatch(
    src,
    /new URL\(\s*'\/private'/,
    "proxy.ts builds the gate URL with `new URL('/private', …)`, which strips `?invite=` and `?next=` — " +
      'clone `request.nextUrl` and assign `pathname` instead'
  );
  assert.match(
    src,
    /nextUrl\.clone\(\)/,
    'the gate redirect must clone the request URL so its query survives'
  );
});

test('the gate redirect records where the visitor was going', () => {
  const src = stripComments(read('proxy.ts'));
  assert.match(
    src,
    /searchParams\.set\(\s*'next'/,
    "`?next=` is read at PrivateTeaserClient.tsx:41 and :71 and was never set by anything — " +
      'the gate redirect is the one place that knows the destination'
  );
});

/**
 * The email is the other half. Fixing the proxy makes `/?invite=` survive, but
 * the link should be right on its own — `docs/BETA_INVITE.md:27` says `/private`,
 * `scripts/print-beta-invite.ts` emits `/private`, and only the shipped HTML
 * disagreed. A doc, a script and a template describing one URL is two places to
 * drift.
 */
test('the beta invite email links straight at the gate', () => {
  const html = read('src/emails/templates/beta-invite.html');
  const inviteLinks = [...html.matchAll(/href="(https:\/\/[^"]*invite=[^"]*)"/g)].map((m) => m[1]);
  assert.ok(inviteLinks.length > 0, 'the beta invite email has no invite link at all');
  for (const link of inviteLinks) {
    assert.match(
      new URL(link).pathname,
      /^\/private/,
      `${link} sends an invited tester to a gated path — the code is stripped by the redirect ` +
        'and they land on the public waitlist form'
    );
  }
});

test('the admin share link matches the email — /private, not /', async () => {
  const { buildInviteShareLink } = await import('./beta/inviteShareLink.ts');
  const link = buildInviteShareLink('MW-B-ABC12', {
    PRIVATE_ACCESS_SECRET: 's3cret',
    NEXT_PUBLIC_SITE_URL: 'https://www.missionwinning.com',
  });
  const url = new URL(link);
  assert.equal(url.pathname, '/private', 'share links must land on the gate page');
  assert.equal(url.searchParams.get('invite'), 'MW-B-ABC12');
  assert.equal(
    url.searchParams.get('access'),
    null,
    'production share links must not embed ?access= — it dead-ends on / after unlock'
  );
});
