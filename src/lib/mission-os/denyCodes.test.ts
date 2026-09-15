/**
 * CapResult deny-code set freeze.
 *
 * Judge ≠ builder: the closed lists are hardcoded here, not read back
 * from production as the source of truth. A ninth host-lifecycle code,
 * or a production `code: '…'` literal outside the complete set, would
 * mean the bus grew a silent extra deny.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  CAPABILITY_DENY_CODES,
  HOST_LIFECYCLE_DENY_CODES,
  type ModuleManifest,
} from '../../../packages/mw-core/src/module';
import { createMiniHost } from './host';
import { mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import { mountTestGrantedMini } from './allowProbe';
import { resolveMiniDeeplink } from './deeplink';
import type { CapResult, MountedMini } from './types';

const here = import.meta.dirname;
const repoRoot = path.join(here, '..', '..', '..');

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

/** Hardcoded — do not import production constants as the expected list. */
const HOST_LIFECYCLE = [
  'scope_denied',
  'unknown_method',
  'unknown_capability',
  'not_mounted',
  'already_mounted',
  'unknown_mini',
  'bad_deeplink',
  'storage_cap',
] as const;

const SCOPED_STUBS = ['stub', 'photos_stub'] as const;

const CLOSED_ALL = [...HOST_LIFECYCLE, ...SCOPED_STUBS] as const;

const SCOPE_DENIED: CapResult<never> = { ok: false, code: 'scope_denied' };
const UNKNOWN_METHOD: CapResult<never> = { ok: false, code: 'unknown_method' };
const UNKNOWN_CAPABILITY: CapResult<never> = { ok: false, code: 'unknown_capability' };
const NOT_MOUNTED: CapResult<never> = { ok: false, code: 'not_mounted' };
const ALREADY_MOUNTED: CapResult<never> = { ok: false, code: 'already_mounted' };
const UNKNOWN_MINI: CapResult<never> = { ok: false, code: 'unknown_mini' };
const BAD_DEEPLINK: CapResult<never> = { ok: false, code: 'bad_deeplink' };
const STORAGE_CAP: CapResult<never> = { ok: false, code: 'storage_cap' };
const STUB: CapResult<never> = { ok: false, code: 'stub' };
const PHOTOS_STUB: CapResult<never> = { ok: false, code: 'photos_stub' };
const GUEST_STUB: CapResult<{ missionId: null; callSign: null }> = {
  ok: true,
  value: { missionId: null, callSign: null },
};
const MUTED_READ: CapResult<{ bundle: 'none'; muted: true }> = {
  ok: true,
  value: { bundle: 'none', muted: true },
};
const SET_OK: CapResult<void> = { ok: true, value: undefined };

const HEALTH_ID = 'l1.health';
const GRANTED_ID = 'test.granted';
const OVERSIZED = 'x'.repeat(4097);

const LIVE_ENVELOPES: Record<(typeof HOST_LIFECYCLE)[number], CapResult<never>> = {
  scope_denied: SCOPE_DENIED,
  unknown_method: UNKNOWN_METHOD,
  unknown_capability: UNKNOWN_CAPABILITY,
  not_mounted: NOT_MOUNTED,
  already_mounted: ALREADY_MOUNTED,
  unknown_mini: UNKNOWN_MINI,
  bad_deeplink: BAD_DEEPLINK,
  storage_cap: STORAGE_CAP,
};

const CODE_LITERAL = /\bcode:\s*['"]([a-z_]+)['"]/g;

function assertMounted(result: CapResult<MountedMini>): MountedMini {
  assert.equal(result.ok, true, 'mount must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

function productionTsFiles(): string[] {
  const dirs = [
    path.join(repoRoot, 'src', 'lib', 'mission-os'),
    path.join(repoRoot, 'packages', 'mw-core', 'src', 'module'),
    path.join(repoRoot, 'src', 'lib', 'minis'),
  ];
  const files: string[] = [];
  for (const dir of dirs) {
    for (const name of readdirSync(dir)) {
      if (!name.endsWith('.ts')) continue;
      if (name.endsWith('.test.ts')) continue;
      files.push(path.join(dir, name));
    }
  }
  return files.sort();
}

function codesIn(src: string): string[] {
  const found = new Set<string>();
  for (const match of src.matchAll(CODE_LITERAL)) {
    const code = match[1];
    if (code) found.add(code);
  }
  return [...found].sort();
}

test('closed host-lifecycle deny set is exactly the eight PLAN codes', () => {
  assert.deepEqual([...HOST_LIFECYCLE], [
    'scope_denied',
    'unknown_method',
    'unknown_capability',
    'not_mounted',
    'already_mounted',
    'unknown_mini',
    'bad_deeplink',
    'storage_cap',
  ]);
  assert.equal(HOST_LIFECYCLE.length, 8);
  assert.deepEqual([...HOST_LIFECYCLE_DENY_CODES], [...HOST_LIFECYCLE]);
  assert.deepEqual([...CAPABILITY_DENY_CODES], [...CLOSED_ALL]);
  assert.equal(CAPABILITY_DENY_CODES.includes('rate_limited' as never), false);
  assert.equal(HOST_LIFECYCLE.includes('stub' as never), false);
  assert.equal(HOST_LIFECYCLE.includes('photos_stub' as never), false);
});

test('each frozen host-lifecycle deny is emitted live — not a list that never runs', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  const live: Record<(typeof HOST_LIFECYCLE)[number], CapResult<unknown>> = {
    scope_denied: health.billing.read(),
    unknown_method: host.call(HEALTH_ID, 'identity', 'foo'),
    unknown_capability: host.call(HEALTH_ID, 'camera', 'read'),
    not_mounted: host.unmount('utility.probe'),
    already_mounted: mountHealthMini(host),
    unknown_mini: host.mount('totally.unknown'),
    bad_deeplink: resolveMiniDeeplink('https://evil'),
    storage_cap: health.storage.set('k', OVERSIZED),
  };

  for (const code of HOST_LIFECYCLE) {
    const result = live[code];
    assert.deepEqual(result, LIVE_ENVELOPES[code], `${code} live envelope`);
    assert.equal(result.ok, false, `${code} must deny`);
    if (result.ok) return;
    assert.equal(result.code, code, `${code} must keep its own spelling`);
    for (const other of HOST_LIFECYCLE) {
      if (other === code) continue;
      assert.notEqual(result.code, other, `${code} must not collapse to ${other}`);
    }
    assert.notEqual(result.code, 'stub', `${code} must not collapse to stub`);
    assert.notEqual(result.code, 'photos_stub', `${code} must not collapse to photos_stub`);
  }

  assert.deepEqual(granted.photos.read(), PHOTOS_STUB);
  assert.deepEqual(granted.billing.read(), MUTED_READ);
  assert.deepEqual(health.identity.read(), GUEST_STUB);
  assert.deepEqual(health.storage.get('k'), { ok: true, value: undefined });

  const invalid: ModuleManifest = {
    id: 'totally.unknown',
    version: '1.0.0',
    scopes: ['identity.read'],
    surfaces: ['web'],
    freeCore: true,
    entry: 'active',
  };
  assert.deepEqual(host.mount(invalid), STUB);
});

test('production code: literals stay inside the closed complete set', () => {
  const files = productionTsFiles();
  assert.ok(files.length >= 8, 'discover production files — an empty scan is vacuous');

  const emitted = new Set<string>();
  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    for (const code of codesIn(src)) {
      assert.equal(
        (CLOSED_ALL as readonly string[]).includes(code),
        true,
        `${path.relative(repoRoot, file)} emits '${code}' — a new deny needs PLAN`
      );
      emitted.add(code);
    }
  }

  for (const code of CLOSED_ALL) {
    assert.equal(
      emitted.has(code),
      true,
      `'${code}' is on the freeze list but never emitted as code: '…' — stale allowlist`
    );
  }
});

test('PLAN.md names every frozen host-lifecycle code; HOP.md stays empty', () => {
  const plan = readFileSync(path.join(here, 'PLAN.md'), 'utf8');
  assert.match(plan, /Paper \.1102/);
  assert.match(plan, /no silent ninth code/i);
  for (const code of HOST_LIFECYCLE) {
    assert.equal(plan.includes(`\`${code}\``), true, `PLAN.md must name ${code}`);
  }

  const hop = readFileSync(path.join(repoRoot, 'docs', 'harness', 'HOP.md'), 'utf8');
  assert.match(hop, /^# Live hop\n/);
  assert.match(hop, /^ticket:\n/m);
  assert.match(hop, /^done_means:\n/m);
  assert.match(hop, /^accept:\n/m);
  assert.equal(hop.includes('1102'), false);
  assert.equal(hop.includes('storage.remove'), false);
  assert.equal(hop.includes('unknown_capability'), false);
  assert.equal(hop.includes('l1.health'), false);
});

test('known-method envelopes stay .1079–.1097 beside the freeze', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));
  const shot = assertMounted(mountClearShotMini(host));

  assert.deepEqual(health.storage.set('note', 'ok'), SET_OK);
  assert.deepEqual(health.identity.read(), GUEST_STUB);
  assert.deepEqual(health.billing.read(), SCOPE_DENIED);
  assert.deepEqual(health.photos.read(), SCOPE_DENIED);
  assert.deepEqual(granted.billing.read(), MUTED_READ);
  assert.deepEqual(granted.photos.read(), PHOTOS_STUB);
  assert.deepEqual(shot.photos.read(), PHOTOS_STUB);
  assert.deepEqual(shot.storage.get('note'), SCOPE_DENIED);
  assert.deepEqual(host.call(HEALTH_ID, 'identity', 'foo'), UNKNOWN_METHOD);
  assert.deepEqual(host.call(HEALTH_ID, 'camera', 'read'), UNKNOWN_CAPABILITY);
  assert.deepEqual(mountHealthMini(host), ALREADY_MOUNTED);
  assert.deepEqual(host.mount('totally.unknown'), UNKNOWN_MINI);
  assert.deepEqual(host.unmount('utility.probe'), NOT_MOUNTED);
  assert.deepEqual(resolveMiniDeeplink('https://evil'), BAD_DEEPLINK);
  assert.deepEqual(resolveMiniDeeplink('mission://minis/totally-unknown'), UNKNOWN_MINI);
  assert.deepEqual(host.call(GRANTED_ID, 'storage', 'set', { key: 'note', value: 'ok' }), SET_OK);
});

test('deny-code freeze never imports Stripe, camera, or Android wiring', () => {
  for (const file of ['fakes.ts', 'host.ts', 'types.ts', 'call.ts']) {
    const src = sourceOf(file);
    assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false, `${file} must not import Stripe`);
    assert.equal(src.includes('premiumServer'), false, `${file} must not import premiumServer`);
    assert.equal(src.includes('getUserMedia'), false, `${file} must not open a camera`);
    assert.equal(/android\.provider\.MediaStore/i.test(src), false, `${file} must not import MediaStore`);
    assert.equal(src.includes('apps/android'), false, `${file} must not wire Android`);
    assert.equal(src.includes('safeStorage'), false, `${file} must not import safeStorage`);
    assert.equal(src.includes('localStorage'), false, `${file} must not call localStorage`);
  }
});
