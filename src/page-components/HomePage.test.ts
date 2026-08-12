import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('TodayDashboardLoading matches Lean/Dashboard md+ width parity', () => {
  const src = readFileSync('src/page-components/HomePage.tsx', 'utf8');
  const loadingBlock =
    src.match(/function TodayDashboardLoading\(\)[\s\S]*?^}/m)?.[0] ?? '';
  assert.match(
    loadingBlock,
    /max-w-lg md:max-w-none/,
    'loading skeleton must lift phone cap at md+ like HomeTodayLean / HomeTodayDashboard'
  );
});
