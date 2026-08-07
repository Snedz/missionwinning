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
import { useIsCompact } from '@/hooks/useIsCompact';
import {
  resolveJustGoHeroCopy,
  type JustGoHeroMeta,
} from '@/lib/justGoHeroMeta';

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
        <a href="/leaderboard" className="text-muted-foreground hover:text-foreground hover:underline min-h-[44px] inline-flex items-center tap-target">
          {t('todayRankings', { defaultValue: 'Rankings' })}
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
  /**
   * Primary train CTA meta. When `source` is `coach`, copy must not say
   * "Just Go" — the tap loads today's prescribed session.
   */
  justGoMeta?: JustGoHeroMeta | null;
  /** `workoutHistory.length` — week-1 second-session CTA when exactly 1 (`.291`). */
  completedSessions?: number;
}

export function JourneyHero({
  action,
  onPrimaryClick,
  activeWorkout,
  justGoMeta,
  completedSessions,
}: JourneyHeroProps) {
  const { t } = useTranslation();
  const isCompact = useIsCompact();
  const useTrainCta = !activeWorkout && !!justGoMeta;
  const heroCopy = justGoMeta
    ? resolveJustGoHeroCopy(justGoMeta, { completedSessions })
    : null;

  const label = activeWorkout
    ? t('resumeWorkout', { defaultValue: 'Resume workout' })
    : useTrainCta && heroCopy
      ? t(heroCopy.labelKey, { defaultValue: heroCopy.defaultLabel })
      : action.label;

  const kicker =
    useTrainCta && heroCopy
      ? t(heroCopy.kickerKey, { defaultValue: heroCopy.defaultKicker })
      : t('yourNextStep', { defaultValue: 'Your next step' });

  const title =
    useTrainCta && heroCopy
      ? t(heroCopy.titleKey, {
          ...(heroCopy.titleParams ?? {}),
          defaultValue: heroCopy.defaultTitle,
        })
      : label;

  const description =
    useTrainCta && heroCopy
      ? t(heroCopy.descKey, {
          ...(heroCopy.descParams ?? {}),
          defaultValue: heroCopy.defaultDesc,
        })
      : action.description;

  /*
   * Desktop keeps the form handoff 2 drew: a full block in the content flow,
   * with the title and the whole description, and an action sized to its own
   * label rather than the column. The dock below is a mobile decision — it
   * exists because 844px of phone cannot spend five lines restating the button
   * under them, which is not a constraint a 1440px window has.
   */
  if (!isCompact) {
    return (
      <div className="poster-field p-7 space-y-4">
        <div>
          <p className="poster-kicker mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em]">
            {kicker}
          </p>
          <h3 className="font-display text-[1.6rem] font-extrabold leading-[1.05] md:text-[1.9rem]">
            {title}
          </h3>
          <p className="poster-sub mt-1.5 text-sm leading-relaxed tabular-nums">{description}</p>
        </div>
        {/* `w-auto` beats `.primary-action`'s `w-full` — utilities layer after
            components. The handoff's `.btn` is `inline-flex`, i.e. sized to its
            own label; a button stretched across 832px reads as a banner. */}
        <button type="button" onClick={onPrimaryClick} className="primary-action w-auto">
          {label}
          <ChevronRight className="h-5 w-5" />
        </button>
        {action.phase === 'basic' && !useTrainCta && (
          <p className="poster-sub text-sm leading-relaxed">
            {t('journeyBasicFoot', {
              defaultValue:
                'One step at a time. Log a few sets — Coach can shape the week from real history.',
            })}
          </p>
        )}
      </div>
    );
  }

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
        {kicker}
      </p>
      {/* One line, clamped. The description is why this action and not another,
          which is worth keeping; the full paragraph is not worth the fold. */}
      <p className="poster-sub mb-2.5 line-clamp-1 text-sm leading-relaxed tabular-nums">
        {description}
      </p>
      <button
        type="button"
        onClick={onPrimaryClick}
        className="primary-action min-h-[52px] w-full text-[19px]"
      >
        <span className="flex-1 text-start">{title}</span>
        <ChevronRight className="ms-auto h-5 w-5 shrink-0" />
      </button>
    </div>
  );
}
