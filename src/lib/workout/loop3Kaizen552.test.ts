import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('Active menus use house leftover overflow', () => {
  const more = readFileSync(
    join(root, 'src/components/workout/ActiveExerciseMoreMenu.tsx'),
    'utf8'
  );
  assert.match(more, /house-card house-exercise-more/);
  assert.doesNotMatch(more, /hover:bg-accent-100/);
  assert.doesNotMatch(more, /hover:bg-muted/);
  assert.doesNotMatch(more, /border-2/);

  const setOpts = readFileSync(
    join(root, 'src/components/workout/ActiveSetOptionsMenu.tsx'),
    'utf8'
  );
  assert.match(setOpts, /house-card house-set-options/);
  assert.match(setOpts, /aria-haspopup/);
  assert.doesNotMatch(setOpts, /hover:bg-accent-100/);
  assert.doesNotMatch(setOpts, /hover:bg-muted/);
  assert.doesNotMatch(setOpts, /border-2/);
});

test('Active page scrolls next set when rest ends', () => {
  const page = readFileSync(
    join(root, 'src/page-components/ActiveWorkoutPage.tsx'),
    'utf8'
  );
  assert.match(page, /shouldScrollAfterRestEnds/);
  assert.match(page, /prevRestActive/);
});
