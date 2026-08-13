'use client';
/**
 * Mission Coach weekly plan state — generate, adapt, persist.
 * Consumers: CoachPage | See: src/lib/coach/INDEX.md
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';
import { usePremium } from '@/hooks/usePremium';
import { supabase } from '@/lib/supabase';
import { track } from '@/lib/analytics';
import { readLocalCoachContext } from '@/lib/coach/contextBuilder';
import { generateWeek } from '@/lib/coach/planEngine';
import { adaptPlan, adaptForEquipmentChange, regenerateFutureSessions } from '@/lib/coach/adapt';
import { currentWeekStart, todayDayOffset } from '@/lib/coach/splitPlanner';
import { localDateKey } from '@/lib/time/localDate';
import {
  loadPlan,
  savePlan,
  isTasterUsed,
  markTasterUsed,
  getOrCreateDeviceId,
} from '@/lib/coach/storage';
import type { CoachPlan } from '@/lib/coach/types';
import { adjustTodaySession, type SessionConstraint } from '@/lib/coach/adjust';
import { swapExerciseInPlan } from '@/lib/workout/garageSwap';
import { scheduleCoachPush } from '@/lib/coachSync';

export function useCoachPlan() {
  const history = useWorkoutStore((s) => s.workoutHistory);
  const { premium, loading: premiumLoading } = usePremium();
  const [plan, setPlan] = useState<CoachPlan | null>(() =>
    typeof window !== 'undefined' ? loadPlan() : null
  );
  const [loading, setLoading] = useState(() =>
    typeof window !== 'undefined' ? !loadPlan() : true
  );
  const [userId, setUserId] = useState<string | null>(null);

  const weekStart = currentWeekStart();
  const todayOffset = todayDayOffset(weekStart);
  const tasterUsed = isTasterUsed();

  const ctx = useMemo(() => {
    const base = readLocalCoachContext(history);
    return { ...base, seedId: userId ?? base.seedId ?? getOrCreateDeviceId() };
  }, [history, userId]);

  // Horizon W: never lock the whole Coach week behind Bundle. Free weekly plan + adapt;
  // same-week on-demand regen stays premium (see generate()).
  const locked = false;

  const refresh = useCallback(() => {
    let existing = loadPlan();

    if (!existing) {
      existing = generateWeek(ctx, weekStart, 1);
      if (!tasterUsed) markTasterUsed();
      savePlan(existing);
      scheduleCoachPush();
      track('coach_week_generated', { weekStart, premium: !!premium, auto: true });
      if (premium) track('coach_premium_active', { weekStart });
      setPlan(existing);
      return;
    }

    if (existing.weekStart !== weekStart) {
      const next = generateWeek(ctx, weekStart, existing.revision + 1);
      if (!tasterUsed) markTasterUsed();
      savePlan(next);
      scheduleCoachPush();
      track('coach_week_generated', { weekStart, premium: !!premium, rollover: true });
      setPlan(next);
      return;
    }

    /*
     * `.207` — a real today, not the start of the week.
     *
     * This passed `weekStart`, so `adaptPlan`'s `todayDayOffset(weekStart, today)`
     * was always 0 and the coach believed every day was Monday. Two live
     * consequences: `dayOffset < todayOffset` never matched, so **missed
     * sessions were never marked missed** and the "life happened, days
     * re-spread" adaptation could not fire from the automatic path at all; and
     * the low-readiness recovery swap targets `dayOffset === todayOffset`, so on
     * a Thursday with readiness 30 it swapped **Monday's** session and left
     * Thursday's heavy squat day standing.
     *
     * `todayOffset` above was already derived from the real clock and used three
     * lines down — the date was in scope the whole time.
     */
    let next = adaptPlan(existing, ctx, localDateKey());
    next = adaptForEquipmentChange(next, ctx, todayOffset);

    if (premium && ctx.bodyScores.strain >= 70 && todayOffset < 6) {
      const regen = regenerateFutureSessions(next, ctx, todayOffset);
      if (regen.revision !== next.revision) {
        next = regen;
        track('coach_plan_regenerated_fatigue', { strain: ctx.bodyScores.strain });
      }
    }

    if (next.revision !== existing.revision) {
      track('coach_plan_adapted', { revision: next.revision });
      savePlan(next);
      scheduleCoachPush();
    }
    setPlan(next);
  }, [ctx, weekStart, premium, tasterUsed, todayOffset]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh();
    setLoading(false);

    const onChange = () => refresh();
    window.addEventListener('mw-coach-plan-changed', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('mw-coach-plan-changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, [refresh]);

  const generate = useCallback(() => {
    // Free: first plan for this week anytime. Same-week regen = Bundle.
    if (!premium && plan?.weekStart === weekStart) {
      track('coach_taster_locked');
      return null;
    }
    const next = generateWeek(ctx, weekStart, (plan?.revision ?? 0) + 1);
    if (!tasterUsed) markTasterUsed();
    savePlan(next);
    scheduleCoachPush();
    setPlan(next);
    track('coach_week_generated', { weekStart, premium: !!premium, manual: true });
    return next;
  }, [ctx, weekStart, plan, premium, tasterUsed]);

  const todaySession =
    plan?.weekStart === weekStart
      ? (plan.sessions.find((s) => s.dayOffset === todayOffset) ?? null)
      : null;

  /** Free offline adjust — no premium/taster gate. */
  const adjustToday = useCallback(
    (constraint: SessionConstraint): CoachPlan | null => {
      if (!plan || plan.weekStart !== weekStart) return null;
      const next = adjustTodaySession(plan, ctx, todayOffset, constraint);
      if (!next) return null;
      savePlan(next);
      scheduleCoachPush();
      setPlan(next);
      const props: Record<string, string | number | boolean> = { type: constraint.type };
      if (constraint.type === 'time') props.minutes = constraint.minutes;
      if (constraint.type === 'equipment') props.equipment = constraint.equipment;
      if (constraint.type === 'avoid') props.group = constraint.group;
      if (constraint.type === 'readiness') props.why = 'readiness_volume_trim';
      track('coach_session_adjusted', props);
      return next;
    },
    [plan, weekStart, ctx, todayOffset]
  );

  /** Free offline garage swap on one plan line — does not regenerate the week. */
  const swapSessionExercise = useCallback(
    (sessionId: string, fromExerciseId: string, toExerciseId: string): CoachPlan | null => {
      if (!plan || plan.weekStart !== weekStart) return null;
      const next = swapExerciseInPlan(plan, sessionId, fromExerciseId, toExerciseId);
      if (!next) return null;
      savePlan(next);
      scheduleCoachPush();
      setPlan(next);
      track('coach_exercise_swapped', { sessionId, from: fromExerciseId, to: toExerciseId });
      return next;
    },
    [plan, weekStart]
  );

  return {
    plan: plan?.weekStart === weekStart ? plan : locked ? plan : null,
    loading: plan ? false : loading || premiumLoading,
    premium,
    tasterUsed,
    locked,
    todaySession,
    todayOffset,
    weekStart,
    ctx,
    generate,
    refresh,
    adjustToday,
    swapSessionExercise,
  };
}
