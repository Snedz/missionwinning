/**
 * This session as a file they own lives on History detail. Not Today. Not a Feed.
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
const SESSION_FILE = /decideExportSession|session-history-file|history\/exportSession/;

describe('this session as a file they own surface lock (.1016)', () => {
  it('History detail mounts the one-session file-out door', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /HistorySessionFile/);
    assert.match(page, /data-testid="session-history-log"/);
    assert.doesNotMatch(page, BANNED);
    assert.doesNotMatch(page, FEED);
    const fields = read('src/components/history/HistorySessionFile.tsx');
    assert.match(fields, /data-testid="session-history-file-save"/);
    assert.match(fields, /data-testid="session-history-file-json"/);
    assert.match(fields, /decideExportSession/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.match(fields, /disabled=\{!ready\}/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, FEED);
    assert.doesNotMatch(fields, /buildWorkoutCsvDownload|workoutsToMwCsv/);
    assert.doesNotMatch(fields, /navigator\.share|clipboard|permalink/);
    const helper = read('src/lib/history/exportSession.ts');
    assert.match(helper, /decideExportSession/);
    assert.match(helper, /decideExportDiary/);
    assert.doesNotMatch(helper, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(helper, BANNED);
    assert.doesNotMatch(helper, FEED);
  });

  it('Today stays one Start; lean, todayPrimaryAction, and /private do not import this', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, SESSION_FILE);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, SESSION_FILE);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, SESSION_FILE);
  });

  it('first set stays ungated — session file never mounts a login wall', () => {
    for (const rel of [
      'src/lib/history/exportSession.ts',
      'src/components/history/HistorySessionFile.tsx',
      'src/page-components/HistoryPage.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
    }
  });

  it('export .1011 and import .1013 doors still mount — this does not smash them', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /HistoryExport/);
    assert.match(page, /data-testid="session-history-export-open"/);
    assert.match(page, /HistoryImport/);
    assert.match(page, /data-testid="session-history-import-open"/);
    const exportFields = read('src/components/history/HistoryExport.tsx');
    assert.match(exportFields, /decideExportDiary/);
    const importFields = read('src/components/history/HistoryImport.tsx');
    assert.match(importFields, /decideImportDiary/);
  });
});
