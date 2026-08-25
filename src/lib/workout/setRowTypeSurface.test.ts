/**
 * Set-row type lives on the open Train lift. Today stays one Start.
 * Do not invent Track bodyweight. Do not paywall a type.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const BANNED =
  /UnlockButton|isPremium|\/bundle|loadBodyMetrics|bodyweightKg|HealthKit|discord\.com|WeChat|four-scene|Force Sync|Session Expired|SignInPrompt/i;
const FEED = /likes|Top 8|Feed permalink|shame slope/i;

describe('set-row type surface lock (.994)', () => {
  it('table declares data-row-type and duration is not a kg header', () => {
    const table = read('src/components/workout/SetLogTable.tsx');
    assert.match(table, /data-row-type=\{rowType\}/);
    assert.match(table, /rowType === 'duration'/);
    assert.match(table, /activeColTime/);
    assert.match(table, /activeColAssist/);
    assert.match(table, /set-table-duration/);
    assert.match(table, /SetRowDurationField/);
    assert.doesNotMatch(table, BANNED);
    assert.doesNotMatch(table, FEED);
    assert.doesNotMatch(table, /primary-action[\s\S]{0,80}Sign in/i);
  });

  it('empty duration does not invent a logged set', () => {
    const page = read('src/page-components/ActiveWorkoutPage.tsx');
    assert.match(page, /rowType === 'duration' && !\(Number\.isFinite\(hold\) && hold > 0\)\) return/);
    assert.match(page, /logSetAndAdvance\(/);
    assert.doesNotMatch(page, /loadBodyMetrics|bodyweightKg/);
  });

  it('card resolves type once — plusLoad is bodyweight only', () => {
    const card = read('src/components/workout/ActiveExerciseCard.tsx');
    assert.match(card, /resolveSetRowType/);
    assert.match(card, /rowType=\{rowType\}/);
    assert.match(card, /plusLoad=\{plusLoad\}/);
    assert.match(card, /const plusLoad = rowType === 'bodyweight'/);
  });

  it('Today stays one Start; lean and /private do not import set-row type', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, /setRowType|resolveSetRowType|data-row-type/);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, /setRowType|resolveSetRowType/);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, /setRowType|resolveSetRowType|data-row-type/);
  });

  it('volume path never reads Track / profile bodyweight', () => {
    const resume = read('src/lib/workout/sessionResume.ts');
    assert.match(resume, /setRowVolume/);
    assert.doesNotMatch(resume, /loadBodyMetrics|bodyweightKg|bodyMetrics/);
    const helper = read('src/lib/workout/setRowType.ts');
    assert.doesNotMatch(helper, /loadBodyMetrics|bodyweightKg/);
  });

  it('first set stays ungated — helper and table never mount a login wall', () => {
    for (const rel of [
      'src/lib/workout/setRowType.ts',
      'src/components/workout/SetLogTable.tsx',
      'src/components/workout/ActiveExerciseCard.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });

  it('thin-history honesty still scores Train — Wednesday / strip unchanged', () => {
    const thin = read('src/lib/workout/thinHistory.ts');
    assert.match(thin, /THIN_HISTORY_MAX_LIVE_SESSIONS = 2/);
    const cite = read('src/components/coach/CoachNextDayCite.tsx');
    assert.match(cite, /Not enough logs yet/);
    const strip = read('src/components/today/TodayQuietWeekStrip.tsx');
    assert.doesNotMatch(strip, /onTrack|todayDayStreak/);
  });
});
