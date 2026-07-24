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
        <span className="font-medium text-muted-foreground">{action.stepLabel}</span>
        <a href="/leaderboard" className="text-muted-foreground hover:text-foreground hover:underline">
          {t('todayRankings', { defaultValue: 'Rankings' })} →
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/30 bg-muted/20 px-3.5 py-3 space-y-2">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-muted-foreground" suppressHydrationWarning>
          {mounted ? getPhaseLabel(action.phase) : '\u00a0'}
        </span>
        <span className="text-muted-foreground text-end" suppressHydrationWarning>
          {mounted ? action.stepLabel : '\u00a0'}
        </span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary/50 transition-all duration-500 rounded-full"
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
    <div className="rounded-2xl border border-border/40 bg-card/80 p-6 space-y-4 shadow-sm">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground mb-2">
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
                defaultValue: `One tap builds today’s ${justGoMeta!.focusLabel.toLowerCase()} session from how fresh you are and what you lifted last time.`,
              })
            : action.description}
        </p>
      </div>
      <button type="button" onClick={onPrimaryClick} className="primary-action">
        {label}
        <ChevronRight className="h-5 w-5" />
      </button>
      {action.phase === 'basic' && !useJustGo && (
        <p className="text-sm text-center text-muted-foreground leading-relaxed">
          {t('journeyBasicFoot', {
            defaultValue: 'One step at a time. Log a few sets — Coach can shape the week from real history.',
          })}
        </p>
      )}
    </div>
  );
}
