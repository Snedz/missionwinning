'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dumbbell, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkoutStore } from '@/store/workoutStore';
import { useTranslation } from 'react-i18next';
import { PRIMARY_NAV } from '@/lib/navConfig';
import { useMoreNav } from '@/contexts/MoreNavContext';

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const { openMore } = useMoreNav();

  return (
    <aside className="glass-nav flex h-full w-[220px] flex-col border-r border-white/5">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-900/30">
          <Dumbbell className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight">Mission Winning</h1>
          <p className="text-xs text-muted-foreground">Health for everyone</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {PRIMARY_NAV.map(({ href, labelKey, label, icon: Icon, ...rest }) => {
          const pulseWhenActive = 'pulseWhenActive' in rest && rest.pulseWhenActive;
          const isActive = pathname === href || (href === '/log' && pathname === '/');
          const showPulse = pulseWhenActive && activeWorkout;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium min-h-[44px] transition-colors',
                isActive
                  ? 'bg-emerald-600/20 text-emerald-400'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', showPulse && 'text-emerald-400')} />
              {t(labelKey, { defaultValue: label })}
              {showPulse && (
                <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={openMore}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium min-h-[44px] text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors mt-2"
        >
          <LayoutGrid className="h-5 w-5 shrink-0" />
          {t('navMore', { defaultValue: 'More tools' })}
        </button>
      </nav>

      <div className="border-t border-white/5 p-4 space-y-2 text-xs text-muted-foreground">
        <Link href="/vision" className="block hover:text-foreground transition-colors">
          Our mission
        </Link>
        <Link href="/beta" className="block hover:text-emerald-400 transition-colors">
          Beta guide
        </Link>
      </div>
    </aside>
  );
}
