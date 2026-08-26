/**
 * Open empty load is blank, not 0. SetLogTable uses the helper.
 * History edit still empty string on 0. Completed .1025 BW stays.
 * Today one Start. First set ungated. `.1048` line.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

const BANNED =
  /UnlockButton|isPremium|\/bundle|discord\.com|WeChat|four-scene|Force Sync|Session Expired/i;
const FEED = /likes|Top 8|Feed permalink|shame slope/i;
const RAINBOW =
  /bg-red(?:-\d+)?|bg-orange|bg-yellow|bg-green|bg-lime|bg-emerald|from-red|to-green|to-red|rpe-color|rainbow/i;

describe('open empty load surface lock (.1048)', () => {
  it('SetLogTable open cell uses a draft field — not raw input.weight', () => {
    const table = read('src/components/workout/SetLogTable.tsx');
    assert.match(table, /function SetRowLoadField/);
    assert.match(table, /displayOpenLoadDraft/);
    assert.match(table, /formatOpenLoadInput/);
    assert.match(table, /parseOpenLoadInput/);
    assert.match(table, /<SetRowLoadField/);
    assert.doesNotMatch(table, /value=\{input\.weight\}/);
    assert.doesNotMatch(table, /value=\{formatOpenLoadInput\(input\.weight\)\}/);
    assert.match(table, /formatCompletedWeightCell/);
    assert.doesNotMatch(table, BANNED);
    assert.doesNotMatch(table, FEED);
  });

  it('History edit still empty string on 0; completed .1025 BW stays', () => {
    const history = read('src/components/history/HistorySessionEdit.tsx');
    assert.match(history, /value=\{set\.weight \? String\(set\.weight\) : ''\}/);
    assert.doesNotMatch(history, /formatOpenLoadInput/);
    const table = read('src/components/workout/SetLogTable.tsx');
    assert.match(table, /formatCompletedWeightCell/);
    assert.match(table, /rowType === 'assisted'/);
    assert.match(table, /set\.weight > 0/);
    assert.match(table, /`−\$\{set\.weight\}`/);
    assert.match(table, /: '—'/);
    const completed = read('src/lib/workout/bodyweightLoad.ts');
    assert.match(completed, /Completed kg cell\. Empty load is BW, not 0/);
    assert.match(completed, /export function formatCompletedWeightCell/);
  });

  it('LogConsole plus-load uses the helper when it still paints load; leftover console stays leftover', () => {
    const consoleSrc = read('src/components/workout/LogConsole.tsx');
    assert.match(consoleSrc, /formatOpenLoadInput\(weight\)/);
    assert.match(consoleSrc, /parseOpenLoadInput/);
    const dock = read('src/components/workout/ActiveSessionDock.tsx');
    assert.match(dock, /no longer emit/);
    assert.match(dock, /<LogConsole/);
  });

  it('Today stays one Start; lean and /private do not import this', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, /formatOpenLoadInput|openEmptyLoad/);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, /formatOpenLoadInput|openEmptyLoad/);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, /formatOpenLoadInput|openEmptyLoad/);
  });

  it('no rainbow / hex on the open load cell — paper/ink tokens only', () => {
    for (const rel of [
      'src/lib/workout/openEmptyLoad.ts',
      'src/components/workout/SetLogTable.tsx',
    ]) {
      const src = stripComments(read(rel));
      assert.doesNotMatch(src, RAINBOW, rel);
      assert.doesNotMatch(src, /#[0-9a-fA-F]{3,8}\b/, rel);
    }
  });

  it('first set stays ungated — open empty load never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/openEmptyLoad.ts',
      'src/components/workout/SetLogTable.tsx',
      'src/components/workout/LogConsole.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });

  it('.1048 line in firstSetUngated', () => {
    const src = read('src/lib/firstSetUngated.ts');
    assert.match(src, /`\.1048` — open empty load is blank, not 0/);
  });
});
