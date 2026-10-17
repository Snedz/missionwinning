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
  garageAuthorStamp,
  garageCompareKey,
  garageMissionFallback,
  garageMissionLabel,
  isGarageCallSign,
  realNameIsReserved,
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
  assert.equal(callSignToSync('  Oak  '), 'oak');
  assert.equal(callSignToSync('Ｏａｋ'), 'oak');
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
    'oak'
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
  assert.deepEqual(
    garageAuthorStamp({ callSign: 'Oak', mode: 'real_name', fullName: '  Jane Doe  ', missionId: 7 }),
    { label: 'Jane Doe', realName: true }
  );
  assert.equal(garageAuthorLabel({ callSign: 'Oak', mode: 'real_name', fullName: '   ', missionId: 7 }), 'oak');
  assert.equal(garageAuthorLabel({ callSign: null, mode: 'real_name', fullName: '', missionId: 3 }), 'Mission 03');
  assert.equal(garageAuthorLabel({ mode: 'real_name', fullName: 'x'.repeat(40), missionId: 1 }).length, 24);
  assert.equal(garageAuthorStamp({ mode: 'real_name', fullName: 'x'.repeat(40), missionId: 1 }).realName, true);
});

test('a real name that matches a call sign or starts with Mission falls back', () => {
  const taken = ['founder', 'oak'];
  const spoofs = [
    'Founder',
    '  FOUNDER  ',
    'Fou\u200Bnder',
    'Ｆｏｕｎｄｅｒ',
    'Founder\u00A0',
    '\u3000Founder',
    'Mission 07',
    ' mission  07',
    'MISSION',
    'Mission\u200B 07',
    'Missionary',
  ];
  for (const name of spoofs) {
    assert.equal(realNameIsReserved(name, taken), true, name);
    const stamp = garageAuthorStamp({
      callSign: 'Oak',
      mode: 'real_name',
      fullName: name,
      missionId: 7,
      takenCallSigns: taken,
    });
    assert.equal(stamp.realName, false, name);
    assert.equal(stamp.label, 'oak', name);
  }
  const noHandle = garageAuthorStamp({
    callSign: null,
    mode: 'real_name',
    fullName: 'Mission 07',
    missionId: 7,
    takenCallSigns: taken,
  });
  assert.deepEqual(noHandle, { label: 'Mission 07', realName: false });
  assert.equal(realNameIsReserved('   ', taken), false);
  assert.equal(realNameIsReserved('\u200B', taken), false);
  assert.equal(garageCompareKey('Jane\u00A0Doe'), 'jane doe');
  const clean = garageAuthorStamp({
    callSign: 'oak',
    mode: 'real_name',
    fullName: 'Jane Doe',
    missionId: 7,
    takenCallSigns: taken,
  });
  assert.deepEqual(clean, { label: 'Jane Doe', realName: true });
  const phrase = garageAuthorStamp({
    callSign: 'oak',
    mode: 'real_name',
    fullName: 'My Mission',
    missionId: 7,
    takenCallSigns: taken,
  });
  assert.deepEqual(phrase, { label: 'My Mission', realName: true });
  const forced = garageAuthorStamp({
    callSign: 'oak',
    mode: 'real_name',
    fullName: 'Jane Doe',
    missionId: 7,
    reserved: true,
  });
  assert.deepEqual(forced, { label: 'oak', realName: false });
  const ownHandle = garageAuthorStamp({
    callSign: 'oak',
    mode: 'real_name',
    fullName: 'Oak',
    missionId: 7,
    takenCallSigns: taken,
  });
  assert.deepEqual(ownHandle, { label: 'oak', realName: false });
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
  assert.match(src, /garageAuthorStamp/);
  assert.match(src, /garageMissionLabel/);
  assert.match(src, /garage_real_name_reserved/);
  assert.match(get, /author_name_kind/);
  assert.match(src, /author_name_kind: stamped\.realName \? 'real_name' : 'call_sign'/);
  const modeAt = src.indexOf("garage_name_mode === 'real_name'");
  const nameAt = src.indexOf(".select('full_name')");
  assert.ok(modeAt !== -1 && nameAt > modeAt, 'full_name is read only after the real_name opt-in');
  assert.equal((src.match(/\.select\('full_name'\)/g) ?? []).length, 1);
  const rpcAt = src.indexOf("rpc('garage_real_name_reserved'");
  assert.ok(rpcAt > nameAt, 'the collision check runs on the opted-in name');
  assert.match(src, /error != null \|\| data !== false/);
});

test('the client sync writes call_sign and never selects full_name', () => {
  const sync = read('src/lib/social/callSignSync.ts')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '');
  assert.doesNotMatch(sync, /full_name/);
  assert.match(sync, /select\('call_sign, garage_name_mode'\)/);
  assert.match(sync, /syncDeviceCallSign/);
  assert.match(sync, /saveGarageNameMode/);
  assert.match(sync, /normalizeCallSign/);
  assert.match(sync, /garage_real_name_reserved/);
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
  assert.match(card, /garageNameReserved/);
  const list = read('src/components/social/MessageList.tsx');
  assert.match(list, /authorNameKind === 'real_name'/);
  assert.match(list, /serverRealNameBadge/);
  assert.match(list, /garage-real-name-badge/);
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
  assert.match(sql, /create unique index profiles_call_sign_unique/);
  assert.match(sql, /on public\.profiles \(lower\(call_sign\)\)/);
  assert.match(sql, /garage_name_mode public\.garage_name_mode not null default 'call_sign'/);
  assert.match(sql, /function public\.garage_compare_key\(raw text\)/);
  assert.match(sql, /function public\.garage_display_name\(raw text\)/);
  assert.match(sql, /function public\.garage_real_name_reserved\(raw text\)/);
  assert.match(sql, /security definer/);
  assert.match(sql, /starts_with\(key, 'mission'\)/);
  assert.match(sql, /lower\(h\.call_sign\) = key/);
  assert.doesNotMatch(sql, /garage_compare_key\(h\.call_sign\)/);
  assert.match(sql, /chr\(160\)/);
  assert.match(sql, /chr\(12288\)/);
  assert.match(sql, /when p\.garage_name_mode = 'real_name' then p\.full_name/);
  assert.doesNotMatch(sql, /left\(btrim\(p\.full_name\), 24\)/);
  assert.equal((sql.match(/p\.full_name/g) ?? []).length, 1);
  assert.match(sql, /raise exception 'garage_real_name_reserved'/);
  assert.match(sql, /errcode = '23514'/);
  assert.match(sql, /NEW\.author_name_kind := 'real_name'/);
  assert.match(sql, /author_name_kind in \('call_sign', 'real_name'\)/);
  assert.match(sql, /coalesce\(auth\.role\(\), ''\) = 'service_role'/);
  assert.match(sql, /if NEW\.call_sign is not null then/);
  const owner = sql.slice(
    sql.indexOf('function public.profiles_owner_garage_identity()'),
    sql.indexOf('function public.social_messages_stamp_author()')
  );
  const resetAt = owner.indexOf("= 'service_role'");
  const resetReturn = owner.indexOf('return NEW;', resetAt);
  const raiseAt = owner.indexOf("raise exception 'garage_real_name_reserved'");
  assert.ok(resetAt !== -1 && resetReturn !== -1 && resetReturn < raiseAt);
  assert.match(sql, /'Mission ' \|\| lpad\(mid::text, 2, '0'\)/);
  assert.match(sql, /auth\.uid\(\) is distinct from NEW\.id/);
  assert.match(sql, /before insert or update on public\.profiles/i);
  assert.doesNotMatch(sql, /label := 'Athlete'/);
});

/**
 * The owner trigger's raise, evaluated from the SQL text.
 * INSERT never reads OLD (CASE). An unrelated column change does not raise.
 */
function reservedRaiseOnProfileWrite(
  ownerSql: string,
  write: {
    op: 'INSERT' | 'UPDATE';
    oldFullName: string | null;
    newFullName: string | null;
    oldMode: 'call_sign' | 'real_name';
    newMode: 'call_sign' | 'real_name';
    reserved: boolean;
  }
): boolean {
  const raiseAt = ownerSql.indexOf("raise exception 'garage_real_name_reserved'");
  assert.ok(raiseAt !== -1);
  const caseAt = ownerSql.lastIndexOf('if case', raiseAt);
  assert.ok(caseAt !== -1, 'the reserved-name raise must sit inside the name/mode CASE');
  const gate = ownerSql.slice(caseAt, raiseAt);
  assert.match(gate, /when tg_op = 'INSERT' then true/);
  assert.match(gate, /NEW\.full_name is distinct from OLD\.full_name/);
  assert.match(gate, /NEW\.garage_name_mode is distinct from OLD\.garage_name_mode/);
  assert.match(gate, /else NEW\.full_name is distinct from OLD\.full_name/);
  assert.match(gate, /and NEW\.garage_name_mode = 'real_name'/);
  assert.match(gate, /garage_real_name_reserved\(NEW\.full_name\)/);
  const distinct = (left: string | null, right: string | null) => left !== right;
  const publishingWrite =
    write.op === 'INSERT' ||
    distinct(write.oldFullName, write.newFullName) ||
    distinct(write.oldMode, write.newMode);
  return publishingWrite && write.newMode === 'real_name' && write.reserved;
}

test('a later colliding call sign does not block an unrelated profile update', () => {
  const sql = read('supabase/migrations/20261017_social_messages_stamp_author.sql');
  const owner = sql.slice(
    sql.indexOf('function public.profiles_owner_garage_identity()'),
    sql.indexOf('function public.social_messages_stamp_author()')
  );
  assert.equal((owner.match(/raise exception 'garage_real_name_reserved'/g) ?? []).length, 1);
  assert.doesNotMatch(
    owner,
    /if NEW\.garage_name_mode = 'real_name'\s+and public\.garage_real_name_reserved/
  );

  // A is already in real_name. B then claims call sign "jane". A's reminders
  // toggle writes reminders_opt_in only (AccountPage). That update succeeds.
  const reminders = reservedRaiseOnProfileWrite(owner, {
    op: 'UPDATE',
    oldFullName: 'Jane',
    newFullName: 'Jane',
    oldMode: 'real_name',
    newMode: 'real_name',
    reserved: true,
  });
  assert.equal(reminders, false);

  assert.equal(
    reservedRaiseOnProfileWrite(owner, {
      op: 'UPDATE',
      oldFullName: 'Safe Name',
      newFullName: 'Jane',
      oldMode: 'real_name',
      newMode: 'real_name',
      reserved: true,
    }),
    true
  );
  assert.equal(
    reservedRaiseOnProfileWrite(owner, {
      op: 'UPDATE',
      oldFullName: 'Jane',
      newFullName: 'Jane',
      oldMode: 'call_sign',
      newMode: 'real_name',
      reserved: true,
    }),
    true
  );
  assert.equal(
    reservedRaiseOnProfileWrite(owner, {
      op: 'INSERT',
      oldFullName: null,
      newFullName: 'Jane',
      oldMode: 'call_sign',
      newMode: 'real_name',
      reserved: true,
    }),
    true
  );
  assert.equal(
    reservedRaiseOnProfileWrite(owner, {
      op: 'UPDATE',
      oldFullName: 'Jane',
      newFullName: 'Jane',
      oldMode: 'real_name',
      newMode: 'real_name',
      reserved: false,
    }),
    false
  );
});
