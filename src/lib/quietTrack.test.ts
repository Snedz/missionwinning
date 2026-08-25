/**
 * Quiet Track — empty invents nothing; a typed number is enough; blank save refused.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  canSaveQuietTrack,
  entryHasLoggedNumber,
  quietTrackSnapshot,
} from './quietTrack.ts';
import type { BodyMetricEntry } from './bodyMetrics.ts';

const root = path.join(import.meta.dirname, '..', '..');
const DAY_A = '2026-01-15';
const DAY_B = '2026-01-22';

const FORBIDDEN = /from ['"]@\/lib\/(premium|trial|bundle|rewards|geolocation|trackGps|wearables)/;

describe('quietTrack snapshot', () => {
  it('empty list invents nothing', () => {
    const snap = quietTrackSnapshot([]);
    assert.equal(snap.empty, true);
    assert.equal(snap.last, null);
    assert.doesNotMatch(JSON.stringify(snap), /weightKg":0/);
    assert.doesNotMatch(JSON.stringify(snap), /strain|recovery/);
  });

  it('date-only row is still empty', () => {
    const snap = quietTrackSnapshot([{ date: DAY_A }]);
    assert.equal(snap.empty, true);
    assert.equal(snap.last, null);
    assert.equal(entryHasLoggedNumber({ date: DAY_A }), false);
  });

  it('logged weight is the last number', () => {
    const row: BodyMetricEntry = { date: DAY_B, weightKg: 81.2 };
    const snap = quietTrackSnapshot([{ date: DAY_A }, row]);
    assert.equal(snap.empty, false);
    assert.equal(snap.last?.weightKg, 81.2);
    assert.equal(snap.last?.date, DAY_B);
  });

  it('tape-only (waist) counts as a logged number', () => {
    const snap = quietTrackSnapshot([{ date: DAY_A, waistCm: 84 }]);
    assert.equal(snap.empty, false);
    assert.equal(snap.last?.waistCm, 84);
    assert.equal(snap.last?.weightKg, undefined);
  });

  it('blank save is refused; a typed number is enough', () => {
    assert.equal(canSaveQuietTrack({ date: DAY_A }), false);
    assert.equal(canSaveQuietTrack({ date: DAY_A, note: 'felt light' }), false);
    assert.equal(canSaveQuietTrack({ date: DAY_A, weightKg: 80 }), true);
    assert.equal(canSaveQuietTrack({ date: DAY_A, chestCm: 100 }), true);
  });

  it('helper does not import premium, trial, Health, or rewards', () => {
    const src = readFileSync(path.join(root, 'src/lib/quietTrack.ts'), 'utf8');
    assert.doesNotMatch(src, FORBIDDEN);
    assert.doesNotMatch(src, /getCurrentPosition|HealthKit|health.connect/i);
    assert.doesNotMatch(src, /usePremium|isPremium/);
  });
});
