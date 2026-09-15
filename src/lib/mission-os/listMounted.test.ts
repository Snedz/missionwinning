/**
 * MiniHost.listMounted CapResult inventory.
 *
 * Judge ≠ builder: expected ids, declared scopes, and deny codes are
 * hardcoded here — not read back from HEALTH_MINI_SCOPES /
 * UTILITY_CLEARSHOT_MANIFEST. An inventory that lists billing on Health,
 * or treats a never-mounted id as scope_denied, would mean the door
 * grew a second shape.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { UTILITY_CLEARSHOT_MANIFEST } from '../../../packages/mw-core/src/module';
import type { CapResult, MiniInventoryEntry } from './types';
import { createMiniHost } from './host';
import { mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

const UNKNOWN: CapResult<never> = { ok: false, code: 'unknown_mini' };
const SCOPE_DENIED: CapResult<never> = { ok: false, code: 'scope_denied' };

const HEALTH_ID = 'l1.health';
const CLEARSHOT_ID = 'utility.clearshot';
const NEVER_ID = 'utility.probe';

/** Hardcoded — do not import HEALTH_MINI_SCOPES. */
const HEALTH_DECLARED = ['identity.read', 'storage.read', 'storage.write'] as const;
/** Hardcoded — do not import UTILITY_CLEARSHOT_MANIFEST.scopes. */
const CLEARSHOT_DECLARED = [
  'identity.read',
  'photos.read',
  'photos.write',
  'storage.write',
] as const;

function assertOk<T>(result: CapResult<T>): T {
  assert.equal(result.ok, true, 'CapResult must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

function byId(
  entries: readonly MiniInventoryEntry[],
  id: string
): MiniInventoryEntry | undefined {
  return entries.find((row) => row.id === id);
}

test('empty host inventory is an empty ok list — not unknown_mini', () => {
  const listed = createMiniHost().listMounted();
  assert.deepEqual(listed, { ok: true, value: [] });
  assert.notEqual(listed.ok, false);
  if (listed.ok) assert.notEqual(listed.value.length, 1);
});

test('mounted inventory lists ids + declared scopes only', () => {
  const host = createMiniHost();
  assert.equal(mountHealthMini(host).ok, true);
  assert.equal(mountClearShotMini(host).ok, true);

  const listed = assertOk(host.listMounted());
  assert.equal(listed.length, 2);

  const health = byId(listed, HEALTH_ID);
  assert.ok(health, 'l1.health must be listed');
  assert.deepEqual([...health.scopes], [...HEALTH_DECLARED]);
  assert.equal(health.scopes.includes('billing.read'), false);
  assert.equal(health.scopes.includes('photos.read'), false);
  assert.equal(health.scopes.includes('photos.write'), false);

  const shot = byId(listed, CLEARSHOT_ID);
  assert.ok(shot, 'utility.clearshot must be listed');
  assert.deepEqual([...shot.scopes], [...CLEARSHOT_DECLARED]);
  assert.equal(shot.scopes.includes('billing.read'), false);
  assert.equal(shot.scopes.includes('storage.read'), false);
  assert.equal(shot.scopes.includes('health.write'), false);

  assert.equal(byId(listed, NEVER_ID), undefined);
});

test('listMounted(id) of a mounted mini returns declared scopes only', () => {
  const host = createMiniHost();
  assert.equal(mountHealthMini(host).ok, true);

  const health = assertOk(host.listMounted(HEALTH_ID));
  assert.equal(health.id, HEALTH_ID);
  assert.deepEqual([...health.scopes], [...HEALTH_DECLARED]);
  assert.equal(health.scopes.includes('billing.read'), false);
});

test('never-mounted id is unknown_mini — not scope_denied, not an empty row', () => {
  const host = createMiniHost();
  assert.deepEqual(host.listMounted(NEVER_ID), UNKNOWN);
  assert.deepEqual(host.listMounted(HEALTH_ID), UNKNOWN);
  assert.deepEqual(host.listMounted(CLEARSHOT_ID), UNKNOWN);

  const miss = host.listMounted(NEVER_ID);
  assert.equal(miss.ok, false);
  if (miss.ok) return;
  assert.equal(miss.code, 'unknown_mini');
  assert.notEqual(miss.code, 'scope_denied');
  assert.notEqual(miss.code, 'stub');
});

test('undeclared peek on a mounted mini is scope_denied', () => {
  const host = createMiniHost();
  assert.equal(mountHealthMini(host).ok, true);
  assert.equal(mountClearShotMini(host).ok, true);

  assert.deepEqual(host.listMounted(HEALTH_ID, 'billing.read'), SCOPE_DENIED);
  assert.deepEqual(host.listMounted(HEALTH_ID, 'photos.read'), SCOPE_DENIED);
  assert.deepEqual(host.listMounted(HEALTH_ID, 'health.write'), SCOPE_DENIED);
  assert.deepEqual(host.listMounted(CLEARSHOT_ID, 'billing.read'), SCOPE_DENIED);
  assert.deepEqual(host.listMounted(CLEARSHOT_ID, 'storage.read'), SCOPE_DENIED);

  const denied = host.listMounted(HEALTH_ID, 'billing.read');
  assert.equal(denied.ok, false);
  if (denied.ok) return;
  assert.equal(denied.code, 'scope_denied');
  assert.notEqual(denied.code, 'unknown_mini');
  assert.notEqual(denied.code, 'stub');
});

test('declared peek on a mounted mini is ok', () => {
  const host = createMiniHost();
  assert.equal(mountHealthMini(host).ok, true);
  assert.equal(mountClearShotMini(host).ok, true);

  assert.deepEqual(host.listMounted(HEALTH_ID, 'identity.read'), {
    ok: true,
    value: undefined,
  });
  assert.deepEqual(host.listMounted(HEALTH_ID, 'storage.read'), {
    ok: true,
    value: undefined,
  });
  assert.deepEqual(host.listMounted(CLEARSHOT_ID, 'photos.write'), {
    ok: true,
    value: undefined,
  });
  assert.deepEqual(host.listMounted(CLEARSHOT_ID, 'storage.write'), {
    ok: true,
    value: undefined,
  });
});

test('never-mounted id + any scope is unknown_mini (id first)', () => {
  const host = createMiniHost();
  assert.deepEqual(host.listMounted(NEVER_ID, 'identity.read'), UNKNOWN);
  assert.deepEqual(host.listMounted(HEALTH_ID, 'identity.read'), UNKNOWN);
  assert.deepEqual(host.listMounted(HEALTH_ID, 'billing.read'), UNKNOWN);

  const miss = host.listMounted(NEVER_ID, 'identity.read');
  assert.equal(miss.ok, false);
  if (miss.ok) return;
  assert.equal(miss.code, 'unknown_mini');
  assert.notEqual(miss.code, 'scope_denied');
});

test('unmount drops that id; remount without unmount stays one row', () => {
  const host = createMiniHost();
  assert.equal(mountHealthMini(host).ok, true);
  assert.equal(mountClearShotMini(host).ok, true);
  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });

  const after = assertOk(host.listMounted());
  assert.equal(after.length, 1);
  assert.equal(byId(after, HEALTH_ID), undefined);
  assert.ok(byId(after, CLEARSHOT_ID));
  assert.deepEqual(host.listMounted(HEALTH_ID), UNKNOWN);
  assert.deepEqual(host.listMounted(HEALTH_ID, 'identity.read'), UNKNOWN);

  assert.equal(mountClearShotMini(host).ok, true);
  const remounted = assertOk(host.listMounted());
  assert.equal(remounted.filter((row) => row.id === CLEARSHOT_ID).length, 1);
});

test('failed mount is not listed', () => {
  const host = createMiniHost();
  const bad = host.mount({
    ...UTILITY_CLEARSHOT_MANIFEST,
    entry: '/active',
  });
  assert.deepEqual(bad, { ok: false, code: 'stub' });
  assert.deepEqual(host.listMounted(), { ok: true, value: [] });
  assert.deepEqual(host.listMounted(CLEARSHOT_ID), UNKNOWN);
});

test('returned scopes are a copy — mutating them does not rewrite the host', () => {
  const host = createMiniHost();
  assert.equal(mountHealthMini(host).ok, true);
  const first = assertOk(host.listMounted(HEALTH_ID));
  (first.scopes as string[]).push('billing.read');
  const listed = assertOk(host.listMounted());
  listed[0] && ((listed[0].scopes as string[]).push('photos.read'));

  const again = assertOk(host.listMounted(HEALTH_ID));
  assert.deepEqual([...again.scopes], [...HEALTH_DECLARED]);
  assert.equal(again.scopes.includes('billing.read'), false);
  assert.equal(again.scopes.includes('photos.read'), false);
});

test('inventory fakes never import Stripe, camera, or Android wiring', () => {
  for (const file of ['host.ts', 'types.ts', 'fakes.ts', 'health.ts', 'clearshot.ts']) {
    const src = sourceOf(file);
    assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false, `${file} must not import Stripe`);
    assert.equal(src.includes('premiumServer'), false, `${file} must not import premiumServer`);
    assert.equal(src.includes('getUserMedia'), false, `${file} must not open a camera`);
    assert.equal(/android\.provider\.MediaStore/i.test(src), false, `${file} must not import MediaStore`);
    assert.equal(src.includes('apps/android'), false, `${file} must not wire Android`);
    assert.equal(src.includes('progressPhotos'), false, `${file} must not reach progressPhotos`);
  }
});
