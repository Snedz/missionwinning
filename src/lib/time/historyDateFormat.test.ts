
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('HistoryPage uses formatLocalDateKey, not a page-local formatDayKey', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'page-components', 'HistoryPage.tsx'),
    'utf8'
  );
  assert.match(src, /formatLocalDateKey/);
  assert.doesNotMatch(src, /function formatDayKey/);
});

test('HistoryDayPage uses formatLocalDateKey, not a page-local formatDay', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'page-components', 'HistoryDayPage.tsx'),
    'utf8'
  );
  assert.match(src, /formatLocalDateKey/);
  assert.doesNotMatch(src, /function formatDay\b/);
});
