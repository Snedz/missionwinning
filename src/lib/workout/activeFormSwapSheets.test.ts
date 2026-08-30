/**
 * /active Form guide + Swap sheets open on click from first paint.
 * Overlay must not wait on a mount tick. Form guide must not die on a catalog miss.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { composeFormGuideSheet } from './writeTodayComposeSession.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function sliceFromTestId(src: string, testId: string, chars = 360): string {
  const needle = `data-testid="${testId}"`;
  const start = src.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return src.slice(start, start + chars);
}

test('AdaptiveOverlay portals when open on the client — no mount wait', () => {
  const src = read('src/components/ui/AdaptiveOverlay.tsx');
  assert.doesNotMatch(
    src,
    /if \(!open \|\| !mounted\) return null/,
    'sheets must not wait on a useEffect mount tick'
  );
  assert.match(src, /typeof document === ['"]undefined['"]/);
  assert.match(src, /createPortal\(overlay, document\.body\)/);
});

test('Form guide sheet stays mounted and resolves from the painted compose', () => {
  const sheets = read('src/components/workout/ActiveWorkoutSheets.tsx');
  assert.match(sheets, /<FormGuideSheet/);
  assert.doesNotMatch(
    sheets,
    /\{formGuideSheet \? \(/,
    'FormGuideSheet must stay mounted so the overlay is ready on click'
  );
  const page = read('src/page-components/ActiveWorkoutPage.tsx');
  assert.match(page, /composeFormGuideSheet\(/);
  assert.doesNotMatch(page, /resolveFormGuideSheet\(/);
});

test('composeFormGuideSheet(push-ups) is a sheet — persist / catalog miss does not own it', () => {
  const sheet = composeFormGuideSheet('push-ups');
  assert.ok(sheet, 'push-ups must open a form sheet');
  assert.equal(sheet?.exerciseId, 'push-ups');
  assert.ok(sheet?.exerciseName);
  assert.ok(sheet?.guide);
  assert.equal(composeFormGuideSheet(null), null);
});

test('DESIGN names Form / Swap sheets open on click from first paint', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Form \/ Swap sheets open on click from first paint/);
});

test('Finish / Skip / Swap / Form guide / Repeat last never house-btn-primary', () => {
  const finish = sliceFromTestId(
    read('src/components/workout/ActiveSessionChrome.tsx'),
    'active-finish'
  );
  assert.doesNotMatch(finish, /house-btn-primary/);

  const header = read('src/components/workout/ActiveExerciseHeader.tsx');
  for (const id of [
    'active-skip-exercise',
    'active-swap-exercise',
    'active-form-guide',
    'active-repeat-last',
  ] as const) {
    const slice = sliceFromTestId(header, id);
    assert.doesNotMatch(slice, /house-btn-primary/, id);
  }
});
