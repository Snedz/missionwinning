'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useActiveWorkoutPulse } from '@/hooks/useActiveWorkoutPulse';
import { useTranslation } from 'react-i18next';
import { PRIMARY_NAV } from '@/lib/primaryNav';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/** Desktop side rail — primary tabs only. Extended routes live in AppHeader dropdown. */
export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const hasActiveWorkout = useActiveWorkoutPulse();

  return (
    <aside className="hidden md:flex h-full w-[72px] lg:w-[210px] flex-col border-e border-border/50 bg-card/30 shrink-0">
      <nav className="flex-1 flex flex-col gap-1 p-2 lg:p-3 pt-4">
        {PRIMARY_NAV.map(({ href, labelKey, label, icon: Icon }) => {
          const isActive =
            href === '/log'
              ? pathname === '/log' || pathname === '/'
              : pathname === href || pathname.startsWith(href + '/');
          const showPulse = href === '/active' && hasActiveWorkout;
          const navLabel = t(labelKey, { defaultValue: label });

          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  aria-label={navLabel}
                  className={cn(
                    'flex flex-col lg:flex-row items-center lg:items-center gap-1 lg:gap-3 rounded-xl px-2 lg:px-3 py-2.5 min-h-[52px] transition-colors relative',
                    isActive
                      ? 'bg-primary/15 text-primary shadow-[inset_2px_0_0_0_hsl(var(--primary))]'
                      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', showPulse && 'text-primary')} />
                  <span className="text-[10px] lg:text-[15px] font-medium lg:font-medium text-center lg:text-start leading-tight">
                    {navLabel}
                  </span>
                  {showPulse && (
                    <span className="absolute top-2 end-2 lg:top-1/2 lg:-translate-y-1/2 lg:end-3 h-2 w-2 rounded-full bg-poster animate-pulse" />
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="lg:hidden">
                {navLabel}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </aside>
  );
}
