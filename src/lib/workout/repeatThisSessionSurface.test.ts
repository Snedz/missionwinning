/**
 * Repeat this session lives on History detail. Not Today. Not a Feed.
 * Today stays one Start. Receipt Start this again (.991) stays.
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
const REPEAT = /decideRepeatThisSession|history-repeat-session|repeatThisSession/;

describe('repeat this session surface lock (.1026)', () => {
  it('History detail mounts one Repeat this session door', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /decideRepeatThisSession/);
    assert.match(page, /data-testid="history-repeat-session"/);
    assert.match(page, /historyRepeatSession|Repeat this session/);
    assert.match(page, /history-save-routine|honorSaveAsRoutine/);
    assert.doesNotMatch(page, SHOP);
    assert.doesNotMatch(page, PREMIUM);
    assert.doesNotMatch(page, FEED);
    assert.doesNotMatch(page, BANNED);
    const helper = read('src/lib/workout/repeatThisSession.ts');
    assert.match(helper, /decideRepeatThisSession/);
    assert.doesNotMatch(helper, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(helper, SHOP);
    assert.doesNotMatch(helper, PREMIUM);
  });

  it('History day and list call the same helper — one copy decision', () => {
    const day = read('src/page-components/HistoryDayPage.tsx');
    assert.match(day, /decideRepeatThisSession/);
    assert.doesNotMatch(day, SHOP);
    const list = read('src/page-components/HistoryPage.tsx');
    assert.match(list, /historyTrainAgainShort|Again/);
    assert.match(list, /decideRepeatThisSession/);
  });

  it('Today stays one Start; lean, todayPrimaryAction, and /private do not import this', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, REPEAT);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, REPEAT);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, REPEAT);
  });

  it('receipt Start this again (.991) stays — this does not smash the close receipt', () => {
    const sheet = read('src/components/workout/WorkoutVictorySheet.tsx');
    assert.match(sheet, /decideStartAgain/);
    assert.match(sheet, /data-testid="victory-start-again"/);
    assert.doesNotMatch(sheet, /decideRepeatThisSession/);
  });

  it('first set stays ungated — Repeat never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/repeatThisSession.ts',
      'src/page-components/HistoryPage.tsx',
      'src/page-components/HistoryDayPage.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
    }
  });

  it('set-table .1025 and History volume .1024 stay', () => {
    const cell = read('src/lib/workout/bodyweightLoad.ts');
    assert.match(cell, /formatCompletedWeightCell/);
    const history = read('src/page-components/HistoryPage.tsx');
    assert.match(history, /formatLogVolumeDisplay/);
  });
});
