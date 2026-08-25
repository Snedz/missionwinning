/**
 * Exercise note + pin live on the open Train lift.
 * Pin does not appear on History. Today stays one Start.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const BANNED =
  /UnlockButton|isPremium|\/bundle|permalink|discord\.com|WeChat|four-scene|Force Sync|Session Expired|SignInPrompt/i;
const FEED = /likes|Top 8|Feed permalink|shame slope/i;
const PIN_LEAK = /exercise-pin|readPinnedNote|writePinnedNote|pinnedNoteByExercise|mw_pinned_note/;

describe('exercise note + pin surface lock (.996)', () => {
  it('open lift mounts this-session note and the pin after the table', () => {
    const card = read('src/components/workout/ActiveExerciseCard.tsx');
    const table = card.indexOf('<SetLogTable');
    const note = card.indexOf('<ExerciseNoteField');
    const pin = card.indexOf('<ExercisePinnedNoteField');
    const footer = card.indexOf('<ActiveExerciseFooter');
    assert.ok(table !== -1 && note !== -1 && pin !== -1 && footer !== -1);
    assert.ok(pin > table, 'pin must follow SetLogTable');
    assert.ok(note > table, 'note must follow SetLogTable');
    assert.ok(pin < footer && note < footer, 'note + pin sit before the footer');
    assert.doesNotMatch(card, /lastNotesFor|noteFromHistory/);
    assert.doesNotMatch(card, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(card, BANNED);
    assert.doesNotMatch(card, FEED);

    const field = read('src/components/workout/ExercisePinnedNoteField.tsx');
    assert.match(field, /data-testid="exercise-pin"/);
    assert.match(field, /min-h-\[44px\]/);
    assert.doesNotMatch(field, /autoFocus/);
    assert.doesNotMatch(field, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(field, BANNED);
    assert.doesNotMatch(field, FEED);
    assert.doesNotMatch(field, /listMovementHistory|SessionJotField|resolveInSetCues/);
  });

  it('appearance does not stuff last History note into the field', () => {
    const helper = read('src/lib/workout/exerciseNote.ts');
    const apply = helper.slice(helper.indexOf('export function applyHistoryNote'));
    assert.match(apply, /note: _ignored/);
    assert.doesNotMatch(apply, /noteFromHistory|seedExerciseNote|lastNotesFor/);
  });

  it('pin never mounts on History, movement-history, receipt, or Today', () => {
    for (const rel of [
      'src/page-components/HistoryPage.tsx',
      'src/components/workout/MovementHistorySheet.tsx',
      'src/lib/workout/movementHistory.ts',
      'src/components/workout/WorkoutVictorySheet.tsx',
      'src/components/workout/VictoryReceiptStrip.tsx',
      'src/page-components/HomeTodayLean.tsx',
      'src/lib/todayPrimaryAction.ts',
      'app/private/page.tsx',
    ]) {
      assert.doesNotMatch(read(rel), PIN_LEAK, `${rel} leaked the pin`);
    }
  });

  it('Today stays one Start; lean and /private do not import the pin', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, /ExercisePinnedNoteField|ExerciseNoteField|exercise-pin/);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, /ExercisePinnedNoteField|exercise-pin/);
  });

  it('first set stays ungated — pin never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/exercisePin.ts',
      'src/lib/workout/exerciseNote.ts',
      'src/components/workout/ExercisePinnedNoteField.tsx',
      'src/components/workout/ExerciseNoteField.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });

  it('cues and session notes stay their own homes', () => {
    const cues = read('src/lib/workout/inSetCues.ts');
    assert.doesNotMatch(cues, PIN_LEAK);
    const session = read('src/lib/workout/sessionNote.ts');
    assert.doesNotMatch(session, PIN_LEAK);
    const jot = read('src/components/workout/SessionJotField.tsx');
    assert.doesNotMatch(jot, PIN_LEAK);
  });
});
