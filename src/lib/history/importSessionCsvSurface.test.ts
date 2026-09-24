/**
 * Workout CSV lives on History. Not Today. Not a login wall. Not a Feed.
 * The diary-file door stays.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const BANNED =
  /UnlockButton|isPremium|\/bundle|discord\.com|WeChat|four-scene|Force Sync|Session Expired/i;
const FEED = /likes|Top 8|Feed permalink|shame slope|navigator\.share|mailto:/i;

describe('workout CSV history surface (.1112)', () => {
  it('History mounts the file picker and confirm, and the diary door stays', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /HistorySessionCsvImport/);
    assert.match(page, /data-testid="session-history-csv-open"/);
    assert.match(page, /data-testid="session-history-import-open"/);
    assert.match(page, /min-h-\[44px\]/);
    assert.doesNotMatch(page, BANNED);
    assert.doesNotMatch(page, FEED);
    const fields = read('src/components/history/HistorySessionCsvImport.tsx');
    assert.match(fields, /data-testid="session-history-csv-file"/);
    assert.match(fields, /data-testid="session-history-csv-confirm"/);
    assert.match(fields, /data-testid="session-history-csv-cancel"/);
    assert.match(fields, /decideImportSessionCsv/);
    assert.match(fields, /decideApplySessionCsv/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, /SignInPrompt|SignInPanel/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, FEED);
    const helper = read('src/lib/history/importSessionCsv.ts');
    assert.match(helper, /decideImportSessionCsv/);
    assert.match(helper, /decideApplySessionCsv/);
    assert.doesNotMatch(helper, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(helper, BANNED);
    const diary = read('src/components/history/HistoryImport.tsx');
    assert.doesNotMatch(diary, /importSessionCsv|decideImportSessionCsv/);
  });

  it('Today stays one Start and does not mount this door', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, /HistorySessionCsvImport|session-history-csv/);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, /importSessionCsv|HistorySessionCsvImport/);
  });

  it('first set stays ungated', () => {
    const ledger = read('src/lib/firstSetUngated.ts');
    assert.match(ledger, /\.1112/);
    assert.match(ledger, /workout CSV/i);
    for (const rel of [
      'src/lib/history/importSessionCsv.ts',
      'src/components/history/HistorySessionCsvImport.tsx',
      'src/page-components/HistoryPage.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
    }
  });

  it('Account still has the settings import card', () => {
    const account = read('src/page-components/AccountPage.tsx');
    assert.match(account, /ProfileImportCard/);
  });
});
