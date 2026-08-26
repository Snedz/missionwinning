/**
 * Our export comes back lives on History. Not Today. Not a Feed.
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
const IMPORT = /decideImportDiary|session-history-import|history\/importDiary/;

describe('our export comes back surface lock (.1013)', () => {
  it('History mounts the file-in door and calls decideImportDiary', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /decideImportDiary|HistoryImport/);
    assert.match(page, /data-testid="session-history-import-open"/);
    assert.match(page, /min-h-\[44px\]/);
    assert.doesNotMatch(page, BANNED);
    assert.doesNotMatch(page, FEED);
    const fields = read('src/components/history/HistoryImport.tsx');
    assert.match(fields, /data-testid="session-history-import-file"/);
    assert.match(fields, /data-testid="session-history-import-confirm"/);
    assert.match(fields, /data-testid="session-history-import-cancel"/);
    assert.match(fields, /decideImportDiary|decideImportApply/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, FEED);
    assert.doesNotMatch(fields, /importCsv|buildWorkoutCsvDownload|workoutsToMwCsv/);
    const helper = read('src/lib/history/importDiary.ts');
    assert.match(helper, /decideImportDiary/);
    assert.match(helper, /decideImportApply/);
    assert.doesNotMatch(helper, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(helper, BANNED);
    assert.doesNotMatch(helper, FEED);
  });

  it('Today stays one Start; lean, todayPrimaryAction, and /private do not import this', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, IMPORT);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, IMPORT);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, IMPORT);
  });

  it('first set stays ungated — import never mounts a login wall', () => {
    for (const rel of [
      'src/lib/history/importDiary.ts',
      'src/components/history/HistoryImport.tsx',
      'src/page-components/HistoryPage.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
    }
  });

  it('export .1011 door still mounts — this does not smash file-out', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /HistoryExport/);
    assert.match(page, /data-testid="session-history-export-open"/);
    const fields = read('src/components/history/HistoryExport.tsx');
    assert.match(fields, /decideExportDiary/);
  });
});
