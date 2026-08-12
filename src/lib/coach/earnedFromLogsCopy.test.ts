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

test('CoachAdaptBanner surfaces log-cited week rationale', () => {
  const src = readFileSync(join(root, 'components/coach/CoachAdaptBanner.tsx'), 'utf8');
  assert.match(src, /buildWeekRationale/);
  assert.match(src, /coachRationaleInputLabel|From your logs/);
  assert.match(src, /coachRationaleRuleLabel|Rule applied/);
  assert.match(src, /coachRationaleEffectLabel|Expected effect/);
});

test('PlanSessionCard surfaces log-cited session rationale on boss card', () => {
  const src = readFileSync(join(root, 'components/coach/PlanSessionCard.tsx'), 'utf8');
  assert.match(src, /buildSessionRationale/);
  assert.match(src, /Why this session — from your logs/i);
  assert.match(src, /coachRationaleInputLabel|From your logs/);
  assert.match(src, /coachRationaleRuleLabel|Rule applied/);
  assert.match(src, /coachRationaleEffectLabel|Expected effect/);
  assert.doesNotMatch(src, /TrainerRail|forceCoach|PRIVATE_MODE/);
});
