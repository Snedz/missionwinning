'use client';
/**
 * Fetch daily coach insight from API or rules fallback.
 * Consumers: CoachInsightCard, Today | See: src/lib/coachDailyServer.ts
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CoachInsight } from '@/lib/score';
import type { DailyCoachContext } from '@/lib/coachDailyServer';
import { localDateKey } from '@/lib/time/localDate';
import {
  focusFromInsightParams,
  translateCoachActionLabel,
  translateCoachInsightLine,
} from '@/lib/readinessDisplay';

type CoachDisplay = {
  message: string;
  actionLabel: string;
  actionPath: string;
  source: 'llm' | 'rules' | 'local';
  loading: boolean;
};

function cacheKey() {
  return `mw_coach_${localDateKey()}`;
}

function localInsightCopy(fallback: CoachInsight, t: (k: string, o?: Record<string, unknown>) => string) {
  const focus = focusFromInsightParams(fallback.messageParams);
  return {
    message: translateCoachInsightLine(fallback, focus, t),
    actionLabel: translateCoachActionLabel(fallback.actionLabelKey, t),
  };
}

export function useDailyCoachInsight(
  context: Omit<DailyCoachContext, 'fallback'> | null,
  fallback: CoachInsight
): CoachDisplay {
  const { t } = useTranslation();
  const [state, setState] = useState<CoachDisplay>(() => {
    const local = localInsightCopy(fallback, t);
    return {
      message: local.message,
      actionLabel: local.actionLabel,
      actionPath: fallback.actionPath,
      source: 'local',
      loading: true,
    };
  });

  useEffect(() => {
    if (!context) return;

    const params = { ...(fallback.messageParams ?? {}) };
    const { message: localMessage, actionLabel: localLabel } = localInsightCopy(fallback, t);

    const cached = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey()) : null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as CoachDisplay;
        setState({ ...parsed, loading: false });
        return;
      } catch {
        sessionStorage.removeItem(cacheKey());
      }
    }

    let cancelled = false;

    (async () => {
      try {
        // deviceId = metering identity for anonymous athletes (counts, never
        // content) — same contract as anonymous push. See llm/metering.ts.
        const { getOrCreateDeviceId } = await import('@/lib/coach/storage');
        const res = await fetch('/api/coach/daily-insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...context, fallback, deviceId: getOrCreateDeviceId() }),
        });
        if (!res.ok) throw new Error('coach_failed');
        const data = (await res.json()) as {
          source: 'llm' | 'rules';
          message?: string;
          actionLabel?: string;
          actionPath?: string;
          messageKey?: string;
          actionLabelKey?: string;
        };
        if (cancelled) return;

        const next: CoachDisplay =
          data.source === 'llm' && data.message
            ? {
                message: data.message,
                actionLabel: data.actionLabel ?? localLabel,
                actionPath: data.actionPath ?? fallback.actionPath,
                source: 'llm',
                loading: false,
              }
            : (() => {
                const key = data.messageKey ?? fallback.messageKey;
                const actionKey = data.actionLabelKey ?? fallback.actionLabelKey;
                const resolved = localInsightCopy(
                  {
                    messageKey: key,
                    messageParams: params,
                    actionLabelKey: actionKey,
                    actionPath: data.actionPath ?? fallback.actionPath,
                  },
                  t
                );
                return {
                  message: resolved.message || localMessage,
                  actionLabel: resolved.actionLabel || localLabel,
                  actionPath: data.actionPath ?? fallback.actionPath,
                  source: 'rules' as const,
                  loading: false,
                };
              })();

        setState(next);
        sessionStorage.setItem(cacheKey(), JSON.stringify(next));
      } catch {
        if (cancelled) return;
        setState({
          message: localMessage,
          actionLabel: localLabel,
          actionPath: fallback.actionPath,
          source: 'local',
          loading: false,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [context, fallback, t]);

  return state;
}
