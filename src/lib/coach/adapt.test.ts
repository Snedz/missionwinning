import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { CompletedWorkoutLog } from '@/types';
import { buildCoachContextFromInputs } from '@/lib/coach/contextBuilder';
import { generateWeek } from '@/lib/coach/planEngine';
import { adaptPlan, adaptForEquipmentChange, regenerateFutureSessions } from '@/lib/coach/adapt';

describe('adaptPlan', () => {
  /*
   * `.207` — this test used to pass `today = weekStart` and then assert
   * `missed.length >= 0`, which is true of every array ever created. It was
   * green for the whole life of the bug it was named after, and it is why the
   * defect below survived: `useCoachPlan` also passed `weekStart` as today, so
   * `todayDayOffset` was always 0, `dayOffset < todayOffset` never matched, and
   * **no session was ever marked missed on the automatic path.** The "life
   * happened, remaining days re-spread" adaptation could not fire at all.
   *
   * A Thursday, and a real count.
   */
  it('marks past planned sessions as missed', () => {
    const ctx = buildCoachContextFromInputs({
      history: [],
      experience: 'beginner',
      equipment: 'bodyweight',
      goal: 'goal:general',
      daysPerWeek: 3,
      seedId: 'adapt-miss',
    });
    // 2026-07-06 is a Monday; 2026-07-09 is the Thursday of the same week.
    const plan = generateWeek(ctx, '2026-07-06');
    const before = plan.sessions.filter((s) => s.dayOffset < 3 && s.status === 'planned');
    assert.ok(before.length > 0, 'fixture should have planned sessions before Thursday');

    const adapted = adaptPlan(plan, ctx, '2026-07-09');
    const stillPlannedInThePast = adapted.sessions.filter(
      (s) => s.dayOffset < 3 && s.status === 'planned'
    );
    assert.deepEqual(
      stillPlannedInThePast,
      [],
      'a session whose day has passed is missed or done — never still "planned"'
    );
  });

  it('marks nothing missed on the first day of the week', () => {
    const ctx = buildCoachContextFromInputs({
      history: [],
      experience: 'beginner',
      equipment: 'bodyweight',
      goal: 'goal:general',
      daysPerWeek: 3,
      seedId: 'adapt-miss-monday',
    });
    const plan = generateWeek(ctx, '2026-07-06', 1, '2026-07-06');
    const adapted = adaptPlan(plan, ctx, '2026-07-06');
    assert.deepEqual(
      adapted.sessions.filter((s) => s.status === 'missed'),
      [],
      'nothing has been missed yet on Monday — the other direction of the same rule'
    );
  });

  /*
   * Cold-start Sunday: seed used to place Mon/Wed/Fri, adapt marked all three
   * missed (no remaining future sessions to re-spread), and Coach opened with
   * "Life happened — 3 sessions missed" for an athlete who had never trained.
   */
  it('does not leave a wall of missed sessions on a cold-start late week', () => {
    const ctx = buildCoachContextFromInputs({
      history: [],
      experience: 'beginner',
      equipment: 'bodyweight',
      goal: 'goal:general',
      daysPerWeek: 3,
      seedId: 'adapt-cold-sunday',
    });
    // Generate as if Monday (full pattern), then adapt on Sunday — the stored
    // plan shape an athlete would hit after a mid-week code path or old seed.
    const plan = generateWeek(ctx, '2026-07-06', 1, '2026-07-06');
    assert.ok(
      plan.sessions.some((s) => s.dayOffset < 6),
      'fixture needs past-week sessions to exercise the collapse path'
    );
    const adapted = adaptPlan(plan, ctx, '2026-07-12'); // Sunday of that week
    const missed = adapted.sessions.filter((s) => s.status === 'missed');
    const planned = adapted.sessions.filter(
      (s) => s.status === 'planned' || s.status === 'swapped'
    );
    assert.deepEqual(missed, [], 'cold start must not paint past seed days as missed');
    assert.ok(planned.length >= 1, 'at least one session must still be open on Sunday');
    assert.ok(
      planned.every((s) => s.dayOffset >= 6),
      'open sessions sit on the remaining day(s), not the past'
    );
  });

  it('generateWeek mid-week only schedules remaining days', () => {
    const ctx = buildCoachContextFromInputs({
      history: [],
      experience: 'beginner',
      equipment: 'bodyweight',
      goal: 'goal:general',
      daysPerWeek: 3,
      seedId: 'gen-midweek',
    });
    // Thursday of the week starting Monday 2026-07-06
    const plan = generateWeek(ctx, '2026-07-06', 1, '2026-07-09');
    assert.ok(plan.sessions.length >= 1);
    assert.ok(
      plan.sessions.every((s) => s.dayOffset >= 3),
      `no session before Thursday, got offsets ${plan.sessions.map((s) => s.dayOffset)}`
    );
    assert.ok(
      plan.sessions.every((s) => s.status === 'planned'),
      'fresh generate is all planned'
    );
  });

  it('swaps today strength to recovery when readiness low', () => {
    const ctx = buildCoachContextFromInputs({
      history: [],
      experience: 'intermediate',
      equipment: 'dumbbells',
      goal: 'goal:strength',
      daysPerWeek: 4,
      seedId: 'adapt-readiness',
    });
    ctx.bodyScores.readiness = 30;
    const plan = generateWeek(ctx, '2026-07-06');
    const todaySession = plan.sessions.find((s) => s.dayOffset === 0);
    if (todaySession?.kind === 'strength') {
      const adapted = adaptPlan(plan, ctx, '2026-07-06');
      const today = adapted.sessions.find((s) => s.dayOffset === 0);
      assert.ok(today?.kind === 'recovery' || today?.status === 'swapped');
    }
  });

  /*
   * `.207` — the recovery swap targets `dayOffset === todayOffset`, and
   * `todayOffset` was always 0. So on a Thursday with readiness 30 the app
   * swapped **Monday's** session — already in the past — and left Thursday's
   * heavy squat day exactly where it was. The athlete asked for a lighter day
   * and got one, retroactively, on a day they had already trained.
   */
  it('swaps the session for the day it actually is', () => {
    const ctx = buildCoachContextFromInputs({
      history: [],
      experience: 'intermediate',
      equipment: 'full-gym',
      goal: 'goal:strength',
      daysPerWeek: 5,
      seedId: 'adapt-readiness-midweek',
    });
    ctx.bodyScores.readiness = 30;
    const generated = generateWeek(ctx, '2026-07-06');

    /*
     * Preconditions are asserted, never skipped past.
     *
     * The first draft of this test read `if (session?.kind !== 'strength') return;`
     * and the `recovery-swap-hits-the-wrong-day` mutant **survived** — the
     * fixture has no session on day 3 at all, so the test returned without
     * asserting anything. That is the fifth vacuous guard in this programme and
     * the reason the rule is now: state what the fixture must provide, and fail
     * loudly when it stops providing it.
     *
     * Days 0 and 1 are marked done so the missed-session re-spread (which runs
     * first and rewrites dayOffsets) cannot move the session under test.
     */
    const TODAY_OFFSET = 2; // 2026-07-08, the Wednesday of that week
    const plan = {
      ...generated,
      sessions: generated.sessions.map((s) =>
        s.dayOffset < TODAY_OFFSET ? { ...s, status: 'done' as const } : s
      ),
    };
    const target = plan.sessions.find((s) => s.dayOffset === TODAY_OFFSET);
    assert.ok(target, `fixture must have a session on day ${TODAY_OFFSET}`);
    assert.equal(target.kind, 'strength', 'the swap only applies to a strength session');

    const adapted = adaptPlan(plan, ctx, '2026-07-08');
    const after = adapted.sessions.find((s) => s.dayOffset === TODAY_OFFSET);
    assert.ok(
      after?.kind === 'recovery' || after?.status === 'swapped',
      "low readiness on Wednesday must reach Wednesday's session — it used to swap Monday's, " +
        'because todayOffset was always 0'
    );
  });

  /*
   * `.207` — the revision is a claim, and it was made unconditionally.
   *
   * `adaptPlan` returned `plan.revision + 1` every time, and `useCoachPlan`
   * guards its save with `next.revision !== existing.revision` — always true. So
   * every mount rewrote the plan and called `scheduleCoachPush()`. Downstream,
   * `hasCoachAdaptationSignal` is `revision > 1`, so `CoachAdaptBanner` told
   * every athlete on every visit that the coach had adapted their week, whether
   * or not anything had changed. `.127`: nothing said on thin data.
   */
  it('does not claim an adaptation when nothing changed', () => {
    const ctx = buildCoachContextFromInputs({
      history: [],
      experience: 'beginner',
      equipment: 'bodyweight',
      goal: 'goal:general',
      daysPerWeek: 3,
      seedId: 'adapt-idempotent',
    });
    const plan = generateWeek(ctx, '2026-07-06');
    const once = adaptPlan(plan, ctx, '2026-07-06');
    const twice = adaptPlan(once, ctx, '2026-07-06');

    assert.equal(
      twice.revision,
      once.revision,
      'adapting an already-adapted, unchanged week must not bump the revision — ' +
        'that is what made the "your coach adapted your week" banner permanent'
    );
    assert.deepEqual(twice.sessions, once.sessions, 'and the week itself must be unchanged');
  });

  it('still bumps the revision when the week really changes', () => {
    const ctx = buildCoachContextFromInputs({
      history: [],
      experience: 'beginner',
      equipment: 'bodyweight',
      goal: 'goal:general',
      daysPerWeek: 3,
      seedId: 'adapt-real-change',
    });
    const plan = generateWeek(ctx, '2026-07-06');
    const adapted = adaptPlan(plan, ctx, '2026-07-09');
    if (adapted.sessions.some((s, i) => s.status !== plan.sessions[i]?.status)) {
      assert.equal(
        adapted.revision,
        plan.revision + 1,
        'a week that changed must say so — the guard above must not silence real adaptations'
      );
    }
  });

  it('done sessions stay immutable on equipment change', () => {
    const ctx = buildCoachContextFromInputs({
      history: [],
      experience: 'beginner',
      equipment: 'bodyweight',
      goal: 'goal:general',
      daysPerWeek: 3,
      seedId: 'adapt-eq',
    });
    const plan = generateWeek(ctx, '2026-07-06');
    const doneId = plan.sessions[0].id;
    plan.sessions[0] = { ...plan.sessions[0], status: 'done' };
    const newCtx = { ...ctx, equipment: 'full-gym' as const };
    const adapted = adaptForEquipmentChange(plan, newCtx, 1);
    const done = adapted.sessions.find((s) => s.id === doneId);
    assert.equal(done?.status, 'done');
  });

  it('regenerateFutureSessions is idempotent when the week is unchanged', () => {
    const history: CompletedWorkoutLog[] = Array.from({ length: 20 }, (_, i) => ({
      id: `w-${i}`,
      clientId: `w-${i}`,
      workoutName: 'Session',
      startedAt: new Date(Date.now() - i * 86400000 - 3600000).toISOString(),
      completedAt: new Date(Date.now() - i * 86400000).toISOString(),
      durationSeconds: 3600,
      exercises: [
        {
          exerciseId: 'squat',
          muscleGroups: ['Legs'],
          sets: [{ reps: 10, weight: 100, kind: 'normal' as const }],
        },
      ],
      totalVolume: 50_000,
      revision: 1,
      updatedAt: new Date().toISOString(),
    }));
    const ctx = buildCoachContextFromInputs({
      history,
      experience: 'intermediate',
      equipment: 'full-gym',
      goal: 'goal:strength',
      daysPerWeek: 4,
      seedId: 'regen-idempotent',
    });
    assert.ok(ctx.bodyScores.strain >= 70, 'fixture must exercise fatigue regen path');
    const plan = generateWeek(ctx, '2026-07-06');
    const todayOffset = 2;
    const once = regenerateFutureSessions(plan, ctx, todayOffset);
    const twice = regenerateFutureSessions(once, ctx, todayOffset);
    assert.equal(
      twice.revision,
      once.revision,
      'fatigue regen must not bump revision when sessions are already regen-shaped'
    );
    assert.deepEqual(twice.sessions, once.sessions);
  });
});
