'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveWorkoutPulse } from '@/hooks/useActiveWorkoutPulse';
import { useTranslation } from 'react-i18next';
import { railFooterForNav, railGroupsForNav } from '@/lib/navConfig';
import { APP_PUBLIC_VERSION } from '@/lib/buildInfo';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function pathActive(pathname: string, href: string): boolean {
  if (href === '/log') return pathname === '/log' || pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

const roomClass = (isActive: boolean) =>
  cn(
    'relative flex min-h-[44px] flex-col items-center gap-1 px-2 py-2 transition-colors lg:flex-row lg:gap-3 lg:px-3',
    isActive ? 'is-active-row text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  );

const footClass = (isActive: boolean) =>
  cn(
    'relative flex min-h-[40px] flex-col items-center gap-1 px-2 py-1.5 transition-colors lg:flex-row lg:gap-3 lg:px-3',
    isActive ? 'is-active-row text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  );

/**
 * Persistent left room rail — Today · Train · Coach · History · Library.
 * Footer: You + More (Builder / Messenger / Account live in the sheet).
 *
 * Same Sidebar the desktop shell already had. Recut to the IA rooms and
 * visible at every width — hiding it below `md` is how /log looked bare.
 * Wireframe tokens only. Not a costume.
 */
export function Sidebar({ onOpenMore }: { onOpenMore: () => void }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const hasActiveWorkout = useActiveWorkoutPulse();
  const groups = useMemo(() => railGroupsForNav(), []);
  const footer = useMemo(() => railFooterForNav(), []);

  return (
    <aside
      data-testid="room-rail"
      aria-label={t('navGroupMission', { defaultValue: 'Mission' })}
      className="flex h-full w-[72px] lg:w-[210px] shrink-0 flex-col border-e-2 border-border bg-card"
    >
      <nav aria-label={t('navGroupMission', { defaultValue: 'Mission' })} className="flex-1 overflow-y-auto p-2 lg:p-3">
        {groups.map((group) => (
          <ul key={group.id} className="flex flex-col">
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
                        className={roomClass(isActive)}
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
        ))}
      </nav>

      <div className="border-t-2 border-border p-2 lg:p-3">
        <ul className="flex flex-col">
          {footer.map(({ href, labelKey, label, icon: Icon }) => {
            const isActive = pathActive(pathname, href);
            const navLabel = t(labelKey, { defaultValue: label });
            return (
              <li key={href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={href}
                      aria-label={navLabel}
                      aria-current={isActive ? 'page' : undefined}
                      className={footClass(isActive)}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="text-center text-[10px] font-medium leading-tight lg:text-start lg:text-[13px]">
                        {navLabel}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="lg:hidden">
                    {navLabel}
                  </TooltipContent>
                </Tooltip>
              </li>
            );
          })}
          <li>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onOpenMore}
                  aria-haspopup="dialog"
                  className={footClass(false)}
                >
                  <MoreHorizontal className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="text-center text-[10px] font-medium leading-tight lg:text-start lg:text-[13px]">
                    {t('navMore', { defaultValue: 'More' })}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="lg:hidden">
                {t('navMore', { defaultValue: 'More' })}
              </TooltipContent>
            </Tooltip>
          </li>
        </ul>

        <p className="hidden lg:block pt-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          <span className="tabular-nums" data-mw-public-version={APP_PUBLIC_VERSION}>
            {APP_PUBLIC_VERSION}
          </span>
          {' · '}
          <Link href="/guide" className="hover:text-foreground hover:underline">
            {t('navGuide', { defaultValue: 'Guide' })}
          </Link>
        </p>
      </div>
    </aside>
  );
}
