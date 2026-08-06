import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('privateGate verifies cookie or Bearer via shared authAccessToken (F1)', () => {
  const gate = readFileSync(join(root, 'src/lib/privateGate.ts'), 'utf8');
  assert.match(gate, /extractSupabaseAccessTokenFromRequest/);
  assert.match(gate, /hasVerifiedSupabaseUser/);
  assert.match(gate, /getUser/);
  // Must not require bypass flag for JWT gate access
  assert.ok(!/PRIVATE_ALLOW_AUTH_BYPASS !== 'true'/.test(gate));
});

test('proxy uses hasValidSupabaseSession / verified user path', () => {
  const proxy = readFileSync(join(root, 'proxy.ts'), 'utf8');
  assert.match(proxy, /hasValidSupabaseSession/);
});

test('mobileAccess reuses authAccessToken (no duplicate Bearer parse)', () => {
  const mob = readFileSync(join(root, 'src/lib/mobileAccess.ts'), 'utf8');
  assert.match(mob, /authAccessToken/);
  assert.match(mob, /extractSupabaseAccessTokenFromRequest/);
});
