import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TODAY_BLOCK_PRIORITY } from '@/lib/today/todayBlockPriority';

const root = join(import.meta.dirname, '..', '..', '..');

test('plate Apply uses primary-action hit target', () => {
  const src = readFileSync(
    join(root, 'src/components/calculators/PlateCalculatorPanel.tsx'),
    'utf8'
  );
  assert.match(src, /onApplyTarget/);
  assert.match(src, /primary-action/);
  assert.match(src, /min-h-\[52px\]/);
});

test('coach-today outranks continuity on Today', () => {
  assert.ok(
    TODAY_BLOCK_PRIORITY['coach-today'] < TODAY_BLOCK_PRIORITY.continuity,
    'session CTA must sort before cross-pillar strip'
  );
  assert.ok(TODAY_BLOCK_PRIORITY['coach-week'] < TODAY_BLOCK_PRIORITY.continuity);
});
