/**
 * Coverage + "GET only" for the Mission ID hook.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import { useMissionId } from './useMissionId';

const root = path.join(import.meta.dirname, '..', '..');

test('useMissionId is a client hook export', () => {
  assert.equal(typeof useMissionId, 'function');
});

test('the hook never POSTs an id to mint', () => {
  const src = readFileSync(path.join(root, 'src/hooks/useMissionId.ts'), 'utf8');
  assert.match(src, /fetch\('\/api\/account\/mission-id'\)/);
  assert.doesNotMatch(src, /method:\s*['"]POST['"]/);
  assert.doesNotMatch(src, /body:/);
});
