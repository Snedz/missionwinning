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

test('TodayProgressSection never defaults readiness status to raw statusKey', () => {
  const src = readFileSync(
    join(root, 'src/components/today/TodayProgressSection.tsx'),
    'utf8'
  );
  assert.match(src, /readinessStatusDefault/);
  assert.doesNotMatch(src, /defaultValue:\s*r\.statusKey/);
});

test('TodayJournalStrip never defaults pillar labels to entry.pillar', () => {
  const src = readFileSync(
    join(root, 'src/components/today/TodayJournalStrip.tsx'),
    'utf8'
  );
  // Strip comments — docs may name the old defaultValue: entry.pillar defect.
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  assert.match(src, /labelDefault:\s*'Train'/);
  assert.doesNotMatch(code, /defaultValue:\s*entry\.pillar/);
  assert.match(code, /defaultValue:\s*meta\.labelDefault/);
});
