/**
 * Week-logged API contract.
 *
 * Was "session-only; guests must not have a write path". That assertion is what kept the
 * north-star metric blind: `week_logged.user_id` was `not null`, the route answered 401,
 * and so the only athletes the boss metric could ever describe were people who created an
 * account — in a product whose promise is that you never have to.
 *
 * The route now accepts an accountless write, and the contract that replaces "must 401"
 * is narrower and more demanding: consent must be proven server-side, and a caller must
 * never be able to name its own owner. Both are pinned below.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { weekLoggedBodySchema } from '@/lib/apiSchemas';
import { isPlausibleDeviceId, resolveWeekLoggedOwner } from '@/lib/weekLoggedRow';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('week-logged API contract', () => {
  it('never trusts a client-supplied owner id', () => {
    const route = read('app/api/metrics/week-logged/route.ts');
    // Ownership is derived from the session or the device, never read off the body.
    assert.match(route, /getUserFromRequest/);
    assert.doesNotMatch(route, /user_id:\s*parsed/);
    assert.match(route, /user\?\.id \?\? null/);
    // The client sends a device address; it does not send permission.
    assert.match(route, /resolveWeekLoggedOwner/);
  });

  it('requires push consent for an accountless write, checked server-side', () => {
    const route = read('app/api/metrics/week-logged/route.ts');
    assert.match(route, /push_subscriptions/);
    // Fail closed: an unreachable lookup refuses the write rather than allowing it.
    assert.match(route, /if \(!admin\) return false/);
    assert.match(route, /status: 403/);

    const refused = resolveWeekLoggedOwner({
      userId: null,
      deviceId: 'dev-1',
      hasPushConsent: false,
    });
    assert.equal(refused.ok, false);

    const signedIn = resolveWeekLoggedOwner({ userId: 'u-1', hasPushConsent: false });
    assert.equal(signedIn.ok, true, 'an account is its own identity; no reminder needed');
  });

  it('accepts ISO week keys and a bounded device id only', () => {
    assert.equal(weekLoggedBodySchema.safeParse({ isoWeek: '2026-W33' }).success, true);
    assert.equal(weekLoggedBodySchema.safeParse({ isoWeek: '2026-08-13' }).success, false);
    assert.equal(weekLoggedBodySchema.safeParse({}).success, false);
    assert.equal(
      weekLoggedBodySchema.safeParse({ isoWeek: '2026-W33', deviceId: 'a'.repeat(65) }).success,
      false
    );
    assert.equal(isPlausibleDeviceId('a'.repeat(65)), false);
  });

  it('upserts on the generated owner key, not on a nullable column', () => {
    // A nullable column cannot be part of a PK, so the conflict target moved. Upserting
    // on `user_id,iso_week` would silently no-op every accountless write instead of
    // failing loudly — the exact "succeeds, data is gone" shape this repo has been
    // bitten by before.
    const route = read('app/api/metrics/week-logged/route.ts');
    assert.match(route, /onConflict: 'owner_key,iso_week'/);
  });
});