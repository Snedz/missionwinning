'use client';

/**
 * The one place Today reads the day from the device.
 *
 * Storage is not a React input — a quick-log write does not invalidate a memo —
 * so the read is held in state with an explicit `refresh()` rather than
 * pretending `loadCheckIns()` is pure. That is the same shape
 * `TodayDayReviewCard` already used for its own read; this hoists it so every
 * card shares one result instead of five.
 *
 * `buildWeeklyDebrief` is imported **dynamically and only on Sunday or Monday**.
 * It was a static import on the Today path, so a Tuesday downloaded and ran the
 * whole weekly-debrief module to be told it was not the weekend.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';
import { loadCheckIns, type MindCheckIn } from '@/lib/mindCheckIns';
import { loadBodyMetrics, type BodyMetricEntry } from '@/lib/bodyMetrics';
import type { WeeklyDebrief } from '@/lib/weeklyDebrief';
import {
  buildTodayDigest,
  isFullDebriefDay,
  type DebriefBuilder,
  type TodayDigest,
} from '@/lib/today/todayDigest';

type DeviceRead = {
  checkIns: MindCheckIn[];
  bodyMetrics: BodyMetricEntry[];
  now: Date;
};

const EMPTY: DeviceRead | null = null;

export interface UseTodayDigest extends TodayDigest {
  /** Re-read the device. Call after any write a card makes. */
  refresh: () => void;
}

export function useTodayDigest(): UseTodayDigest {
  const history = useWorkoutStore((s) => s.workoutHistory);
  const [device, setDevice] = useState<DeviceRead | null>(EMPTY);
  const [debriefBuilder, setDebriefBuilder] = useState<DebriefBuilder | null>(null);

  const refresh = useCallback(() => {
    if (typeof window === 'undefined') return;
    setDevice({ checkIns: loadCheckIns(), bodyMetrics: loadBodyMetrics(), now: new Date() });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const wantDebrief = device ? isFullDebriefDay(device.now) : false;

  useEffect(() => {
    if (!wantDebrief || debriefBuilder) return;
    let cancelled = false;
    void import('@/lib/weeklyDebrief').then((m) => {
      if (cancelled) return;
      // Wrapped in a thunk: `useState` treats a bare function argument as a
      // lazy initialiser and would call it instead of storing it.
      setDebriefBuilder(() => (args: Parameters<DebriefBuilder>[0]): WeeklyDebrief =>
        m.buildWeeklyDebrief(args)
      );
    });
    return () => {
      cancelled = true;
    };
  }, [wantDebrief, debriefBuilder]);

  const digest = useMemo(
    () =>
      buildTodayDigest({
        history,
        checkIns: device?.checkIns ?? [],
        bodyMetrics: device?.bodyMetrics ?? [],
        now: device?.now ?? new Date(),
        wantDebrief,
        ...(debriefBuilder ? { buildDebrief: debriefBuilder } : {}),
      }),
    [history, device, wantDebrief, debriefBuilder]
  );

  return { ...digest, refresh };
}
