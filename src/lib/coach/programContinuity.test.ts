/**
 * Continuity may only claim what the app can actually count.
 *
 * `.195`: `weeklyDebrief` read `(log as { personalRecords?: number }).personalRecords`
 * — a field existing nowhere else in the repo — so the recap card's PR line was
 * always 0 and dead on arrival, and the hand-written cast is precisely what
 * stopped the compiler from saying so. `.224` adds an eyebrow that says where a
 * session sits in a progression, which is the same temptation with a nicer
 * label: a week number would look right and be unbacked, because
 * `useCoachPlan` overwrites the previous plan every Monday.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  completedSessionCount,
  nextSessionOrdinal,
  planBlockName,
  sessionContinuity,
} from '@/lib/coach/programContinuity';
import type { CompletedWorkoutLog } from '@/types';
import type { CoachPlan, PlanSession, SessionKind } from '@/lib/coach/types';

const root = path.join(import.meta.dirname, '..', '..', '..');

function log(id: string, deletedAt: string | null = null): CompletedWorkoutLog {
  return {
    id,
    workoutName: 'Session',
    startedAt: '2026-08-01T10:00:00.000Z',
    completedAt: '2026-08-01T11:00:00.000Z',
    durationSeconds: 3600,
    totalVolume: 1000,
    deletedAt,
    exercises: [],
  } as CompletedWorkoutLog;
}

function session(name: string, kind: SessionKind = 'strength', dayOffset = 0): PlanSession {
  return {
    id: `${name}-${dayOffset}`,
    dayOffset,
    kind,
    name,
    focusGroups: [],
    exercises: [],
    estMinutes: 45,
    status: 'planned',
  };
}

function plan(sessions: PlanSession[]): CoachPlan {
  return {
    revision: 1,
    weekStart: '2026-07-27',
    daysPerWeek: sessions.length,
    sessions,
    generatedAt: '2026-07-27T00:00:00.000Z',
    contextHash: 'x',
    equipmentProfile: 'full-gym',
  };
}

test('a deleted session is not a session you did', () => {
  const history = [log('a'), log('b', '2026-08-01T12:00:00.000Z'), log('c')];
  assert.equal(completedSessionCount(history), 2);
  assert.equal(
    nextSessionOrdinal(history),
    3,
    'the ordinal must skip tombstones — dayReview and behaviorImpacts both drop them, ' +
      'and weekRecap not doing so is what .223 found printed onto a shared PNG'
  );
});

test('an athlete with no history gets no ordinal', () => {
  assert.equal(nextSessionOrdinal([]), null);
  assert.equal(
    sessionContinuity([], plan([session('Push Strength')])).line,
    'Push',
    '"Session 1" beside a Start button is a claim about a past that does not exist — ' +
      'the block name alone is still true'
  );
});

test('the block name is read out of the plan, in the order the week runs', () => {
  const p = plan([
    session('Push Strength', 'strength', 0),
    session('Pull Strength', 'strength', 2),
    session('Lower Body Strength', 'strength', 4),
    session('Recovery & Mobility', 'recovery', 5),
  ]);
  assert.equal(planBlockName(p), 'Push / Pull / Lower Body');
});

test('recovery and conditioning never name the block', () => {
  const p = plan([session('Recovery & Mobility', 'recovery'), session('Conditioning Circuit', 'conditioning', 2)]);
  assert.equal(
    planBlockName(p),
    null,
    'every block has these; naming one after them would make every label identical'
  );
  assert.equal(planBlockName(null), null);
});

test('a long rotation says how long it is rather than listing everything', () => {
  const p = plan(
    ['Push Strength', 'Pull Strength', 'Lower Body Strength', 'Upper Body Strength'].map((n, i) =>
      session(n, 'strength', i)
    )
  );
  assert.equal(planBlockName(p), '4-day split');
});

test('the eyebrow is silent rather than filler when nothing is true', () => {
  assert.equal(sessionContinuity([], null).line, null);
  assert.equal(sessionContinuity([], plan([session('Recovery & Mobility', 'recovery')])).line, null);
});

/**
 * The structural rule. Everything above would still pass if someone added
 * `weekIndex` tomorrow and computed it from thin air.
 */
test('no week number is claimed while the plan is not durable', () => {
  const overwrites = /savePlan\(next\)/.test(
    readFileSync(path.join(root, 'src/hooks/useCoachPlan.ts'), 'utf8')
  );
  assert.ok(
    overwrites,
    'useCoachPlan no longer overwrites the plan on rollover — if plan history is now durable, ' +
      'a week number may finally be honest; delete this guard deliberately rather than by accident'
  );

  const src = readFileSync(path.join(root, 'src/lib/coach/programContinuity.ts'), 'utf8');
  assert.doesNotMatch(
    src,
    /\bweekIndex\b|\bweekNumber\b|\bphaseOf\b/,
    'continuity must not expose a week or phase number while the previous plan is discarded ' +
      'every Monday — that is a field nothing writes, which is .195 with a nicer label'
  );
});
