/**
 * Name this finished session lives on History / receipt. Not Today.
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
const NAME =
  /decideNameFinishedSession|HistorySessionName|session-history-name|historySessionLabel/;

describe('name this finished session surface lock (.1007)', () => {
  it('History detail and receipt mount the name door', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /HistorySessionName/);
    assert.match(page, /nameFinishedHistoryLog/);
    assert.match(page, /historySessionLabel/);
    assert.doesNotMatch(page, BANNED);
    assert.doesNotMatch(page, FEED);
    const fields = read('src/components/history/HistorySessionName.tsx');
    assert.match(fields, /data-testid="session-history-name"/);
    assert.match(fields, /data-testid="session-history-name-save"/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    const receipt = read('src/components/workout/WorkoutVictorySheet.tsx');
    assert.match(receipt, /HistorySessionName/);
    assert.doesNotMatch(receipt, BANNED);
  });

  it('Today stays one Start; lean and /private do not import name', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, NAME);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, NAME);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, NAME);
  });

  it('first set stays ungated — name never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/nameFinishedSession.ts',
      'src/components/history/HistorySessionName.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
    }
  });
});
