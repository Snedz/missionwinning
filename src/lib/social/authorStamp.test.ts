/**
 * The garage author line is the owner's choice, on both doors.
 * full_name reaches a post only after an explicit real_name opt-in.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { UNSET_CALL_SIGN } from '@/lib/social/callSign';
import { rowToGarageMessage } from '@/lib/social/cloud';
import {
  DEVICE_DEFAULT_CALL_SIGN,
  callSignToSync,
  garageAuthorLabel,
  garageMissionFallback,
  garageMissionLabel,
  isGarageCallSign,
} from '@/lib/social/authorStamp';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('a call sign is 3-20 letters, numbers, hyphen, or underscore', () => {
  assert.equal(isGarageCallSign('Oak'), true);
  assert.equal(isGarageCallSign('Red_Oak'), true);
  assert.equal(isGarageCallSign('a-1'), true);
  assert.equal(isGarageCallSign('ab'), false);
  assert.equal(isGarageCallSign('Red Oak'), false);
  assert.equal(isGarageCallSign('has.dot'), false);
  assert.equal(isGarageCallSign('x'.repeat(21)), false);
  assert.equal(isGarageCallSign(''), false);
  assert.equal(isGarageCallSign(null), false);
});

test('the device default is not synced, and a spaced name is not a call sign', () => {
  assert.equal(DEVICE_DEFAULT_CALL_SIGN, UNSET_CALL_SIGN);
  assert.equal(callSignToSync(UNSET_CALL_SIGN), null);
  assert.equal(callSignToSync('  Red Oak  '), null);
  assert.equal(callSignToSync('  Oak  '), 'Oak');
  assert.equal(callSignToSync('ab'), null);
});

test('the mission number is the account id, two digits, or absent', () => {
  assert.equal(garageMissionLabel(1), '01');
  assert.equal(garageMissionLabel(42), '42');
  assert.equal(garageMissionLabel(0), '00');
  assert.equal(garageMissionLabel(100), null);
  assert.equal(garageMissionLabel(1.5), null);
  assert.equal(garageMissionLabel(null), null);
});

test('posts show the call sign, then Mission NN, and a real name only when opted in', () => {
  assert.equal(
    garageAuthorLabel({ callSign: 'Oak', mode: 'call_sign', fullName: 'Jane Doe', missionId: 7 }),
    'Oak'
  );
  assert.equal(
    garageAuthorLabel({ callSign: null, mode: 'call_sign', fullName: 'Jane Doe', missionId: 7 }),
    'Mission 07'
  );
  assert.equal(
    garageAuthorLabel({ callSign: 'Red Oak', mode: 'call_sign', fullName: 'Jane Doe', missionId: 7 }),
    'Mission 07'
  );
  assert.equal(garageAuthorLabel({ callSign: null, mode: 'call_sign', fullName: 'Jane Doe', missionId: null }), 'Mission');
  assert.equal(garageMissionFallback(42), 'Mission 42');
  assert.equal(
    garageAuthorLabel({ callSign: 'Oak', mode: 'real_name', fullName: '  Jane Doe  ', missionId: 7 }),
    'Jane Doe'
  );
  assert.equal(garageAuthorLabel({ callSign: 'Oak', mode: 'real_name', fullName: '   ', missionId: 7 }), 'Oak');
  assert.equal(garageAuthorLabel({ callSign: null, mode: 'real_name', fullName: '', missionId: 3 }), 'Mission 03');
  assert.equal(garageAuthorLabel({ mode: 'real_name', fullName: 'x'.repeat(40), missionId: 1 }).length, 24);
});

test('a message row does not carry full_name to the client', () => {
  const message = rowToGarageMessage({
    id: 'm1',
    channel_slug: 'train',
    body: 'hello',
    author_call_sign: 'Oak',
    author_mission_id: '07',
    created_at: '2026-08-14T12:00:00.000Z',
    full_name: 'Jane Doe',
  });
  assert.equal(message?.authorCallSign, 'Oak');
  assert.equal(JSON.stringify(message).includes('Jane Doe'), false);
});

test('the route does not store the client author fields or return a real name by default', () => {
  const src = read('app/api/social/messages/route.ts');
  const get = src.slice(src.indexOf('export const GET'), src.indexOf('export const POST'));
  assert.doesNotMatch(get, /full_name/);
  assert.doesNotMatch(src, /parsed\.data\.authorCallSign/);
  assert.doesNotMatch(src, /parsed\.data\.authorMissionId/);
  assert.doesNotMatch(src, /parsed\.data\.createdAt/);
  assert.match(src, /garageAuthorLabel/);
  assert.match(src, /garageMissionLabel/);
  const modeAt = src.indexOf("garage_name_mode === 'real_name'");
  const nameAt = src.indexOf(".select('full_name')");
  assert.ok(modeAt !== -1 && nameAt > modeAt, 'full_name is read only after the real_name opt-in');
  assert.equal((src.match(/\.select\('full_name'\)/g) ?? []).length, 1);
});

test('the client sync writes call_sign and never selects full_name', () => {
  const sync = read('src/lib/social/callSignSync.ts')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '');
  assert.doesNotMatch(sync, /full_name/);
  assert.match(sync, /select\('call_sign, garage_name_mode'\)/);
  assert.match(sync, /syncDeviceCallSign/);
  assert.match(sync, /saveGarageNameMode/);
  const outbox = read('src/lib/socialSync.ts');
  const handler = outbox.indexOf("registerHandler('social.message'");
  const syncAt = outbox.indexOf('syncDeviceCallSign(', handler);
  const postAt = outbox.indexOf("postJson('/api/social/messages'", handler);
  assert.ok(handler !== -1 && syncAt > handler && syncAt < postAt);
  const page = read('src/page-components/AccountPage.tsx');
  assert.match(page, /<GarageNameCard/);
  const card = read('src/components/profile/GarageNameCard.tsx');
  assert.match(card, /saveGarageNameMode\('call_sign'\)|chooseMode\('call_sign'\)/);
  assert.match(card, /chooseMode\('real_name'\)/);
  assert.match(card, /saveGarageCallSign/);
});

test('BEFORE INSERT stamps call_sign, Mission NN, and full_name only when opted in', () => {
  const sql = read('supabase/migrations/20261017_social_messages_stamp_author.sql');
  assert.match(sql, /before insert on public\.social_messages/i);
  assert.match(sql, /NEW\.created_at\s*:=\s*now\(\)/);
  assert.match(sql, /from public\.profiles/);
  assert.match(sql, /from public\.mission_ids/);
  assert.match(sql, /NEW\.author_call_sign/);
  assert.match(sql, /NEW\.author_mission_id/);
  assert.match(sql, /create type public\.garage_name_mode as enum \('call_sign', 'real_name'\)/);
  assert.match(sql, /call_sign ~ '\^\[A-Za-z0-9_-\]\{3,20\}\$'/);
  assert.match(sql, /profiles_call_sign_unique/);
  assert.match(sql, /garage_name_mode public\.garage_name_mode not null default 'call_sign'/);
  assert.match(sql, /when p\.garage_name_mode = 'real_name' then left\(btrim\(p\.full_name\), 24\)/);
  assert.equal((sql.match(/p\.full_name/g) ?? []).length, 1);
  assert.match(sql, /'Mission ' \|\| lpad\(mid::text, 2, '0'\)/);
  assert.match(sql, /auth\.uid\(\) is distinct from NEW\.id/);
  assert.match(sql, /before insert or update on public\.profiles/i);
  assert.doesNotMatch(sql, /label := 'Athlete'/);
});
