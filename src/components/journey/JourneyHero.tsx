'use client';
/**
 * Journey phase hero on Today.
 * See: src/components/journey/INDEX.md
 */

import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { JourneyAction } from '@/lib/missionJourney';
import { getPhaseLabel } from '@/lib/missionJourney';

export function JourneyStrip({ action }: { action: JourneyAction }) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (action.phase === 'commissioned') {
    return (
      <div className="flex items-center justify-between text-xs text-muted-foreground py-2">
        <span className="text-emerald-400 font-medium">{action.stepLabel}</span>
        <a href="/leaderboard" className="text-emerald-400/80 hover:text-emerald-400 hover:underline">
          {t('todayRankings', { defaultValue: 'Rankings' })} →
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-muted/30 p-4 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-emerald-400 uppercase tracking-wide">
          {getPhaseLabel(action.phase)}
        </span>
        <span className="text-muted-foreground">{action.stepLabel}</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
          style={{ width: mounted ? `${action.progressPct}%` : '0%' }}
          suppressHydrationWarning
        />
      </div>
    </div>
  );
}

interface JourneyHeroProps {
  action: JourneyAction;
  onPrimaryClick: () => void;
  activeWorkout?: boolean;
  /** Forge-style Just Go meta — muscle focus under CTA (not a second button). */
  justGoMeta?: { focusLabel: string } | null;
}

export function JourneyHero({
  action,
  onPrimaryClick,
  activeWorkout,
  justGoMeta,
}: JourneyHeroProps) {
  const { t } = useTranslation();
  const useJustGo = !activeWorkout && !!justGoMeta;
  const label = activeWorkout
    ? t('resumeWorkout', { defaultValue: 'Resume workout' })
    : useJustGo
      ? t('justGoCta', { defaultValue: 'Just Go' })
      : action.label;

  return (
    <div className="content-card p-6 space-y-4">
      <div>
        <p className="eyebrow-live mb-2">
          {useJustGo
            ? t('justGoEyebrow', { defaultValue: 'Ready to train' })
            : t('yourNextStep', { defaultValue: 'Your next step' })}
        </p>
        <h3 className="display-section text-[1.35rem] md:text-[1.6rem] normal-case tracking-normal">
          {useJustGo
            ? t('justGoTitle', {
                focus: justGoMeta!.focusLabel,
                defaultValue: `${justGoMeta!.focusLabel} — Just Go`,
              })
            : label}
        </h3>
        <p className="text-base text-muted-foreground mt-2 leading-relaxed">
          {useJustGo
            ? t('justGoDesc', {
                focus: justGoMeta!.focusLabel,
                defaultValue: `One tap builds today’s ${justGoMeta!.focusLabel.toLowerCase()} session from your readiness and last lifts — no AI key.`,
              })
            : action.description}
        </p>
      </div>
      <button type="button" onClick={onPrimaryClick} className="primary-action">
        {label}
        <ChevronRight className="h-5 w-5" />
      </button>
      {action.phase === 'basic' && !useJustGo && (
        <p className="text-xs text-center text-muted-foreground">
          {t('journeyBasicFoot', { defaultValue: 'One step at a time. More tools unlock as you progress.' })}
        </p>
      )}
    </div>
  );
}
