'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useActiveWorkoutPulse } from '@/hooks/useActiveWorkoutPulse';
import { useTranslation } from 'react-i18next';
import { railGroupsForNav } from '@/lib/navConfig';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function pathActive(pathname: string, href: string): boolean {
  if (href === '/log') return pathname === '/log' || pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

/**
 * Desktop side rail — the 13 signed-in screens grouped Mission / Pillars /
 * Toolkit (Modernist handoff). Everything that is not one of those screens
 * (calculators, leaderboard, guidebook, bundle) stays in the header menu.
 *
 * The rail scrolls: 13 items plus three group headers overflow a short laptop
 * window, and the alternative — compressing rows until they stop being
 * thumb-sized — trades a scroll nobody minds for a tap target that misses.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const hasActiveWorkout = useActiveWorkoutPulse();
  const groups = useMemo(() => railGroupsForNav(), []);

  return (
    <aside className="hidden md:flex h-full w-[72px] lg:w-[210px] shrink-0 flex-col border-e-2 border-border bg-card">
      <nav className="flex-1 overflow-y-auto p-2 lg:p-3">
        {groups.map((group, groupIndex) => (
          <div
            key={group.id}
            className={cn(
              groupIndex > 0 && 'mt-4 border-t-2 border-border pt-4 lg:border-t-0 lg:pt-0'
            )}
          >
            {/* At 72px the rail is icon-only, so the label would be unreadable —
                the 2px rule above carries the grouping instead.

                muted-foreground, not the handoff's neutral-500: #9b9797 on
                paper is ~2.4:1 and these are 10px, nowhere near the 4.5:1 they
                need. The sheet picked a tone, not a tested value. */}
            <p className="hidden lg:block px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t(group.titleKey, { defaultValue: group.title })}
            </p>
            <ul className="flex flex-col">
              {group.items.map(({ href, labelKey, label, icon: Icon }) => {
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
                            'relative flex min-h-[44px] flex-col items-center gap-1 px-2 py-2 transition-colors lg:flex-row lg:gap-3 lg:px-3',
                            isActive
                              ? 'is-active-row text-primary'
                              : 'text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground'
                          )}
                        >
                          <Icon className="h-5 w-5 shrink-0" aria-hidden />
                          <span className="text-center text-[10px] font-semibold leading-tight lg:text-start lg:text-[15px] lg:font-medium">
                            {navLabel}
                          </span>
                          {showPulse && (
                            <span className="absolute end-2 top-2 h-2 w-2 bg-[hsl(var(--accent-poster))] animate-pulse lg:end-3 lg:top-1/2 lg:-translate-y-1/2" />
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
          </div>
        ))}
      </nav>

      {/*
        The handoff's rail ends `v2026.07.89 · Guide` under a rule. It is the
        only build label a signed-in tester can see without opening Profile,
        which is worth having when every beta report starts "which build?".

        `lg:` only — the rail is 72px icon-only below that, where a version
        string cannot fit and the Guide link is already in the nav.
      */}
      <div className="hidden lg:block border-t-2 border-border px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          <span className="tabular-nums">{APP_BUILD_LABEL}</span>
          {' · '}
          <Link href="/guide" className="hover:text-foreground hover:underline">
            {t('navGuide', { defaultValue: 'Guide' })}
          </Link>
        </p>
      </div>
    </aside>
  );
}
