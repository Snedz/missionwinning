'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useActiveWorkoutPulse } from '@/hooks/useActiveWorkoutPulse';
import { PRIMARY_NAV, TAB_LABEL_OVERRIDES, resolveMobileTabHrefs } from '@/lib/primaryNav';

function pathActive(pathname: string, href: string): boolean {
  if (href === '/log') return pathname === '/log' || pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

/** Shared by all five slots so the fifth is a peer, not a decorated afterthought. */
const tabClass =
  'relative flex flex-1 min-w-0 min-h-[56px] flex-col items-center justify-center gap-[3px] px-1 pb-2.5 pt-2 text-[10px] uppercase tracking-[0.04em] transition-colors';

export function MobileNav({
  onOpenMore,
  moreOpen = false,
}: {
  onOpenMore: () => void;
  moreOpen?: boolean;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const hasActiveWorkout = useActiveWorkoutPulse();

  /*
   * `.201` — never throw on the render path of the persistent bottom nav.
   * Drop an unresolvable href; `mobileNavTabs.test.ts` catches the mismatch.
   *
   * `.892` — cold bar is Summary + Search. Train joins only while a session
   * is live. Coach and Fuel left the bar.
   */
  const tabs = useMemo(
    () =>
      resolveMobileTabHrefs({ hasActiveWorkout }).map((href) => {
        const item = PRIMARY_NAV.find((n) => n.href === href);
        if (!item) return null;
        return { ...item, ...(TAB_LABEL_OVERRIDES[href] ?? {}) };
      }).filter((tab): tab is NonNullable<typeof tab> => tab !== null),
    [hasActiveWorkout]
  );

  return (
    /*
     * Modernist: solid paper under a 2px rule — no translucency, no blur.
     *
     * In flow, not `fixed`. It is the last child of a `h-screen flex-col`
     * shell, so static puts it in exactly the same place while *reserving* its
     * height — which means `main` no longer needs a `pb-[56px]` guess that
     * every other bottom-anchored panel then has to guess along with, and the
     * screen dock above it cannot be covered by it.
     */
    <nav
      aria-label="Primary"
      className="ptn md:hidden shrink-0 z-50 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-stretch">
        {tabs.map(({ href, labelKey, label, icon: Icon }) => {
          const isActive = pathActive(pathname, href);
          const showPulse = href === '/active' && hasActiveWorkout;

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                tabClass,
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
              <span className="max-w-full truncate">{t(labelKey, { defaultValue: label })}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onOpenMore}
          aria-expanded={moreOpen}
          aria-haspopup="dialog"
          className={cn(
            tabClass,
            moreOpen
              ? 'is-active-tab font-extrabold text-primary'
              : 'font-semibold text-muted-foreground hover:text-foreground'
          )}
        >
          <Search className="h-5 w-5" aria-hidden />
          <span className="max-w-full truncate">{t('navSearch', { defaultValue: 'Search' })}</span>
        </button>
      </div>
    </nav>
  );
}
