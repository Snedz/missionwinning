import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('Photo meal logger header is muted not accent wash', () => {
  const src = readFileSync(
    join(root, 'src/components/nutrition/PhotoMealLogger.tsx'),
    'utf8'
  );
  assert.match(src, /bg-muted border-2 border-border/);
  assert.doesNotMatch(src, /bg-accent-100/);
  assert.match(src, /edit before you log/);
});

test('Coach adapt banner and day review use muted fill', () => {
  const coach = readFileSync(
    join(root, 'src/components/coach/CoachAdaptBanner.tsx'),
    'utf8'
  );
  assert.match(coach, /bg-muted/);
  assert.doesNotMatch(coach, /bg-accent-100/);

  const day = readFileSync(
    join(root, 'src/components/today/TodayDayReviewCard.tsx'),
    'utf8'
  );
  assert.match(day, /bg-muted border-2 border-border/);
});
