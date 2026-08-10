/**
 * Free-beta Today score foot must not paint Super Bundle (pack used to override defaultValue).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('PillarScoreBreakdown free-beta uses open-beta foot key', () => {
  const src = readFileSync(
    join(root, 'src/components/metrics/PillarScoreBreakdown.tsx'),
    'utf8'
  );
  assert.match(src, /todayPillarScoreFootOpenBeta/);
  assert.match(src, /isFreeBeta|freeBeta/);
});

test('todayPillarScoreFoot EN packs never pitch Super Bundle', () => {
  const src = readFileSync(join(root, 'src/i18n/todayLocales.ts'), 'utf8');
  // Foot blocks after todayPillarScoreFoot: must not contain Super Bundle
  for (const m of src.matchAll(/todayPillarScoreFoot(?:OpenBeta)?:\s*\n?\s*'([^']*)'/g)) {
    assert.doesNotMatch(
      m[1]!,
      /Super Bundle/i,
      `foot string still pitches Super Bundle: ${m[1]}`
    );
  }
});
