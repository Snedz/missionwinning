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
    <div className="space-y-2 border-t-2 border-border pt-3">
      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.08em]">
        <span className="text-muted-foreground" suppressHydrationWarning>
          {mounted ? getPhaseLabel(action.phase) : '\u00a0'}
        </span>
        <span className="text-end text-muted-foreground" suppressHydrationWarning>
          {mounted ? action.stepLabel : '\u00a0'}
        </span>
      </div>
      {/* Square meter on a neutral track \u2014 same bar the rest of the system uses.
          Not a MeterBar: this one is decorative alongside the labels above it,
          and MeterBar announces itself as a progressbar. */}
      <div className="h-1.5 overflow-hidden bg-neutral-300">
        <div
          className="h-full bg-primary-fill transition-all duration-500"
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
    // Today's boss panel, and the one red field this screen gets. It was a grey
    // surface card; the handoff makes the next action the loudest thing on the
    // page. The nested .primary-action inverts to paper (see .poster-field in
    // index.css), so the count first-90 asserts on /log is unchanged — one
    // primary action, just no longer red-on-grey.
    <div className="poster-field p-7 space-y-4">
      <div>
        <p className="poster-kicker mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em]">
          {useJustGo
            ? t('justGoEyebrow', { defaultValue: 'Ready to train' })
            : t('yourNextStep', { defaultValue: 'Your next step' })}
        </p>
        <h3 className="font-display text-[1.6rem] font-extrabold leading-[1.05] md:text-[1.9rem]">
          {useJustGo
            ? t('justGoTitle', {
                focus: justGoMeta!.focusLabel,
                defaultValue: `${justGoMeta!.focusLabel} — Just Go`,
              })
            : label}
        </h3>
        <p className="poster-sub mt-1.5 text-sm leading-relaxed tabular-nums">
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
        <p className="poster-sub text-sm leading-relaxed">
          {t('journeyBasicFoot', {
            defaultValue: 'One step at a time. Log a few sets — Coach can shape the week from real history.',
          })}
        </p>
      )}
    </div>
  );
}
