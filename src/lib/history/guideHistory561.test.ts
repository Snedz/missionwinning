import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('Guidebook index CTAs are 44px without arrow flourish', () => {
  const page = readFileSync(
    join(root, 'src/page-components/GuidebookIndexPage.tsx'),
    'utf8'
  );
  assert.match(page, /min-h-\[44px\] tap-target/);
  assert.doesNotMatch(page, /Magazine \(web\) →/);
  assert.doesNotMatch(page, /Quick paths →/);
});

test('History empty and filters stay plain with tap chips', () => {
  const page = readFileSync(join(root, 'src/page-components/HistoryPage.tsx'), 'utf8');
  assert.match(page, /finished sessions land here/);
  assert.match(page, /Widen the range or clear search/);
  assert.match(page, /hover:bg-muted/);
  assert.match(page, /View in Fuel/);
  assert.doesNotMatch(page, /View in Nutrition →/);
});

test('Journal empty offers Open Today', () => {
  const src = readFileSync(
    join(root, 'src/components/history/JournalTimeline.tsx'),
    'utf8'
  );
  assert.match(src, /href=.\/log/);
  assert.match(src, /Finish a session — debriefs/);
});

test('Guidebook continue card plain CTA 44px', () => {
  const src = readFileSync(
    join(root, 'src/components/learn/GuidebookContinueCard.tsx'),
    'utf8'
  );
  assert.match(src, /min-h-\[44px\] tap-target/);
  assert.doesNotMatch(src, /Open Guidebook →/);
});
