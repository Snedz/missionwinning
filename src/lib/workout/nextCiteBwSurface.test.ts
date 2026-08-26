/**
 * Live Next/Last cites live on Train. Not Today.
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
const CITE = /formatSetRowLine|formatSetRowPrev|Next: \{\{line\}\}|Last: \{\{line\}\}/;

describe('next cite BW surface lock (.1009)', () => {
  it('header, ghost, and after-complete cite reuse set-row grammar', () => {
    const header = read('src/components/workout/ActiveExerciseHeader.tsx');
    assert.match(header, /formatSetRowLine/);
    assert.match(header, /Next: \{\{line\}\}/);
    assert.doesNotMatch(header, /Next: \{\{reps\}\} × \{\{weight\}\}/);
    assert.doesNotMatch(header, BANNED);
    assert.doesNotMatch(header, FEED);

    const ghost = read('src/components/workout/LastSetGhostButton.tsx');
    assert.match(ghost, /formatSetRowPrev/);
    assert.match(ghost, /Last: \{\{line\}\}/);
    assert.doesNotMatch(ghost, /Last: \{\{reps\}\} × \{\{weight\}\}/);

    const adj = read('src/lib/workout/setRowAdjacency.ts');
    assert.match(adj, /formatSetRowPrev/);
    assert.match(adj, /opts\?\.rowType/);

    const table = read('src/components/workout/SetLogTable.tsx');
    assert.match(table, /rowType/);
    assert.match(table, /formatAfterCompleteParts/);
  });

  it('Today stays one Start; lean and /private do not import the cite', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, CITE);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, CITE);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, CITE);
  });

  it('first set stays ungated — cite never mounts a login wall', () => {
    for (const rel of [
      'src/components/workout/ActiveExerciseHeader.tsx',
      'src/components/workout/LastSetGhostButton.tsx',
      'src/lib/workout/setRowAdjacency.ts',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
    }
  });
});
