/**
 * Today weekly challenges free-beta mute — pack said “no premium required”
 * which is pay contrast while open beta unlocks depth.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('TodayWeekSection free-beta uses open-beta challenges desc', () => {
  const src = readFileSync(join(root, 'src/components/today/TodayWeekSection.tsx'), 'utf8');
  assert.match(src, /todayWeeklyChallengesDescOpenBeta/);
  assert.match(src, /isFreeBeta|freeBeta/);
});

test('todayLocales EN open-beta challenges desc omits premium pay contrast', () => {
  const src = readFileSync(join(root, 'src/i18n/todayLocales.ts'), 'utf8');
  assert.match(src, /todayWeeklyChallengesDescOpenBeta:/);
  const m = src.match(
    /todayWeeklyChallengesDescOpenBeta:\s*(?:\n\s*)?'((?:\\'|[^'])*)'/m
  );
  assert.ok(m, 'missing EN todayWeeklyChallengesDescOpenBeta');
  assert.doesNotMatch(m[1]!, /Super Bundle/i);
  assert.doesNotMatch(m[1]!, /\b[Pp]remium\b/);
});
