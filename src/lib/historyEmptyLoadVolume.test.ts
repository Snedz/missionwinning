/**
 * History session volume is reps, not 0 kg (`.1024`).
 * Victory already says 8 reps. History still interpolated stored totalVolume 0 as 0 kg.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  formatLogVolumeDisplay,
  formatWorkoutVolumeDisplay,
  sumWorkingReps,
} from './workout/volumeDisplay.ts';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const bwLog = {
  totalVolume: 0,
  exercises: [
    {
      sets: [
        { reps: 8, kind: 'normal' as const },
        { reps: 5, kind: 'warmup' as const },
      ],
    },
  ],
};

const loadedLog = {
  totalVolume: 400,
  exercises: [{ sets: [{ reps: 5, kind: 'normal' as const }] }],
};

describe('history session volume is reps, not 0 kg (.1024)', () => {
  it('push-ups 8 × 0 display as 8 reps, not 0 kg', () => {
    const out = formatLogVolumeDisplay(bwLog, 'kg', (n) => String(n));
    assert.equal(out.value, '8');
    assert.equal(out.unit, 'reps');
    assert.equal(sumWorkingReps(bwLog.exercises), 8);
    assert.doesNotMatch(`${out.value} ${out.unit}`, /0 kg/);
  });

  it('loaded session stays kg', () => {
    const out = formatLogVolumeDisplay(loadedLog, 'kg', (n) => String(n));
    assert.equal(out.value, '400');
    assert.equal(out.unit, 'kg');
  });

  it('empty invents nothing', () => {
    const out = formatLogVolumeDisplay({ totalVolume: 0, exercises: [] }, 'kg', (n) => String(n));
    assert.equal(out.value, '0');
    assert.equal(out.unit, 'kg');
    const missing = formatWorkoutVolumeDisplay(0, 0, 'lbs', (n) => String(n));
    assert.equal(missing.unit, 'lbs');
  });

  it('History list + detail use the helper — no raw 0 kg interpolator', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /formatLogVolumeDisplay/);
    assert.doesNotMatch(page, /fmt\.num\(log\.totalVolume\)\} \{unitLabel\}/);
    assert.doesNotMatch(page, /fmt\.num\(selected\.totalVolume\)/);
    const helper = read('src/lib/workout/volumeDisplay.ts');
    assert.match(helper, /export function formatLogVolumeDisplay/);
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
  });

  it('career briefing stays kg-honest — not mixed with session reps', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /historyBriefingLine/);
    assert.match(page, /summary\.totalVolume/);
    assert.match(page, /historyAvgVolume/);
    assert.doesNotMatch(page, /formatLogVolumeDisplay\(summary/);
  });
});
