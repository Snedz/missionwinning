import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('Victory and CoachToday full-width buttons are 44px', () => {
  const v = readFileSync(join(root, 'src/components/workout/WorkoutVictorySheet.tsx'), 'utf8');
  assert.match(v, /w-full min-h-\[44px\]/);

  const c = readFileSync(join(root, 'src/components/coach/CoachTodayCard.tsx'), 'utf8');
  assert.match(c, /w-full min-h-\[44px\] tap-target/);
});

test('Compare Start free is 52px primary-action', () => {
  const src = readFileSync(join(root, 'src/page-components/ComparePage.tsx'), 'utf8');
  assert.match(src, /primary-action min-h-\[52px\]/);
});

test('PFT runner and school panel full-width CTAs are 44px', () => {
  const pft = readFileSync(
    join(root, 'src/components/fitness-test/FitnessTestRunner.tsx'),
    'utf8'
  );
  assert.match(pft, /w-full min-h-\[44px\]/);
  const school = readFileSync(
    join(root, 'src/components/fitness-test/SchoolClassPanel.tsx'),
    'utf8'
  );
  assert.match(school, /w-full min-h-\[44px\]/);
});
