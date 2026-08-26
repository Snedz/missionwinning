/**
 * Find a past session lives on History. Not Today.
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
const SEARCH =
  /decideSearchHistory|session-history-search|history\/searchHistory/;

describe('find a past session surface lock (.1008)', () => {
  it('History list mounts search and calls decideSearchHistory', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /decideSearchHistory/);
    assert.match(page, /data-testid="session-history-search"/);
    assert.match(page, /Search sessions \(name, date, lift\)/);
    assert.match(page, /min-h-\[44px\]/);
    assert.doesNotMatch(page, BANNED);
    assert.doesNotMatch(page, FEED);
    const helper = read('src/lib/history/searchHistory.ts');
    assert.match(helper, /decideSearchHistory/);
    assert.doesNotMatch(helper, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(helper, BANNED);
    assert.doesNotMatch(helper, FEED);
  });

  it('Today stays one Start; lean and /private do not import search', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, SEARCH);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, SEARCH);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, SEARCH);
  });

  it('first set stays ungated — search never mounts a login wall', () => {
    for (const rel of [
      'src/lib/history/searchHistory.ts',
      'src/page-components/HistoryPage.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
    }
  });
});
