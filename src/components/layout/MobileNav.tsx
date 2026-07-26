'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useActiveWorkoutPulse } from '@/hooks/useActiveWorkoutPulse';
import { useTranslation } from 'react-i18next';
import { railGroupsForNav } from '@/lib/navConfig';

function pathActive(pathname: string, href: string): boolean {
  if (href === '/log') return pathname === '/log' || pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const hasActiveWorkout = useActiveWorkoutPulse();
  // Same source and order as the desktop rail, flattened — the group headers
  // have nowhere to live in a tab bar, but Mission still comes first, so
  // Today / Train / Coach / History are the tabs on screen before any scroll.
  const items = useMemo(() => railGroupsForNav().flatMap((g) => g.items), []);

  return (
    // Modernist: solid paper under a 2px rule — no translucency, no blur.
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t-2 border-border bg-background pb-[env(safe-area-inset-bottom)]">
      {/* Scrolls horizontally rather than dividing 375px by thirteen: at flex-1
          each tab would be ~29px wide, well under the 44px this nav has to
          stay above. Scrollbar hidden, momentum kept. */}
      <div className="flex items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map(({ href, labelKey, label, icon: Icon }) => {
          const isActive = pathActive(pathname, href);
          const showPulse = href === '/active' && hasActiveWorkout;

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex min-h-[52px] min-w-[68px] shrink-0 flex-col items-center justify-center gap-[3px] px-1 pb-2.5 pt-2 text-[10px] uppercase tracking-[0.04em] transition-colors',
                isActive
                  ? 'is-active-tab font-extrabold text-primary'
                  : // muted-foreground, not the handoff's neutral-600. #7d7979 on
                    // paper is 3.84:1 and these labels are 10px, so they need
                    // 4.5:1 — the sheet's value fails the same way poster red
                    // failed on small text. muted-foreground is 8.4:1.
                    'font-semibold text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {showPulse && (
                <span className="absolute end-[calc(50%-18px)] top-1.5 h-2 w-2 bg-[hsl(var(--accent-poster))] animate-pulse" />
              )}
              {t(labelKey, { defaultValue: label })}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
