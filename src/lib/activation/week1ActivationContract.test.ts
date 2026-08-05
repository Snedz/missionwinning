/**
 * Week-1 activation must survive Today composure and kaizen reordering.
 *
 * `.291` added session-2. `.294` demoted Mission Score and tightened the
 * Today budget. This file is the regression net: if either side drifts, the
 * athlete with exactly one log sees Fuel tourism or a scoreboard above "what
 * now" again.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  week1SecondSessionCue,
  week1SecondSessionDone,
} from './week1SecondSession.ts';
import { pickVictoryNextAction } from '@/lib/workout/workoutVictory';
import { getFirstSteps, summarizeFirstSteps } from '@/lib/journey/firstSteps';
import { pickReadinessPrimaryAction, type JourneyState } from '@/lib/missionJourney';
import {
  buildJustGoHeroMeta,
  resolveJustGoHeroCopy,
} from '@/lib/justGoHeroMeta';
import { TODAY_BLOCK_PRIORITY } from '@/lib/today/todayBlockPriority';
import {
  planTodayBlocks,
  TODAY_MAX_TOP_LEVEL_BLOCKS,
} from '@/lib/today/todayBlockBudget';

const root = path.join(import.meta.dirname, '..', '..', '..');

function basicAfterFirstWorkout(): JourneyState {
  return {
    phase: 'basic',
    iDay: {},
    basic: { workout: true, fuel: false, move: false, mind: false, learn: false },
    readiness: { parq: false, streakMet: false, winScoreSeen: true },
  };
}

describe('week-1 activation contract after composure (.404)', () => {
  it('First Steps next is session2 after exactly one log', () => {
    const progress = summarizeFirstSteps(
      getFirstSteps(basicAfterFirstWorkout(), { completedSessions: 1 })
    );
    assert.equal(progress.next?.key, 'session2');
    assert.equal(progress.next?.href, '/active');
    assert.equal(week1SecondSessionDone(1), false);
    assert.equal(week1SecondSessionDone(2), true);
  });

  it('Victory next after first log matches session-2 cue (T1.3 · .412)', () => {
    const cue = week1SecondSessionCue({ completedSessions: 1 });
    assert.ok(cue);
    const victory = pickVictoryNextAction({
      completedWorkouts: 1,
      hasCoachPlan: true,
    });
    assert.equal(victory.href, cue!.href);
    assert.equal(victory.labelKey, cue!.labelKey);
    assert.equal(victory.reasonKey, cue!.reasonKey);
  });

  /**
   * K5 — After first log, phase is readiness; Today dock must agree with
   * Victory and First Steps (train / session 2), not PAR-Q or guidebook.
   */
  it('readiness Today primary after first log is train — agrees Victory + First Steps (K5)', () => {
    const cue = week1SecondSessionCue({ completedSessions: 1 });
    assert.ok(cue);
    const readinessPrimary = pickReadinessPrimaryAction({
      readiness: { parq: false, streakMet: false, winScoreSeen: true },
      completedSessions: 1,
      startWorkout: {
        name: 'Session 2',
        exercises: [{ exerciseId: 'air-squat', sets: [{ reps: 10, weight: 0 }] }],
      },
    });
    assert.ok(readinessPrimary);
    assert.equal(readinessPrimary!.href, '/active');
    assert.equal(readinessPrimary!.href, cue!.href);

    const victory = pickVictoryNextAction({ completedWorkouts: 1 });
    assert.equal(victory.href, readinessPrimary!.href);

    const progress = summarizeFirstSteps(
      getFirstSteps(basicAfterFirstWorkout(), { completedSessions: 1 })
    );
    assert.equal(progress.next?.href, readinessPrimary!.href);
    assert.notEqual(readinessPrimary!.href, '/assessments');
    assert.notEqual(readinessPrimary!.href, '/learn/guide');
  });

  it('pure cue shows only at completedSessions === 1', () => {
    assert.ok(week1SecondSessionCue({ completedSessions: 1 })?.show);
    assert.equal(week1SecondSessionCue({ completedSessions: 0 }), null);
    assert.equal(week1SecondSessionCue({ completedSessions: 2 }), null);
    assert.equal(
      week1SecondSessionCue({ completedSessions: 1, hasActiveWorkout: true }),
      null
    );
  });

  it('Today train CTA says session 2 for freestyle and coach', () => {
    const freestyle = resolveJustGoHeroCopy(
      buildJustGoHeroMeta({
        hasActiveWorkout: false,
        trainReady: true,
        focusLabel: 'Back',
        coach: null,
      })!,
      { completedSessions: 1 }
    );
    assert.equal(freestyle.labelKey, 'week1SecondSessionCta');

    const coach = resolveJustGoHeroCopy(
      buildJustGoHeroMeta({
        hasActiveWorkout: false,
        trainReady: true,
        focusLabel: 'Chest',
        coach: {
          name: 'Upper A',
          exercises: [{ exerciseId: 'bench-press', sets: 3, reps: 5, weight: 100 }],
        },
      })!,
      { completedSessions: 1 }
    );
    assert.equal(coach.labelKey, 'week1SecondSessionCta');
  });

  it('Mission Score priority stays behind what-to-do blocks (K1)', () => {
    const P = TODAY_BLOCK_PRIORITY;
    assert.ok(P.beta < P['coach-today']);
    assert.ok(P['coach-today'] < P['week-recap']);
    assert.ok(P['week-recap'] < P.dashboard);
    assert.equal(P.dashboard, 32, 'dashboard was demoted to 32 in .294 — do not re-promote');
  });

  it('dense evening budget keeps coach session, spills Mission Score', () => {
    // Pinned first-steps + header + reentry consume 3 of 6; room = 3 spillable.
    const candidates = [
      { key: 'beta', priority: TODAY_BLOCK_PRIORITY.beta, pinned: true, node: 'fs' },
      { key: 'header', priority: TODAY_BLOCK_PRIORITY.header, pinned: true, node: 'h' },
      { key: 'reentry', priority: TODAY_BLOCK_PRIORITY.reentry, pinned: true, node: 'r' },
      { key: 'coach-today', priority: TODAY_BLOCK_PRIORITY['coach-today'], node: 'ct' },
      { key: 'coach-week', priority: TODAY_BLOCK_PRIORITY['coach-week'], node: 'cw' },
      { key: 'day-review', priority: TODAY_BLOCK_PRIORITY['day-review'], node: 'dr' },
      { key: 'intent', priority: TODAY_BLOCK_PRIORITY.intent, node: 'i' },
      { key: 'week-recap', priority: TODAY_BLOCK_PRIORITY['week-recap'], node: 'wr' },
      { key: 'dashboard', priority: TODAY_BLOCK_PRIORITY.dashboard, node: 'ms' },
      { key: 'coach-invite', priority: TODAY_BLOCK_PRIORITY['coach-invite'], node: 'ci' },
    ];
    const plan = planTodayBlocks(candidates, TODAY_MAX_TOP_LEVEL_BLOCKS);
    const topKeys = plan.top.map((c) => c.key);
    const moreKeys = plan.inMore.map((c) => c.key);

    assert.ok(topKeys.includes('beta'), 'First Steps stay pinned for week-1');
    assert.ok(topKeys.includes('coach-today'), 'next session stays above the fold');
    assert.ok(
      moreKeys.includes('dashboard'),
      'Mission Score spills before coach session on a dense evening'
    );
    assert.ok(
      !topKeys.includes('coach-invite') || moreKeys.includes('coach-invite'),
      'coach-invite is never preferred over session'
    );
    // Invite must not beat coach-today into the three spillable slots
    assert.ok(
      topKeys.indexOf('coach-today') !== -1 && moreKeys.includes('coach-invite')
        ? true
        : moreKeys.includes('coach-invite') || !topKeys.includes('coach-invite')
    );
  });

  it('call sites still pass completedSessions (wiring)', () => {
    const card = readFileSync(
      path.join(root, 'src/components/journey/FirstStepsCard.tsx'),
      'utf8'
    );
    const hero = readFileSync(
      path.join(root, 'src/components/journey/JourneyHero.tsx'),
      'utf8'
    );
    const lean = readFileSync(
      path.join(root, 'src/page-components/HomeTodayLean.tsx'),
      'utf8'
    );
    const dash = readFileSync(
      path.join(root, 'src/page-components/HomeTodayDashboard.tsx'),
      'utf8'
    );
    assert.match(card, /completedSessions/);
    assert.match(hero, /completedSessions/);
    assert.match(lean, /completedSessions=\{workoutHistory\.length\}/);
    assert.match(dash, /completedSessions=\{workoutHistory\.length\}/);
  });
});
