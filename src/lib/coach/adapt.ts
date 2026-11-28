import { EXERCISES, ensureFullExerciseCatalog, getExerciseById, isFullExerciseCatalogLoaded } from '@/data/exercises';
import type { MuscleGroup } from '@/lib/muscleGroups';
import type { CompletedWorkoutLog, Exercise } from '@/types';
import type { CoachContext, CoachPlan, PlanExercise, PlanSession } from '@/lib/coach/types';
import { chooseSplit, todayDayOffset } from '@/lib/coach/splitPlanner';
import { buildSession, estimateMinutes, levelAllows, pickExercises } from '@/lib/coach/selector';
import { hashString, mulberry32 } from '@/lib/coach/rng';
import { equipmentMatches } from '@/lib/coach/equipment';
import { nextTargets } from '@/lib/coach/progression';
import { listGarageSwaps } from '@/lib/workout/garageSwap';

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
        reassigned.push({ ...s, dayOffset: slots[slotIdx]! });
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
        s.id === todaySession.id ? { ...swapped, id: s.id } : s
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
 * Did the week actually change, in a way an athlete should be told about?
 *
 * H-08: array order is not material. Field-wise rather than `JSON.stringify`,
 * because key order is not a fact about the plan either. A reordered spread
 * must not read as an adaptation.
 */
function sessionSignature(s: PlanSession): string {
  return [
    s.id,
    String(s.dayOffset),
    s.status,
    s.kind,
    s.name,
    String(s.estMinutes),
    s.exercises.map((ex) => ex.exerciseId).join(','),
  ].join('|');
}

export function sessionsMateriallyEqual(a: PlanSession[], b: PlanSession[]): boolean {
  if (a.length !== b.length) return false;
  const left = a.map(sessionSignature).sort();
  const right = b.map(sessionSignature).sort();
  return left.every((k, i) => k === right[i]);
}

function sessionsEqual(a: PlanSession[], b: PlanSession[]): boolean {
  return sessionsMateriallyEqual(a, b);
}

export function regenerateFutureSessions(plan: CoachPlan, ctx: CoachContext, todayOffset: number): CoachPlan {
  const pending = plan.sessions.filter((s) => isUpcoming(s, todayOffset))
    .sort((a, b) => a.dayOffset - b.dayOffset);
  if (!pending.length) return plan;
  const split = chooseSplit(pending.length, ctx.experience, ctx.goalId, ctx.assessmentRisk, {
    readiness: ctx.bodyScores.readiness,
    strain: ctx.bodyScores.strain,
    recovery: ctx.bodyScores.recovery,
    loadZone: ctx.loadZone,
  });
  const rng = mulberry32(hashString(`${plan.weekStart}:${ctx.seedId}:regen`));
  const replacements = new Map<PlanSession, PlanSession>();
  pending.forEach((session, i) => {
    const day = split[i];
    if (session.kind !== 'strength' || day?.kind !== 'recovery') return;
    const recovery = buildSession(day, session.dayOffset, plan.weekStart, ctx, rng);
    replacements.set(session, { ...recovery, id: session.id, status: 'swapped' });
  });
  if (!replacements.size) return plan;

  return {
    ...plan,
    revision: plan.revision + 1,
    sessions: plan.sessions.map((s) => replacements.get(s) ?? s),
    generatedAt: new Date().toISOString(),
  };
}

function isUpcoming(session: PlanSession, todayOffset: number): boolean {
  return session.dayOffset >= todayOffset && (session.status === 'planned' || session.status === 'swapped');
}

function repairSessionEquipment(session: PlanSession, ctx: CoachContext): PlanSession {
  const checks = session.exercises.map((target) => {
    const exercise = getExerciseById(target.exerciseId);
    return { target, exercise, compatible: !exercise || equipmentMatches(exercise, ctx.equipment, ctx.homeGymKit) };
  });
  if (checks.every(({ compatible }) => compatible)) return session;

  const used = new Set(checks.filter(({ compatible }) => compatible).map(({ target }) => target.exerciseId));
  const recovery = session.kind === 'recovery'
    ? pickExercises({ kind: 'recovery', focusGroups: session.focusGroups, nameKey: '' }, ctx,
      mulberry32(hashString(session.id))).exercises
    : [];
  const eligible = (ex: Exercise) =>
    !used.has(ex.id) && levelAllows(ex, ctx.experience) && equipmentMatches(ex, ctx.equipment, ctx.homeGymKit);

  const exercises = checks.flatMap(({ target, exercise, compatible }): PlanExercise[] => {
    if (compatible || !exercise) return [target];
    if (session.kind === 'recovery') {
      const replacement = recovery.find((candidate) => {
        const data = getExerciseById(candidate.exerciseId);
        return data && eligible(data);
      });
      if (!replacement) return [];
      used.add(replacement.exerciseId);
      return [replacement];
    }
    const explicit = [...(exercise.alternatives ?? []).map(getExerciseById), ...listGarageSwaps(exercise.id)]
      .find((ex) => ex && eligible(ex));
    const primary = exercise.muscleGroups[0];
    const replacement = explicit ?? EXERCISES.find((ex) =>
      !!primary && ex.muscleGroups[0] === primary && eligible(ex)
    );
    if (!replacement) return [];
    used.add(replacement.id);
    return [{
      exerciseId: replacement.id,
      ...nextTargets(replacement.id, ctx.history, ctx.units, ctx.goalId, ctx.experience, ctx.loadZone),
    }];
  });
  return { ...session, exercises, estMinutes: estimateMinutes(exercises, session.kind) };
}

export async function adaptForEquipmentChange(
  plan: CoachPlan,
  ctx: CoachContext,
  todayOffset: number
): Promise<CoachPlan> {
  const profileChanged = plan.equipmentProfile !== ctx.equipment;
  const futureIds = plan.sessions
    .filter((s) => isUpcoming(s, todayOffset))
    .flatMap((s) => s.exercises.map((ex) => ex.exerciseId));
  const checkEquipment = profileChanged || ctx.equipment === 'dumbbells' || !!ctx.homeGymKit;
  if (checkEquipment && !isFullExerciseCatalogLoaded() && futureIds.some((id) => !getExerciseById(id))) {
    await ensureFullExerciseCatalog();
  }
  if (!checkEquipment) return plan;
  const sessions = plan.sessions.map((s) => isUpcoming(s, todayOffset) ? repairSessionEquipment(s, ctx) : s);
  if (!profileChanged && sessions.every((s, i) => s === plan.sessions[i])) return plan;
  return {
    ...plan,
    revision: plan.revision + 1,
    equipmentProfile: ctx.equipment,
    sessions,
    generatedAt: new Date().toISOString(),
  };
}
