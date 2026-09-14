/**
 * Health mini mount on MiniHost + in-memory fakes.
 *
 * Judge ≠ builder: expected scopes are hardcoded here, not read back from
 * the production constant. Photos / billing / health.write must deny
 * `scope_denied` — `photos_stub` would mean the stub silently gained a door.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  HEALTH_TRAIN_MANIFEST,
  UTILITY_CLEARSHOT_MANIFEST,
  assertModuleManifest,
} from '../../../packages/mw-core/src/module';
import { createMiniHost } from './host';
import {
  HEALTH_MINI_MANIFEST,
  HEALTH_MINI_SCOPES,
  mountHealthMini,
} from './health';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

/** Closed set the judge named. A fifth name is a fail, not a silent extra door. */
const EXPECTED_SCOPES = ['identity.read', 'storage.read', 'storage.write'] as const;

test('Health mini scopes are identity + storage only — extras fail closed', () => {
  assert.deepEqual([...HEALTH_MINI_SCOPES], [...EXPECTED_SCOPES]);
  assert.deepEqual([...HEALTH_MINI_MANIFEST.scopes], [...EXPECTED_SCOPES]);
  assert.equal(HEALTH_MINI_MANIFEST.scopes.length, 3);
  assert.equal(HEALTH_MINI_MANIFEST.scopes.includes('photos.read'), false);
  assert.equal(HEALTH_MINI_MANIFEST.scopes.includes('photos.write'), false);
  assert.equal(HEALTH_MINI_MANIFEST.scopes.includes('billing.read'), false);
  assert.equal(HEALTH_MINI_MANIFEST.scopes.includes('health.write'), false);
  assert.equal(HEALTH_MINI_MANIFEST.scopes.includes('health.read'), false);

  const src = sourceOf('health.ts');
  assert.equal(src.includes("'photos.read'"), false, 'Health stub must not declare photos.read');
  assert.equal(src.includes("'photos.write'"), false, 'Health stub must not declare photos.write');
  assert.equal(src.includes("'billing.read'"), false, 'Health stub must not declare billing.read');
  assert.equal(src.includes("'health.write'"), false, 'Health stub must not take health.write');
  assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false);
  assert.equal(src.includes('premiumServer'), false);
});

test('Health mini is a reserved stub, not the Train logger', () => {
  assert.equal(HEALTH_MINI_MANIFEST.id, 'utility.health');
  assert.equal(HEALTH_MINI_MANIFEST.name, 'Health');
  assert.equal(HEALTH_MINI_MANIFEST.entry, 'mission://minis/health');
  assert.equal(HEALTH_MINI_MANIFEST.freeCore, true);
  assert.notEqual(HEALTH_MINI_MANIFEST.id, HEALTH_TRAIN_MANIFEST.id);
  assert.notEqual(HEALTH_MINI_MANIFEST.entry, '/active');
  assert.notEqual(HEALTH_MINI_MANIFEST.entry, UTILITY_CLEARSHOT_MANIFEST.entry);
  assert.doesNotThrow(() => assertModuleManifest(HEALTH_MINI_MANIFEST));
});

test('mountHealthMini: identity + storage work; photos and billing deny', () => {
  const host = createMiniHost({ identity: { missionId: 3, callSign: '03' } });
  const mounted = mountHealthMini(host);
  assert.equal(mounted.ok, true);
  if (!mounted.ok) return;

  assert.equal(mounted.value.manifest.id, 'utility.health');
  assert.deepEqual(mounted.value.identity.read(), {
    ok: true,
    value: { missionId: 3, callSign: '03' },
  });
  assert.deepEqual(mounted.value.storage.set('note', 'ok'), { ok: true, value: undefined });
  assert.deepEqual(mounted.value.storage.get('note'), { ok: true, value: 'ok' });

  assert.deepEqual(mounted.value.billing.read(), { ok: false, code: 'scope_denied' });
  assert.deepEqual(mounted.value.photos.read(), { ok: false, code: 'scope_denied' });
  assert.deepEqual(mounted.value.photos.write(), { ok: false, code: 'scope_denied' });
});

test('guest identity stays null; nothing is minted', () => {
  const mounted = mountHealthMini(createMiniHost());
  assert.equal(mounted.ok, true);
  if (!mounted.ok) return;
  assert.deepEqual(mounted.value.identity.read(), {
    ok: true,
    value: { missionId: null, callSign: null },
  });
});

test('mountHealthMini always mounts the Health stub (not ClearShot / Train)', () => {
  const hostSrc = sourceOf('health.ts');
  assert.equal(hostSrc.includes('mount(HEALTH_MINI_MANIFEST)'), true);
  assert.equal(hostSrc.includes('HEALTH_TRAIN_MANIFEST'), false);
  assert.equal(hostSrc.includes('UTILITY_CLEARSHOT_MANIFEST'), false);

  const host = createMiniHost();
  const health = mountHealthMini(host);
  const clearshot = host.mount(UTILITY_CLEARSHOT_MANIFEST);
  assert.equal(health.ok, true);
  assert.equal(clearshot.ok, true);
  if (!health.ok || !clearshot.ok) return;
  assert.equal(health.value.storage.set('k', 'health').ok, true);
  assert.equal(clearshot.value.storage.set('k', 'shot').ok, true);
  assert.deepEqual(health.value.storage.get('k'), { ok: true, value: 'health' });
  assert.deepEqual(clearshot.value.storage.get('k'), { ok: false, code: 'scope_denied' });
});

test('Health mini cannot call photos_stub — undeclared doors stay scope_denied', () => {
  const mounted = mountHealthMini(createMiniHost());
  assert.equal(mounted.ok, true);
  if (!mounted.ok) return;
  const photo = mounted.value.photos.read();
  assert.equal(photo.ok, false);
  if (photo.ok) return;
  assert.equal(photo.code, 'scope_denied');
  assert.notEqual(photo.code, 'photos_stub');
});
