/**
 * Identity CapResult deny consistency on MiniHost bus fakes.
 *
 * Judge ≠ builder: deny codes and the granted stub snapshot are hardcoded
 * here, not read back from production constants. A method that returns
 * `photos_stub` or throws would mean the door grew a second shape.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  IDENTITY_METHODS,
  type CapResult,
  type IdentityCapability,
  type IdentityMethod,
} from './types';
import { createIdentityFake } from './fakes';
import { createMiniHost } from './host';
import { HEALTH_MINI_MANIFEST, mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import { mountTestBillingMini } from './billingProbe';
import { TEST_NO_IDENTITY_MANIFEST, mountTestNoIdentityMini } from './identityProbe';
import { MINI_LAST_SEGMENT_ROUTES, resolveMiniDeeplink } from './deeplink';
import { lookupMini } from '../minis/registry';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

const SCOPE_DENIED: CapResult<never> = { ok: false, code: 'scope_denied' };
const GUEST_STUB: CapResult<{ missionId: null; callSign: null }> = {
  ok: true,
  value: { missionId: null, callSign: null },
};

function callIdentity(identity: IdentityCapability, method: IdentityMethod): CapResult<unknown> {
  return identity[method]();
}

function assertMounted<T extends { ok: boolean }>(
  result: T
): asserts result is T & { ok: true } {
  assert.equal(result.ok, true, 'mount must succeed');
}

test('closed identity methods are read', () => {
  assert.deepEqual([...IDENTITY_METHODS], ['read']);
  const fake = createIdentityFake(HEALTH_MINI_MANIFEST);
  assert.deepEqual(Object.keys(fake).sort(), [...IDENTITY_METHODS].sort());
});

test('test.noidentity: every identity method is scope_denied', () => {
  const mounted = mountTestNoIdentityMini(createMiniHost());
  assertMounted(mounted);
  assert.equal(mounted.value.manifest.id, 'test.noidentity');
  for (const method of IDENTITY_METHODS) {
    const result = callIdentity(mounted.value.identity, method);
    assert.deepEqual(result, SCOPE_DENIED, `${method} must be scope_denied`);
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.code, 'scope_denied');
    assert.notEqual(result.code, 'photos_stub');
    assert.notEqual(result.code, 'stub');
  }
});

test('test.billing: every identity method is the same scope_denied', () => {
  const mounted = mountTestBillingMini(createMiniHost());
  assertMounted(mounted);
  for (const method of IDENTITY_METHODS) {
    const result = callIdentity(mounted.value.identity, method);
    assert.deepEqual(result, SCOPE_DENIED, `${method} must be scope_denied`);
  }
});

test('Health: every identity method is stub success', () => {
  const mounted = mountHealthMini(createMiniHost());
  assertMounted(mounted);
  assert.equal(mounted.value.manifest.id, 'l1.health');
  for (const method of IDENTITY_METHODS) {
    const result = callIdentity(mounted.value.identity, method);
    assert.deepEqual(result, GUEST_STUB, `${method} must stub-succeed when granted`);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.notEqual(result.value, undefined);
  }
});

test('ClearShot: every identity method is stub success', () => {
  const mounted = mountClearShotMini(createMiniHost());
  assertMounted(mounted);
  assert.equal(mounted.value.manifest.id, 'utility.clearshot');
  for (const method of IDENTITY_METHODS) {
    const result = callIdentity(mounted.value.identity, method);
    assert.deepEqual(result, GUEST_STUB, `${method} must stub-succeed when granted`);
    assert.equal(result.ok, true);
  }
});

test('granted identity injects the snapshot — nothing is minted', () => {
  const host = createMiniHost({ identity: { missionId: 7, callSign: '07' } });
  const health = mountHealthMini(host);
  const shot = mountClearShotMini(host);
  assertMounted(health);
  assertMounted(shot);
  const injected: CapResult<{ missionId: number; callSign: string }> = {
    ok: true,
    value: { missionId: 7, callSign: '07' },
  };
  for (const method of IDENTITY_METHODS) {
    assert.deepEqual(callIdentity(health.value.identity, method), injected);
    assert.deepEqual(callIdentity(shot.value.identity, method), injected);
  }
  const denied = mountTestNoIdentityMini(host);
  assertMounted(denied);
  for (const method of IDENTITY_METHODS) {
    assert.deepEqual(callIdentity(denied.value.identity, method), SCOPE_DENIED);
  }
});

test('test.noidentity is not a product mount — unknown to deeplink and registry', () => {
  assert.equal(Object.hasOwn(MINI_LAST_SEGMENT_ROUTES, 'noidentity'), false);
  assert.deepEqual(resolveMiniDeeplink('mission://minis/noidentity'), {
    ok: false,
    code: 'unknown_mini',
  });
  assert.deepEqual(lookupMini('test.noidentity'), { ok: false, code: 'unknown_mini' });
  assert.equal(TEST_NO_IDENTITY_MANIFEST.id, 'test.noidentity');
  assert.equal(TEST_NO_IDENTITY_MANIFEST.scopes.includes('identity.read'), false);
  assert.equal(TEST_NO_IDENTITY_MANIFEST.scopes.includes('identity.write'), false);
  assert.notEqual(TEST_NO_IDENTITY_MANIFEST.id, 'utility.clearshot');
  assert.notEqual(TEST_NO_IDENTITY_MANIFEST.id, 'l1.health');
  assert.notEqual(TEST_NO_IDENTITY_MANIFEST.id, 'test.billing');
});

test('identity fakes never import Supabase or auth UI', () => {
  for (const file of ['fakes.ts', 'identityProbe.ts', 'types.ts', 'host.ts']) {
    const src = sourceOf(file);
    assert.equal(/from\s+['"][^'"]*supabase/i.test(src), false, `${file} must not import supabase`);
    assert.equal(src.includes('createClient'), false, `${file} must not open a Supabase client`);
    assert.equal(src.includes('premiumServer'), false, `${file} must not import premiumServer`);
    assert.equal(/signInWith/i.test(src), false, `${file} must not sign in`);
    assert.equal(src.includes('AuthProvider'), false, `${file} must not mount auth UI`);
    assert.equal(src.includes('/login'), false, `${file} must not route to login`);
    assert.equal(src.includes('auth.users'), false, `${file} must not touch auth.users`);
  }
});
