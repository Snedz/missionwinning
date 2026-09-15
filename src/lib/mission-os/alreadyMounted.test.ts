/**
 * MiniHost.mount refuses a second mount of the same id while mounted.
 *
 * Judge ≠ builder: deny codes are hardcoded here, not read back from
 * production constants. A remount that throws, returns ok, or replaces
 * the live instance would mean the host grew a silent swap.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { ModuleScope } from '../../../packages/mw-core/src/module';
import { createMiniHost } from './host';
import { mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import type { CapResult, MountedMini } from './types';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

const ALREADY_MOUNTED: CapResult<never> = { ok: false, code: 'already_mounted' };
const HEALTH_ID = 'l1.health';
const CLEARSHOT_ID = 'utility.clearshot';

/** Hardcoded — do not import HEALTH_MINI_SCOPES. */
const HEALTH_DECLARED = ['identity.read', 'storage.read', 'storage.write'] as const;

function assertMounted(result: CapResult<MountedMini>): MountedMini {
  assert.equal(result.ok, true, 'mount must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

test('first mount of a known test mini succeeds', () => {
  const first = assertMounted(mountHealthMini(createMiniHost()));
  assert.equal(first.manifest.id, HEALTH_ID);
  assert.deepEqual(first.identity.read(), {
    ok: true,
    value: { missionId: null, callSign: null },
  });
  assert.deepEqual(first.storage.set('note', 'ok'), { ok: true, value: undefined });
  assert.deepEqual(first.storage.get('note'), { ok: true, value: 'ok' });
});

test('second mount of the same id while mounted is already_mounted', () => {
  const host = createMiniHost();
  const first = assertMounted(mountHealthMini(host));
  assert.equal(first.storage.set('secret', 'health-only').ok, true);

  const second = mountHealthMini(host);
  assert.deepEqual(second, ALREADY_MOUNTED);
  assert.equal(second.ok, false);
  if (second.ok) return;
  assert.equal(second.code, 'already_mounted');
  assert.notEqual(second.code, 'unknown_mini');
  assert.notEqual(second.code, 'stub');
  assert.notEqual(second.code, 'scope_denied');

  assert.deepEqual(first.storage.get('secret'), { ok: true, value: 'health-only' });
});

test('refused remount does not replace the live instance or inventory scopes', () => {
  const host = createMiniHost();
  const first = assertMounted(mountHealthMini(host));
  assert.equal(first.storage.set('secret', 'health-only').ok, true);

  const extraScopes: readonly ModuleScope[] = [...HEALTH_DECLARED, 'billing.read'];
  const swapped = host.mount({
    id: HEALTH_ID,
    name: 'Health',
    version: '0.1.0',
    scopes: extraScopes,
    surfaces: ['web'],
    freeCore: true,
    entry: 'mission://minis/health',
  });
  assert.deepEqual(swapped, ALREADY_MOUNTED);

  const listed = host.listMounted();
  assert.equal(listed.ok, true);
  if (!listed.ok) return;
  assert.equal(listed.value.length, 1);
  assert.equal(listed.value[0]?.id, HEALTH_ID);
  assert.deepEqual([...(listed.value[0]?.scopes ?? [])], [...HEALTH_DECLARED]);
  assert.equal(listed.value[0]?.scopes.includes('billing.read'), false);

  const peek = host.listMounted(HEALTH_ID);
  assert.equal(peek.ok, true);
  if (!peek.ok) return;
  assert.deepEqual([...peek.value.scopes], [...HEALTH_DECLARED]);
  assert.deepEqual(host.listMounted(HEALTH_ID, 'billing.read'), {
    ok: false,
    code: 'scope_denied',
  });

  assert.deepEqual(first.storage.get('secret'), { ok: true, value: 'health-only' });
  assert.deepEqual(first.billing.read(), { ok: false, code: 'scope_denied' });
});

test('after unmount, remount succeeds and cannot read leftovers', () => {
  const host = createMiniHost();
  const first = assertMounted(mountHealthMini(host));
  assert.equal(first.storage.set('secret', 'health-only').ok, true);
  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });

  const remounted = assertMounted(mountHealthMini(host));
  const leftover = remounted.storage.get('secret');
  assert.deepEqual(leftover, { ok: true, value: undefined });
  if (!leftover.ok) return;
  assert.notEqual(leftover.value, 'health-only');
});

test('listMounted is one entry while mounted and zero after unmount', () => {
  const host = createMiniHost();
  assert.deepEqual(host.listMounted(), { ok: true, value: [] });

  assertMounted(mountHealthMini(host));
  const whileMounted = host.listMounted();
  assert.equal(whileMounted.ok, true);
  if (!whileMounted.ok) return;
  assert.equal(whileMounted.value.length, 1);
  assert.equal(whileMounted.value[0]?.id, HEALTH_ID);

  assert.deepEqual(mountHealthMini(host), ALREADY_MOUNTED);
  const stillOne = host.listMounted();
  assert.equal(stillOne.ok, true);
  if (!stillOne.ok) return;
  assert.equal(stillOne.value.length, 1);

  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  assert.deepEqual(host.listMounted(), { ok: true, value: [] });
  assert.deepEqual(host.listMounted(HEALTH_ID), { ok: false, code: 'unknown_mini' });
});

test('a different id still mounts while another mini is live', () => {
  const host = createMiniHost();
  assertMounted(mountHealthMini(host));
  const shot = assertMounted(mountClearShotMini(host));
  assert.equal(shot.manifest.id, CLEARSHOT_ID);
  assert.deepEqual(mountHealthMini(host), ALREADY_MOUNTED);
  assert.deepEqual(mountClearShotMini(host), ALREADY_MOUNTED);

  const listed = host.listMounted();
  assert.equal(listed.ok, true);
  if (!listed.ok) return;
  assert.equal(listed.value.length, 2);
});

test('invalid remount stays stub and does not replace the live instance', () => {
  const host = createMiniHost();
  const first = assertMounted(mountHealthMini(host));
  assert.equal(first.storage.set('secret', 'health-only').ok, true);

  const bad = host.mount({
    id: HEALTH_ID,
    name: 'Health',
    version: '0.1.0',
    scopes: [...HEALTH_DECLARED],
    surfaces: ['web'],
    freeCore: true,
    entry: 'active',
  });
  assert.deepEqual(bad, { ok: false, code: 'stub' });
  assert.equal(bad.ok, false);
  if (bad.ok) return;
  assert.equal(bad.code, 'stub');
  assert.notEqual(bad.code, 'already_mounted');

  const listed = host.listMounted();
  assert.equal(listed.ok, true);
  if (!listed.ok) return;
  assert.equal(listed.value.length, 1);
  assert.deepEqual(first.storage.get('secret'), { ok: true, value: 'health-only' });
});

test('host refuse never imports Stripe, camera, or Android wiring', () => {
  for (const file of ['host.ts', 'types.ts', 'fakes.ts', 'health.ts', 'clearshot.ts']) {
    const src = sourceOf(file);
    assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false, `${file} must not import Stripe`);
    assert.equal(src.includes('premiumServer'), false, `${file} must not import premiumServer`);
    assert.equal(src.includes('getUserMedia'), false, `${file} must not open a camera`);
    assert.equal(/android\.provider\.MediaStore/i.test(src), false, `${file} must not import MediaStore`);
    assert.equal(src.includes('apps/android'), false, `${file} must not wire Android`);
  }

  const hostSrc = sourceOf('host.ts');
  assert.equal(hostSrc.includes("code: 'already_mounted'"), true);
  assert.equal(hostSrc.includes('mounted.has(manifest.id)'), true);
});
