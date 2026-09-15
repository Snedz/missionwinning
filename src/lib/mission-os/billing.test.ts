/**
 * Billing CapResult deny consistency on MiniHost bus fakes.
 *
 * Judge ≠ builder: deny codes and the granted hold value are hardcoded
 * here, not read back from production constants. A method that returns
 * `photos_stub` or throws would mean the door grew a second shape.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  BILLING_METHODS,
  type BillingCapability,
  type BillingMethod,
  type CapResult,
} from './types';
import { createBillingFake, createBillingHold } from './fakes';
import { createMiniHost } from './host';
import { mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import { TEST_BILLING_MANIFEST, mountTestBillingMini } from './billingProbe';
import { MINI_LAST_SEGMENT_ROUTES, resolveMiniDeeplink } from './deeplink';
import { lookupMini } from '../minis/registry';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

const SCOPE_DENIED: CapResult<never> = { ok: false, code: 'scope_denied' };

function callBilling(billing: BillingCapability, method: BillingMethod): CapResult<unknown> {
  return billing[method]();
}

function assertMounted<T extends { ok: boolean }>(
  result: T
): asserts result is T & { ok: true } {
  assert.equal(result.ok, true, 'mount must succeed');
}

test('closed billing methods are read + checkout + portal', () => {
  assert.deepEqual([...BILLING_METHODS], ['read', 'checkout', 'portal']);
  const fake = createBillingFake(TEST_BILLING_MANIFEST);
  assert.deepEqual(Object.keys(fake).sort(), [...BILLING_METHODS].sort());
  const hold = createBillingHold();
  assert.deepEqual(Object.keys(hold).sort(), [...BILLING_METHODS].sort());
});

test('ClearShot: every billing method is scope_denied', () => {
  const mounted = mountClearShotMini(createMiniHost());
  assertMounted(mounted);
  for (const method of BILLING_METHODS) {
    const result = callBilling(mounted.value.billing, method);
    assert.deepEqual(result, SCOPE_DENIED, `${method} must be scope_denied`);
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.code, 'scope_denied');
    assert.notEqual(result.code, 'photos_stub');
    assert.notEqual(result.code, 'stub');
  }
});

test('Health: every billing method is scope_denied', () => {
  const mounted = mountHealthMini(createMiniHost());
  assertMounted(mounted);
  for (const method of BILLING_METHODS) {
    const result = callBilling(mounted.value.billing, method);
    assert.deepEqual(result, SCOPE_DENIED, `${method} must be scope_denied`);
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.code, 'scope_denied');
    assert.notEqual(result.code, 'photos_stub');
    assert.notEqual(result.code, 'stub');
  }
});

test('test-only billing grant: stub success without Stripe', () => {
  const mounted = mountTestBillingMini(createMiniHost());
  assertMounted(mounted);
  assert.equal(mounted.value.manifest.id, 'test.billing');
  assert.deepEqual(mounted.value.billing.read(), {
    ok: true,
    value: { bundle: 'none', muted: true },
  });
  assert.deepEqual(mounted.value.billing.checkout(), { ok: true, value: { held: true } });
  assert.deepEqual(mounted.value.billing.portal(), { ok: true, value: { held: true } });

  for (const method of BILLING_METHODS) {
    const result = callBilling(mounted.value.billing, method);
    assert.equal(result.ok, true, `${method} must stub-succeed when granted`);
  }
});

test('test.billing is not a product mount — unknown to deeplink and registry', () => {
  assert.equal(Object.hasOwn(MINI_LAST_SEGMENT_ROUTES, 'billing'), false);
  assert.deepEqual(resolveMiniDeeplink('mission://minis/billing'), {
    ok: false,
    code: 'unknown_mini',
  });
  assert.deepEqual(lookupMini('test.billing'), { ok: false, code: 'unknown_mini' });
  assert.equal(TEST_BILLING_MANIFEST.id, 'test.billing');
  assert.notEqual(TEST_BILLING_MANIFEST.id, 'utility.clearshot');
  assert.notEqual(TEST_BILLING_MANIFEST.id, 'l1.health');
});

test('billing fakes never import Stripe or open checkout', () => {
  for (const file of ['fakes.ts', 'billingProbe.ts', 'types.ts', 'host.ts']) {
    const src = sourceOf(file);
    assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false, `${file} must not import Stripe`);
    assert.equal(src.includes('premiumServer'), false, `${file} must not import premiumServer`);
    assert.equal(/checkout\.sessions/i.test(src), false, `${file} must not open checkout`);
    assert.equal(src.includes('stripe.com'), false, `${file} must not name stripe.com`);
    assert.equal(src.includes('STRIPE'), false, `${file} must not name Stripe keys`);
  }
});
