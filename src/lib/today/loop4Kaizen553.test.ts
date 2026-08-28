import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('ContinuityStrip is secondary plain copy under coach', () => {
  const src = readFileSync(
    join(root, 'src/components/today/ContinuityStrip.tsx'),
    'utf8'
  );
  assert.match(src, /After training/);
  assert.match(src, /Move, mind, or fuel/);
  assert.doesNotMatch(src, /Keep the mission moving/);
  assert.doesNotMatch(src, /One app —/);
  assert.match(src, /continuity-strip/);
});

test('inline add exercise and form guide CTAs meet sheet language', () => {
  const inline = readFileSync(
    join(root, 'src/components/workout/ActiveInlineAddExercise.tsx'),
    'utf8'
  );
  assert.match(inline, /min-h-\[44px\]/);
  assert.match(inline, /hover:bg-muted/);
  assert.doesNotMatch(inline, /hover:bg-accent-100/);

  const form = readFileSync(join(root, 'src/components/form/FormGuideSheet.tsx'), 'utf8');
  assert.match(form, /house-btn min-h-\[52px\] w-full tap-target/);
  assert.doesNotMatch(form, /primary-action|bg-primary-fill/);

  const foot = readFileSync(
    join(root, 'src/components/workout/ActiveExerciseFooter.tsx'),
    'utf8'
  );
  assert.match(foot, /min-h-\[44px\]/);
  assert.doesNotMatch(foot, /hover:bg-accent-100/);
});
