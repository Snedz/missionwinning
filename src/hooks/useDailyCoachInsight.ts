'use client';
/**
 * Fetch daily coach insight from API or rules fallback.
 * Consumers: CoachInsightCard, Today | See: src/lib/coachDailyServer.ts
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CoachInsight } from '@/lib/score';
import type { DailyCoachContext } from '@/lib/coachDailyServer';

type CoachDisplay = {
  message: string;
  actionLabel: string;
  actionPath: string;
  source: 'llm' | 'rules' | 'local';
  loading: boolean;
};

function cacheKey() {
  return `mw_coach_${new Date().toISOString().split('T')[0]}`;
}

export function useDailyCoachInsight(
  context: Omit<DailyCoachContext, 'fallback'> | null,
  fallback: CoachInsight
): CoachDisplay {
  const { t } = useTranslation();
  const [state, setState] = useState<CoachDisplay>(() => ({
    message: '',
    actionLabel: t(fallback.actionLabelKey, { defaultValue: fallback.actionLabelKey }),
    actionPath: fallback.actionPath,
    source: 'local',
    loading: true,
  }));

  useEffect(() => {
    if (!context) return;

    const params = { ...(fallback.messageParams ?? {}) };
    const localMessage = t(fallback.messageKey, {
      ...params,
      defaultValue: fallback.messageKey,
    });
    const localLabel = t(fallback.actionLabelKey, {
      defaultValue: fallback.actionLabelKey,
    });

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
        const res = await fetch('/api/coach/daily-insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...context, fallback }),
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
            : {
                message: t(data.messageKey ?? fallback.messageKey, {
                  ...params,
                  defaultValue: localMessage,
                }),
                actionLabel: t(data.actionLabelKey ?? fallback.actionLabelKey, {
                  defaultValue: localLabel,
                }),
                actionPath: data.actionPath ?? fallback.actionPath,
                source: 'rules',
                loading: false,
              };

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
  }, [
    context?.readiness,
    context?.strain,
    context?.recovery,
    context?.missionScore,
    context?.streak,
    context?.focusGroup,
    context?.pillars.moveFlows,
    context?.pillars.mindSessions,
    context?.pillars.proteinDays,
    context?.pillars.trainDays,
    fallback.messageKey,
    fallback.actionLabelKey,
    fallback.actionPath,
    t,
  ]);

  return state;
}
