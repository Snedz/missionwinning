/**
 * Hide lives on library / overflow. Not Today. Not a second Start.
 * History stays. A live-session card is not removed.
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
const HIDE =
  /decideHideExercise|hideExerciseNow|omitHiddenExercises|library-hide|library-hidden/;
const MERGE = /decideMergeExercises|applyMergeExercises|HistoryMergeExercises/;
const DELETE_SESSION = /decideDeleteSession|deleteFinishedSession|session-history-delete/;
const IN_SET_PR = /decideInSetPr|formatInSetPrLabels|set-table-in-set-pr|inSetPrLabels/;

describe('hide exercise from library surface lock (.1004)', () => {
  it('Library mounts hide + unhide; merge stays the other door', () => {
    const page = read('src/page-components/LibraryPage.tsx');
    assert.match(page, /hideExerciseNow|unhideExerciseNow|omitHiddenExercises/);
    assert.match(page, /data-testid="library-hidden"|library-hidden/);
    const hiddenAt = page.indexOf('library-unhide');
    const hiddenBtn = page.slice(Math.max(0, hiddenAt - 280), hiddenAt + 80);
    assert.match(hiddenBtn, /house-btn house-btn-ghost/);
    assert.doesNotMatch(hiddenBtn, /variant="outline"/);
    assert.doesNotMatch(hiddenBtn, /<Button[\s>]/);
    assert.match(page, /decideMergeExercises/);
    assert.doesNotMatch(page, DELETE_SESSION);
    assert.doesNotMatch(page, IN_SET_PR);
    assert.doesNotMatch(page, BANNED);
    assert.doesNotMatch(page, FEED);
    const detail = read('src/components/library/LibraryDetailSheet.tsx');
    assert.match(detail, /hideExerciseNow/);
    assert.match(detail, /data-testid="library-hide"/);
    const hideAt = detail.indexOf('library-hide');
    const hideBtn = detail.slice(Math.max(0, hideAt - 280), hideAt + 80);
    assert.match(hideBtn, /min-h-\[44px\]/);
    assert.match(hideBtn, /house-btn house-btn-ghost/);
    assert.doesNotMatch(hideBtn, /variant="outline"/);
    assert.doesNotMatch(hideBtn, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(detail, /upsertCustomExercise|exercise-picker-use-name/);
    assert.doesNotMatch(detail, /looksLike|fuzzy|autoHide/);
    assert.doesNotMatch(detail, BANNED);
  });

  it('Add / picker omits hidden names', () => {
    const picker = read('src/components/library/ExercisePicker.tsx');
    assert.match(picker, /omitHiddenExercises/);
    assert.match(picker, /exercisesForPicker/);
    assert.doesNotMatch(picker, /UnlockButton|isPremium|\/bundle/);
    const sheet = read('src/components/workout/AddExerciseSheet.tsx');
    assert.match(sheet, /ExercisePicker/);
  });

  it('Train overflow can hide; it does not remove the live card', () => {
    const menu = read('src/components/workout/ActiveExerciseMoreMenu.tsx');
    assert.match(menu, /hideExerciseNow|unhideExerciseNow/);
    assert.match(menu, /data-testid="active-hide-from-library"/);
    const hideAt = menu.indexOf('active-hide-from-library');
    const hideBlock = menu.slice(Math.max(0, hideAt - 80), hideAt + 420);
    assert.doesNotMatch(hideBlock, /onRemove\(\)/);
    assert.doesNotMatch(menu, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(menu, BANNED);
  });

  it('Today stays one Start; lean and /private do not import hide', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, HIDE);
    assert.doesNotMatch(lean, MERGE);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, HIDE);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, HIDE);
    assert.doesNotMatch(priv, /editFinishedSession|HistorySessionEdit|session-history-edit/);
  });

  it('this-movement history still reads the diary — hide is not delete', () => {
    const history = read('src/lib/workout/movementHistory.ts');
    assert.doesNotMatch(history, /loadHiddenExerciseIds|omitHiddenExercises|hideExerciseNow/);
    const sheet = read('src/components/workout/MovementHistorySheet.tsx');
    assert.doesNotMatch(sheet, /hideExerciseNow|omitHiddenExercises/);
  });

  it('first set stays ungated — hide never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/hideExercise.ts',
      'src/components/library/LibraryDetailSheet.tsx',
      'src/components/workout/ActiveExerciseMoreMenu.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });
});
