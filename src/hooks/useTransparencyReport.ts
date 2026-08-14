'use client';

import { useEffect, useMemo, useState } from 'react';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';
import { isClientPrivateGateEnabled } from '@/lib/privateGateNavigate';
import { isFreeBeta } from '@/lib/freeBeta';
import { getStripeCheckoutUrl, isCheckoutSessionsEnabled } from '@/lib/payments';
import { fetchTerritoryAccess, type TerritoryAccessClient } from '@/lib/legal/territoryAccessClient';
import { loadPlan } from '@/lib/coach/storage';
import { buildWeekRationale } from '@/lib/coach/weekRationale';
import { useWorkoutStore } from '@/store/workoutStore';
import { buildTransparencyReport } from '@/lib/transparency/report';
import type { TransparencyReport } from '@/lib/transparency/types';

export function useTransparencyReport(): TransparencyReport {
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const [territory, setTerritory] = useState<TerritoryAccessClient | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchTerritoryAccess().then((next) => {
      if (!cancelled) setTerritory(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => {
    const plan = loadPlan();
    const rationale = plan
      ? buildWeekRationale(plan, { loggedWorkoutCount: workoutHistory.length })
      : null;
    return buildTransparencyReport({
      buildLabel: APP_BUILD_LABEL,
      privateGateEnabled: isClientPrivateGateEnabled(),
      freeBeta: isFreeBeta(),
      stripeCheckoutEnabled: isCheckoutSessionsEnabled() || Boolean(getStripeCheckoutUrl()),
      territory: {
        blocked: Boolean(territory?.blocked),
        reason: territory?.reason ?? null,
        message: territory?.message ?? null,
        country: territory?.country ?? null,
      },
      coach: {
        hasPlan: Boolean(plan),
        rationaleCompact: rationale?.compactDefault ?? null,
        rationaleInput: rationale?.inputDefault ?? null,
        rationaleRule: rationale?.ruleDefault ?? null,
        rationaleEffect: rationale?.effectDefault ?? null,
      },
    });
  }, [territory, workoutHistory.length]);
}
