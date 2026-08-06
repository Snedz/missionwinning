import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('Track empty week links to track-log; log CTA is primary 52px', () => {
  const page = readFileSync(join(root, 'src/page-components/TrackPage.tsx'), 'utf8');
  assert.match(page, /track-log/);
  assert.match(page, /primary-action min-h-\[52px\]/);
  assert.doesNotMatch(page, /Core mission is Train \+ Fuel/);
  assert.match(page, /h-11 w-11 tap-target/);
});

test('Track GPS panel controls are 44px; errors use alert', () => {
  const gps = readFileSync(join(root, 'src/components/track/TrackGpsPanel.tsx'), 'utf8');
  assert.match(gps, /min-h-\[44px\] tap-target/);
  assert.match(gps, /role=.alert/);
  assert.match(gps, /primary-action/);
});

test('Track locked teasers drop accent-100 wash', () => {
  const week = readFileSync(
    join(root, 'src/components/track/TrackWeeklyInsights.tsx'),
    'utf8'
  );
  assert.match(week, /bg-muted/);
  assert.doesNotMatch(week, /bg-accent-100/);

  const locked = readFileSync(
    join(root, 'src/components/track/TrackGpsLockedPreview.tsx'),
    'utf8'
  );
  assert.match(locked, /bg-muted/);
  assert.doesNotMatch(locked, /MapMy-style/);
});
