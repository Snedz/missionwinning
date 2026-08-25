/**
 * This-movement history lives on the open Train lift. Not a chart.
 * Today stays one Start. Honesty .971 still applies when the list is short.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const BANNED =
  /UnlockButton|isPremium|\/bundle|History1RMChart|Sparkline|projected.?max|permalink|discord\.com|WeChat|four-scene|Force Sync|Session Expired|SignInPrompt/i;
const FEED = /likes|Top 8|Feed permalink|shame slope/i;

describe('movement history surface lock (.993)', () => {
  it('header name is the open control; sheet empty copy matches; footer is Close', () => {
    const header = read('src/components/workout/ActiveExerciseHeader.tsx');
    assert.match(header, /data-testid="movement-history-open"/);
    assert.match(header, /MovementHistorySheet/);
    assert.match(header, /listMovementHistory/);
    assert.doesNotMatch(header, BANNED);
    assert.doesNotMatch(header, /primary-action|bg-primary-fill/);

    const sheet = read('src/components/workout/MovementHistorySheet.tsx');
    assert.match(sheet, /data-testid="movement-history-sheet"/);
    assert.match(sheet, /data-testid="movement-history-empty"/);
    assert.match(sheet, /No prior sessions yet — log this one/);
    assert.match(sheet, /data-testid="movement-history-row"/);
    assert.match(sheet, /data-testid="movement-history-close"/);
    assert.match(sheet, /variant="outline"/);
    assert.match(sheet, /isShortMovementHistory/);
    assert.doesNotMatch(sheet, /primary-action|Start workout|decideStartAgain|libraryTrainThis/);
    assert.doesNotMatch(sheet, BANNED);
    assert.doesNotMatch(sheet, FEED);
    assert.doesNotMatch(sheet, /onTrack|consistency|streak|projected/i);
  });

  it('Today stays one Start; lean and /private do not import movement history', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, /movementHistory|MovementHistorySheet|movement-history/);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, /movementHistory|listMovementHistory/);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, /movementHistory|MovementHistorySheet|movement-history/);
  });

  it('History first paint stays the session list; Library spark stays off Train', () => {
    const history = read('src/page-components/HistoryPage.tsx');
    assert.match(history, /toSessionHistoryRow|listSessionHistoryRows|liveSessionLogs/);
    assert.doesNotMatch(history, /listMovementHistory/);
    const sheet = read('src/components/workout/MovementHistorySheet.tsx');
    assert.doesNotMatch(sheet, /Sparkline|History1RMChart|volumeSpark/);
    const library = read('src/components/library/LibraryDetailSheet.tsx');
    assert.match(library, /countExerciseHistory/);
    assert.doesNotMatch(library, /listMovementHistory/);
  });

  it('thin-history honesty still scores Train — Wednesday / strip unchanged', () => {
    const thin = read('src/lib/workout/thinHistory.ts');
    assert.match(thin, /THIN_HISTORY_MAX_LIVE_SESSIONS = 2/);
    const cite = read('src/components/coach/CoachNextDayCite.tsx');
    assert.match(cite, /Not enough logs yet/);
    const strip = read('src/components/today/TodayQuietWeekStrip.tsx');
    assert.doesNotMatch(strip, /onTrack|todayDayStreak/);
  });

  it('first set stays ungated — helper and sheet never mount a login wall', () => {
    for (const rel of [
      'src/lib/workout/movementHistory.ts',
      'src/components/workout/MovementHistorySheet.tsx',
      'src/components/workout/ActiveExerciseHeader.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });
});
