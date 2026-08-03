/**
 * Today hero copy for the primary train CTA.
 *
 * Just Go is freestyle (focus/starter). When Mission Coach has a live session
 * for today, the same tap loads that plan — the label must not say "Just Go".
 */
import type { CoachSessionLike, JustGoSession } from '@/lib/justGoSession';

export type JustGoHeroSource = JustGoSession['source'];

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
};

/**
 * Build Today train-CTA meta for lean + full shells.
 * Pure: coach peek stays outside so SSR / tests do not touch storage.
 */
export function buildJustGoHeroMeta(opts: BuildJustGoHeroMetaOpts): JustGoHeroMeta | null {
  if (opts.hasActiveWorkout || !opts.trainReady) return null;
  const focusLabel = opts.focusLabel.trim() || 'Training';
  const coach = opts.coach;
  if (coach && coach.exercises.length > 0) {
    return {
      focusLabel,
      source: 'coach',
      sessionName: coach.name,
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

/**
 * Resolve presentation for the Today train CTA.
 * Pure — unit-tested so UI cannot re-lie without a failing test.
 */
export function resolveJustGoHeroCopy(meta: JustGoHeroMeta): JustGoHeroCopy {
  if (meta.source === 'coach') {
    const name = meta.sessionName?.trim() || meta.focusLabel;
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
