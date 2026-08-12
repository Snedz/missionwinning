import { EXERCISES } from '@/data/exercises';
import type { MuscleGroup } from '@/lib/muscleGroups';
import type { CompletedWorkoutLog } from '@/types';
import type { CoachContext, CoachPlan, PlanSession } from '@/lib/coach/types';
import { chooseSplit, mapToCalendar, todayDayOffset } from '@/lib/coach/splitPlanner';
import { buildSession } from '@/lib/coach/selector';
import { hashString, mulberry32 } from '@/lib/coach/rng';

export function recoverySession(dayOffset: number, weekStart: string): PlanSession {
  const rng = mulberry32(hashString(`${weekStart}-recovery-${dayOffset}`));
  return buildSession(
    { kind: 'recovery', focusGroups: ['Core', 'Back'], nameKey: 'coachSessionRecovery' },
    dayOffset,
    weekStart,
    {
      experience: 'beginner',
      equipment: 'bodyweight',
      goalId: 'mobility',
      daysPerWeek: 3,
      preferredDays: [],
      history: [],
      readiness: {} as CoachContext['readiness'],
      bodyScores: {
        readiness: 30,
        strain: 50,
        recovery: 40,
        readinessLabelKey: 'todayBodyRestUp',
        strainLabelKey: 'todayBodyModerateLoad',
        recoveryLabelKey: 'todayBodyNeedsRest',
      },
      units: 'metric',
      seedId: 'adapt',
    },
    rng
  );
}

function sessionMuscleSet(session: PlanSession): Set<MuscleGroup> {
  const groups = new Set<MuscleGroup>();
  for (const ex of session.exercises) {
    const data = EXERCISES.find((e) => e.id === ex.exerciseId);
    data?.muscleGroups.forEach((g) => {
      if (session.focusGroups.includes(g as MuscleGroup)) groups.add(g as MuscleGroup);
    });
  }
  return groups;
}

function workoutMuscleSet(log: CompletedWorkoutLog): Set<MuscleGroup> {
  const groups = new Set<MuscleGroup>();
  for (const ex of log.exercises) {
    const data = EXERCISES.find((e) => e.id === ex.exerciseId);
    data?.muscleGroups.forEach((g) => groups.add(g as MuscleGroup));
  }
  return groups;
}

function overlapRatio(a: Set<MuscleGroup>, b: Set<MuscleGroup>): number {
  if (!a.size || !b.size) return 0;
  let hit = 0;
  for (const g of a) if (b.has(g)) hit++;
  return hit / Math.max(a.size, b.size);
}

export function markSessionsFromExternalWorkouts(
  plan: CoachPlan,
  history: CompletedWorkoutLog[],
  weekStart: string
): CoachPlan {
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const weekLogs = history.filter((log) => {
    const d = new Date(log.completedAt);
    return d >= start && d < end;
  });

  if (!weekLogs.length) return plan;

  const sessions = plan.sessions.map((s) => ({ ...s }));

  for (const log of weekLogs) {
    const logMuscles = workoutMuscleSet(log);
    let bestIdx = -1;
    let bestRatio = 0;
    for (let i = 0; i < sessions.length; i++) {
      if (sessions[i].status === 'done') continue;
      const ratio = overlapRatio(sessionMuscleSet(sessions[i]), logMuscles);
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestIdx = i;
      }
    }
    if (bestIdx >= 0 && bestRatio >= 0.6) {
      sessions[bestIdx] = { ...sessions[bestIdx], status: 'done' };
    }
  }

  return { ...plan, sessions };
}

export function adaptPlan(plan: CoachPlan, ctx: CoachContext, today: string): CoachPlan {
  const weekStart = plan.weekStart;
  const todayOffset = todayDayOffset(weekStart, today);
  let sessions = plan.sessions.map((s) => ({ ...s }));

  // Mark missed sessions
  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i]!.dayOffset < todayOffset && sessions[i]!.status === 'planned') {
      sessions[i] = { ...sessions[i]!, status: 'missed' };
    }
  }

  const missed = sessions.filter((s) => s.status === 'missed');
  const remaining = sessions.filter((s) => s.status === 'planned' || s.status === 'swapped');
  const doneSessions = sessions.filter((s) => s.status === 'done');
  const daysLeft = 7 - todayOffset;
  const slots = Array.from({ length: daysLeft }, (_, i) => todayOffset + i);

  /*
   * Late-week / cold-start collapse: every planned day is already in the past,
   * so `remaining` is empty and the old path left a wall of `missed` with no
   * forward session — "Life happened — 3 sessions missed" on a brand-new
   * Sunday I-Day. Re-open those sessions onto the days that are still left
   * as **planned**, and only keep true misses when nothing can be salvaged
   * (no days left, or the athlete already finished the week).
   */
  if (missed.length > 0 && remaining.length === 0 && slots.length > 0) {
    const strengthDays = missed.filter((s) => s.kind === 'strength');
    const otherDays = missed.filter((s) => s.kind !== 'strength');
    let slotIdx = 0;
    const reassigned: PlanSession[] = [];
    const assign = (list: PlanSession[]) => {
      for (const s of list) {
        while (slotIdx < slots.length - 1) {
          const prev = reassigned[reassigned.length - 1];
          if (
            prev &&
            prev.kind === 'strength' &&
            s.kind === 'strength' &&
            slots[slotIdx]! - prev.dayOffset === 1
          ) {
            slotIdx++;
            continue;
          }
          break;
        }
        if (slotIdx >= slots.length) break;
        reassigned.push({ ...s, dayOffset: slots[slotIdx]!, status: 'planned' });
        slotIdx++;
      }
    };
    assign(strengthDays);
    assign(otherDays);
    // Only keep as missed what could not fit — never the whole week as shame.
    const placedIds = new Set(reassigned.map((s) => s.id));
    const stillMissed =
      doneSessions.length > 0
        ? missed.filter((s) => !placedIds.has(s.id))
        : []; // cold start: drop unplaceable past days, don't label them missed
    sessions = [...doneSessions, ...stillMissed, ...reassigned];
  } else if (missed.length > 0 && remaining.length > 0) {
    const strengthDays = remaining.filter((s) => s.kind === 'strength');
    const otherDays = remaining.filter((s) => s.kind !== 'strength');

    let slotIdx = 0;
    const reassigned: PlanSession[] = [];

    const assign = (list: PlanSession[]) => {
      for (const s of list) {
        while (slotIdx < slots.length - 1) {
          const prev = reassigned[reassigned.length - 1];
          if (
            prev &&
            prev.kind === 'strength' &&
            s.kind === 'strength' &&
            slots[slotIdx]! - prev.dayOffset === 1
          ) {
            slotIdx++;
            continue;
          }
          break;
        }
        if (slotIdx >= slots.length) break;
        reassigned.push({ ...s, dayOffset: slots[slotIdx]!, status: 'planned' });
        slotIdx++;
      }
    };

    assign(strengthDays);
    assign(otherDays);

    /*
     * Missed days stay in the week.
     *
     * This used to be `[...doneSessions, ...reassigned]`, on the reasoning that
     * dropping them stopped the week strip "painting Missed on days the plan
     * left". But **nothing left those days.** Branch A above re-opens the
     * *missed* sessions themselves, so it must filter `placedIds` or the same
     * session shows twice; this branch re-spreads `remaining` — the still-future
     * sessions — and never touches `missed` at all. There was no duplicate to
     * avoid, so the filter deleted the only record that a day was missed.
     *
     * The cost was the whole adaptation story. `summarizeCoachAdaptations` reads
     * `status === 'missed'`, so it saw none: no "Life happened…" beat,
     * `hasCoachAdaptationSignal` false, `CoachAdaptBanner` returning `null` — in
     * the file whose own header calls the banner "demo-critical: partners must
     * see log/miss → week changed in ≤60s" — and no re-entry block. The athlete
     * missed Monday and the week quietly got smaller with nothing said.
     *
     * The beat's own copy proves the intent: *"Life happened — missed {days}.
     * **Remaining days are re-spread** so the week still fits."* That sentence
     * describes this branch exactly, and this branch was the one case that could
     * never render it.
     *
     * Keeping them is also what the rest of the app already expects. A missed
     * session renders with the deliberate calm treatment `PlanSessionCard`
     * documents — dashed border, "Missed" badge, never dimmed past contrast —
     * because "it is behind you, not hidden from you (Horizon W criterion 4)".
     * Hiding it is not kindness; it is the plan losing the athlete's week.
     */
    sessions = [...doneSessions, ...missed, ...reassigned];
  }

  // Low readiness swap today
  if (ctx.bodyScores.readiness < 40 || ctx.assessmentRisk === 'high') {
    const todaySession = sessions.find(
      (s) => s.dayOffset === todayOffset && (s.status === 'planned' || s.status === 'swapped')
    );
    if (todaySession && todaySession.kind === 'strength') {
      const swapped = recoverySession(todayOffset, weekStart);
      swapped.status = 'swapped';
      sessions = sessions.map((s) =>
        s.id === todaySession.id ? swapped : s
      );
    }
  }

  sessions = markSessionsFromExternalWorkouts({ ...plan, sessions }, ctx.history, weekStart).sessions;

  /*
   * `.207` — the revision is a claim, so it must be earned.
   *
   * This used to return `plan.revision + 1` unconditionally, and
   * `useCoachPlan` guards its save with `next.revision !== existing.revision`
   * — which was therefore always true. Every mount rewrote the plan and called
   * `scheduleCoachPush()`.
   *
   * Downstream the damage is a trust claim: `hasCoachAdaptationSignal` is
   * `revision > 1`, so `CoachAdaptBanner` told **every athlete, on every visit,
   * always** that the coach had adapted their week — including when nothing had
   * changed. `.127`: nothing said on thin data.
   *
   * An unchanged week is not an adaptation. Comparing the sessions is the only
   * honest test, because that is the entire output this function produces.
   */
  if (sessionsEqual(plan.sessions, sessions)) return plan;

  return {
    ...plan,
    revision: plan.revision + 1,
    sessions,
  };
}

/**
 * Did the week actually change?
 *
 * Field-wise rather than `JSON.stringify`, because key order is not a fact about
 * the plan and a reordered spread would read as an adaptation.
 */
function sessionsEqual(a: PlanSession[], b: PlanSession[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((s, i) => {
    const o = b[i];
    return (
      s.id === o.id &&
      s.dayOffset === o.dayOffset &&
      s.status === o.status &&
      s.kind === o.kind &&
      s.name === o.name &&
      s.estMinutes === o.estMinutes &&
      // The recovery swap replaces a session's whole exercise list, so comparing
      // only the header would call a changed week unchanged.
      s.exercises.length === o.exercises.length &&
      s.exercises.every((ex, j) => ex.exerciseId === o.exercises[j].exerciseId)
    );
  });
}

export function regenerateFutureSessions(plan: CoachPlan, ctx: CoachContext, todayOffset: number): CoachPlan {
  const doneSessions = plan.sessions.filter((s) => s.status === 'done' || s.dayOffset < todayOffset);
  const daysLeft = ctx.daysPerWeek - doneSessions.length;
  if (daysLeft <= 0) return plan;

  const split = chooseSplit(daysLeft, ctx.experience, ctx.goalId, ctx.assessmentRisk, {
    readiness: ctx.bodyScores.readiness,
    strain: ctx.bodyScores.strain,
    recovery: ctx.bodyScores.recovery,
  });
  const preferred = ctx.preferredDays.filter((d) => d >= todayOffset);
  const calendar = mapToCalendar(split, preferred.length ? preferred : [], plan.weekStart);
  const rng = mulberry32(hashString(`${plan.weekStart}:${ctx.seedId}:regen`));

  const future = calendar
    .filter(({ dayOffset }) => dayOffset >= todayOffset)
    .map(({ day, dayOffset }) => buildSession(day, dayOffset, plan.weekStart, ctx, rng));

  const sessions = [...doneSessions, ...future];

  /*
   * Same class of bug as `.207` on `adaptPlan`: this always returned
   * `revision + 1`, and `useCoachPlan` saves when the revision moves then
   * listens synchronously for `mw-coach-plan-changed`. On Today — free beta
   * counts as premium, strain ≥ 70 triggers this path — every refresh rewrote
   * the plan, re-fired the event, and recurse until the renderer stack blew
   * (Chrome Aw, Snap! code 9 on /log).
   */
  if (sessionsEqual(plan.sessions, sessions) && plan.equipmentProfile === ctx.equipment) {
    return plan;
  }

  return {
    ...plan,
    revision: plan.revision + 1,
    equipmentProfile: ctx.equipment,
    sessions,
    generatedAt: new Date().toISOString(),
  };
}

export function adaptForEquipmentChange(
  plan: CoachPlan,
  ctx: CoachContext,
  todayOffset: number
): CoachPlan {
  if (plan.equipmentProfile === ctx.equipment) return plan;
  return regenerateFutureSessions(plan, ctx, todayOffset);
}
