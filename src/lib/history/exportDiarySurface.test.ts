/**
 * Export this diary lives on History. Not Today. Not a Feed.
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
const EXPORT = /decideExportDiary|session-history-export|history\/exportDiary/;

describe('export this diary surface lock (.1011)', () => {
  it('History mounts the file-out door and calls decideExportDiary', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /decideExportDiary|HistoryExport/);
    assert.match(page, /data-testid="session-history-export-open"/);
    assert.match(page, /min-h-\[44px\]/);
    assert.doesNotMatch(page, BANNED);
    assert.doesNotMatch(page, FEED);
    const fields = read('src/components/history/HistoryExport.tsx');
    assert.match(fields, /data-testid="session-history-export-save"/);
    assert.match(fields, /data-testid="session-history-export-json"/);
    assert.match(fields, /decideExportDiary/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, FEED);
    assert.doesNotMatch(fields, /buildWorkoutCsvDownload|workoutsToMwCsv/);
    const helper = read('src/lib/history/exportDiary.ts');
    assert.match(helper, /decideExportDiary/);
    assert.doesNotMatch(helper, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(helper, BANNED);
    assert.doesNotMatch(helper, FEED);
  });

  it('Today stays one Start; lean and /private do not import export', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, EXPORT);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, EXPORT);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, EXPORT);
  });

  it('first set stays ungated — export never mounts a login wall', () => {
    for (const rel of [
      'src/lib/history/exportDiary.ts',
      'src/components/history/HistoryExport.tsx',
      'src/page-components/HistoryPage.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
    }
  });
});
