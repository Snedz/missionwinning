import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('TodayJournalStrip uses formatJournalWhen', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'components', 'today', 'TodayJournalStrip.tsx'),
    'utf8'
  );
  assert.match(src, /formatJournalWhen/);
  assert.doesNotMatch(src, /function formatWhen/);
});

test('NutritionPage stamps via formatLocalClockTime', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'page-components', 'NutritionPage.tsx'),
    'utf8'
  );
  assert.match(src, /formatLocalClockTime/);
  assert.doesNotMatch(src, /toLocaleTimeString/);
});
