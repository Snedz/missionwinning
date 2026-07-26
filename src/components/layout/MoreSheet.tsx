'use client';

/**
 * The fifth tab — a door to the nine signed-in screens that have no tab.
 *
 * Built from `railGroupsForNav()`, so the rail, the tab bar and this sheet all
 * describe the same thirteen screens from one declaration. The four routes
 * already in the tab bar are filtered out: a row that repeats the button two
 * inches below it is dead weight.
 *
 * Rows carry a live figure on the right where an honest one exists, so the
 * sheet reads as a status board rather than a menu. Where there is no honest
 * figure the row carries none — an invented "0 sessions" on day one is the same
 * lie as a zeroed score, which is why `ScoreNumeral` renders an em-dash.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { MOBILE_TAB_HREFS } from '@/lib/primaryNav';
import { railGroupsForNav, MORE_NAV } from '@/lib/navConfig';
import { isPathEnabled } from '@/lib/surface';
import { isFreeBeta } from '@/lib/freeBeta';

/** Quiet links below the groups — reachable, but not screens the rail counts. */
const QUIET_LINKS: { href: string; labelKey: string; label: string }[] = [
  { href: '/calculators', labelKey: 'navCalculators', label: 'Calculators' },
  { href: '/leaderboard', labelKey: 'navLeaderboard', label: 'Leaderboard' },
  { href: '/learn/guide', labelKey: 'navGuidebook', label: 'Guidebook' },
  { href: '/beta', labelKey: 'navBetaGuide', label: 'Beta guide' },
  { href: '/vision', labelKey: 'navOurMission', label: 'Our mission' },
  { href: '/about', labelKey: 'about', label: 'About' },
  { href: '/terms', labelKey: 'termsOfService', label: 'Terms' },
  { href: '/privacy', labelKey: 'privacyPolicy', label: 'Privacy' },
  { href: '/dmca', labelKey: 'infoDmcaTitle', label: 'DMCA' },
  { href: '/refunds', labelKey: 'infoRefundsTitle', label: 'Refunds' },
];

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
   * Computed during render, not in an effect. `railGroupsForNav()` is sync, and
   * this whole module is already behind a dynamic import — so deferring it only
   * bought one frame of an open sheet with nothing in it.
   */
  const groups = useMemo(
    () =>
      railGroupsForNav()
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) => !(MOBILE_TAB_HREFS as readonly string[]).includes(item.href)
          ),
        }))
        .filter((group) => group.items.length > 0),
    []
  );

  const bundle = MORE_NAV.find((i) => i.href === '/bundle');
  const showBundle = !isFreeBeta() && isPathEnabled('/bundle') && bundle;
  const quiet = QUIET_LINKS.filter((l) => isPathEnabled(l.href));

  return (
    <AdaptiveOverlay
      open={open}
      onClose={onClose}
      size="sm"
      eyebrow={t('navMoreEyebrow', { defaultValue: 'All screens' })}
      title={t('appName', { defaultValue: 'Mission Winning' })}
      bodyClassName="pb-2"
    >
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
          <span className="block text-[11px] font-semibold uppercase tracking-[0.1em] opacity-90">
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
    </AdaptiveOverlay>
  );
}
