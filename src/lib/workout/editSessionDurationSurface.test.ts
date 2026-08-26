/**
 * Edit this session's logged duration lives on History detail.
 * Not Today. Not a Feed. Live pause stays on Train.
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
const DURATION =
  /decideEditSessionDuration|HistorySessionDuration|session-history-duration|editSessionDuration/;
const NAME = /HistorySessionName|nameFinishedHistoryLog|session-history-name/;
const MOVE = /HistorySessionMove|decideMoveSessionDay|moveFinishedHistoryLog/;
const COPY = /HistorySessionCopy|decideCopySessionDay|copyFinishedHistoryLog/;
const REORDER =
  /decideReorderFinishedExercises|session-history-reorder-up|session-history-reorder-down/;

describe('edit this session duration surface lock (.1035)', () => {
  it('History detail mounts HistorySessionDuration / durationFinishedHistoryLog', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /HistorySessionDuration/);
    assert.match(page, /durationFinishedHistoryLog/);
    assert.doesNotMatch(page, BANNED);
    assert.doesNotMatch(page, FEED);
    const fields = read('src/components/history/HistorySessionDuration.tsx');
    assert.match(fields, /data-testid="session-history-duration"/);
    assert.match(fields, /data-testid="session-history-duration-input"/);
    assert.match(fields, /data-testid="session-history-duration-save"/);
    assert.match(fields, /historyDurationLabel|Duration/);
    assert.match(fields, /historyDurationSave|Save duration/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.match(fields, /variant="outline"/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, /decideThisDeviceResume|protectLiveStart|startWorkout/);
    const helper = read('src/lib/workout/editSessionDuration.ts');
    assert.match(helper, /decideEditSessionDuration/);
    assert.doesNotMatch(helper, /from '@\/store\/workoutStore'/);
  });

  it('44px outline save — not primary-fill', () => {
    const fields = read('src/components/history/HistorySessionDuration.tsx');
    assert.match(fields, /variant="outline"/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.match(fields, /tap-target/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
  });

  it('Today stays one Start; lean and /private do not import duration', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, DURATION);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, DURATION);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, DURATION);
  });

  it('reorder / name / move / copy stay; live pause stays on Train', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, NAME);
    assert.match(page, MOVE);
    assert.match(page, COPY);
    assert.match(page, /HistorySessionEdit/);
    assert.match(page, /decideEditSave/);
    const edit = read('src/components/history/HistorySessionEdit.tsx');
    assert.match(edit, REORDER);
    const live = read('src/lib/workout/sessionClock.ts');
    assert.match(live, /toggleSessionClock|sessionElapsedSeconds/);
    const sheet = read('src/components/workout/WorkoutVictorySheet.tsx');
    assert.doesNotMatch(sheet, DURATION);
    assert.match(sheet, /HistorySessionName/);
  });

  it('first set stays ungated — duration never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/editSessionDuration.ts',
      'src/components/history/HistorySessionDuration.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });

  it('.1035 line in firstSetUngated', () => {
    const src = read('src/lib/firstSetUngated.ts');
    assert.match(src, /`\.1035` — edit this session's logged duration from History/);
  });
});
