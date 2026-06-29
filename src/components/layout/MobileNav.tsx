'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useWorkoutStore } from '@/store/workoutStore';
import { PRIMARY_NAV } from '@/lib/navConfig';

export function MobileNav() {
  const pathname = usePathname();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);

  return (
    <nav className="glass-nav md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around h-[52px]">
          {PRIMARY_NAV.map(({ href, label, icon: Icon, ...rest }) => {
            const pulseWhenActive = 'pulseWhenActive' in rest && rest.pulseWhenActive;
          const isActive = pathname === href || (href === '/log' && pathname === '/');
          const showPulse = pulseWhenActive && activeWorkout;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium min-h-[44px] relative transition-colors',
                isActive ? 'text-emerald-400' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-6 w-6', showPulse && 'text-emerald-400')} />
              {showPulse && (
                <span className="absolute top-1.5 right-[calc(50%-20px)] h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
