/**
 * Last-segment mini deeplink → reserved mount.
 *
 * Judge ≠ builder: expected ids and deny codes are hardcoded here, not
 * read back from the production table. A long opaque path that silently
 * mounted ClearShot would mean the last-segment grammar vanished.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  miniSlugFromId,
  parseMissionMiniEntry,
} from '../../../packages/mw-core/src/module';
import { CLEARSHOT_MINI_MANIFEST, mountClearShotMini } from './clearshot';
import {
  MINI_LAST_SEGMENT_ROUTES,
  mountMiniByDeeplink,
  resolveMiniByLastSegment,
  resolveMiniDeeplink,
} from './deeplink';
import { createMiniHost } from './host';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

/** Closed set the judge named. A third slug is a fail, not a silent extra door. */
const EXPECTED_SLUGS = ['clearshot', 'health'] as const;

test('closed last-segment table is health + clearshot', () => {
  assert.deepEqual(
    Object.keys(MINI_LAST_SEGMENT_ROUTES).sort(),
    [...EXPECTED_SLUGS]
  );
  assert.equal(MINI_LAST_SEGMENT_ROUTES.clearshot.id, 'utility.clearshot');
  assert.equal(MINI_LAST_SEGMENT_ROUTES.health.id, 'l1.health');
  assert.equal(MINI_LAST_SEGMENT_ROUTES.clearshot.entry, 'mission://minis/clearshot');
  assert.equal(MINI_LAST_SEGMENT_ROUTES.health.entry, 'mission://minis/health');
});

test('ClearShot last-segment is clearshot — not a long opaque path', () => {
  assert.equal(miniSlugFromId(CLEARSHOT_MINI_MANIFEST.id), 'clearshot');
  assert.equal(parseMissionMiniEntry(CLEARSHOT_MINI_MANIFEST.entry), 'clearshot');
  assert.equal(CLEARSHOT_MINI_MANIFEST.entry, 'mission://minis/clearshot');
  assert.notEqual(CLEARSHOT_MINI_MANIFEST.entry, 'mission://minis/utility.clearshot');
  assert.notEqual(CLEARSHOT_MINI_MANIFEST.entry, 'mission://minis/utilityclearshot');
  assert.notEqual(CLEARSHOT_MINI_MANIFEST.entry, '/minis/clearshot');
});

test('last-segment clearshot resolves to utility.clearshot', () => {
  const bySlug = resolveMiniByLastSegment('clearshot');
  assert.equal(bySlug.ok, true);
  if (!bySlug.ok) return;
  assert.equal(bySlug.value.id, 'utility.clearshot');
  assert.equal(bySlug.value.entry, 'mission://minis/clearshot');
  assert.equal(bySlug.value, CLEARSHOT_MINI_MANIFEST);

  const byEntry = resolveMiniDeeplink('mission://minis/clearshot');
  assert.equal(byEntry.ok, true);
  if (!byEntry.ok) return;
  assert.equal(byEntry.value.id, 'utility.clearshot');
  assert.equal(byEntry.value, CLEARSHOT_MINI_MANIFEST);
});

test('mission://minis/clearshot mounts utility.clearshot', () => {
  const host = createMiniHost({ identity: { missionId: 5, callSign: '05' } });
  const mounted = mountMiniByDeeplink(host, 'mission://minis/clearshot');
  assert.equal(mounted.ok, true);
  if (!mounted.ok) return;

  assert.equal(mounted.value.manifest.id, 'utility.clearshot');
  assert.equal(mounted.value.manifest.entry, 'mission://minis/clearshot');
  assert.notEqual(mounted.value.manifest.id, 'l1.health');

  const direct = mountClearShotMini(host);
  assert.deepEqual(direct, { ok: false, code: 'already_mounted' });
  assert.equal(mounted.value.manifest.id, 'utility.clearshot');

  assert.deepEqual(mounted.value.identity.read(), {
    ok: true,
    value: { missionId: 5, callSign: '05' },
  });
  assert.deepEqual(mounted.value.storage.set('note', 'ok'), { ok: true, value: undefined });
  assert.deepEqual(mounted.value.storage.get('note'), { ok: false, code: 'scope_denied' });
  assert.deepEqual(mounted.value.billing.read(), { ok: false, code: 'scope_denied' });
  assert.deepEqual(mounted.value.photos.read(), { ok: false, code: 'photos_stub' });
});

test('long opaque last-segments do not resolve to ClearShot', () => {
  const host = createMiniHost();
  const opaque = [
    'mission://minis/utility.clearshot',
    'mission://minis/utilityclearshot',
    'mission://minis/utility-clearshot',
    '/minis/clearshot',
    'mission://minis/mini',
    'clearshot',
    'utility.clearshot',
  ];
  for (const entry of opaque) {
    assert.deepEqual(
      resolveMiniDeeplink(entry),
      { ok: false, code: 'unknown_mini' },
      `${entry} must not be a last-segment ClearShot route`
    );
    assert.deepEqual(mountMiniByDeeplink(host, entry), { ok: false, code: 'unknown_mini' });
  }

  assert.deepEqual(resolveMiniByLastSegment('utilityclearshot'), {
    ok: false,
    code: 'unknown_mini',
  });
  assert.deepEqual(resolveMiniByLastSegment('mini'), { ok: false, code: 'unknown_mini' });
  assert.deepEqual(resolveMiniByLastSegment('toString'), { ok: false, code: 'unknown_mini' });
  assert.deepEqual(resolveMiniByLastSegment('constructor'), {
    ok: false,
    code: 'unknown_mini',
  });
});

test('last-segment health still resolves to l1.health — not ClearShot', () => {
  const resolved = resolveMiniDeeplink('mission://minis/health');
  assert.equal(resolved.ok, true);
  if (!resolved.ok) return;
  assert.equal(resolved.value.id, 'l1.health');
  assert.notEqual(resolved.value.id, 'utility.clearshot');

  const host = createMiniHost();
  const mounted = mountMiniByDeeplink(host, 'mission://minis/health');
  assert.equal(mounted.ok, true);
  if (!mounted.ok) return;
  assert.equal(mounted.value.manifest.id, 'l1.health');
  assert.equal(mounted.value.manifest.entry, 'mission://minis/health');
  assert.deepEqual(mounted.value.photos.read(), { ok: false, code: 'scope_denied' });
});

test('deeplink helper stays stubby — no Stripe, camera, or Android wiring', () => {
  const src = sourceOf('deeplink.ts');
  assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false);
  assert.equal(src.includes('premiumServer'), false);
  assert.equal(src.includes('apps/android'), false);
  assert.equal(src.includes('mission://minis/clearshot'), true);
  assert.equal(src.includes('utility.clearshot'), true);
  assert.equal(src.includes('CLEARSHOT_MINI_MANIFEST'), true);
});
