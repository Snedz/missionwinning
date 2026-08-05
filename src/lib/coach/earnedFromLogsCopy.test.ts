/**
 * Coach must keep “from your logs / no wearable” honesty in athlete-facing copy.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('CoachTodayCard keeps built-from-logs honesty', () => {
  const src = readFileSync(join(root, 'components/coach/CoachTodayCard.tsx'), 'utf8');
  assert.match(src, /from your logs|Built from your logs/i);
  assert.match(src, /no wearable/i);
});

test('CoachAdaptBanner keeps adapted-from-logs honesty', () => {
  const src = readFileSync(join(root, 'components/coach/CoachAdaptBanner.tsx'), 'utf8');
  assert.match(src, /from your logs/i);
  assert.match(src, /no wearable/i);
});
