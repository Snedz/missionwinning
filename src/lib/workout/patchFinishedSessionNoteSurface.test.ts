/**
 * Optional session note on a finished session lives on History detail.
 * Own Save. Duration / Name stay. Today stays one Start.
 * Lift note stays on History edit. Not a Feed. No LLM.
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
const NOTE =
  /decidePatchFinishedSessionNote|HistorySessionNote|session-history-session-note|patchFinishedSessionNote/;
const DURATION =
  /decideEditSessionDuration|HistorySessionDuration|session-history-duration/;
const NAME = /HistorySessionName|nameFinishedHistoryLog|session-history-name/;
const LIFT_NOTE = /decidePatchFinishedExerciseNote|session-history-lift-note/;
const RAINBOW =
  /bg-red(?:-\d+)?|bg-orange|bg-yellow|bg-green|bg-lime|bg-emerald|from-red|to-green|to-red|rpe-color|rainbow/i;

describe('patch finished session note surface lock (.1046)', () => {
  it('HistoryPage mounts session-history-session-note / decidePatchFinishedSessionNote / HistorySessionNote', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /HistorySessionNote/);
    assert.match(page, /noteFinishedHistoryLog/);
    assert.doesNotMatch(page, BANNED);
    assert.doesNotMatch(page, FEED);
    const fields = read('src/components/history/HistorySessionNote.tsx');
    assert.match(fields, /decidePatchFinishedSessionNote/);
    assert.match(fields, /data-testid="session-history-session-note"/);
    assert.match(fields, /data-testid="session-history-session-note-save"/);
    assert.match(fields, /<textarea/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.match(fields, /variant="outline"/);
    assert.match(fields, /historySessionNoteLabel|Notes/);
    assert.match(fields, /historySessionNoteSave|Save notes/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, /decideEditSave|session-history-edit-save/);
    assert.doesNotMatch(fields, /SessionJotField|data-testid="session-notes"/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, FEED);
    assert.doesNotMatch(fields, /decideThisDeviceResume|protectLiveStart|startWorkout/);
    const helper = stripComments(read('src/lib/workout/patchFinishedSessionNote.ts'));
    assert.match(helper, /decidePatchFinishedSessionNote/);
    assert.match(helper, /normalizeSessionNote/);
    assert.match(helper, /attachSessionNote/);
    assert.doesNotMatch(helper, /from ['"]@\/store\/workoutStore['"]/);
    assert.doesNotMatch(helper, /from ['"]@\/lib\/llm/);
    assert.doesNotMatch(helper, /decideEditSave/);
  });

  it('44px outline save — not primary-fill', () => {
    const fields = read('src/components/history/HistorySessionNote.tsx');
    assert.match(fields, /variant="outline"/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.match(fields, /tap-target/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
  });

  it('Today stays one Start; lean and /private do not import this', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, NOTE);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, NOTE);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, NOTE);
  });

  it('Duration / Name testids stay; lift note stays on History edit', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, DURATION);
    assert.match(page, NAME);
    assert.match(page, /HistorySessionEdit/);
    assert.match(page, /decideEditSave/);
    const duration = read('src/components/history/HistorySessionDuration.tsx');
    assert.match(duration, /data-testid="session-history-duration"/);
    const name = read('src/components/history/HistorySessionName.tsx');
    assert.match(name, /data-testid="session-history-name"/);
    const edit = read('src/components/history/HistorySessionEdit.tsx');
    assert.match(edit, LIFT_NOTE);
    assert.match(edit, /session-history-lift-note-/);
    const jot = read('src/components/workout/SessionJotField.tsx');
    assert.match(jot, /data-testid="session-notes"/);
  });

  it('no rainbow / hex session-note color identity — paper/ink tokens only', () => {
    for (const rel of [
      'src/lib/workout/patchFinishedSessionNote.ts',
      'src/components/history/HistorySessionNote.tsx',
    ]) {
      const src = stripComments(read(rel));
      assert.doesNotMatch(src, RAINBOW, rel);
      assert.doesNotMatch(src, /#[0-9a-fA-F]{3,8}\b/, rel);
    }
  });

  it('first set stays ungated — session note never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/patchFinishedSessionNote.ts',
      'src/components/history/HistorySessionNote.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });

  it('.1046 line in firstSetUngated', () => {
    const src = read('src/lib/firstSetUngated.ts');
    assert.match(src, /`\.1046` — session note on a finished History session/);
  });
});
