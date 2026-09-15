/**
 * MiniHost.mount refuses an id that is not in the host allowlist.
 *
 * Judge ≠ builder: deny codes are hardcoded here, not read back from
 * HOST_MOUNT_ALLOWLIST. A refuse that throws, returns ok, or lists the
 * unknown id would mean the host grew a silent invented mini.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { ModuleManifest } from '../../../packages/mw-core/src/module';
import { lookupMini } from '../minis/registry';
import { createMiniHost } from './host';
import { mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import type { CapResult, MountedMini } from './types';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

const UNKNOWN: CapResult<never> = { ok: false, code: 'unknown_mini' };
const ALREADY_MOUNTED: CapResult<never> = { ok: false, code: 'already_mounted' };
const UNKNOWN_ID = 'totally.unknown';
const HEALTH_ID = 'l1.health';
const CLEARSHOT_ID = 'utility.clearshot';

/** Hardcoded — do not import HEALTH_MINI_SCOPES. */
const HEALTH_DECLARED = ['identity.read', 'storage.read', 'storage.write'] as const;

/** Valid-looking unknown — assertModuleManifest would accept this. */
const UNKNOWN_MANIFEST: ModuleManifest = {
  id: UNKNOWN_ID,
  name: 'Unknown',
  version: '0.1.0',
  scopes: ['identity.read'],
  surfaces: ['web'],
  freeCore: true,
  entry: '/unknown',
};

function assertMounted(result: CapResult<MountedMini>): MountedMini {
  assert.equal(result.ok, true, 'mount must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

test('mount of totally.unknown is unknown_mini and does not throw', () => {
  const host = createMiniHost();
  let threw = false;
  let refused: CapResult<MountedMini> | undefined;
  try {
    refused = host.mount(UNKNOWN_ID);
  } catch {
    threw = true;
  }
  assert.equal(threw, false);
  assert.deepEqual(refused, UNKNOWN);
  assert.equal(refused?.ok, false);
  if (!refused || refused.ok) return;
  assert.equal(refused.code, 'unknown_mini');
  assert.notEqual(refused.code, 'stub');
  assert.notEqual(refused.code, 'already_mounted');
  assert.notEqual(refused.code, 'scope_denied');
});

test('failed unknown mount does not appear in listMounted', () => {
  const host = createMiniHost();
  assert.deepEqual(host.mount(UNKNOWN_ID), UNKNOWN);
  assert.deepEqual(host.listMounted(), { ok: true, value: [] });
  assert.deepEqual(host.listMounted(UNKNOWN_ID), UNKNOWN);

  const viaManifest = host.mount(UNKNOWN_MANIFEST);
  assert.deepEqual(viaManifest, UNKNOWN);
  assert.deepEqual(host.listMounted(), { ok: true, value: [] });
  assert.deepEqual(host.listMounted(UNKNOWN_ID), UNKNOWN);
  assert.deepEqual(host.listMounted(UNKNOWN_ID, 'identity.read'), UNKNOWN);
});

test('valid unknown manifest is unknown_mini — not a silent invented mini', () => {
  const host = createMiniHost();
  const refused = host.mount(UNKNOWN_MANIFEST);
  assert.deepEqual(refused, UNKNOWN);
  assert.equal(refused.ok, false);
  if (refused.ok) return;
  assert.equal(refused.code, 'unknown_mini');
  assert.notEqual(refused.code, 'stub');
});

test('invalid unknown remount stays stub and does not list', () => {
  const host = createMiniHost();
  const bad = host.mount({
    ...UNKNOWN_MANIFEST,
    entry: 'active',
  });
  assert.deepEqual(bad, { ok: false, code: 'stub' });
  assert.equal(bad.ok, false);
  if (bad.ok) return;
  assert.equal(bad.code, 'stub');
  assert.notEqual(bad.code, 'unknown_mini');
  assert.deepEqual(host.listMounted(), { ok: true, value: [] });
});

test('known test minis still mount / already_mounted / unmount', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  assert.equal(health.manifest.id, HEALTH_ID);
  assert.deepEqual(health.identity.read(), {
    ok: true,
    value: { missionId: null, callSign: null },
  });
  assert.equal(health.storage.set('secret', 'health-only').ok, true);
  assert.deepEqual(host.mount(UNKNOWN_ID), UNKNOWN);
  assert.deepEqual(mountHealthMini(host), ALREADY_MOUNTED);

  const listed = host.listMounted();
  assert.equal(listed.ok, true);
  if (!listed.ok) return;
  assert.equal(listed.value.length, 1);
  assert.equal(listed.value[0]?.id, HEALTH_ID);
  assert.deepEqual([...(listed.value[0]?.scopes ?? [])], [...HEALTH_DECLARED]);
  assert.equal(
    listed.value.some((row) => row.id === UNKNOWN_ID),
    false
  );

  const shot = assertMounted(mountClearShotMini(host));
  assert.equal(shot.manifest.id, CLEARSHOT_ID);
  assert.deepEqual(mountClearShotMini(host), ALREADY_MOUNTED);

  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountHealthMini(host));
  const leftover = remounted.storage.get('secret');
  assert.deepEqual(leftover, { ok: true, value: undefined });
  if (!leftover.ok) return;
  assert.notEqual(leftover.value, 'health-only');
});

test('failed unknown mount does not leave a store for a later known mount', () => {
  const host = createMiniHost();
  assert.deepEqual(host.mount(UNKNOWN_MANIFEST), UNKNOWN);
  const health = assertMounted(mountHealthMini(host));
  assert.deepEqual(health.storage.get('secret'), { ok: true, value: undefined });
  assert.deepEqual(health.storage.set('note', 'ok'), { ok: true, value: undefined });
  assert.deepEqual(health.storage.get('note'), { ok: true, value: 'ok' });
});

test('totally.unknown is not a product registry row', () => {
  assert.deepEqual(lookupMini(UNKNOWN_ID), UNKNOWN);
  assert.deepEqual(lookupMini('l1.health'), UNKNOWN);
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
  assert.equal(hostSrc.includes('HOST_MOUNT_ALLOWLIST'), true);
  assert.equal(hostSrc.includes('isKnownMountId'), true);
  assert.equal(hostSrc.includes("code: 'unknown_mini'"), true);
  assert.equal(hostSrc.includes(UNKNOWN_ID), false);
  assert.equal(/typeof target === 'string'/.test(hostSrc), true);
});
