/**
 * H-02 — the Coach week arrives as a proposal with a visible diff.
 *
 * Two seeded histories, one engine (`generateWeek` + Thursday `adaptPlan`).
 * The line must name the same working-session change the engine made, and
 * the stored set when one exists. No date literals — week start is the
 * current local Monday.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog } from '@/types';
import { buildCoachContextFromInputs } from '@/lib/coach/contextBuilder';
import { generateWeek } from '@/lib/coach/planEngine';
import { adaptPlan } from '@/lib/coach/adapt';
import { localDateKey, startOfLocalWeek } from '@/lib/time/localDate';
import {
  buildCoachWeekDiff,
  formatCoachWeekDiffLine,
  sessionCountChangeFromEngine,
  sessionCountChangeFromPlan,
  workingSessionCount,
} from '@/lib/coach/weekDiff';

const root = path.join(import.meta.dirname, '..', '..', '..');
const TODAY_OFFSET = 3;

function addLocalDays(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return '';
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

function localNoonIso(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y!, m! - 1, d!, 12, 0, 0).toISOString();
}

function seededLog(completedAt: string): CompletedWorkoutLog {
  return {
    id: 'h02-cite',
    workoutName: 'Push A',
    startedAt: completedAt,
    completedAt,
    durationSeconds: 1800,
    totalVolume: 1000,
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 60 }] }],
  };
}

function thursdayAdapt(history: CompletedWorkoutLog[]) {
  const ctx = buildCoachContextFromInputs({
    history,
    experience: 'intermediate',
    equipment: 'full-gym',
    goal: 'goal:strength',
    daysPerWeek: 4,
    seedId: 'h02-week-diff',
    includeCheckIn: false,
  });
  const monday = localDateKey(startOfLocalWeek(new Date()));
  const thursday = addLocalDays(monday, TODAY_OFFSET);
  const generated = generateWeek(ctx, monday, 1, monday);
  const pastPlanned = generated.sessions.filter(
    (s) => s.dayOffset < TODAY_OFFSET && s.status === 'planned'
  );
  assert.ok(
    pastPlanned.length > 0,
    `generated week has no planned sessions before offset ${TODAY_OFFSET} — do not skip`
  );
  const adapted = adaptPlan(generated, ctx, thursday);
  return { generated, adapted, thursday, monday };
}

test('reconstruction names the same session-count change adaptPlan made', () => {
  const empty = thursdayAdapt([]);
  const fromEngine = sessionCountChangeFromEngine(empty.generated, empty.adapted);
  const fromPlan = sessionCountChangeFromPlan(empty.adapted);
  assert.deepEqual(fromPlan, fromEngine);
  assert.ok(
    fromEngine.beforeCount > fromEngine.afterCount,
    'Thursday adapt must drop at least one working session (a miss) — fixture moved'
  );
  assert.equal(
    fromEngine.afterCount,
    workingSessionCount(empty.adapted.sessions)
  );
});

test('two histories: empty vs a stored set — same engine counts, citation only when stored', () => {
  const empty = thursdayAdapt([]);
  const lastWeek = addLocalDays(empty.monday, -3);
  const withLog = thursdayAdapt([seededLog(localNoonIso(lastWeek))]);

  const emptyChange = sessionCountChangeFromEngine(empty.generated, empty.adapted);
  const loggedChange = sessionCountChangeFromEngine(withLog.generated, withLog.adapted);
  assert.deepEqual(
    emptyChange,
    loggedChange,
    'a last-week set is a citation, not this week\'s miss count'
  );

  const emptyDiff = buildCoachWeekDiff(empty.adapted, [], {
    now: new Date(`${empty.thursday}T18:00:00`),
  });
  const loggedDiff = buildCoachWeekDiff(withLog.adapted, [seededLog(localNoonIso(lastWeek))], {
    now: new Date(`${withLog.thursday}T18:00:00`),
  });

  assert.ok(emptyDiff, 'empty history still has a session-count proposal');
  assert.ok(loggedDiff, 'logged history still has a session-count proposal');
  assert.equal(emptyDiff!.beforeCount, emptyChange.beforeCount);
  assert.equal(emptyDiff!.afterCount, emptyChange.afterCount);
  assert.equal(loggedDiff!.beforeCount, loggedChange.beforeCount);
  assert.equal(loggedDiff!.afterCount, loggedChange.afterCount);

  const expected = `${emptyChange.beforeCount} sessions → ${emptyChange.afterCount}`;
  assert.equal(emptyDiff!.line, expected);
  assert.equal(emptyDiff!.fact, null);
  assert.equal(emptyDiff!.citation.kind, 'no-logs');

  assert.ok(loggedDiff!.fact, 'the stored set must appear on the line');
  assert.ok(loggedDiff!.line.startsWith(expected), loggedDiff!.line);
  assert.match(loggedDiff!.line, /From your log:/);
  assert.match(loggedDiff!.fact!, /60kg/);
  assert.match(loggedDiff!.fact!, /× 5/);
});

test('no session-count change is not a proposal', () => {
  const ctx = buildCoachContextFromInputs({
    history: [],
    experience: 'beginner',
    equipment: 'bodyweight',
    goal: 'goal:general',
    daysPerWeek: 3,
    seedId: 'h02-no-change',
    includeCheckIn: false,
  });
  const monday = localDateKey(startOfLocalWeek(new Date()));
  const plan = generateWeek(ctx, monday, 1, monday);
  assert.equal(sessionCountChangeFromPlan(plan).beforeCount, sessionCountChangeFromPlan(plan).afterCount);
  assert.equal(buildCoachWeekDiff(plan, []), null);
});

test('the line is counts first, then the stored fact', () => {
  assert.equal(formatCoachWeekDiffLine(3, 2, null), '3 sessions → 2');
  assert.equal(formatCoachWeekDiffLine(1, 1, null), '1 session → 1');
  assert.equal(
    formatCoachWeekDiffLine(4, 3, 'Bench Press 60kg × 5 · 12 Aug'),
    '4 sessions → 3. From your log: Bench Press 60kg × 5 · 12 Aug'
  );
});

test('Today and Coach mount the diff in the existing banner slot', () => {
  const banner = readFileSync(path.join(root, 'src/components/coach/CoachAdaptBanner.tsx'), 'utf8');
  assert.match(banner, /sessionCountChangeFromPlan/);
  assert.match(banner, /formatCoachWeekDiffLine/);
  assert.match(banner, /coach-week-diff/);
  assert.match(banner, /coachLogCitationFromStorage|coachLogCitation/);

  const today = readFileSync(path.join(root, 'src/components/coach/TodayCoachWeekStrip.tsx'), 'utf8');
  assert.match(today, /<CoachAdaptBanner/);
  assert.doesNotMatch(today, /coach-week-diff-block|TodayWeekDiff/);

  const page = readFileSync(path.join(root, 'src/page-components/CoachPage.tsx'), 'utf8');
  assert.doesNotMatch(page, /<CoachAdaptBanner/);
  assert.doesNotMatch(page, /coach-week-diff-block/);
});
