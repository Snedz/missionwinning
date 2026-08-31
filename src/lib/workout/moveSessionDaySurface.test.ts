/**
 * Move this session lives on History detail. Not Today. Not a Feed.
 * Today stays one Start. Repeat .1026 / edit .997 / backfill .1000 stay.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const SHOP = /marketplace|template shop|3.template|discord\.com|WeChat|Trainer-rail|four-scene/i;
const PREMIUM = /from ['"]@\/lib\/(premium|trial|bundle)/;
const FEED = /likes|Top 8|Feed permalink|shame slope|navigator\.share|mailto:/i;
const BANNED =
  /UnlockButton|isPremium|\/bundle|discord\.com|WeChat|four-scene|Force Sync|Session Expired/i;
const MOVE = /decideMoveSessionDay|HistorySessionMove|session-history-move|moveSessionDay/;
const REPEAT = /decideRepeatThisSession|history-repeat-session/;
const EDIT = /decideEditSave|HistorySessionEdit|session-history-edit/;
const BACKFILL = /decideBackfillSession|HistoryBackfill|session-history-backfill/;

describe('move this session to another day surface lock (.1027)', () => {
  it('History detail mounts one Move to another day door', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /decideMoveSessionDay/);
    assert.match(page, /HistorySessionMove/);
    assert.match(page, /moveFinishedHistoryLog/);
    assert.doesNotMatch(page, SHOP);
    assert.doesNotMatch(page, PREMIUM);
    assert.doesNotMatch(page, FEED);
    assert.doesNotMatch(page, BANNED);
    const fields = read('src/components/history/HistorySessionMove.tsx');
    assert.match(fields, /data-testid="session-history-move"/);
    assert.match(fields, /data-testid="session-history-move-date"/);
    assert.match(fields, /data-testid="session-history-move-save"/);
    assert.match(fields, /historyMoveDay|Move to another day/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.match(fields, /type="date"/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, /decideThisDeviceResume|protectLiveStart|startWorkout/);
    const helper = read('src/lib/workout/moveSessionDay.ts');
    assert.match(helper, /decideMoveSessionDay/);
    assert.doesNotMatch(helper, /from '@\/store\/workoutStore'/);
  });

  it('Today stays one Start; lean, todayPrimaryAction, and /private do not import this', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, MOVE);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, MOVE);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, MOVE);
  });

  it('Repeat .1026 / edit .997 / backfill .1000 stay — this does not smash them', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, REPEAT);
    assert.match(page, EDIT);
    assert.match(page, BACKFILL);
    assert.match(page, /formatLogVolumeDisplay/);
    const cell = read('src/lib/workout/bodyweightLoad.ts');
    assert.match(cell, /formatCompletedWeightCell/);
    const month = read('src/lib/history/monthTheyOwn.ts');
    assert.match(month, /decideMonthDaySelect/);
  });

  it('day replay and receipt stay off this door', () => {
    const day = read('src/page-components/HistoryDayPage.tsx');
    assert.doesNotMatch(day, MOVE);
    assert.match(day, /decideRepeatThisSession/);
    const sheet = read('src/components/workout/WorkoutVictorySheet.tsx');
    assert.doesNotMatch(sheet, MOVE);
    assert.doesNotMatch(sheet, /decideStartAgain/);
  });

  it('first set stays ungated — move never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/moveSessionDay.ts',
      'src/components/history/HistorySessionMove.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });
});
