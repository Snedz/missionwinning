'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { MetricsRow } from '@/components/metrics/MetricsRow';
import { ProgressRing } from '@/components/ui/ProgressRing';
import type { BodyScores } from '@/lib/score';
import { animateCount, prefersReducedMotion } from '@/lib/motion';
import { toast } from '@/hooks/use-toast';
import { Check } from 'lucide-react';

const BASE_SCORES: BodyScores = {
  readiness: 72,
  strain: 30,
  recovery: 80,
  readinessLabelKey: 'todayBodyTrainSmart',
  strainLabelKey: 'todayBodyLightWeek',
  recoveryLabelKey: 'todayBodyRebuilding',
};

const SET_LABELS = ['Set 1 · Squat', 'Set 2 · Squat', 'Set 3 · Squat'];

type Props = {
  /** SSR fallback when JS is off */
  staticFallback?: React.ReactNode;
};

export function HeroDemo({ staticFallback }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loggedSets, setLoggedSets] = useState(0);
  const [winScore, setWinScore] = useState(68);
  const [scores, setScores] = useState(BASE_SCORES);

  useEffect(() => {
    const run = () => setMounted(true);
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(run);
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(run, 100);
    return () => clearTimeout(t);
  }, []);

  const logSet = useCallback(() => {
    if (loggedSets >= 3) return;
    const next = loggedSets + 1;
    setLoggedSets(next);
    const targetScore = 68 + next * 2;
    animateCount(winScore, targetScore, 300, setWinScore);
    setScores((s) => ({
      ...s,
      strain: Math.min(100, s.strain + 8),
      readiness: Math.min(100, s.readiness + 3),
    }));
    if (next === 3) {
      toast({
        title: t('heroDemoPr', { defaultValue: 'New PR logged' }),
        description: t('heroDemoPrDesc', {
          defaultValue: "That's the loop. Yours is free.",
        }),
      });
    }
  }, [loggedSets, winScore, t]);

  if (!mounted && staticFallback) return <>{staticFallback}</>;

  return (
    <div className="content-card p-6 sm:p-8" role="region" aria-label={t('heroDemoRegion', { defaultValue: 'Interactive workout demo' })}>
      <div className="briefing-rule mb-6">
        <span className="eyebrow">{t('heroDemoToday', { defaultValue: 'Today' })}</span>
      </div>
      <div className="mb-6 flex items-center justify-center">
        <ProgressRing
          label={t('heroDemoWinScore', { defaultValue: 'Win Score' })}
          value={winScore}
          subtitle={t('heroDemoAllPillars', { defaultValue: 'From your logs' })}
          tone="emerald"
          size="lg"
        />
      </div>
      <MetricsRow scores={scores} demo embedded />
      <div className="mt-6 space-y-2" aria-live="polite">
        {SET_LABELS.map((label, i) => {
          const done = i < loggedSets;
          return (
            <button
              key={label}
              type="button"
              onClick={logSet}
              disabled={done || loggedSets !== i}
              className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            >
              <span>{label}</span>
              {done ? (
                <Check className="h-4 w-4 text-primary" aria-hidden />
              ) : (
                <span className="text-xs text-muted-foreground">
                  {t('heroDemoTap', { defaultValue: 'Tap to log' })}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {loggedSets >= 3 && (
        <button
          type="button"
          className="mt-6 w-full text-center text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          onClick={() => router.push('/welcome')}
        >
          {t('heroDemoCta', { defaultValue: "That's the loop. Start free →" })}
        </button>
      )}
      {prefersReducedMotion() && loggedSets === 0 && (
        <p className="mt-4 text-xs text-muted-foreground text-center">
          {t('heroDemoStaticHint', { defaultValue: 'Demo preview — scores update as you log sets.' })}
        </p>
      )}
    </div>
  );
}

/** Static card for SSR / no-JS fallback */
export function HeroDemoFallback() {
  const scores: BodyScores = {
    readiness: 82,
    strain: 45,
    recovery: 78,
    readinessLabelKey: 'todayBodyPrimePush',
    strainLabelKey: 'todayBodyModerateLoad',
    recoveryLabelKey: 'todayBodyRebuilding',
  };
  return (
    <div className="content-card p-6 sm:p-8">
      <div className="briefing-rule mb-6">
        <span className="eyebrow">Today</span>
      </div>
      <div className="mb-6 flex items-center justify-center">
        <ProgressRing label="Win Score" value={74} subtitle="From your logs" tone="emerald" size="lg" />
      </div>
      <MetricsRow scores={scores} demo embedded />
    </div>
  );
}
