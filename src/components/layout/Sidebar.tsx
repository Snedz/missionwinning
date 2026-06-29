'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useWorkoutStore } from '@/store/workoutStore';
import { useTranslation } from 'react-i18next';
import { PRIMARY_NAV } from '@/lib/navConfig';

/** Desktop side rail — primary tabs only. Extended routes live in AppHeader dropdown. */
export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);

  return (
    <aside className="hidden md:flex h-full w-[72px] lg:w-[210px] flex-col border-r border-border/50 bg-card/30 shrink-0">
      <nav className="flex-1 flex flex-col gap-1 p-2 lg:p-3 pt-4">
        {PRIMARY_NAV.map(({ href, labelKey, label, icon: Icon }) => {
          const isActive = pathname === href || (href === '/log' && pathname === '/');
          const showPulse = href === '/active' && activeWorkout;

          return (
            <Link
              key={href}
              href={href}
              title={t(labelKey, { defaultValue: label })}
              className={cn(
                'flex flex-col lg:flex-row items-center lg:items-center gap-1 lg:gap-3 rounded-xl px-2 lg:px-3 py-2.5 min-h-[52px] transition-colors relative',
                isActive
                  ? 'bg-emerald-600/20 text-emerald-400'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', showPulse && 'text-emerald-400')} />
              <span className="text-[10px] lg:text-[15px] font-medium lg:font-medium text-center lg:text-left leading-tight">
                {t(labelKey, { defaultValue: label })}
              </span>
              {showPulse && (
                <span className="absolute top-2 right-2 lg:top-1/2 lg:-translate-y-1/2 lg:right-3 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
