'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';
import { usePremium } from '@/hooks/usePremium';
import { supabase } from '@/lib/supabase';
import { track } from '@/lib/analytics';
import { currentWeekStart } from '@/lib/coach/splitPlanner';
import { readLocalFuelContext } from '@/lib/fuelCoach/contextBuilder';
import { generateFuelPlan, regenerateFuelPlan } from '@/lib/fuelCoach/planEngine';
import { recipesFromCatalog } from '@/lib/fuelCoach/mealSelector';
import {
  getOrCreateDeviceId,
  loadFuelPlan,
  saveFuelPlan,
} from '@/lib/fuelCoach/storage';
import { mergeAndSaveFuelPlan, pullFuelPlanFromCloud, scheduleFuelPlanPush } from '@/lib/fuelCoach/fuelSync';
import { fetchPremiumCatalogJson } from '@/lib/premiumCatalogCache';
import { FREE_RECIPES } from '@/data/recipes/freeRecipes';
import type { FuelPlan } from '@/lib/fuelCoach/types';
import type { Recipe } from '@/data/recipes/types';

export function useFuelPlan() {
  const history = useWorkoutStore((s) => s.workoutHistory);
  const { premium, loading: premiumLoading } = usePremium();
  const [plan, setPlan] = useState<FuelPlan | null>(() =>
    typeof window !== 'undefined' ? loadFuelPlan() : null
  );
  const [loading, setLoading] = useState(() =>
    typeof window !== 'undefined' ? !loadFuelPlan() : true
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [premiumRecipes, setPremiumRecipes] = useState<Recipe[]>([]);

  const weekStart = currentWeekStart();

  const ctx = useMemo(() => {
    const base = readLocalFuelContext(history);
    return { ...base, seedId: userId ?? base.seedId ?? getOrCreateDeviceId() };
  }, [history, userId]);

  const recipeCatalog = useMemo(() => {
    const merged = premium ? [...FREE_RECIPES, ...premiumRecipes] : FREE_RECIPES;
    return recipesFromCatalog(merged);
  }, [premium, premiumRecipes]);

  useEffect(() => {
    if (!premium) {
      setPremiumRecipes([]);
      return;
    }
    fetchPremiumCatalogJson<{ recipes?: Recipe[] }>('/api/premium/recipes')
      .then((d) => setPremiumRecipes(d.recipes ?? []))
      .catch(() => setPremiumRecipes([]));
  }, [premium]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const refresh = useCallback(() => {
    let existing = loadFuelPlan();
    if (userId) {
      const remote = pullFuelPlanFromCloud(userId);
      existing = mergeAndSaveFuelPlan(existing, remote);
    }
    if (existing && existing.weekStart !== weekStart && premium) {
      existing = null;
    }
    setPlan(existing);
    setLoading(false);
  }, [userId, weekStart, premium]);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('mw-fuel-plan-changed', onChange);
    return () => window.removeEventListener('mw-fuel-plan-changed', onChange);
  }, [refresh]);

  const generate = useCallback(() => {
    if (!premium || recipeCatalog.length < 4) return null;
    const next = generateFuelPlan(ctx, recipeCatalog, weekStart, 1);
    saveFuelPlan(next);
    setPlan(next);
    track('fuel_plan_generated', { goal: ctx.goal, days: next.days.length });
    scheduleFuelPlanPush();
    return next;
  }, [premium, recipeCatalog, ctx, weekStart]);

  const regenerate = useCallback(() => {
    if (!premium || !plan || recipeCatalog.length < 4) return null;
    const next = regenerateFuelPlan(plan, ctx, recipeCatalog);
    saveFuelPlan(next);
    setPlan(next);
    track('fuel_plan_regenerated', { revision: next.revision });
    scheduleFuelPlanPush();
    return next;
  }, [premium, plan, ctx, recipeCatalog]);

  return {
    plan,
    loading: plan ? false : loading || premiumLoading,
    premium,
    generate,
    regenerate,
    weekStart,
    baseTargets: ctx.baseTargets,
  };
}
