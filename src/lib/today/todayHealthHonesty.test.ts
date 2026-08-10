/**
 * Today health / coach chip honesty for free-beta hydrate.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('CrossPillarCoachChips uses insight floors not actionLabel as message default', () => {
  const src = readFileSync(
    join(root, 'src/components/today/CrossPillarCoachChips.tsx'),
    'utf8'
  );
  assert.match(src, /translateCoachInsightLine/);
  assert.match(src, /translateCoachActionLabel/);
  assert.doesNotMatch(src, /defaultValue:\s*actionLabel/);
  assert.doesNotMatch(src, /defaultValue:\s*pillar/);
});

test('PillarScoreBreakdown never defaults pillar labels to raw keys', () => {
  const src = readFileSync(
    join(root, 'src/components/metrics/PillarScoreBreakdown.tsx'),
    'utf8'
  );
  assert.match(src, /labelDefault:\s*'Train'/);
  assert.doesNotMatch(src, /defaultValue:\s*key\s*\}/);
});
