/**
 * The garage author line comes from the account, on both doors.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { garageCallSignFromProfile, garageMissionLabel } from '@/lib/social/authorStamp';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('the visible label is the profile name, clipped, or Athlete', () => {
  assert.equal(garageCallSignFromProfile('  Founder  '), 'Founder');
  assert.equal(garageCallSignFromProfile(''), 'Athlete');
  assert.equal(garageCallSignFromProfile(null), 'Athlete');
  assert.equal(garageCallSignFromProfile('x'.repeat(40)).length, 24);
});

test('the mission number is the account id, two digits, or absent', () => {
  assert.equal(garageMissionLabel(1), '01');
  assert.equal(garageMissionLabel(42), '42');
  assert.equal(garageMissionLabel(0), '00');
  assert.equal(garageMissionLabel(100), null);
  assert.equal(garageMissionLabel(1.5), null);
  assert.equal(garageMissionLabel(null), null);
});

test('the route does not store the client author fields', () => {
  const src = read('app/api/social/messages/route.ts');
  assert.doesNotMatch(src, /parsed\.data\.authorCallSign/);
  assert.doesNotMatch(src, /parsed\.data\.authorMissionId/);
  assert.doesNotMatch(src, /parsed\.data\.createdAt/);
  assert.match(src, /garageCallSignFromProfile/);
  assert.match(src, /garageMissionLabel/);
});

test('BEFORE INSERT overwrites call sign, mission number, and created_at', () => {
  const sql = read('supabase/migrations/20261017_social_messages_stamp_author.sql');
  assert.match(sql, /before insert on public\.social_messages/i);
  assert.match(sql, /NEW\.created_at\s*:=\s*now\(\)/);
  assert.match(sql, /from public\.profiles/);
  assert.match(sql, /full_name/);
  assert.match(sql, /from public\.mission_ids/);
  assert.match(sql, /NEW\.author_call_sign/);
  assert.match(sql, /NEW\.author_mission_id/);
});
