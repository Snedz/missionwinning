import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// this file lives in src/lib/today/
const pages = join(import.meta.dirname, '..', '..', 'page-components');

for (const page of ['HomeTodayLean.tsx', 'HomeTodayDashboard.tsx']) {
  test(`${page} today label via formatLocalDateKey`, () => {
    const src = readFileSync(join(pages, page), 'utf8');
    assert.match(src, /formatLocalDateKey/);
    assert.doesNotMatch(src, /new Date\(\)\.toLocaleDateString/);
  });
}
