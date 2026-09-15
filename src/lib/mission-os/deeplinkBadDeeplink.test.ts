/**
 * Malformed / wrong-scheme / non-minis deeplink is bad_deeplink.
 *
 * Judge ≠ builder: deny codes and the accept URIs are hardcoded here,
 * not read back from MINI_LAST_SEGMENT_ROUTES. A refuse that throws,
 * mounts, or reuses unknown_mini for a non-minis URI would mean the
 * shape gate vanished into the table-miss code.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  mountMiniByDeeplink,
  resolveMiniByLastSegment,
  resolveMiniDeeplink,
} from './deeplink';
import { createMiniHost } from './host';
import { mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import type { CapResult, MountedMini } from './types';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

const BAD: CapResult<never> = { ok: false, code: 'bad_deeplink' };
const UNKNOWN: CapResult<never> = { ok: false, code: 'unknown_mini' };
const ALREADY_MOUNTED: CapResult<never> = { ok: false, code: 'already_mounted' };
const NOT_MOUNTED: CapResult<never> = { ok: false, code: 'not_mounted' };

const UNKNOWN_ENTRY = 'mission://minis/totally-unknown';
const HEALTH_ENTRY = 'mission://minis/health';
const CLEARSHOT_ENTRY = 'mission://minis/clearshot';
const HEALTH_ID = 'l1.health';
const CLEARSHOT_ID = 'utility.clearshot';

/** Accept #1 — not a well-formed mission://minis/<segment>. */
const BAD_ENTRIES = ['', 'https://evil', 'mission://other/x', 'mission://minis'] as const;

function assertMounted(result: CapResult<MountedMini>): MountedMini {
  assert.equal(result.ok, true, 'mount must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

function assertBadDeeplink(result: CapResult<unknown>, label: string): void {
  assert.deepEqual(result, BAD, label);
  assert.equal(result.ok, false, label);
  if (result.ok) return;
  assert.equal(result.code, 'bad_deeplink', label);
  assert.notEqual(result.code, 'unknown_mini', label);
  assert.notEqual(result.code, 'not_mounted', label);
  assert.notEqual(result.code, 'already_mounted', label);
  assert.notEqual(result.code, 'stub', label);
  assert.notEqual(result.code, 'scope_denied', label);
}

test('empty / https://evil / mission://other/x / mission://minis are bad_deeplink and do not throw', () => {
  for (const entry of BAD_ENTRIES) {
    let threw = false;
    let resolved: CapResult<unknown> | undefined;
    try {
      resolved = resolveMiniDeeplink(entry);
    } catch {
      threw = true;
    }
    assert.equal(threw, false, `${JSON.stringify(entry)} must not throw`);
    assertBadDeeplink(resolved ?? { ok: true, value: undefined }, JSON.stringify(entry));
  }
});

test('mountMiniByDeeplink of a bad URI does not mount', () => {
  const host = createMiniHost();
  for (const entry of BAD_ENTRIES) {
    let threw = false;
    let refused: CapResult<MountedMini> | undefined;
    try {
      refused = mountMiniByDeeplink(host, entry);
    } catch {
      threw = true;
    }
    assert.equal(threw, false, `${JSON.stringify(entry)} must not throw`);
    assertBadDeeplink(refused ?? { ok: true, value: undefined }, `mount ${JSON.stringify(entry)}`);
  }
  assert.deepEqual(host.listMounted(), { ok: true, value: [] });
  assert.deepEqual(host.listMounted('totally.unknown'), UNKNOWN);
});

test('mission://minis/totally-unknown stays unknown_mini', () => {
  let threw = false;
  let resolved: CapResult<unknown> | undefined;
  try {
    resolved = resolveMiniDeeplink(UNKNOWN_ENTRY);
  } catch {
    threw = true;
  }
  assert.equal(threw, false);
  assert.deepEqual(resolved, UNKNOWN);
  if (!resolved || resolved.ok) return;
  assert.equal(resolved.code, 'unknown_mini');
  assert.notEqual(resolved.code, 'bad_deeplink');

  const host = createMiniHost();
  const mounted = mountMiniByDeeplink(host, UNKNOWN_ENTRY);
  assert.deepEqual(mounted, UNKNOWN);
  assert.deepEqual(host.listMounted(), { ok: true, value: [] });
});

test('known mission://minis/health and mission://minis/clearshot still mount', () => {
  const host = createMiniHost();
  const health = assertMounted(mountMiniByDeeplink(host, HEALTH_ENTRY));
  assert.equal(health.manifest.id, HEALTH_ID);
  assert.equal(health.manifest.entry, HEALTH_ENTRY);
  assert.deepEqual(health.identity.read(), {
    ok: true,
    value: { missionId: null, callSign: null },
  });
  assert.deepEqual(health.photos.read(), { ok: false, code: 'scope_denied' });

  const shot = assertMounted(mountMiniByDeeplink(host, CLEARSHOT_ENTRY));
  assert.equal(shot.manifest.id, CLEARSHOT_ID);
  assert.equal(shot.manifest.entry, CLEARSHOT_ENTRY);
  assert.notEqual(shot.manifest.id, HEALTH_ID);
  assert.deepEqual(shot.photos.read(), { ok: false, code: 'photos_stub' });
  assert.deepEqual(shot.billing.read(), { ok: false, code: 'scope_denied' });

  const listed = host.listMounted();
  assert.equal(listed.ok, true);
  if (!listed.ok) return;
  assert.equal(listed.value.length, 2);
  assert.equal(
    listed.value.some((row) => row.id === HEALTH_ID),
    true
  );
  assert.equal(
    listed.value.some((row) => row.id === CLEARSHOT_ID),
    true
  );
});

test('unknown_mini / already_mounted / not_mounted stay unchanged', () => {
  const host = createMiniHost();
  assert.deepEqual(resolveMiniDeeplink(UNKNOWN_ENTRY), UNKNOWN);
  assert.deepEqual(resolveMiniByLastSegment('totallyunknown'), UNKNOWN);
  assert.deepEqual(host.mount('totally.unknown'), UNKNOWN);
  assert.deepEqual(host.unmount(HEALTH_ID), NOT_MOUNTED);
  assert.deepEqual(host.call(HEALTH_ID, 'identity', 'read'), NOT_MOUNTED);

  const health = assertMounted(mountHealthMini(host));
  assert.equal(health.manifest.id, HEALTH_ID);
  assert.deepEqual(mountHealthMini(host), ALREADY_MOUNTED);
  assert.equal(health.storage.set('secret', 'health-only').ok, true);
  assert.deepEqual(host.call(HEALTH_ID, 'identity', 'read'), {
    ok: true,
    value: { missionId: null, callSign: null },
  });

  const shot = assertMounted(mountClearShotMini(host));
  assert.equal(shot.manifest.id, CLEARSHOT_ID);
  assert.deepEqual(mountClearShotMini(host), ALREADY_MOUNTED);

  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  assert.deepEqual(host.call(HEALTH_ID, 'identity', 'read'), NOT_MOUNTED);
  assert.deepEqual(host.unmount(HEALTH_ID), NOT_MOUNTED);

  const remounted = assertMounted(mountHealthMini(host));
  const leftover = remounted.storage.get('secret');
  assert.deepEqual(leftover, { ok: true, value: undefined });
  if (!leftover.ok) return;
  assert.notEqual(leftover.value, 'health-only');
});

test('deeplink bad_deeplink refuse never imports Stripe, camera, or Android wiring', () => {
  const src = sourceOf('deeplink.ts');
  assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false);
  assert.equal(src.includes('premiumServer'), false);
  assert.equal(src.includes('getUserMedia'), false);
  assert.equal(/android\.provider\.MediaStore/i.test(src), false);
  assert.equal(src.includes('apps/android'), false);
  assert.equal(src.includes("code: 'bad_deeplink'"), true);
  assert.equal(src.includes("code: 'unknown_mini'"), true);
  assert.equal(src.includes(UNKNOWN_ENTRY), false);
  assert.equal(src.includes('https://evil'), false);
  assert.equal(src.includes('MINI_LAST_SEGMENT_ROUTES'), true);
});
