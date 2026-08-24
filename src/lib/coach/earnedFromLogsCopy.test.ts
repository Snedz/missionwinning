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
  assert.match(src, /coachRationaleInputLabel|From your logs/);
  assert.match(src, /coachRationaleRuleLabel|Rule applied/);
  assert.match(src, /coachRationaleEffectLabel|Expected effect/);
  // Honest empty is one compact line — not three invented labels.
  assert.match(src, /session-empty/);
  assert.match(src, /compactKey/);
  // Craft: single "From your logs" via input label — no redundant eyebrow key.
  assert.doesNotMatch(src, /coachWhySessionEyebrow/);
  assert.doesNotMatch(src, /className=\{?["']eyebrow/);
  // Quiet inset next to Start — primary edge, not poster compete.
  assert.match(src, /border-s-primary/);
  assert.doesNotMatch(src, /border-s-\[hsl\(var\(--accent-poster\)\)\]/);
  assert.doesNotMatch(src, /TrainerRail|forceCoach|PRIVATE_MODE/);
  // Why stays free — never paywall the session line.
  assert.doesNotMatch(src, /premium|isPremium|usePremium|entitled/);
});
