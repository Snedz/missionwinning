/**
 * MiniHost.unmount refuses an id that is not currently mounted.
 *
 * Judge ≠ builder: deny codes are hardcoded here, not read back from
 * production constants. A refuse that throws, returns ok, or reuses
 * unknown_mini would mean the host grew a silent lifecycle lie.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createMiniHost } from './host';
import { mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import type { CapResult, MountedMini } from './types';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

const NOT_MOUNTED: CapResult<never> = { ok: false, code: 'not_mounted' };
const UNKNOWN: CapResult<never> = { ok: false, code: 'unknown_mini' };
const ALREADY_MOUNTED: CapResult<never> = { ok: false, code: 'already_mounted' };
const NEVER_MOUNTED_ID = 'never.mounted';
const HEALTH_ID = 'l1.health';
const CLEARSHOT_ID = 'utility.clearshot';

function assertMounted(result: CapResult<MountedMini>): MountedMini {
  assert.equal(result.ok, true, 'mount must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

test('unmount of never.mounted is not_mounted and does not throw', () => {
  const host = createMiniHost();
  let threw = false;
  let refused: CapResult<void> | undefined;
  try {
    refused = host.unmount(NEVER_MOUNTED_ID);
  } catch {
    threw = true;
  }
  assert.equal(threw, false);
  assert.deepEqual(refused, NOT_MOUNTED);
  assert.equal(refused?.ok, false);
  if (!refused || refused.ok) return;
  assert.equal(refused.code, 'not_mounted');
  assert.notEqual(refused.code, 'unknown_mini');
  assert.notEqual(refused.code, 'already_mounted');
  assert.notEqual(refused.code, 'stub');
  assert.notEqual(refused.code, 'scope_denied');
});

test('unmount after successful mount is ok; listMounted empty; remount has no leftovers', () => {
  const host = createMiniHost();
  const first = assertMounted(mountHealthMini(host));
  assert.equal(first.storage.set('secret', 'health-only').ok, true);

  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  assert.deepEqual(host.listMounted(), { ok: true, value: [] });
  assert.deepEqual(host.listMounted(HEALTH_ID), UNKNOWN);

  const remounted = assertMounted(mountHealthMini(host));
  const leftover = remounted.storage.get('secret');
  assert.deepEqual(leftover, { ok: true, value: undefined });
  if (!leftover.ok) return;
  assert.notEqual(leftover.value, 'health-only');
});

test('double-unmount: second call is not_mounted', () => {
  const host = createMiniHost();
  assertMounted(mountHealthMini(host));
  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });

  let threw = false;
  let second: CapResult<void> | undefined;
  try {
    second = host.unmount(HEALTH_ID);
  } catch {
    threw = true;
  }
  assert.equal(threw, false);
  assert.deepEqual(second, NOT_MOUNTED);
  assert.equal(second?.ok, false);
  if (!second || second.ok) return;
  assert.equal(second.code, 'not_mounted');
  assert.notEqual(second.code, 'unknown_mini');
  assert.notEqual(second.code, 'already_mounted');
});

test('known-but-not-mounted id is not_mounted — not unknown_mini', () => {
  const host = createMiniHost();
  assert.deepEqual(host.unmount(HEALTH_ID), NOT_MOUNTED);
  assert.deepEqual(host.unmount(CLEARSHOT_ID), NOT_MOUNTED);
  assert.deepEqual(host.listMounted(HEALTH_ID), UNKNOWN);
  assert.deepEqual(host.mount(NEVER_MOUNTED_ID), UNKNOWN);
});

test('unknown_mini and already_mounted stay unchanged', () => {
  const host = createMiniHost();
  assert.deepEqual(host.mount(NEVER_MOUNTED_ID), UNKNOWN);
  const health = assertMounted(mountHealthMini(host));
  assert.equal(health.manifest.id, HEALTH_ID);
  assert.deepEqual(mountHealthMini(host), ALREADY_MOUNTED);
  assert.deepEqual(host.mount(NEVER_MOUNTED_ID), UNKNOWN);
  assert.deepEqual(host.listMounted(NEVER_MOUNTED_ID), UNKNOWN);

  const shot = assertMounted(mountClearShotMini(host));
  assert.equal(shot.manifest.id, CLEARSHOT_ID);
  assert.deepEqual(mountClearShotMini(host), ALREADY_MOUNTED);
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
  assert.equal(hostSrc.includes("code: 'not_mounted'"), true);
  assert.equal(hostSrc.includes("code: 'unknown_mini'"), true);
  assert.equal(hostSrc.includes("code: 'already_mounted'"), true);
  assert.equal(hostSrc.includes(NEVER_MOUNTED_ID), false);
  assert.equal(hostSrc.includes('mounted.has(id)'), true);
});
