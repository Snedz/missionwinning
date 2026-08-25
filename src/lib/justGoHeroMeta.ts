/**
 * Today hero copy for the primary train CTA.
 *
 * Just Go is freestyle (focus/starter). When Mission Coach has a live session
 * for today, the same tap loads that plan — the label must not say "Just Go".
 * When there is no live Coach day but a last completed session exists, the
 * tap copies that log (`.717`) — the label must say Repeat last session.
 */
import type { CoachSessionLike, JustGoSession } from '@/lib/justGoSession';

export type JustGoHeroSource = JustGoSession['source'] | 'repeat_last' | 'saved';

export type JustGoHeroMeta = {
  focusLabel: string;
  source: JustGoHeroSource;
  /** Coach session name when source === 'coach' */
  sessionName?: string;
};

export type BuildJustGoHeroMetaOpts = {
  hasActiveWorkout: boolean;
  /** Journey says train is the primary next step. */
  trainReady: boolean;
  focusLabel: string;
  /** From peekCoachToday / loadCoachTodayOptional — null when no live plan day. */
  coach: CoachSessionLike | null;
  /** Last completed session name when Repeat Last owns the tap (`.717`). */
  repeatLastName?: string | null;
  /** Saved notebook name when honor owns the tap (`.960`). */
  savedRoutineName?: string | null;
};

/**
 * Build Today train-CTA meta for lean + full shells.
 * Pure: coach peek stays outside so SSR / tests do not touch storage.
 */
export function buildJustGoHeroMeta(opts: BuildJustGoHeroMetaOpts): JustGoHeroMeta | null {
  if (opts.hasActiveWorkout || !opts.trainReady) return null;
  const focusLabel = opts.focusLabel.trim() || 'Training';
  const savedName = opts.savedRoutineName?.trim();
  if (savedName) {
    return {
      focusLabel,
      source: 'saved',
      sessionName: savedName,
    };
  }
  const coach = opts.coach;
  if (coach && coach.exercises.length > 0) {
    return {
      focusLabel,
      source: 'coach',
      sessionName: coach.name,
    };
  }
  const repeatName = opts.repeatLastName?.trim();
  if (repeatName) {
    return {
      focusLabel,
      source: 'repeat_last',
      sessionName: repeatName,
    };
  }
  return { focusLabel, source: 'focus' };
}

export type JustGoHeroCopy = {
  /** i18n key for the button / dock primary label */
  labelKey: string;
  defaultLabel: string;
  kickerKey: string;
  defaultKicker: string;
  titleKey: string;
  defaultTitle: string;
  titleParams?: Record<string, string>;
  descKey: string;
  defaultDesc: string;
  descParams?: Record<string, string>;
};

export type ResolveJustGoHeroCopyOpts = {
  /** `workoutHistory.length` — week-1 second-session CTA when exactly 1 (`.291`). */
  completedSessions?: number;
};

/**
 * Resolve presentation for the Today train CTA.
 * Pure — unit-tested so UI cannot re-lie without a failing test.
 */
export function resolveJustGoHeroCopy(
  meta: JustGoHeroMeta,
  opts?: ResolveJustGoHeroCopyOpts
): JustGoHeroCopy {
  const week1Second = opts?.completedSessions === 1;

  if (meta.source === 'saved') {
    const name = meta.sessionName?.trim() || meta.focusLabel;
    return {
      labelKey: 'todaySavedRoutineCta',
      defaultLabel: 'Start {{name}}',
      kickerKey: 'todaySavedRoutineKicker',
      defaultKicker: 'Your routine',
      titleKey: 'todaySavedRoutineTitle',
      defaultTitle: name,
      titleParams: { name },
      descKey: 'todaySavedRoutineDesc',
      defaultDesc: 'The routine you saved — last loads stay on the set row.',
      descParams: { name },
    };
  }

  if (meta.source === 'repeat_last') {
    const name = meta.sessionName?.trim() || meta.focusLabel;
    return {
      labelKey: 'todayRepeatLastCta',
      defaultLabel: 'Repeat last session',
      kickerKey: 'todayRepeatLastKicker',
      defaultKicker: 'Train',
      titleKey: 'todayRepeatLastTitle',
      defaultTitle: name,
      titleParams: { name },
      descKey: 'todayRepeatLastDesc',
      defaultDesc: 'Same as last time — last loads are ready in the set log.',
      descParams: { name },
    };
  }

  if (meta.source === 'coach') {
    const name = meta.sessionName?.trim() || meta.focusLabel;
    if (week1Second) {
      return {
        labelKey: 'week1SecondSessionCta',
        defaultLabel: 'Start session 2',
        kickerKey: 'week1SecondSessionKicker',
        defaultKicker: 'Week one habit',
        titleKey: 'coachPlanHeroTitle',
        defaultTitle: name,
        titleParams: { name },
        descKey: 'week1SecondSessionCoachDesc',
        defaultDesc:
          'Session two of week one — from the plan that already saw your first log.',
        descParams: { name },
      };
    }
    return {
      labelKey: 'coachStartSession',
      defaultLabel: 'Start this session',
      kickerKey: 'coachPageTitle',
      defaultKicker: 'Mission Coach',
      titleKey: 'coachPlanHeroTitle',
      defaultTitle: name,
      titleParams: { name },
      descKey: 'coachPlanHeroDesc',
      defaultDesc:
        "Today's planned session from Mission Coach — not freestyle Just Go.",
      descParams: { name },
    };
  }

  if (week1Second) {
    return {
      labelKey: 'week1SecondSessionCta',
      defaultLabel: 'Start session 2',
      kickerKey: 'week1SecondSessionKicker',
      defaultKicker: 'Week one habit',
      titleKey: 'justGoTitle',
      defaultTitle: `${meta.focusLabel} — session 2`,
      titleParams: { focus: meta.focusLabel },
      descKey: 'week1SecondSessionReason',
      defaultDesc:
        'One session logged. A second this week locks the loop — Coach builds from the logs, not another pillar.',
      descParams: { focus: meta.focusLabel },
    };
  }

  return {
    labelKey: 'justGoCta',
    defaultLabel: 'Just Go',
    kickerKey: 'justGoEyebrow',
    defaultKicker: 'Ready to train',
    titleKey: 'justGoTitle',
    defaultTitle: `${meta.focusLabel} — Just Go`,
    titleParams: { focus: meta.focusLabel },
    descKey: 'justGoDesc',
    defaultDesc: `One tap builds today's ${meta.focusLabel.toLowerCase()} session from how fresh you are and what you lifted last time.`,
    descParams: { focus: meta.focusLabel },
  };
}

/** True when the CTA is freestyle Just Go (not a prescribed coach day). */
export function isFreestyleJustGo(source: JustGoHeroSource): boolean {
  return source === 'focus' || source === 'starter';
}
