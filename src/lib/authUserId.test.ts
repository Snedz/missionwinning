/**
 * The predicate that decides what may be written to an `auth.users` foreign key.
 *
 * `.260` — it existed twice on the revenue path, byte-identical: `stripeWebhook.ts`
 * picking an id off a Checkout Session, and an inline copy in
 * `premiumServer.grantEnrollmentFromWebhook` deciding whether to put that id in the
 * `INSERT`. Two definitions of one rule (`.178`), on the two files that turn a
 * payment into an entitlement.
 *
 * The drift is quiet in the expensive direction. Loosen the reader and it hands
 * over an id the writer rejects — the enrollment silently loses its `user_id` and
 * becomes email-only. Loosen the writer and the insert takes an id no auth user
 * owns, which is a foreign-key error on the row that grants somebody the thing
 * they just paid for.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { asAuthUserId } from './authUserId.ts';

const root = path.join(import.meta.dirname, '..', '..');

test('accepts a real auth user id, trimmed', () => {
  const id = '3f9a1c2e-5b7d-4e8f-9a0b-1c2d3e4f5a6b';
  assert.equal(asAuthUserId(id), id);
  assert.equal(asAuthUserId(`  ${id}  `), id, 'Stripe metadata arrives with whitespace often enough');
  assert.equal(asAuthUserId(id.toUpperCase()), id.toUpperCase(), 'Postgres uuid is case-insensitive');
});

test('rejects what a Payment Link or a hand-made test event actually sends', () => {
  for (const [value, why] of [
    [undefined, 'absent'],
    [null, 'null'],
    ['', 'empty'],
    ['   ', 'whitespace only'],
    ['anonymous', 'a literal placeholder'],
    ['user_12345', 'a Stripe-style id, not a Supabase one'],
    ['3f9a1c2e5b7d4e8f9a0b1c2d3e4f5a6b', 'no dashes'],
    ['3f9a1c2e-5b7d-4e8f-9a0b-1c2d3e4f5a6', 'one char short'],
    ['3f9a1c2e-5b7d-4e8f-9a0b-1c2d3e4f5a6bb', 'one char long'],
    ['zf9a1c2e-5b7d-4e8f-9a0b-1c2d3e4f5a6b', 'non-hex'],
    ['3f9a1c2e-5b7d-4e8f-9a0b-1c2d3e4f5a6b extra', 'trailing junk'],
  ] as const) {
    assert.equal(asAuthUserId(value), null, `should reject ${why}: ${JSON.stringify(value)}`);
  }
});

/**
 * The nil UUID is the one that matters most: it is well-formed, it is what a
 * hand-written fixture reaches for, and Postgres will accept it into a `uuid`
 * column — where it then fails the foreign key, because no auth user is
 * all-zeroes. The version nibble is what excludes it.
 */
test('rejects the nil UUID and out-of-range versions', () => {
  assert.equal(asAuthUserId('00000000-0000-0000-0000-000000000000'), null, 'nil UUID');
  assert.equal(asAuthUserId('3f9a1c2e-5b7d-0e8f-9a0b-1c2d3e4f5a6b'), null, 'version 0');
  assert.equal(asAuthUserId('3f9a1c2e-5b7d-9e8f-9a0b-1c2d3e4f5a6b'), null, 'version 9');
  assert.equal(asAuthUserId('3f9a1c2e-5b7d-4e8f-0a0b-1c2d3e4f5a6b'), null, 'variant 0');
  // v4 and v7 are the two Supabase actually mints; both must pass.
  assert.ok(asAuthUserId('3f9a1c2e-5b7d-4e8f-9a0b-1c2d3e4f5a6b'), 'v4');
  assert.ok(asAuthUserId('01931c2e-5b7d-7e8f-8a0b-1c2d3e4f5a6b'), 'v7');
});

/**
 * `.178`, executable: one rule, one definition.
 *
 * Discovers rather than enumerates (`.220`) — it scans for the pattern's shape
 * instead of checking the two files I happened to fix, so a third copy appearing
 * in a new payment provider fails here rather than in production.
 */
test('the auth-user-id pattern is defined exactly once', () => {
  const shape = /\[0-9a-f\]\{8\}-\[0-9a-f\]\{4\}-/;
  const offenders: string[] = [];

  const walk = (dir: string) => {
    for (const e of readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = path.posix.join(dir, e.name);
      if (e.isDirectory()) walk(rel);
      else if (/\.tsx?$/.test(e.name) && !/\.(test|routetest)\.tsx?$/.test(e.name)) {
        const src = readFileSync(path.join(root, rel), 'utf8');
        if (shape.test(src) && rel !== 'src/lib/authUserId.ts') offenders.push(rel);
      }
    }
  };
  walk('src');
  walk('app');

  assert.deepEqual(
    offenders,
    [],
    'the auth-user-id pattern is spelled out again in:\n  ' +
      offenders.join('\n  ') +
      '\n  Import `asAuthUserId` from @/lib/authUserId instead. Two copies of this rule is how a ' +
      'reader and a writer come to disagree about which ids are real, on the row that grants premium.'
  );
});
