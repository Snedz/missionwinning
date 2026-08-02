/**
 * The row that turns a payment into an entitlement.
 *
 * `.226` — `grantEnrollmentFromWebhook` reaches Supabase on its first line, so
 * every decision in this row was only reachable through a service-role client and
 * none of it had ever been executed. `premiumServer.ts` was 124 lines that no test
 * imported, on the path a paying customer arrives through.
 *
 * What is pinned here is what a wrong row costs. A missing `premium_granted`, a
 * capitalised email, a `status` that is not `active` — none of these fail. They
 * insert cleanly and the buyer is simply not premium, with a receipt in hand and
 * a row in the table that says they are enrolled.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildEnrollmentRow, isAuthUserForeignKeyError } from './enrollmentRow.ts';

const UUID = '3f9a1c2e-5b7d-4e8f-9a0b-1c2d3e4f5a6b';

const base = {
  user_email: 'buyer@example.com',
  provider: 'stripe',
  external_id: 'cs_test_123',
};

test('a paid webhook produces an active, premium-granted enrollment', () => {
  assert.deepEqual(buildEnrollmentRow({ ...base, user_id: UUID }), {
    user_email: 'buyer@example.com',
    product_id: 'super-bundle',
    plan: 'bundle',
    status: 'active',
    premium_granted: true,
    provider: 'stripe',
    external_id: 'cs_test_123',
    user_id: UUID,
  });
});

/**
 * The email is the identity `isPremiumForUser` matches on, and it matches the
 * normalized form. A row inserted with the address exactly as Stripe sent it is an
 * enrollment its owner cannot be found by.
 */
test('the email is normalized, because that is what premium is looked up by', () => {
  const row = buildEnrollmentRow({ ...base, user_email: '  Buyer@Example.COM  ' });
  assert.equal(row.user_email, 'buyer@example.com');
});

test('product_id defaults to the bundle but an explicit one wins', () => {
  assert.equal(buildEnrollmentRow(base).product_id, 'super-bundle');
  assert.equal(buildEnrollmentRow({ ...base, product_id: 'pt-nutrition' }).product_id, 'pt-nutrition');
});

/**
 * `enrollments.user_id` is a foreign key to `auth.users`. Stripe Payment Links put
 * whatever the link was configured with into metadata, and test pings send
 * literals — an unchecked value fails the insert that grants premium.
 */
test('user_id is omitted rather than sent when it is not an auth user id', () => {
  for (const junk of [undefined, null, '', '   ', 'anonymous', 'user_12345', '00000000-0000-0000-0000-000000000000']) {
    const row = buildEnrollmentRow({ ...base, user_id: junk });
    assert.ok(
      !('user_id' in row),
      `user_id ${JSON.stringify(junk)} must be absent from the row, not present-and-invalid — ` +
        'a key that is present with a bad value is a foreign-key error on the enrollment insert'
    );
  }
});

test('a whitespace-padded real id is still written, trimmed', () => {
  assert.equal(buildEnrollmentRow({ ...base, user_id: `  ${UUID}  ` }).user_id, UUID);
});

/**
 * The retry rule. The caller drops `user_id` and inserts again *only* on a
 * foreign-key error — every other failure is real and must surface, or a genuine
 * outage becomes a silently degraded email-only row.
 */
test('only a foreign-key error earns the email-only retry', () => {
  assert.equal(isAuthUserForeignKeyError({ code: '23503' }), true, 'foreign_key_violation by code');
  assert.equal(
    isAuthUserForeignKeyError({ message: 'insert violates foreign key constraint on auth.users' }),
    true,
    'drivers that report the constraint without the code'
  );

  for (const other of [
    { code: '23505', message: 'duplicate key value violates unique constraint' },
    { code: '42501', message: 'new row violates row-level security policy' },
    { code: '08006', message: 'connection failure' },
    { message: 'timeout' },
    {},
    null,
    undefined,
  ]) {
    assert.equal(
      isAuthUserForeignKeyError(other),
      false,
      `${JSON.stringify(other)} must not be retried as email-only — retrying a unique-violation or ` +
        'an RLS refusal hides it, and the second insert fails the same way'
    );
  }
});
