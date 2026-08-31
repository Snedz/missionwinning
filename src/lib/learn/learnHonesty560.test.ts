import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('LearnPage does not leftover path catalog or sample merch', () => {
  const page = readFileSync(join(root, 'src/page-components/LearnPage.tsx'), 'utf8');
  assert.match(page, /<QuietLearnIntroCard\b/);
  assert.doesNotMatch(page, /id="learn-paths"/);
  assert.doesNotMatch(page, /Open Guidebook →/);
  assert.doesNotMatch(page, /Start Bodyweight Sample →/);
});

test('Learn locked preview muted not accent-100', () => {
  const locked = readFileSync(
    join(root, 'src/components/learn/LearnLockedPreview.tsx'),
    'utf8'
  );
  assert.match(locked, /bg-muted/);
  assert.doesNotMatch(locked, /bg-accent-100/);
  assert.match(locked, /min-h-\[44px\] tap-target/);
});

test('CourseReader chapter nav uses muted selected state', () => {
  const src = readFileSync(join(root, 'src/components/learn/CourseReader.tsx'), 'utf8');
  assert.match(src, /bg-muted/);
  assert.doesNotMatch(src, /bg-accent-100/);
  assert.match(src, /min-h-\[44px\] tap-target/);
});
