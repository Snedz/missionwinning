/**
 * The daily nudge To: must be the auth mailbox, not owner-writable profiles.email.
 *
 * `collectNudgeCandidates` is `server-only`, so the send-address rule lives in
 * `nudgeMailbox.ts` (callable here) and this file also reads the collector
 * source so a revert that wires `profile.email` back into decideNudge fails
 * even if the helper is left unused.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  attachNudgeMailboxes,
  verifiedAuthMailbox,
  type AuthMailboxUser,
} from '@/lib/nudgeMailbox';

const root = path.join(import.meta.dirname, '..', '..');

const VERIFIED: AuthMailboxUser = {
  email: 'real@user.test',
  email_confirmed_at: '2026-01-01T00:00:00Z',
};

test('verifiedAuthMailbox accepts only a confirmed auth address', () => {
  assert.equal(verifiedAuthMailbox(null), null);
  assert.equal(verifiedAuthMailbox(undefined), null);
  assert.equal(verifiedAuthMailbox({}), null);
  assert.equal(verifiedAuthMailbox({ email: '  ' }), null);
  assert.equal(verifiedAuthMailbox({ email: 'not-an-email' }), null);
  assert.equal(verifiedAuthMailbox({ email: 'unverified@user.test' }), null);
  assert.equal(verifiedAuthMailbox({ email: 'unverified@user.test', email_confirmed_at: '' }), null);
  assert.equal(verifiedAuthMailbox(VERIFIED), 'real@user.test');
  assert.equal(
    verifiedAuthMailbox({ email: '  Real@User.test  ', confirmed_at: '2026-01-01T00:00:00Z' }),
    'Real@User.test'
  );
});

/**
 * The defect: a signed-in UPDATE of profiles.email became the cron To:.
 * attachNudgeMailboxes must drop or replace that column, never emit it.
 */
test('a spoofed profiles.email is never the send target', () => {
  const spoofed = [
    { id: 'u1', email: 'attacker@evil.test', created_at: '2026-01-01T00:00:00Z' },
    { id: 'u2', email: 'also-attacker@evil.test', created_at: '2026-01-01T00:00:00Z' },
    { id: 'u3', email: 'no-auth@evil.test', created_at: '2026-01-01T00:00:00Z' },
  ];
  const authById = new Map<string, AuthMailboxUser | undefined>([
    ['u1', VERIFIED],
    ['u2', { email: 'other@user.test' }],
    // u3 omitted — no auth row
  ]);

  const eligible = attachNudgeMailboxes(spoofed, authById);
  assert.deepEqual(
    eligible.map((r) => ({ id: r.id, email: r.email })),
    [{ id: 'u1', email: 'real@user.test' }]
  );
  for (const row of eligible) {
    assert.notEqual(row.email, 'attacker@evil.test');
    assert.notEqual(row.email, 'also-attacker@evil.test');
    assert.notEqual(row.email, 'no-auth@evil.test');
  }
});

test('a profile with no email still sends to the verified auth mailbox', () => {
  const eligible = attachNudgeMailboxes([{ id: 'u1' }], new Map([['u1', VERIFIED]]));
  assert.deepEqual(
    eligible.map((r) => r.email),
    ['real@user.test']
  );
});

function collectNudgePathSource(): string {
  const src = readFileSync(path.join(root, 'src/lib/nudgeServer.ts'), 'utf8');
  const loadStart = src.indexOf('async function loadAuthMailboxUsers');
  assert.ok(loadStart !== -1, 'loadAuthMailboxUsers was renamed — re-read this guard');
  const collectStart = src.indexOf('export async function collectNudgeCandidates');
  assert.ok(collectStart !== -1, 'collectNudgeCandidates was renamed — re-read this guard');
  const collectEnd = src.indexOf('\nexport ', collectStart + 1);
  return src.slice(loadStart, collectEnd === -1 ? undefined : collectEnd);
}

test('collectNudgeCandidates does not send to the client-writable profiles.email', () => {
  const src = collectNudgePathSource();
  assert.doesNotMatch(
    src,
    /\.select\([^)]*\bemail\b/,
    'selecting profiles.email is how a client UPDATE becomes the To:'
  );
  assert.doesNotMatch(
    src,
    /\.not\(\s*['"]email['"]/,
    'filtering on profiles.email still treats that column as the mailbox'
  );
  assert.doesNotMatch(
    src,
    /email:\s*(profile|p|row)\.email/,
    'decideNudge must not take a raw profiles row email'
  );
  assert.match(
    src,
    /attachNudgeMailboxes/,
    'the collector must run the helper that refuses the profile column'
  );
  assert.match(
    src,
    /auth\.admin\.(getUserById|listUsers)/,
    'the auth mailbox must be loaded from auth.users, not profiles'
  );
});

test('the protect trigger freezes email, created_at, and last_nudge_at unless service_role', () => {
  const sql = readFileSync(
    path.join(root, 'supabase/migrations/20260817_profiles_protect_nudge_cols.sql'),
    'utf8'
  );
  assert.match(sql, /new\.email\s*:=\s*old\.email/);
  assert.match(sql, /new\.created_at\s*:=\s*old\.created_at/);
  assert.match(sql, /new\.last_nudge_at\s*:=\s*old\.last_nudge_at/);
  assert.match(sql, /auth\.role\(\)/);
  assert.match(sql, /service_role/);
  assert.match(sql, /before update on public\.profiles/i);
});
