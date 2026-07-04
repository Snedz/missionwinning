import { EXERCISES } from '@/data/exercises';
import type { MuscleGroup } from '@/lib/muscleGroups';
import type { CompletedWorkoutLog } from '@/types';
import type { CoachContext, CoachPlan, PlanSession } from '@/lib/coach/types';
import { generateWeek } from '@/lib/coach/planEngine';
import { chooseSplit, mapToCalendar, todayDayOffset } from '@/lib/coach/splitPlanner';
import { buildSession } from '@/lib/coach/selector';
import { hashString, mulberry32 } from '@/lib/coach/rng';

function recoverySession(dayOffset: number, weekStart: string): PlanSession {
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
  const todayOffset = todayDayOffset(weekStart);
  let sessions = plan.sessions.map((s) => ({ ...s }));

  // Mark missed sessions
  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i].dayOffset < todayOffset && sessions[i].status === 'planned') {
      sessions[i] = { ...sessions[i], status: 'missed' };
    }
  }

  const missed = sessions.filter((s) => s.status === 'missed');
  const remaining = sessions.filter((s) => s.status === 'planned' || s.status === 'swapped');

  if (missed.length > 0 && remaining.length > 0) {
    const daysLeft = 7 - todayOffset;
    const slots = Array.from({ length: daysLeft }, (_, i) => todayOffset + i);
    const strengthDays = remaining.filter((s) => s.kind === 'strength');
    const otherDays = remaining.filter((s) => s.kind !== 'strength');

    let slotIdx = 0;
    const reassigned: PlanSession[] = [];

    const assign = (list: PlanSession[]) => {
      for (const s of list) {
        while (slotIdx < slots.length - 1) {
          const prev = reassigned[reassigned.length - 1];
          if (prev && prev.kind === 'strength' && s.kind === 'strength' && slots[slotIdx] - prev.dayOffset === 1) {
            slotIdx++;
            continue;
          }
          break;
        }
        if (slotIdx >= slots.length) break;
        reassigned.push({ ...s, dayOffset: slots[slotIdx], status: 'planned' });
        slotIdx++;
      }
    };

    assign(strengthDays);
    assign(otherDays);

    const done = sessions.filter((s) => s.status === 'done');
    const dropped = remaining.length - reassigned.length;
    sessions = [...done, ...reassigned];
    if (dropped > 0 && reassigned.length) {
      // lowest priority accessory dropped implicitly
    }
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

  return {
    ...plan,
    revision: plan.revision + 1,
    sessions,
  };
}

export function regenerateFutureSessions(plan: CoachPlan, ctx: CoachContext, todayOffset: number): CoachPlan {
  const doneSessions = plan.sessions.filter((s) => s.status === 'done' || s.dayOffset < todayOffset);
  const daysLeft = ctx.daysPerWeek - doneSessions.length;
  if (daysLeft <= 0) return plan;

  const split = chooseSplit(daysLeft, ctx.experience, ctx.goalId, ctx.assessmentRisk);
  const preferred = ctx.preferredDays.filter((d) => d >= todayOffset);
  const calendar = mapToCalendar(split, preferred.length ? preferred : [], plan.weekStart);
  const rng = mulberry32(hashString(`${plan.weekStart}:${ctx.seedId}:regen`));

  const future = calendar
    .filter(({ dayOffset }) => dayOffset >= todayOffset)
    .map(({ day, dayOffset }) => buildSession(day, dayOffset, plan.weekStart, ctx, rng));

  return {
    ...plan,
    revision: plan.revision + 1,
    equipmentProfile: ctx.equipment,
    sessions: [...doneSessions, ...future],
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
