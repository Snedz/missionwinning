/**
 * Optional exercise group on a finished session lives on History edit.
 * Today stays one Start. Session note / lift note / load-pct stay.
 * First set ungated. `.1047` line.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

const BANNED =
  /UnlockButton|isPremium|\/bundle|discord\.com|WeChat|four-scene|Force Sync|Session Expired/i;
const FEED = /likes|Top 8|Feed permalink|shame slope/i;
const SUPERSET = /decidePatchFinishedSuperset|session-history-superset/;
const SESSION_NOTE =
  /decidePatchFinishedSessionNote|HistorySessionNote|session-history-session-note/;
const LIFT_NOTE = /decidePatchFinishedExerciseNote|session-history-lift-note/;
const LOAD_PCT = /decidePatchFinishedSetLoadPct|session-history-set-load-pct/;
const RAINBOW =
  /bg-red(?:-\d+)?|bg-orange|bg-yellow|bg-green|bg-lime|bg-emerald|from-red|to-green|to-red|rpe-color|rainbow/i;

describe('patch finished superset surface lock (.1047)', () => {
  it('HistorySessionEdit mounts session-history-superset / decidePatchFinishedSuperset', () => {
    const fields = read('src/components/history/HistorySessionEdit.tsx');
    assert.match(fields, /decidePatchFinishedSuperset/);
    assert.match(fields, /session-history-superset-/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.match(fields, /variant="outline"/);
    assert.match(fields, /activeSupersetLink|Superset w\/ next/);
    assert.match(fields, /activeSupersetUnlink|Unlink superset/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, FEED);
    assert.doesNotMatch(fields, /decideThisDeviceResume|protectLiveStart|startWorkout/);
    assert.match(fields, /session-history-edit-save|onSaveRequest/);
    const helper = read('src/lib/workout/patchFinishedSuperset.ts');
    assert.match(helper, /decidePatchFinishedSuperset/);
    assert.match(helper, /stripOrphanGroups/);
    assert.doesNotMatch(helper, /pairMark|supersetLabel/);
    assert.doesNotMatch(helper, /from ['"]@\/store\/workoutStore['"]/);
    assert.doesNotMatch(helper, /from ['"]@\/lib\/llm/);
  });

  it('Today stays one Start; lean and /private do not import this', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, SUPERSET);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, SUPERSET);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, SUPERSET);
  });

  it('session-note / lift-note / load-pct testids stay', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, SESSION_NOTE);
    assert.match(page, /HistorySessionEdit/);
    assert.match(page, /decideEditSave/);
    const edit = read('src/components/history/HistorySessionEdit.tsx');
    assert.match(edit, LIFT_NOTE);
    assert.match(edit, /session-history-lift-note-/);
    assert.match(edit, LOAD_PCT);
    assert.match(edit, /session-history-set-load-pct-/);
    const note = read('src/components/history/HistorySessionNote.tsx');
    assert.match(note, /data-testid="session-history-session-note"/);
  });

  it('no rainbow / hex superset color identity — paper/ink tokens only', () => {
    for (const rel of [
      'src/lib/workout/patchFinishedSuperset.ts',
      'src/components/history/HistorySessionEdit.tsx',
    ]) {
      const src = stripComments(read(rel));
      assert.doesNotMatch(src, RAINBOW, rel);
      assert.doesNotMatch(src, /#[0-9a-fA-F]{3,8}\b/, rel);
    }
  });

  it('first set stays ungated — finished superset never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/patchFinishedSuperset.ts',
      'src/components/history/HistorySessionEdit.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });

  it('.1047 line in firstSetUngated', () => {
    const src = read('src/lib/firstSetUngated.ts');
    assert.match(src, /`\.1047` — superset on a finished History session/);
  });
});
