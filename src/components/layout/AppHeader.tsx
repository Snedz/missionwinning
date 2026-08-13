'use client';

import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandMonogram } from '@/components/brand/BrandMonogram';
import { Badge } from '@/components/ui/badge';
import { isFreeBeta } from '@/lib/freeBeta';
import { isClientPrivateGateEnabled } from '@/lib/privateGateNavigate';
import { useIsCompact } from '@/hooks/useIsCompact';
import { ROUTE_LABELS, STATIC_PAGE_TITLES } from '@/lib/pageTitles';

const HeaderAuthChip = dynamic(
  () => import('@/components/layout/HeaderAuthChip').then((m) => ({ default: m.HeaderAuthChip })),
  { ssr: false }
);

/**
 * App chrome header — brand, page title, auth chip.
 *
 * The brand button used to expand an inline nav panel inside the header, which
 * meant the app had two menus describing overlapping sets of screens: this one
 * (grouped by journey phase) and the tab bar (grouped by rail). It now opens
 * the same More sheet the fifth tab does, so there is one answer to "where is
 * everything" at any width — a bottom sheet on a phone, a centred dialog on a
 * desktop, both from `railGroupsForNav()`.
 */
export function AppHeader({
  onOpenMore,
  moreOpen = false,
}: {
  onOpenMore: () => void;
  moreOpen?: boolean;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isCompact = useIsCompact();

  const pageTitle = (() => {
    const normalized = pathname === '/' ? '/log' : pathname;
    const staticTitle =
      STATIC_PAGE_TITLES[normalized] ??
      (normalized.startsWith('/learn/guide/') ? STATIC_PAGE_TITLES['/learn/guide'] : undefined);
    if (staticTitle) {
      return staticTitle.labelKey
        ? t(staticTitle.labelKey, { defaultValue: staticTitle.label })
        : staticTitle.label;
    }
    const match = ROUTE_LABELS.find(
      (n) => normalized === n.href || normalized.startsWith(n.href + '/')
    );
    if (match) return t(match.labelKey, { defaultValue: match.label });
    return t('appName', { defaultValue: 'Mission Winning' });
  })();

  /*
   * The brand block is a *button* only on compact, where it is the handle for
   * the More sheet — the sheet that answers "where is everything" when there is
   * no rail. The desktop handoff's header has neither: no chevron, no menu,
   * because the sidebar already lists all thirteen screens. So desktop renders
   * the same brand as plain content.
   */
  const brand = (
    <>
      <BrandMonogram className="h-9 w-9 text-sm" />
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-base font-extrabold tracking-[-0.01em] truncate sm:text-lg">
          Mission Winning
        </span>
        {/* Bound to the flag, not hardcoded — the tag has to disappear on
            its own when the beta window closes. Hidden under sm: at 375px
            the wordmark, chevron and auth chip already fill the row.

            `.745` — and bound to the *gate* as well as the flag. This said
            "Open beta" on `/regions`, `/terms` and every other page that stays
            public while `PRIVATE_MODE` is on, to visitors who cannot get in
            without an access code. The landing already says "invite-only";
            chrome that contradicts the page it frames is the cheapest kind of
            dishonesty and the easiest to fix. */}
        {isFreeBeta() && (
          <Badge variant="outline" className="hidden shrink-0 sm:inline-flex">
            {isClientPrivateGateEnabled()
              ? t('navInviteOnlyBeta', { defaultValue: 'Invite-only beta' })
              : t('navOpenBeta', { defaultValue: 'Open beta' })}
          </Badge>
        )}
        {isCompact && (
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
              moreOpen && 'rotate-180 text-primary'
            )}
          />
        )}
      </div>
    </>
  );

  return (
    <header className="shrink-0 z-50 border-b-2 border-border bg-background">
      <div className="relative z-[1] flex items-center gap-2 px-4 min-h-[56px]">
        {isCompact ? (
          <button
            type="button"
            onClick={onOpenMore}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
            className="flex flex-1 min-w-0 items-center gap-3 text-start hover:bg-muted transition-colors -ms-1 ps-1 py-1"
          >
            {brand}
          </button>
        ) : (
          <div className="flex flex-1 min-w-0 items-center gap-3 py-1">{brand}</div>
        )}
        <HeaderAuthChip />
        <span className="text-sm text-muted-foreground shrink-0 hidden sm:inline max-w-[140px] truncate">
          {pageTitle}
        </span>
      </div>
    </header>
  );
}
