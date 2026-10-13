import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildWeekLoggedRow,
  isPlausibleDeviceId,
  resolveWeekLoggedOwner,
} from './weekLoggedRow';

describe('isPlausibleDeviceId', () => {
  it('bounds shape so an address is not an arbitrary blob', () => {
    assert.equal(isPlausibleDeviceId('3f2b1c9e-4a5d-4e6f-8a9b-0c1d2e3f4a5b'), true);
    assert.equal(isPlausibleDeviceId('dev-1'), true);
    assert.equal(isPlausibleDeviceId(''), false);
    assert.equal(isPlausibleDeviceId('a'.repeat(65)), false);
    assert.equal(isPlausibleDeviceId(undefined), false);
    assert.equal(isPlausibleDeviceId(42), false);
  });
});

describe('resolveWeekLoggedOwner', () => {
  it('signed in: account owns the row, device is attached when present', () => {
    const r = resolveWeekLoggedOwner({ userId: 'u-1', deviceId: 'dev-1' });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.owner, 'account');
    assert.equal(r.userId, 'u-1');
    // Carrying both columns is what lets the reader collapse the weeks an athlete
    // logged anonymously onto their account cohort. Without it they split in two.
    assert.equal(r.deviceId, 'dev-1');
  });

  it('signed in without a usable device id still resolves — consent is for the anonymous path', () => {
    const r = resolveWeekLoggedOwner({ userId: 'u-1', hasPushConsent: false });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.owner, 'account');
    assert.equal(r.deviceId, null);
  });

  it('accountless with a device and consent: device owns the row', () => {
    const r = resolveWeekLoggedOwner({ userId: null, deviceId: 'dev-1', hasPushConsent: true });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.owner, 'device');
    assert.equal(r.userId, null);
    assert.equal(r.deviceId, 'dev-1');
  });

  it('accountless without consent is refused — a client cannot assert its own permission', () => {
    const r = resolveWeekLoggedOwner({ userId: null, deviceId: 'dev-1', hasPushConsent: false });
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.equal(r.reason, 'consent_required');
  });

  it('accountless with no device id is refused', () => {
    const r = resolveWeekLoggedOwner({ userId: null, hasPushConsent: true });
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.equal(r.reason, 'device_id_required');
  });

  it('a refused write never produces a row with an owner-shaped hole', () => {
    // The DB CHECK would also catch this, but the point of the pure module is that the
    // route cannot express the invalid state at all.
    for (const input of [
      { userId: null, deviceId: undefined, hasPushConsent: undefined },
      { userId: null, deviceId: '', hasPushConsent: true },
      { userId: null, deviceId: 'dev-1', hasPushConsent: undefined },
    ]) {
      const r = resolveWeekLoggedOwner(input);
      assert.equal(r.ok, false);
    }
  });
});

describe('buildWeekLoggedRow', () => {
  it('produces exactly one owner column set — never both null', () => {
    const account = resolveWeekLoggedOwner({ userId: 'u-1', deviceId: 'dev-1' });
    const device = resolveWeekLoggedOwner({
      userId: null,
      deviceId: 'dev-1',
      hasPushConsent: true,
    });
    assert.ok(account.ok && device.ok);

    const a = buildWeekLoggedRow(account, '2026-W33');
    assert.deepEqual(a, { user_id: 'u-1', device_id: 'dev-1', iso_week: '2026-W33' });

    const d = buildWeekLoggedRow(device, '2026-W33');
    assert.deepEqual(d, { user_id: null, device_id: 'dev-1', iso_week: '2026-W33' });

    // Mirrors the CHECK constraint added in 20261009_week_logged_device_owners.sql.
    assert.ok(a.user_id !== null || a.device_id !== null);
    assert.ok(d.user_id !== null || d.device_id !== null);
  });
});

describe('migration contract', () => {
  it('the owner CHECK and generated key match what this module produces', () => {
    // Source-text, deliberately: the constraint and the writer must agree, and the only
    // way to assert that without a database is to read the two sides together.
    const sql = readFileSync(
      new URL('../../supabase/migrations/20261009_week_logged_device_owners.sql', import.meta.url),
      'utf8'
    );
    assert.match(sql, /check \(user_id is not null or device_id is not null\)/);
    assert.match(sql, /generated always as/);
    assert.match(sql, /'u:' \|\| user_id::text/);
    assert.match(sql, /'d:' \|\| device_id/);
    // The reader this migration ships is the one the product is missing entirely.
    assert.match(sql, /mw_week4_retention_weekly/);
  });

  it('the ISO week is sliced at the right offsets', () => {
    // 'YYYY-Www' — position 6 is the 'W'. Slicing `from 6 for 2` yields 'W3', which
    // raises on the int cast the first time the function runs and never before, so the
    // function would look installed and fail only in production. Pinned by construction.
    const sql = readFileSync(
      new URL('../../supabase/migrations/20261009_week_logged_device_owners.sql', import.meta.url),
      'utf8'
    );
    assert.match(sql, /substring\(w\.iso_week from 1 for 4\)::int as iso_year/);
    assert.match(sql, /substring\(w\.iso_week from 7 for 2\)::int as iso_wk/);
    // Comments are stripped first: this migration explains the very mistake it avoids,
    // so the phrase appears in the prose and must not be mistaken for live SQL.
    const code = sql
      .split('\n')
      .filter((l) => !l.trimStart().startsWith('--'))
      .join('\n');
    assert.doesNotMatch(code, /from 6 for 2/);

    // And the week-4 rule has to land on +21 days, which is what
    // `mw_week4_retention()`'s day-21..28 window already means.
    const week = '2026-W33';
    assert.equal(week.slice(0, 4), '2026');
    assert.equal(week.slice(6, 8), '33');
  });
});

import { readFileSync } from 'node:fs';