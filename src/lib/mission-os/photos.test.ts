/**
 * Photos CapResult deny consistency on MiniHost bus fakes.
 *
 * Judge ≠ builder: deny codes and the scoped stub code are hardcoded
 * here, not read back from production constants. A method that returns
 * `stub` or throws, or a Health call that returns `photos_stub`, would
 * mean the door grew a second shape.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  PHOTOS_METHODS,
  type CapResult,
  type PhotosCapability,
  type PhotosMethod,
} from './types';
import { createPhotosFake } from './fakes';
import { createMiniHost } from './host';
import { HEALTH_MINI_MANIFEST, mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import { MINI_LAST_SEGMENT_ROUTES, resolveMiniDeeplink } from './deeplink';
import { lookupMini } from '../minis/registry';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

const SCOPE_DENIED: CapResult<never> = { ok: false, code: 'scope_denied' };
const PHOTOS_STUB: CapResult<never> = { ok: false, code: 'photos_stub' };

function callPhotos(photos: PhotosCapability, method: PhotosMethod): CapResult<never> {
  return photos[method]();
}

function assertMounted<T extends { ok: boolean }>(
  result: T
): asserts result is T & { ok: true } {
  assert.equal(result.ok, true, 'mount must succeed');
}

test('closed photos methods are read + write', () => {
  assert.deepEqual([...PHOTOS_METHODS], ['read', 'write']);
  const health = createPhotosFake(HEALTH_MINI_MANIFEST);
  assert.deepEqual(Object.keys(health).sort(), [...PHOTOS_METHODS].sort());
});

test('Health: every photos method is scope_denied', () => {
  const mounted = mountHealthMini(createMiniHost());
  assertMounted(mounted);
  assert.equal(mounted.value.manifest.id, 'l1.health');
  for (const method of PHOTOS_METHODS) {
    const result = callPhotos(mounted.value.photos, method);
    assert.deepEqual(result, SCOPE_DENIED, `${method} must be scope_denied`);
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.code, 'scope_denied');
    assert.notEqual(result.code, 'photos_stub');
    assert.notEqual(result.code, 'stub');
  }
});

test('ClearShot: every photos method is photos_stub', () => {
  const mounted = mountClearShotMini(createMiniHost());
  assertMounted(mounted);
  assert.equal(mounted.value.manifest.id, 'utility.clearshot');
  for (const method of PHOTOS_METHODS) {
    const result = callPhotos(mounted.value.photos, method);
    assert.deepEqual(result, PHOTOS_STUB, `${method} must be photos_stub`);
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.code, 'photos_stub');
    assert.notEqual(result.code, 'scope_denied');
    assert.notEqual(result.code, 'stub');
  }
});

test('l1.health is a reserved Health mount without photos — not ClearShot, not registry', () => {
  assert.equal(Object.hasOwn(MINI_LAST_SEGMENT_ROUTES, 'health'), true);
  const resolved = resolveMiniDeeplink('mission://minis/health');
  assert.equal(resolved.ok, true);
  if (!resolved.ok) return;
  assert.equal(resolved.value.id, 'l1.health');
  assert.deepEqual(lookupMini('l1.health'), { ok: false, code: 'unknown_mini' });
  assert.equal(HEALTH_MINI_MANIFEST.id, 'l1.health');
  assert.equal(HEALTH_MINI_MANIFEST.scopes.includes('photos.read'), false);
  assert.equal(HEALTH_MINI_MANIFEST.scopes.includes('photos.write'), false);
  assert.notEqual(HEALTH_MINI_MANIFEST.id, 'utility.clearshot');
});

test('photos fakes never import camera, MediaStore, or Android wiring', () => {
  for (const file of ['fakes.ts', 'types.ts', 'host.ts', 'health.ts', 'clearshot.ts']) {
    const src = sourceOf(file);
    assert.equal(src.includes('MediaStore'), false, `${file} must not name MediaStore`);
    assert.equal(src.includes('getUserMedia'), false, `${file} must not open a camera`);
    assert.equal(src.includes('ImagePicker'), false, `${file} must not pick images`);
    assert.equal(/expo-camera/i.test(src), false, `${file} must not import expo-camera`);
    assert.equal(/android\.permission\.CAMERA/i.test(src), false, `${file} must not request CAMERA`);
    assert.equal(src.includes('apps/android'), false, `${file} must not wire Android`);
    assert.equal(src.includes('progressPhotos'), false, `${file} must not reach progressPhotos`);
  }
});
