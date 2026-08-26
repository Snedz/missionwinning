/**
 * Copy this session lives on History detail. Not Today. Not a Feed.
 * Today stays one Start. Move .1027 / Repeat .1026 / edit .997 /
 * backfill .1000 stay.
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
const COPY = /decideCopySessionDay|HistorySessionCopy|session-history-copy|copySessionDay/;
const MOVE = /decideMoveSessionDay|HistorySessionMove|session-history-move/;
const REPEAT = /decideRepeatThisSession|history-repeat-session/;
const EDIT = /decideEditSave|HistorySessionEdit|session-history-edit/;
const BACKFILL = /decideBackfillSession|HistoryBackfill|session-history-backfill/;

describe('copy this session onto another day surface lock (.1030)', () => {
  it('History detail mounts one Copy to another day door', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /decideCopySessionDay/);
    assert.match(page, /HistorySessionCopy/);
    assert.match(page, /copyFinishedHistoryLog/);
    assert.doesNotMatch(page, SHOP);
    assert.doesNotMatch(page, PREMIUM);
    assert.doesNotMatch(page, FEED);
    assert.doesNotMatch(page, BANNED);
    const fields = read('src/components/history/HistorySessionCopy.tsx');
    assert.match(fields, /data-testid="session-history-copy"/);
    assert.match(fields, /data-testid="session-history-copy-date"/);
    assert.match(fields, /data-testid="session-history-copy-save"/);
    assert.match(fields, /historyCopyDay|Copy to another day/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.match(fields, /type="date"/);
    assert.match(fields, /variant="outline"/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, /decideThisDeviceResume|protectLiveStart|startWorkout/);
    const helper = read('src/lib/workout/copySessionDay.ts');
    assert.match(helper, /decideCopySessionDay/);
    assert.doesNotMatch(helper, /from '@\/store\/workoutStore'/);
  });

  it('Today stays one Start; lean, todayPrimaryAction, and /private do not import this', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, COPY);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, COPY);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, COPY);
  });

  it('Move .1027 / Repeat .1026 / edit .997 / backfill .1000 stay — this does not smash them', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, MOVE);
    assert.match(page, REPEAT);
    assert.match(page, EDIT);
    assert.match(page, BACKFILL);
    assert.match(page, /formatLogVolumeDisplay/);
    const move = read('src/lib/workout/moveSessionDay.ts');
    assert.match(move, /applyMoveSessionDay/);
    assert.match(move, /same id/i);
    const month = read('src/lib/history/monthTheyOwn.ts');
    assert.match(month, /decideMonthDaySelect/);
  });

  it('day replay and receipt stay off this door; Repeat still lands Start', () => {
    const day = read('src/page-components/HistoryDayPage.tsx');
    assert.doesNotMatch(day, COPY);
    assert.match(day, /decideRepeatThisSession/);
    const sheet = read('src/components/workout/WorkoutVictorySheet.tsx');
    assert.doesNotMatch(sheet, COPY);
    assert.match(sheet, /decideStartAgain/);
  });

  it('first set stays ungated — copy never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/copySessionDay.ts',
      'src/components/history/HistorySessionCopy.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });
});
