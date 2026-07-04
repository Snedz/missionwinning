'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';
import { usePremium } from '@/hooks/usePremium';
import { supabase } from '@/lib/supabase';
import { track } from '@/lib/analytics';
import { readLocalCoachContext } from '@/lib/coach/contextBuilder';
import { generateWeek } from '@/lib/coach/planEngine';
import { adaptPlan, adaptForEquipmentChange } from '@/lib/coach/adapt';
import { currentWeekStart, todayDayOffset } from '@/lib/coach/splitPlanner';
import {
  loadPlan,
  savePlan,
  isTasterUsed,
  markTasterUsed,
  getOrCreateDeviceId,
} from '@/lib/coach/storage';
import type { CoachPlan } from '@/lib/coach/types';
import { scheduleCoachPush } from '@/lib/coachSync';

export function useCoachPlan() {
  const history = useWorkoutStore((s) => s.workoutHistory);
  const { premium, loading: premiumLoading } = usePremium();
  const [plan, setPlan] = useState<CoachPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const weekStart = currentWeekStart();
  const todayOffset = todayDayOffset(weekStart);
  const tasterUsed = isTasterUsed();

  const ctx = useMemo(() => {
    const base = readLocalCoachContext(history);
    return { ...base, seedId: userId ?? base.seedId ?? getOrCreateDeviceId() };
  }, [history, userId]);

  const locked =
    !premium && tasterUsed && (!plan || plan.weekStart !== weekStart);

  const refresh = useCallback(() => {
    let existing = loadPlan();

    if (!existing) {
      if (!tasterUsed || premium) {
        existing = generateWeek(ctx, weekStart, 1);
        if (!tasterUsed) markTasterUsed();
        savePlan(existing);
        scheduleCoachPush();
        track('coach_week_generated', { weekStart, premium: !!premium, auto: true });
        if (premium) track('coach_premium_active', { weekStart });
      }
      setPlan(existing);
      return;
    }

    if (existing.weekStart !== weekStart) {
      if (!premium && tasterUsed) {
        setPlan(existing);
        return;
      }
      const next = generateWeek(ctx, weekStart, existing.revision + 1);
      savePlan(next);
      scheduleCoachPush();
      track('coach_week_generated', { weekStart, premium: !!premium, rollover: true });
      setPlan(next);
      return;
    }

    let next = adaptPlan(existing, ctx, weekStart);
    next = adaptForEquipmentChange(next, ctx, todayOffset);
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
    if (!premium && tasterUsed && plan?.weekStart === weekStart) {
      track('coach_taster_locked');
      return null;
    }
    if (!premium && tasterUsed) {
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

  return {
    plan: plan?.weekStart === weekStart ? plan : locked ? plan : null,
    loading: loading || premiumLoading,
    premium,
    tasterUsed,
    locked,
    todaySession,
    todayOffset,
    weekStart,
    ctx,
    generate,
    refresh,
  };
}
