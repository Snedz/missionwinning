'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useActiveWorkoutPulse } from '@/hooks/useActiveWorkoutPulse';
import { useTranslation } from 'react-i18next';
import { PRIMARY_NAV } from '@/lib/primaryNav';

function pathActive(pathname: string, href: string): boolean {
  if (href === '/log') return pathname === '/log' || pathname === '/';
  if (href === '/coach') return pathname === '/coach' || pathname.startsWith('/coach/');
  if (href === '/active') return pathname === '/active' || pathname.startsWith('/active/');
  if (href === '/nutrition') return pathname === '/nutrition' || pathname.startsWith('/nutrition/');
  if (href === '/profile') return pathname === '/profile' || pathname.startsWith('/profile/');
  return pathname === href || pathname.startsWith(href + '/');
}

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const hasActiveWorkout = useActiveWorkoutPulse();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border/50 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md supports-[backdrop-filter]:bg-background/85">
      <div className="flex items-stretch justify-around h-[52px]">
        {PRIMARY_NAV.map(({ href, labelKey, label, icon: Icon }) => {
          const isActive = pathActive(pathname, href);
          const showPulse = href === '/active' && hasActiveWorkout;

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium min-h-[48px] relative transition-colors',
                isActive
                  ? 'text-primary after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary'
                  : 'text-muted-foreground hover:text-foreground/80'
              )}
            >
              <Icon className={cn('h-6 w-6', showPulse && 'text-primary')} aria-hidden />
              {showPulse && (
                <span className="absolute top-1.5 end-[calc(50%-20px)] h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
              {t(labelKey, { defaultValue: label })}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
