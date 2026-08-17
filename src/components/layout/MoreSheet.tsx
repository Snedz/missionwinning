'use client';

/**
 * The fifth tab — a door to screens that have no tab.
 *
 * **Flow-4 tiers** (`moreSheetTiersForNav`): Wedge · Pillars · You — not a
 * mirror of the desktop rail. Tab routes never appear as rows. Quiet foot
 * links cover tools + legal. Labels resolve through the same nav registry as
 * the rail so names cannot disagree.
 *
 * Rows carry a live figure on the right where an honest one exists, so the
 * sheet reads as a status board rather than a menu. Where there is no honest
 * figure the row carries none — an invented "0 sessions" on day one is the same
 * lie as a zeroed score, which is why `ScoreNumeral` renders an em-dash.
 *
 * **First Steps lives here too, and that is a fix rather than a feature.**
 * `.240` gave the checklist one mount — a Today card — with a Dismiss that
 * writes a flag nothing ever clears, and a card that also retires itself on
 * completion. So both endings were terminal: dismissed or finished, the
 * checklist and the sheet behind it were unreachable for the life of the
 * install. `.243` makes this sheet the surface that survives, which turns
 * Dismiss from *gone* into *moved off Today* — the thing it should always have
 * meant. Being a status board already, the sheet is where an athlete would look.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { MORE_NAV } from '@/lib/navConfig';
import { moreSheetQuietForNav, moreSheetTiersForNav } from '@/lib/moreSheetTiers';
import { isPathEnabled } from '@/lib/surface';
import { MeterBar } from '@/components/ui/MeterBar';
import { FirstStepsSheet } from '@/components/journey/FirstStepsSheet';
import { WhatsNewSheet } from '@/components/profile/WhatsNewSheet';
import { getFirstSteps, summarizeFirstSteps } from '@/lib/journey/firstSteps';
import { syncJourneyPhase } from '@/lib/missionJourney';
import { APP_BUILD_LABEL, APP_PUBLIC_PRODUCT_VERSION } from '@/lib/buildInfo';
import { isWhatsNewUnseen } from '@/lib/whatsNew';
import { useWorkoutStore } from '@/store/workoutStore';
import { useActiveWorkoutPulse } from '@/hooks/useActiveWorkoutPulse';

/**
 * Live figures, read once when the sheet opens.
 *
 * Deliberately narrow: only the four facts that are cheap to read and true
 * without qualification. Session count waits on the store's `hasHydrated`,
 * because a persisted store reports an empty history for a frame or two and
 * "0 sessions" flashing on a user with fifty is worse than a blank.
 */
function useMoreFigures(open: boolean): Record<string, string | undefined> {
  const [figures, setFigures] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    void (async () => {
      const [{ useWorkoutStore }, { isTodayCheckInComplete }, { getWeeklyStats }] =
        await Promise.all([
          import('@/store/workoutStore'),
          import('@/lib/mindCheckIns'),
          import('@/lib/activityLog'),
        ]);
      if (cancelled) return;

      const store = useWorkoutStore.getState();
      const next: Record<string, string | undefined> = {};

      if (store.hasHydrated && store.workoutHistory.length > 0) {
        const n = store.workoutHistory.length;
        next['/history'] = n === 1 ? '1 session' : `${n} sessions`;
      }
      if (isTodayCheckInComplete()) next['/mind'] = 'Checked in';

      const week = getWeeklyStats();
      if (week.count > 0) {
        next['/track'] = week.count === 1 ? '1 this week' : `${week.count} this week`;
      }

      setFigures(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  return figures;
}

export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const figures = useMoreFigures(open);

  /**
   * F-004 — same first-workout signal as Basic Training (`workoutHistory.length`,
   * which `detectBasicMilestones` uses for `basic.workout`). Before hydrate,
   * keep pillars hidden so a cold I-Day open does not flash the options wall.
   */
  const hasHydrated = useWorkoutStore((s) => s.hasHydrated);
  const completedSessions = useWorkoutStore((s) => s.workoutHistory.length);
  const hasFirstWorkout = hasHydrated && completedSessions > 0;
  const hasActiveWorkout = useActiveWorkoutPulse();

  /**
   * Computed during render, not in an effect. `moreSheetTiersForNav()` is sync,
   * and this whole module is already behind a dynamic import — so deferring it
   * only bought one frame of an open sheet with nothing in it.
   */
  const groups = useMemo(
    () => moreSheetTiersForNav({ hasFirstWorkout, hasActiveWorkout }),
    [hasFirstWorkout, hasActiveWorkout]
  );

  /**
   * The checklist, read when the sheet opens.
   *
   * `syncJourneyPhase` rather than `loadJourneyState`: the milestones are
   * detected from live storage, and a stale snapshot here would show a step
   * unticked that the athlete finished a minute ago on another screen. Same
   * open-gated timing as `useMoreFigures` — off-screen work for a sheet nobody
   * opened is the `.210` shape.
   */
  const [firstSteps, setFirstSteps] = useState<ReturnType<typeof getFirstSteps>>([]);
  useEffect(() => {
    if (!open) return;
    try {
      setFirstSteps(getFirstSteps(syncJourneyPhase(), { completedSessions }));
    } catch {
      setFirstSteps([]);
    }
  }, [open, completedSessions]);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  const [whatsNewUnseen, setWhatsNewUnseen] = useState(false);
  useEffect(() => {
    if (!open) return;
    setWhatsNewUnseen(isWhatsNewUnseen(APP_BUILD_LABEL));
  }, [open]);
  const stepProgress = useMemo(() => summarizeFirstSteps(firstSteps), [firstSteps]);

  const bundle = MORE_NAV.find((i) => i.href === '/bundle');
  const showBundle = isPathEnabled('/bundle') && bundle;
  const quiet = useMemo(() => moreSheetQuietForNav(), []);

  return (
    <AdaptiveOverlay
      open={open}
      onClose={onClose}
      size="sm"
      eyebrow={t('navSearch', { defaultValue: 'Search' })}
      title={t('appName', { defaultValue: 'Mission Winning' })}
      bodyClassName="pb-2"
    >
      {/*
        Above the groups because it is the one row that is about *you* rather
        than about a screen. Hidden once complete — a finished checklist on a
        permanent surface is a permanent row saying nothing, which is the
        reference app's notification-centre defect in miniature.
      */}
      {!stepProgress.complete && stepProgress.total > 0 ? (
        <div className="border-b-2 border-border">
          <button
            type="button"
            onClick={() => setStepsOpen(true)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {t('firstStepsEyebrow', { defaultValue: 'Your first steps' })}
              </p>
              <p className="mt-0.5 truncate text-[15px] font-extrabold leading-snug">
                {stepProgress.next
                  ? t(stepProgress.next.titleKey, { defaultValue: stepProgress.next.title })
                  : t('firstStepsEyebrow', { defaultValue: 'Your first steps' })}
              </p>
              <div className="mt-2">
                <MeterBar
                  label={t('firstStepsProgressLabel', { defaultValue: 'Progress' })}
                  value={stepProgress.done}
                  max={stepProgress.total}
                  segments={stepProgress.total}
                  size="sm"
                  readout={`${stepProgress.done} / ${stepProgress.total}`}
                />
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          </button>
          <FirstStepsSheet
            open={stepsOpen}
            onClose={() => setStepsOpen(false)}
            steps={firstSteps}
            progress={stepProgress}
          />
        </div>
      ) : null}

      <div className="border-b-2 border-border">
        <button
          type="button"
          onClick={() => setWhatsNewOpen(true)}
          className="flex w-full min-h-[52px] items-center gap-3 px-4 text-left transition-colors hover:bg-muted"
        >
          <span className="flex-1 truncate text-[15px] font-semibold">
            {t('whatsNewMoreRow', { defaultValue: 'What’s new' })}
          </span>
          {whatsNewUnseen ? (
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
              {t('whatsNewMoreUnseen', { defaultValue: 'New' })}
            </span>
          ) : null}
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
        </button>
        <WhatsNewSheet
          open={whatsNewOpen}
          onClose={() => {
            setWhatsNewOpen(false);
            setWhatsNewUnseen(false);
          }}
        />
      </div>

      {groups.map((group) => (
        <div key={group.id} className="border-b-2 border-border">
          <h3 className="px-4 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {t(group.titleKey, { defaultValue: group.title })}
          </h3>
          <ul>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              const figure = figures[item.href];
              return (
                <li key={item.href} className="border-t border-border">
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-[52px] items-center gap-3 px-4 transition-colors hover:bg-muted',
                      active && 'is-active-row'
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0 text-muted-foreground" aria-hidden />
                    <span className="flex-1 truncate text-[15px] font-semibold">
                      {t(item.labelKey, { defaultValue: item.label })}
                    </span>
                    {figure ? (
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {figure}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {showBundle ? (
        /* --primary #ae1800, never poster #ec3013: this panel carries an 11px
           kicker, and nothing at that size clears 4.5:1 on poster red. */
        <Link
          href="/bundle"
          onClick={onClose}
          className="block bg-primary px-4 py-4 text-primary-foreground"
        >
          <span className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-primary-foreground">
            {t('navSectionPremium', { defaultValue: 'Premium' })}
          </span>
          <span className="block text-[19px] font-extrabold leading-tight">
            {t(bundle.labelKey, { defaultValue: bundle.label })}
          </span>
        </Link>
      ) : null}

      <div className="flex flex-wrap gap-x-4 gap-y-2 px-4 py-4 text-xs text-muted-foreground">
        {quiet.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="hover:text-primary hover:underline"
          >
            {t(link.labelKey, { defaultValue: link.label })}
          </Link>
        ))}
      </div>
      <p
        className="px-4 pb-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        data-mw-public-version
      >
        {APP_PUBLIC_PRODUCT_VERSION}
      </p>
    </AdaptiveOverlay>
  );
}
