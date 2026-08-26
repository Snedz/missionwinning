/**
 * Library spark/count skip tombs. Not Today.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const BANNED =
  /UnlockButton|isPremium|\/bundle|discord\.com|WeChat|four-scene|Force Sync|Session Expired/i;
const FEED = /likes|Top 8|Feed permalink|shame slope/i;
const SKIP = /libraryExerciseVolumeSpark/;

describe('library skips deleted sessions surface lock (.1010)', () => {
  it('Library detail uses count + spark helpers', () => {
    const sheet = read('src/components/library/LibraryDetailSheet.tsx');
    assert.match(sheet, /countExerciseHistory/);
    assert.match(sheet, /libraryExerciseVolumeSpark/);
    assert.doesNotMatch(sheet, BANNED);
    assert.doesNotMatch(sheet, FEED);
    const helper = read('src/lib/libraryFilters.ts');
    assert.match(helper, /!w\.deletedAt/);
    assert.match(helper, /if \(log\.deletedAt\) continue/);
  });

  it('Today stays one Start; lean and /private do not import library spark', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, SKIP);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, SKIP);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, SKIP);
  });

  it('first set stays ungated', () => {
    const src = read('src/lib/libraryFilters.ts');
    assert.doesNotMatch(src, /SignInPrompt|SignInPanel/);
    assert.doesNotMatch(src, /Force Sync|Session Expired/);
  });
});
