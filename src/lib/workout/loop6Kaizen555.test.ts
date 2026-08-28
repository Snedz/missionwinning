import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('SetLogTable completed rows mirror compact SetLogRow cues', () => {
  const src = readFileSync(join(root, 'src/components/workout/SetLogTable.tsx'), 'utf8');
  assert.match(src, /data-set-complete/);
  assert.match(src, /house-set-done-mark|border-s-primary|border-s-\[3px\]/);
  assert.match(src, /set-table-logged-check/);
  assert.match(src, /primary-action/);
  assert.match(src, /min-h-\[44px\]/);
  assert.doesNotMatch(src, /hover:bg-accent-100/);
});

test('CoachToday band light copy stays plain', () => {
  const src = readFileSync(join(root, 'src/components/coach/CoachTodayCard.tsx'), 'utf8');
  assert.doesNotMatch(src, /room to add/);
  assert.match(src, /lighter than your month/);
});
