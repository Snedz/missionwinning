/**
 * First Steps is a Show all row, not a Today tour card.
 *
 * The card is off first paint (`.890` / `.912`). Tab More already
 * mounts the sheet. After Summary, Today had no house door to the
 * checklist. Show all is that door. It must not read the dismiss key.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');
const SHOW = 'src/components/today/TodayShowAll.tsx';
const LEAN = 'src/page-components/HomeTodayLean.tsx';

test('Show all is a First Steps door that is not the tour card', () => {
  const src = read(SHOW);
  assert.match(src, /<FirstStepsSheet\b/, 'the checklist sheet must live in Show all');
  assert.match(src, /data-testid="today-show-all-first-steps"/);
  assert.doesNotMatch(src, /<FirstStepsCard\b/, 'the tour card stays off Today');
  assert.doesNotMatch(
    src,
    /FIRST_STEPS_DISMISS_KEY|useDismissed/,
    'dismissing the old card must not hide this door'
  );
});

test('Lean first paint still drops First Steps', () => {
  const lean = read(LEAN);
  assert.doesNotMatch(lean, /<FirstStepsCard\b/);
  assert.doesNotMatch(lean, /FirstStepsSheet/);
});
