'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, UtensilsCrossed, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkoutStore } from '@/store/workoutStore';

const tabs = [
  { href: '/log', label: 'Today', icon: Home },
  { href: '/active', label: 'Train', icon: Dumbbell, pulseWhenActive: true },
  { href: '/nutrition', label: 'Fuel', icon: UtensilsCrossed },
  { href: '/track', label: 'Track', icon: MapPin },
  { href: '/profile', label: 'You', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around h-16">
        {tabs.map(({ href, label, icon: Icon, pulseWhenActive }) => {
          const isActive = pathname === href || (href === '/log' && pathname === '/');
          const showPulse = pulseWhenActive && activeWorkout;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors relative',
                isActive ? 'text-emerald-400' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', showPulse && 'text-secondary')} />
              {showPulse && (
                <span className="absolute top-2 right-[calc(50%-18px)] h-2 w-2 rounded-full bg-secondary animate-pulse" />
              )}
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
