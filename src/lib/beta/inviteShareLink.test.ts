/**
 * The link the founder hands to a beta tester.
 *
 * `.225` — inside `betaMetricsServer.ts`, which no test loaded, so this had never
 * run. It carries `PRIVATE_ACCESS_SECRET` in a query param on purpose (the row's
 * own comment: *"access from env, never stored in DB"*), which makes the empty
 * case the one that matters: a link with `access=` and nothing after it looks
 * gated and opens nothing, and the tester it was sent to hits the `/private`
 * teaser instead of the app.
 *
 * `MAIL_POSTAL_ADDRESS` blocks the invite *email*, so these links are currently
 * copied out of the admin panel by hand — which means a malformed one gets pasted
 * into a message to a real person with no send-time validation in between.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildInviteShareLink, inviteTotals } from './inviteShareLink.ts';

const CODE = 'MW-B-ABCDE';

test('carries the access secret and the invite code', () => {
  const url = new URL(
    buildInviteShareLink(CODE, {
      PRIVATE_ACCESS_SECRET: 's3cret',
      NEXT_PUBLIC_SITE_URL: 'https://www.missionwinning.com',
    })
  );
  assert.equal(url.origin + url.pathname, 'https://www.missionwinning.com/');
  assert.equal(url.searchParams.get('access'), 's3cret');
  assert.equal(url.searchParams.get('invite'), CODE);
});

/**
 * The failure that matters. `params.set('access', '')` yields `?access=&invite=…`,
 * which reads as a gated link and opens nothing.
 */
test('omits the access param entirely when no secret is configured', () => {
  const link = buildInviteShareLink(CODE, {});
  assert.ok(!link.includes('access='), `an empty access param is worse than none: ${link}`);
  assert.ok(link.includes(`invite=${CODE}`), 'the invite must still be there');

  // Whitespace-only is the same thing arriving from a sloppy .env.
  const padded = buildInviteShareLink(CODE, { PRIVATE_ACCESS_SECRET: '   ' });
  assert.ok(!padded.includes('access='), 'a whitespace secret is not a secret');
});

test('falls back to the first PRIVATE_ACCESS_CODES entry, trimmed', () => {
  const url = new URL(
    buildInviteShareLink(CODE, {
      PRIVATE_ACCESS_CODES: ' first , second ,third',
    })
  );
  assert.equal(url.searchParams.get('access'), 'first');
});

test('PRIVATE_ACCESS_SECRET wins over the codes list', () => {
  const url = new URL(
    buildInviteShareLink(CODE, {
      PRIVATE_ACCESS_SECRET: 'primary',
      PRIVATE_ACCESS_CODES: 'fallback',
    })
  );
  assert.equal(url.searchParams.get('access'), 'primary');
});

test('a secret with URL-special characters is encoded, not pasted raw', () => {
  const secret = 'a b&c=d?e#f';
  const link = buildInviteShareLink(CODE, { PRIVATE_ACCESS_SECRET: secret });
  assert.ok(!link.includes('a b&c=d'), `raw special characters truncate the query: ${link}`);
  assert.equal(
    new URL(link).searchParams.get('access'),
    secret,
    'and it must survive the round trip, or the gate rejects a correct secret'
  );
});

test('the host loses a trailing slash so the path is never //', () => {
  const link = buildInviteShareLink(CODE, {
    NEXT_PUBLIC_SITE_URL: 'https://staging.example.com/',
  });
  assert.ok(link.startsWith('https://staging.example.com/?'), link);
});

test('SITE_URL wins over APP_URL, and production is the last resort', () => {
  assert.ok(
    buildInviteShareLink(CODE, {
      NEXT_PUBLIC_SITE_URL: 'https://site.example.com',
      NEXT_PUBLIC_APP_URL: 'https://app.example.com',
    }).startsWith('https://site.example.com/')
  );
  assert.ok(
    buildInviteShareLink(CODE, {
      NEXT_PUBLIC_APP_URL: 'https://app.example.com',
    }).startsWith('https://app.example.com/')
  );
  assert.ok(
    buildInviteShareLink(CODE, {}).startsWith(
      'https://www.missionwinning.com/'
    ),
    'never a relative or empty host — this is pasted into a message'
  );
});

/**
 * `.218` found landing and redemption arriving out of order or not at all, so the
 * stages are counted independently rather than as a nested funnel. A row that
 * signed up without a recorded landing must still count as signed up — that is
 * the number the beta gate reads.
 */
test('invite totals count each stage independently', () => {
  const t = inviteTotals([
    { first_landed_at: '2026-07-01', signed_up_user_id: 'u1', iDayDone: true, firstWorkout: true },
    { first_landed_at: '2026-07-02', signed_up_user_id: null },
    { first_landed_at: null, signed_up_user_id: 'u3', iDayDone: true, firstWorkout: false },
    { first_landed_at: null, signed_up_user_id: null },
  ]);
  assert.deepEqual(t, {
    issued: 4,
    landed: 2,
    signedUp: 2,
    iDayDone: 2,
    withWorkout: 1,
    target: 10,
  });
});

test('an empty invite list is all zeroes against the target, not a crash', () => {
  assert.deepEqual(inviteTotals([]), {
    issued: 0,
    landed: 0,
    signedUp: 0,
    iDayDone: 0,
    withWorkout: 0,
    target: 10,
  });
});
