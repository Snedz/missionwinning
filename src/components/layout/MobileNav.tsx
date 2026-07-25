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
    // Modernist: solid paper under a 2px rule — no translucency, no blur.
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t-2 border-border bg-background pb-[env(safe-area-inset-bottom)]">
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
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold min-h-[48px] relative transition-colors',
                // The active tab is marked by a 2px poster-red rule along the top
                // edge of the tab — it reads as part of the nav's own rule rather
                // than a floating pill, and the label goes accent-700.
                isActive
                  ? "text-primary before:absolute before:inset-x-0 before:-top-0.5 before:h-0.5 before:bg-[hsl(var(--accent-poster))] before:content-['']"
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-6 w-6', showPulse && 'text-primary')} aria-hidden />
              {showPulse && (
                <span className="absolute top-1.5 end-[calc(50%-20px)] h-2 w-2 rounded-full bg-[hsl(var(--accent-poster))] animate-pulse" />
              )}
              {t(labelKey, { defaultValue: label })}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
