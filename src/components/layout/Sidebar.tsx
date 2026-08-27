'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useActiveWorkoutPulse } from '@/hooks/useActiveWorkoutPulse';
import { useTranslation } from 'react-i18next';
import { railGroupsForNav, studioItemsForNav } from '@/lib/navConfig';
import { APP_PUBLIC_VERSION } from '@/lib/buildInfo';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useWorkoutStore } from '@/store/workoutStore';

function pathActive(pathname: string, href: string): boolean {
  if (href === '/log') return pathname === '/log' || pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

/**
 * Dual rail — 72px icons + ~264px studio labels (Patreon creator studio).
 * Map: Today, Train, Coach, History, Library, Account.
 * Remaining rail destinations stay in More. railGroupsForNav is still called
 * so F-004 (hide Pillars until first workout) stays wired.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const hasActiveWorkout = useActiveWorkoutPulse();
  const hasFirstWorkout = useWorkoutStore(
    (s) => s.hasHydrated && s.workoutHistory.length > 0
  );
  const items = useMemo(() => {
    railGroupsForNav({ hasFirstWorkout });
    return studioItemsForNav();
  }, [hasFirstWorkout]);

  return (
    <aside className="ptn hidden md:flex h-full shrink-0">
      <nav
        aria-label="Studio icons"
        className="ptn-icon-rail flex h-full flex-col items-center border-e border-border py-3"
      >
        <Link
          href="/log"
          className="ptn-icon-btn ptn-rail mb-4"
          aria-label={t('appName', { defaultValue: 'Mission Winning' })}
        >
          MW
        </Link>
        <ul className="flex flex-1 flex-col items-center gap-1">
          {items.map(({ href, labelKey, label, icon: Icon }) => {
            const isActive = pathActive(pathname, href);
            const showPulse = href === '/active' && hasActiveWorkout;
            const navLabel = t(labelKey, { defaultValue: label });
            return (
              <li key={href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={href}
                      aria-label={navLabel}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'ptn-icon-btn relative',
                        isActive ? 'is-active-row ptn-row-active' : 'ptn-quiet'
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" aria-hidden />
                      {showPulse && (
                        <span className="absolute end-1 top-1 h-2 w-2 bg-[hsl(var(--accent-poster))] animate-pulse" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="lg:hidden">
                    {navLabel}
                  </TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
        <p className="ptn-quiet text-[10px] tabular-nums" data-mw-public-version={APP_PUBLIC_VERSION}>
          {APP_PUBLIC_VERSION}
        </p>
      </nav>

      <nav
        aria-label="Studio"
        className="ptn-studio-rail hidden h-full flex-col border-e border-border py-4 pe-3 ps-2 lg:flex"
      >
        <p className="ptn-rail mb-4 px-3 tracking-[0.12em]">MISSION WINNING</p>
        <ul className="flex flex-1 flex-col gap-1">
          {items.map(({ href, labelKey, label, icon: Icon }) => {
            const isActive = pathActive(pathname, href);
            const showPulse = href === '/active' && hasActiveWorkout;
            const navLabel = t(labelKey, { defaultValue: label });
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative flex min-h-[44px] items-center gap-3 px-3 ptn-rail',
                    isActive ? 'is-active-row ptn-row-active' : 'ptn-quiet hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span>{navLabel}</span>
                  {showPulse && (
                    <span className="absolute end-3 top-1/2 h-2 w-2 -translate-y-1/2 bg-[hsl(var(--accent-poster))] animate-pulse" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        <Link href="/guide" className="ptn-quiet px-3 text-[12px] hover:underline">
          {t('navGuide', { defaultValue: 'Guide' })}
        </Link>
      </nav>
    </aside>
  );
}
