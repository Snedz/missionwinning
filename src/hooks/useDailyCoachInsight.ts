'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CoachInsight } from '@/lib/score';
import type { DailyCoachContext } from '@/lib/coachDailyServer';
import { offlineCoachFromContext, shouldSkipCloudCoach } from '@/lib/offlineCoach';
import { isLowImpactGated } from '@/lib/pathfinderAssessment';

type CoachDisplay = {
  message: string;
  actionLabel: string;
  actionPath: string;
  source: 'llm' | 'rules' | 'local' | 'offline';
  loading: boolean;
};

function cacheKey() {
  return `mw_coach_${new Date().toISOString().split('T')[0]}`;
}

function translateInsight(t: (key: string, opts?: Record<string, unknown>) => string, insight: CoachInsight): Pick<CoachDisplay, 'message' | 'actionLabel' | 'actionPath'> {
  const params = insight.messageParams ?? {};
  return {
    message: t(insight.messageKey, {
      ...params,
      defaultValue: insight.messageKey,
    }),
    actionLabel: t(insight.actionLabelKey, { defaultValue: insight.actionLabelKey }),
    actionPath: insight.actionPath,
  };
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

    const local = translateInsight(t, fallback);

    const applyOffline = () => {
      const insight = offlineCoachFromContext(context, fallback, {
        programGate: isLowImpactGated() ? 'low-impact-only' : 'standard',
      });
      const translated = translateInsight(t, insight);
      return {
        ...translated,
        source: 'offline' as const,
        loading: false,
      };
    };

    if (shouldSkipCloudCoach()) {
      const next = applyOffline();
      setState(next);
      sessionStorage.setItem(cacheKey(), JSON.stringify(next));
      return;
    }

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
                actionLabel: data.actionLabel ?? local.actionLabel,
                actionPath: data.actionPath ?? fallback.actionPath,
                source: 'llm',
                loading: false,
              }
            : {
                ...translateInsight(t, {
                  messageKey: data.messageKey ?? fallback.messageKey,
                  messageParams: fallback.messageParams,
                  actionLabelKey: data.actionLabelKey ?? fallback.actionLabelKey,
                  actionPath: data.actionPath ?? fallback.actionPath,
                }),
                source: 'rules',
                loading: false,
              };

        setState(next);
        sessionStorage.setItem(cacheKey(), JSON.stringify(next));
      } catch {
        if (cancelled) return;
        const next = applyOffline();
        setState(next);
        sessionStorage.setItem(cacheKey(), JSON.stringify(next));
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
