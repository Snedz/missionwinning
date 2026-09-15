/**
 * Isolation unit tests for Mission OS mini mounts on MiniHost bus fakes.
 *
 * Judge ≠ builder: grant/deny codes are hardcoded here, not read back from
 * production scope constants. Photos / billing stay stubby — a `ok: true`
 * photos result would mean the stub silently grew a camera.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { ModuleManifest, ModuleScope } from '../../../packages/mw-core/src/module';
import { createMiniHost } from './host';
import { HEALTH_MINI_MANIFEST, mountHealthMini } from './health';
import { CLEARSHOT_MINI_MANIFEST, mountClearShotMini } from './clearshot';
import type { CapResult, MountedMini } from './types';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

function assertMounted(result: CapResult<MountedMini>): MountedMini {
  assert.equal(result.ok, true, 'mount must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

test('l1.health mount: identity + storage granted; photos and billing denied', () => {
  const host = createMiniHost({ identity: { missionId: 9, callSign: '09' } });
  const health = assertMounted(mountHealthMini(host));

  assert.equal(health.manifest.id, 'l1.health');
  assert.equal(health.manifest.entry, 'mission://minis/health');
  assert.notEqual(health.manifest.id, 'health.mini');

  assert.deepEqual(health.identity.read(), {
    ok: true,
    value: { missionId: 9, callSign: '09' },
  });
  assert.deepEqual(health.storage.set('note', 'ok'), { ok: true, value: undefined });
  assert.deepEqual(health.storage.get('note'), { ok: true, value: 'ok' });

  assert.deepEqual(health.billing.read(), { ok: false, code: 'scope_denied' });
  assert.deepEqual(health.photos.read(), { ok: false, code: 'scope_denied' });
  assert.deepEqual(health.photos.write(), { ok: false, code: 'scope_denied' });

  const photo = health.photos.read();
  assert.equal(photo.ok, false);
  if (photo.ok) return;
  assert.notEqual(photo.code, 'photos_stub');
});

test('retired health.mini is not the live Health mount', () => {
  const liveId: string = HEALTH_MINI_MANIFEST.id;
  assert.equal(liveId, 'l1.health');
  assert.notEqual(liveId, 'health.mini');

  const host = createMiniHost();
  const live = assertMounted(mountHealthMini(host));
  assert.equal(live.manifest.id, 'l1.health');

  // Retired slug from `.1073`. Last-segment `mini` no longer matches
  // `mission://minis/health`. Not a live swap.
  const retired: ModuleManifest = {
    ...HEALTH_MINI_MANIFEST,
    id: 'health.mini',
  };
  assert.deepEqual(host.mount(retired), { ok: false, code: 'stub' });
});

test('utility.clearshot mount: photos + storage.write granted; billing denied', () => {
  const host = createMiniHost({ identity: { missionId: 4, callSign: '04' } });
  const shot = assertMounted(mountClearShotMini(host));

  assert.equal(shot.manifest.id, 'utility.clearshot');
  assert.equal(shot.manifest.entry, 'mission://minis/clearshot');

  assert.deepEqual(shot.identity.read(), {
    ok: true,
    value: { missionId: 4, callSign: '04' },
  });
  assert.deepEqual(shot.storage.set('note', 'ok'), { ok: true, value: undefined });
  assert.deepEqual(shot.storage.get('note'), { ok: false, code: 'scope_denied' });

  assert.deepEqual(shot.billing.read(), { ok: false, code: 'scope_denied' });
  assert.deepEqual(shot.photos.read(), { ok: false, code: 'photos_stub' });
  assert.deepEqual(shot.photos.write(), { ok: false, code: 'photos_stub' });

  const bill = shot.billing.read();
  assert.equal(bill.ok, false);
  if (bill.ok) return;
  assert.notEqual(bill.code, 'photos_stub');

  const photo = shot.photos.read();
  assert.equal(photo.ok, false);
  if (photo.ok) return;
  assert.equal(photo.code, 'photos_stub');
  assert.notEqual(photo.code, 'scope_denied');
});

test('CapResult sandbox: one mini cannot read another mini storage keyspace', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const probeScopes: readonly ModuleScope[] = [
    ...CLEARSHOT_MINI_MANIFEST.scopes,
    'storage.read',
  ];
  const shot = assertMounted(
    host.mount({
      ...CLEARSHOT_MINI_MANIFEST,
      scopes: probeScopes,
    })
  );

  assert.equal(health.storage.set('secret', 'health-only').ok, true);
  assert.equal(shot.storage.set('secret', 'shot-only').ok, true);
  assert.equal(health.storage.set('health-key', 'from-health').ok, true);
  assert.equal(shot.storage.set('shot-key', 'from-shot').ok, true);

  assert.deepEqual(health.storage.get('secret'), { ok: true, value: 'health-only' });
  assert.deepEqual(health.storage.get('health-key'), { ok: true, value: 'from-health' });
  assert.deepEqual(health.storage.get('shot-key'), { ok: true, value: undefined });

  const probeSecret = shot.storage.get('secret');
  assert.deepEqual(probeSecret, { ok: true, value: 'shot-only' });
  if (!probeSecret.ok) return;
  assert.equal(probeSecret.value, 'shot-only');
  assert.notEqual(probeSecret.value, 'health-only');
  assert.deepEqual(shot.storage.get('shot-key'), { ok: true, value: 'from-shot' });
  assert.deepEqual(shot.storage.get('health-key'), { ok: true, value: undefined });

  const healthSecret = health.storage.get('secret');
  assert.deepEqual(healthSecret, { ok: true, value: 'health-only' });
  if (!healthSecret.ok) return;
  assert.equal(healthSecret.value, 'health-only');
  assert.notEqual(healthSecret.value, 'shot-only');
});

test('unmount then remount: Health cannot read its prior keyspace', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  assert.equal(health.storage.set('secret', 'health-only').ok, true);
  assert.deepEqual(health.storage.get('secret'), { ok: true, value: 'health-only' });

  assert.deepEqual(host.unmount('l1.health'), { ok: true, value: undefined });

  const remounted = assertMounted(mountHealthMini(host));
  const leftover = remounted.storage.get('secret');
  assert.deepEqual(leftover, { ok: true, value: undefined });
  if (!leftover.ok) return;
  assert.notEqual(leftover.value, 'health-only');
});

test('torn-down handle cannot read leftover values after unmount', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  assert.equal(health.storage.set('secret', 'health-only').ok, true);

  assert.deepEqual(host.unmount('l1.health'), { ok: true, value: undefined });
  assert.deepEqual(health.storage.get('secret'), { ok: true, value: undefined });
});

test('unmount Health does not wipe ClearShot keyspace', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const probeScopes: readonly ModuleScope[] = [
    ...CLEARSHOT_MINI_MANIFEST.scopes,
    'storage.read',
  ];
  const shot = assertMounted(
    host.mount({
      ...CLEARSHOT_MINI_MANIFEST,
      scopes: probeScopes,
    })
  );

  assert.equal(health.storage.set('secret', 'health-only').ok, true);
  assert.equal(shot.storage.set('secret', 'shot-only').ok, true);

  assert.deepEqual(host.unmount('l1.health'), { ok: true, value: undefined });

  const probeSecret = shot.storage.get('secret');
  assert.deepEqual(probeSecret, { ok: true, value: 'shot-only' });
  if (!probeSecret.ok) return;
  assert.equal(probeSecret.value, 'shot-only');
  assert.notEqual(probeSecret.value, 'health-only');
});

test('unmount ClearShot does not wipe Health keyspace', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const shot = assertMounted(mountClearShotMini(host));

  assert.equal(health.storage.set('secret', 'health-only').ok, true);
  assert.equal(shot.storage.set('secret', 'shot-only').ok, true);

  assert.deepEqual(host.unmount('utility.clearshot'), { ok: true, value: undefined });

  const healthSecret = health.storage.get('secret');
  assert.deepEqual(healthSecret, { ok: true, value: 'health-only' });
  if (!healthSecret.ok) return;
  assert.equal(healthSecret.value, 'health-only');
  assert.notEqual(healthSecret.value, 'shot-only');
});

test('ClearShot probe after Health unmount cannot read Health leftovers', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  assert.equal(health.storage.set('secret', 'health-only').ok, true);
  assert.deepEqual(host.unmount('l1.health'), { ok: true, value: undefined });

  const probeScopes: readonly ModuleScope[] = [
    ...CLEARSHOT_MINI_MANIFEST.scopes,
    'storage.read',
  ];
  const probe = assertMounted(
    host.mount({
      ...CLEARSHOT_MINI_MANIFEST,
      scopes: probeScopes,
    })
  );
  const probeSecret = probe.storage.get('secret');
  assert.deepEqual(probeSecret, { ok: true, value: undefined });
  if (!probeSecret.ok) return;
  assert.notEqual(probeSecret.value, 'health-only');
});

test('unmount of a never-mounted id is unknown_mini', () => {
  const host = createMiniHost();
  assert.deepEqual(host.unmount('l1.health'), { ok: false, code: 'unknown_mini' });
  assert.deepEqual(host.unmount('utility.clearshot'), { ok: false, code: 'unknown_mini' });
  assert.deepEqual(host.unmount('utility.probe'), { ok: false, code: 'unknown_mini' });
});

test('second unmount of the same id is unknown_mini', () => {
  const host = createMiniHost();
  assertMounted(mountHealthMini(host));
  assert.deepEqual(host.unmount('l1.health'), { ok: true, value: undefined });
  assert.deepEqual(host.unmount('l1.health'), { ok: false, code: 'unknown_mini' });
});

test('unmount then remount: new writes land and stay namespaced', () => {
  const host = createMiniHost();
  const first = assertMounted(mountHealthMini(host));
  assert.equal(first.storage.set('secret', 'health-only').ok, true);
  assert.deepEqual(host.unmount('l1.health'), { ok: true, value: undefined });

  const second = assertMounted(mountHealthMini(host));
  assert.deepEqual(second.storage.get('secret'), { ok: true, value: undefined });
  assert.equal(second.storage.set('secret', 'health-again').ok, true);
  const again = second.storage.get('secret');
  assert.deepEqual(again, { ok: true, value: 'health-again' });
  if (!again.ok) return;
  assert.notEqual(again.value, 'health-only');

  const shot = assertMounted(mountClearShotMini(host));
  assert.equal(shot.storage.set('secret', 'shot-only').ok, true);
  assert.deepEqual(second.storage.get('secret'), { ok: true, value: 'health-again' });
});

test('stubs stay stubby — no Stripe, camera, or Android Photos/Billing wiring', () => {
  for (const file of [
    'health.ts',
    'clearshot.ts',
    'host.ts',
    'fakes.ts',
    'deeplink.ts',
    'billingProbe.ts',
  ]) {
    const src = sourceOf(file);
    assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false, `${file} must not import Stripe`);
    assert.equal(src.includes('premiumServer'), false, `${file} must not import premiumServer`);
    assert.equal(/checkout\.sessions/i.test(src), false, `${file} must not open checkout`);
    assert.equal(src.includes('apps/android'), false, `${file} must not reach Android ClearShot`);
  }

  const healthSrc = sourceOf('health.ts');
  assert.equal(healthSrc.includes('mount(HEALTH_MINI_MANIFEST)'), true);
  assert.equal(healthSrc.includes("'photos.read'"), false);
  assert.equal(healthSrc.includes("'billing.read'"), false);

  const shotSrc = sourceOf('clearshot.ts');
  assert.equal(shotSrc.includes('mount(CLEARSHOT_MINI_MANIFEST)'), true);
  assert.equal(shotSrc.includes("'billing.read'"), false);
  assert.equal(shotSrc.includes("'storage.read'"), false);

  const hostSrc = sourceOf('host.ts');
  assert.equal(hostSrc.includes('unmount('), true);
  assert.equal(hostSrc.includes('stores.delete'), true);
  assert.equal(hostSrc.includes('store.clear()'), true);
});
