/**
 * Backfill lives on History (and Train overflow). Not Today. Not Resume.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const BANNED =
  /UnlockButton|isPremium|\/bundle|discord\.com|WeChat|four-scene|Force Sync|Session Expired/i;
const FEED = /likes|Top 8|Feed permalink|shame slope/i;
const BACKFILL = /decideBackfillSession|applyBackfillLog|HistoryBackfill|session-history-backfill/;
const IN_SET_PR = /decideInSetPr|formatInSetPrLabels|set-table-in-set-pr|inSetPrLabels/;

describe('backfill a past session surface lock (.1000)', () => {
  it('History mounts the backfill door and Save; Edit stays on History', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /decideBackfillSession/);
    assert.match(page, /saveBackfillLog/);
    assert.match(page, /HistoryBackfill/);
    assert.match(page, /decideEditSave/);
    assert.match(page, /HistorySessionEdit/);
    assert.equal(
      [...page.matchAll(/durationSeconds > 0/g)].length,
      2,
      'list + detail omit duration when timing is off'
    );
    assert.doesNotMatch(page, IN_SET_PR);
    assert.doesNotMatch(page, BANNED);
    assert.doesNotMatch(page, FEED);
    const fields = read('src/components/history/HistoryBackfill.tsx');
    assert.match(fields, /data-testid="session-history-backfill"/);
    assert.match(fields, /data-testid="session-history-backfill-save"/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, /decideThisDeviceResume|protectLiveStart|startWorkout/);
  });

  it('Today stays one Start; lean and /private do not import the backfill helper', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, BACKFILL);
    assert.doesNotMatch(lean, IN_SET_PR);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, BACKFILL);
    assert.doesNotMatch(primary, IN_SET_PR);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, BACKFILL);
    assert.doesNotMatch(priv, IN_SET_PR);
    assert.doesNotMatch(priv, /editFinishedSession|HistorySessionEdit|session-history-edit/);
  });

  it('Train overflow / empty Train offer the door without a second Start', () => {
    const chrome = read('src/components/workout/ActiveSessionChrome.tsx');
    assert.match(chrome, /onLogPastSession/);
    assert.match(chrome, /data-testid="session-train-backfill"/);
    assert.doesNotMatch(chrome, /primary-action|bg-primary-fill/);
    const empty = read('src/components/workout/ActiveEmptyState.tsx');
    assert.match(empty, /history\?backfill=1/);
    assert.match(empty, /data-testid="session-train-backfill"/);
    const links = empty.slice(empty.indexOf('Flow-9'), empty.indexOf('<ScreenDock'));
    assert.match(links, /historyBackfill|Log a past session/);
    assert.doesNotMatch(links, /primary-action|bg-primary-fill/);
    const dock = empty.slice(empty.indexOf('<ScreenDock'));
    assert.match(dock, /primary-action/);
    assert.doesNotMatch(dock, /historyBackfill|Log a past session/);
  });

  it('In-set PR stays off Today; History Edit stays on History', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.doesNotMatch(lean, IN_SET_PR);
    const history = read('src/page-components/HistoryPage.tsx');
    assert.match(history, /editFinishedSession|HistorySessionEdit|session-history-edit/);
  });

  it('first set stays ungated — backfill never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/backfillSession.ts',
      'src/components/history/HistoryBackfill.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });
});
