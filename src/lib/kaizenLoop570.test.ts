import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('Profile assessment win actually bumps streak', () => {
  const src = readFileSync(
    join(root, 'src/components/profile/ProfileAssessmentCard.tsx'),
    'utf8'
  );
  assert.match(src, /bumpTrainingStreak/);
  assert.match(src, /const streak = bumpTrainingStreak/);
  assert.doesNotMatch(src, /streak:\s*1,\s*defaultValue: 'Streak updated/);
});

test('Assessments recommendations plain + 44px', () => {
  const src = readFileSync(join(root, 'src/page-components/AssessmentsPage.tsx'), 'utf8');
  assert.match(src, /tap to start a free starter/);
  assert.doesNotMatch(src, /click to start a matching free starter \+ log win/);
  assert.match(src, /min-h-\[44px\] tap-target/);
});
