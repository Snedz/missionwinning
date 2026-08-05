
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

test('resolveTrendSeries labels via formatLocalDateKey', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', 'trends', 'resolveTrendSeries.ts'),
    'utf8'
  );
  assert.match(src, /formatLocalDateKey/);
  assert.doesNotMatch(src, /new Date\(y,\s*m\s*-\s*1,\s*d/);
});

test("HistoryCalendar month label via formatLocalMonthKey", () => {
  const src = readFileSync(
    join(import.meta.dirname, "..", "..", "components", "history", "HistoryCalendar.tsx"),
    "utf8"
  );
  assert.match(src, /formatLocalMonthKey/);
  assert.doesNotMatch(src, /new Date\(y!, m! - 1, 1\)/);
});
