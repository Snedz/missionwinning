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
    /*
     * Today's one red field, and now a dock rather than a block in the scroll.
     *
     * It was a `p-7` panel carrying a kicker, a 1.6rem title, a description and
     * sometimes a foot note — five lines of the fold spent restating what the
     * button underneath already said, and it scrolled away. Docked, the button
     * label *is* the title: everything above it in the scroll region is
     * read-only status, and the one thing you can do stays under your thumb.
     *
     * The nested `.primary-action` inverts to paper (see `.poster-field` in
     * index.css), so the count `first-90` asserts on /log is unchanged — one
     * primary action.
     */
    <div className="poster-field px-4 pb-4 pt-3.5">
      <p className="poster-kicker mb-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
        {useJustGo
          ? t('justGoEyebrow', { defaultValue: 'Ready to train' })
          : t('yourNextStep', { defaultValue: 'Your next step' })}
      </p>
      {/* One line, clamped. The description is why this action and not another,
          which is worth keeping; the full paragraph is not worth the fold. */}
      <p className="poster-sub mb-2.5 line-clamp-1 text-sm leading-relaxed tabular-nums">
        {useJustGo
          ? t('justGoDesc', {
              focus: justGoMeta!.focusLabel,
              defaultValue: `One tap builds today’s ${justGoMeta!.focusLabel.toLowerCase()} session from how fresh you are and what you lifted last time.`,
            })
          : action.description}
      </p>
      <button
        type="button"
        onClick={onPrimaryClick}
        className="primary-action min-h-[52px] w-full text-[19px]"
      >
        <span className="flex-1 text-start">
          {useJustGo
            ? t('justGoTitle', {
                focus: justGoMeta!.focusLabel,
                defaultValue: `${justGoMeta!.focusLabel} — Just Go`,
              })
            : label}
        </span>
        <ChevronRight className="ms-auto h-5 w-5 shrink-0" />
      </button>
    </div>
  );
}
