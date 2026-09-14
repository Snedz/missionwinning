/**
 * ClearShot utility mini mount on MiniHost + in-memory fakes.
 *
 * Judge ≠ builder: expected scopes are hardcoded here, not read back from
 * the production constant. Billing / health.write / storage.read must deny
 * `scope_denied`. Photos stay `photos_stub` when scoped — success would mean
 * the stub silently grew a camera.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  HEALTH_TRAIN_MANIFEST,
  UTILITY_CLEARSHOT_MANIFEST,
  assertModuleManifest,
  miniSlugFromId,
  parseMissionMiniEntry,
  parseModuleId,
} from '../../../packages/mw-core/src/module';
import { createMiniHost } from './host';
import { HEALTH_MINI_MANIFEST, mountHealthMini } from './health';
import {
  CLEARSHOT_MINI_MANIFEST,
  CLEARSHOT_MINI_SCOPES,
  mountClearShotMini,
} from './clearshot';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

/** Closed set the judge named. A fifth name is a fail, not a silent extra door. */
const EXPECTED_SCOPES = [
  'identity.read',
  'photos.read',
  'photos.write',
  'storage.write',
] as const;

test('ClearShot scopes are photos + storage.write — extras fail closed', () => {
  assert.deepEqual([...CLEARSHOT_MINI_SCOPES], [...EXPECTED_SCOPES]);
  assert.deepEqual([...CLEARSHOT_MINI_MANIFEST.scopes], [...EXPECTED_SCOPES]);
  assert.equal(CLEARSHOT_MINI_MANIFEST.scopes.length, 4);
  assert.equal(CLEARSHOT_MINI_MANIFEST.scopes.includes('storage.read'), false);
  assert.equal(CLEARSHOT_MINI_MANIFEST.scopes.includes('billing.read'), false);
  assert.equal(CLEARSHOT_MINI_MANIFEST.scopes.includes('health.write'), false);
  assert.equal(CLEARSHOT_MINI_MANIFEST.scopes.includes('health.read'), false);

  const src = sourceOf('clearshot.ts');
  assert.equal(src.includes("'billing.read'"), false, 'ClearShot stub must not declare billing.read');
  assert.equal(src.includes("'health.write'"), false, 'ClearShot stub must not take health.write');
  assert.equal(src.includes("'storage.read'"), false, 'storage.read stays fail-closed');
  assert.equal(src.includes("'l1.health'"), false, 'ClearShot is utility.*, not L1 Health');
  assert.equal(src.includes('UTILITY_CLEARSHOT_MANIFEST'), true);
  assert.equal(src.includes('utility.clearshot'), true);
  assert.equal(src.includes('mission://minis/clearshot'), true);
  assert.equal(src.includes("'mission://minis/health'"), false);
  assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false);
  assert.equal(src.includes('premiumServer'), false);
  assert.equal(src.includes('apps/android'), false);
});

test('ClearShot is the reserved utility stub, not Health and not the Train logger', () => {
  assert.equal(CLEARSHOT_MINI_MANIFEST, UTILITY_CLEARSHOT_MANIFEST);
  assert.equal(CLEARSHOT_MINI_MANIFEST.id, 'utility.clearshot');
  assert.equal(parseModuleId('clearshot'), null, 'single-segment clearshot fails MODULE_ID');
  assert.equal(parseModuleId(CLEARSHOT_MINI_MANIFEST.id), 'utility.clearshot');
  assert.equal(miniSlugFromId(CLEARSHOT_MINI_MANIFEST.id), 'clearshot');
  assert.equal(parseMissionMiniEntry(CLEARSHOT_MINI_MANIFEST.entry), 'clearshot');
  assert.equal(CLEARSHOT_MINI_MANIFEST.id.startsWith('utility.'), true);
  assert.equal(CLEARSHOT_MINI_MANIFEST.name, 'ClearShot');
  assert.equal(CLEARSHOT_MINI_MANIFEST.entry, 'mission://minis/clearshot');
  assert.equal(CLEARSHOT_MINI_MANIFEST.freeCore, true);
  assert.notEqual(CLEARSHOT_MINI_MANIFEST.id, HEALTH_MINI_MANIFEST.id);
  assert.notEqual(CLEARSHOT_MINI_MANIFEST.id, HEALTH_TRAIN_MANIFEST.id);
  assert.notEqual(CLEARSHOT_MINI_MANIFEST.entry, '/active');
  assert.notEqual(CLEARSHOT_MINI_MANIFEST.entry, HEALTH_MINI_MANIFEST.entry);
  assert.doesNotThrow(() => assertModuleManifest(CLEARSHOT_MINI_MANIFEST));
  assert.throws(
    () => assertModuleManifest({ ...CLEARSHOT_MINI_MANIFEST, entry: 'mission://minis/health' }),
    /matching id/
  );
  assert.throws(
    () => assertModuleManifest({ ...CLEARSHOT_MINI_MANIFEST, id: 'clearshot' }),
    /invalid module id/
  );
  assert.throws(
    () => assertModuleManifest({ ...CLEARSHOT_MINI_MANIFEST, id: 'utility.health' }),
    /matching id/
  );
});

test('mountClearShotMini: photos stub; storage write works; billing denies', () => {
  const host = createMiniHost({ identity: { missionId: 3, callSign: '03' } });
  const mounted = mountClearShotMini(host);
  assert.equal(mounted.ok, true);
  if (!mounted.ok) return;

  assert.equal(mounted.value.manifest.id, 'utility.clearshot');
  assert.equal(mounted.value.manifest.entry, 'mission://minis/clearshot');
  assert.deepEqual(mounted.value.identity.read(), {
    ok: true,
    value: { missionId: 3, callSign: '03' },
  });
  assert.deepEqual(mounted.value.storage.set('note', 'ok'), { ok: true, value: undefined });
  assert.deepEqual(mounted.value.storage.get('note'), { ok: false, code: 'scope_denied' });

  assert.deepEqual(mounted.value.billing.read(), { ok: false, code: 'scope_denied' });
  assert.deepEqual(mounted.value.photos.read(), { ok: false, code: 'photos_stub' });
  assert.deepEqual(mounted.value.photos.write(), { ok: false, code: 'photos_stub' });
});

test('guest identity stays null; nothing is minted', () => {
  const mounted = mountClearShotMini(createMiniHost());
  assert.equal(mounted.ok, true);
  if (!mounted.ok) return;
  assert.deepEqual(mounted.value.identity.read(), {
    ok: true,
    value: { missionId: null, callSign: null },
  });
});

test('mountClearShotMini always mounts the ClearShot stub (not Health / Train)', () => {
  const hostSrc = sourceOf('clearshot.ts');
  assert.equal(hostSrc.includes('mount(CLEARSHOT_MINI_MANIFEST)'), true);
  assert.equal(hostSrc.includes('HEALTH_MINI_MANIFEST'), false);
  assert.equal(hostSrc.includes('HEALTH_TRAIN_MANIFEST'), false);

  const host = createMiniHost();
  const clearshot = mountClearShotMini(host);
  const health = mountHealthMini(host);
  assert.equal(clearshot.ok, true);
  assert.equal(health.ok, true);
  if (!clearshot.ok || !health.ok) return;
  assert.equal(clearshot.value.storage.set('k', 'shot').ok, true);
  assert.equal(health.value.storage.set('k', 'health').ok, true);
  assert.deepEqual(clearshot.value.storage.get('k'), { ok: false, code: 'scope_denied' });
  assert.deepEqual(health.value.storage.get('k'), { ok: true, value: 'health' });
});

test('ClearShot cannot call billing — undeclared doors stay scope_denied', () => {
  const mounted = mountClearShotMini(createMiniHost());
  assert.equal(mounted.ok, true);
  if (!mounted.ok) return;
  const bill = mounted.value.billing.read();
  assert.equal(bill.ok, false);
  if (bill.ok) return;
  assert.equal(bill.code, 'scope_denied');
  assert.notEqual(bill.code, 'photos_stub');
});

test('scoped photos stay photos_stub — not a silent camera', () => {
  const mounted = mountClearShotMini(createMiniHost());
  assert.equal(mounted.ok, true);
  if (!mounted.ok) return;
  const photo = mounted.value.photos.read();
  assert.equal(photo.ok, false);
  if (photo.ok) return;
  assert.equal(photo.code, 'photos_stub');
  assert.notEqual(photo.code, 'scope_denied');
});
