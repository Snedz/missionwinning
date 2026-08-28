import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('SetLogRow marks completed sets for eyes and AT', () => {
  const src = readFileSync(join(root, 'src/components/workout/SetLogRow.tsx'), 'utf8');
  assert.match(src, /data-set-complete/);
  assert.match(src, /border-s-primary|border-s-\[3px\]/);
  assert.match(src, /activeSetRowCompleteAria|Set \$\{setNumber\} logged/);
  assert.match(src, /set-logged-check/);
  assert.match(src, /role="listitem"/);
});

test('session sheets use primary-action + border-border skip (not ink cage)', () => {
  const checkIn = readFileSync(
    join(root, 'src/components/workout/SessionCheckInSheet.tsx'),
    'utf8'
  );
  assert.match(checkIn, /primary-action/);
  assert.match(checkIn, /border-border/);
  assert.doesNotMatch(checkIn, /border-foreground tap-target/);

  const add = readFileSync(join(root, 'src/components/workout/AddExerciseSheet.tsx'), 'utf8');
  assert.match(add, /house-btn min-h-\[52px\] w-full tap-target/);
  assert.match(add, /tap-target/);
  assert.doesNotMatch(add, /primary-action/);
  assert.doesNotMatch(add, /<Button/);
});
