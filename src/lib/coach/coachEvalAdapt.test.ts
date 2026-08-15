/**
 * GNT-2 U3 — a mid-week adaptPlan records misses and keeps remaining load
 * inside leftover days.
 *
 * `adapt.test.ts` covers this with date literals. `adaptMissedNarration.test.ts`
 * pins the banner on hand-built sessions and derives dates from `toISOString()`.
 * That is not this bar. A planner that relabels nothing — or drops the miss —
 * can still pass those. This file calls `generateWeek` then `adaptPlan`.
 *
 * Pins five properties a date-literal / hand-built suite cannot fake:
 *
 *   1. the generated week has planned sessions before today (precondition —
 *      fail, do not skip),
 *   2. after adapt, zero sessions with dayOffset < today are still `planned`,
 *   3. `missed.length` equals that past planned count (the miss is recorded,
 *      not deleted),
 *   4. remaining planned sessions all sit on leftover days and fit
 *      (`count ≤ leftover days`),
 *   5. remaining planned sets do not rise (adapt re-spreads; it does not
 *      invent a deload).
 *
 * High-strain generateWeek shape is U1. This file does not sweep strain.
 *
 * No date literals: week start is the current local Monday; today is that
 * Monday + 3. Calendar math uses local fields, never `toISOString()`.
 *
 * This documents today's behaviour. It is not a request to cut remaining work.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCoachContextFromInputs } from '@/lib/coach/contextBuilder';
import { generateWeek } from '@/lib/coach/planEngine';
import { adaptPlan } from '@/lib/coach/adapt';
import type { CoachPlan } from '@/lib/coach/types';
import { localDateKey, startOfLocalWeek } from '@/lib/time/localDate';

/** Thursday of a Monday-start week. */
const TODAY_OFFSET = 3;

/** Days still left including today: Thu–Sun. */
const LEFTOVER_DAYS = 7 - TODAY_OFFSET;

function addLocalDays(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return '';
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

function plannedSets(plan: CoachPlan, minOffset: number): number {
  return plan.sessions
    .filter((s) => (s.status === 'planned' || s.status === 'swapped') && s.dayOffset >= minOffset)
    .reduce((n, s) => n + s.exercises.reduce((m, e) => m + e.sets, 0), 0);
}

test('mid-week adapt records misses and keeps remaining load inside leftover days', () => {
  const ctx = buildCoachContextFromInputs({
    history: [],
    experience: 'intermediate',
    equipment: 'full-gym',
    goal: 'goal:strength',
    daysPerWeek: 4,
    seedId: 'gnt2-u3',
    includeCheckIn: false,
  });
  const monday = localDateKey(startOfLocalWeek(new Date()));
  const thursday = addLocalDays(monday, TODAY_OFFSET);
  assert.match(monday, /^\d{4}-\d{2}-\d{2}$/, 'week start must be a local date key');
  assert.match(thursday, /^\d{4}-\d{2}-\d{2}$/, 'today must be a local date key');
  assert.notEqual(thursday, monday, 'Thursday must be a different local day than Monday');

  const generated = generateWeek(ctx, monday, 1, monday);
  const pastPlanned = generated.sessions.filter(
    (s) => s.dayOffset < TODAY_OFFSET && s.status === 'planned',
  );
  assert.ok(
    pastPlanned.length > 0,
    `generated week has no planned sessions before offset ${TODAY_OFFSET} — do not skip`,
  );

  const originalRemainingSets = plannedSets(generated, TODAY_OFFSET);
  const adapted = adaptPlan(generated, ctx, thursday);

  const stillPlannedInThePast = adapted.sessions.filter(
    (s) => s.dayOffset < TODAY_OFFSET && s.status === 'planned',
  );
  assert.deepEqual(
    stillPlannedInThePast,
    [],
    'a session whose day has passed is missed or done — never still planned',
  );

  const missed = adapted.sessions.filter((s) => s.status === 'missed');
  assert.equal(
    missed.length,
    pastPlanned.length,
    `missed count must equal past planned count (recorded, not deleted): past ${pastPlanned.length} vs missed ${missed.length}`,
  );

  const remaining = adapted.sessions.filter(
    (s) => (s.status === 'planned' || s.status === 'swapped') && s.dayOffset >= TODAY_OFFSET,
  );
  assert.ok(
    remaining.every((s) => s.dayOffset >= TODAY_OFFSET),
    'remaining planned sessions must sit on leftover days',
  );
  assert.ok(
    remaining.length <= LEFTOVER_DAYS,
    `remaining week must fit leftover days: ${remaining.length} planned vs ${LEFTOVER_DAYS} leftover`,
  );

  const remainingSets = plannedSets(adapted, TODAY_OFFSET);
  assert.ok(
    remainingSets <= originalRemainingSets,
    `remaining planned sets must not rise (adapt re-spreads, it does not add work): ${originalRemainingSets} → ${remainingSets}`,
  );
});
