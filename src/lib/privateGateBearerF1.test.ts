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

test('proxy does not treat a verified JWT as a gate pass', () => {
  const proxy = readFileSync(join(root, 'proxy.ts'), 'utf8');
  assert.doesNotMatch(proxy, /hasValidSupabaseSession/);
  assert.doesNotMatch(proxy, /hasVerifiedSupabaseUser/);
  assert.match(proxy, /hasPrivateAccessCookie/);
});

test('session mint and OAuth callback require inviteRedeemed while gated', () => {
  const session = readFileSync(join(root, 'app/api/private-access/session/route.ts'), 'utf8');
  const callback = readFileSync(join(root, 'app/auth/callback/route.ts'), 'utf8');
  assert.match(session, /sessionMintEligible/);
  assert.match(session, /invite_required/);
  assert.match(callback, /sessionMintEligible/);
  assert.match(callback, /bindInviteToUser/);
});

test('mobileAccess reuses authAccessToken (no duplicate Bearer parse)', () => {
  const mob = readFileSync(join(root, 'src/lib/mobileAccess.ts'), 'utf8');
  assert.match(mob, /authAccessToken/);
  assert.match(mob, /extractSupabaseAccessTokenFromRequest/);
});
