'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BrandMonogram } from '@/components/brand/BrandMonogram';
import { PublicNavMenu } from '@/components/public/PublicNavMenu';
import { footerGroups, primaryNavLinks } from '@/components/marketing/footerLinks';
import { PublicStatusBar } from '@/components/public/PublicStatusBar';
import {
  APP_PUBLIC_PRODUCT_VERSION,
  APP_PUBLIC_STATUS_LINE_EN,
} from '@/lib/buildInfo';
import { GATED_WWW_HONESTY } from '@/lib/gatedWwwHonesty';
import { isClientPrivateGateEnabled } from '@/lib/privateGateClientFlag';

type MarketingNavProps = {
  /** full = site links + primary CTA; compact = logo + primary CTA only */
  variant?: 'full' | 'compact';
  className?: string;
};

export function MarketingNav({ variant = 'full', className }: MarketingNavProps) {
  const { t } = useTranslation();
  const gateOn = isClientPrivateGateEnabled();
  const navLinks = primaryNavLinks({ gated: gateOn });
  const legalLinks =
    footerGroups().find((g) => g.titleKey === 'footerGroupLegal')?.links ?? [];
  const ctaHref = gateOn ? '/private' : '/welcome';
  const ctaLabel = gateOn
    ? t('landingNavStartGated', {
        defaultValue: GATED_WWW_HONESTY.landingNavStartGated,
      })
    : t('landingNavStart', { defaultValue: 'Start free' });

  return (
    <nav
      aria-label="Site"
      className={cn(
        'sticky top-0 z-50 border-b-2 border-border bg-background',
        className
      )}
    >
      <PublicStatusBar
        label={t('publicStatusOpenBeta', {
          productVersion: APP_PUBLIC_PRODUCT_VERSION,
          defaultValue: APP_PUBLIC_STATUS_LINE_EN,
        })}
      />
      <div className="relative z-[1] mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 min-w-0">
          <BrandMonogram className="h-8 w-8 text-sm" />
          <span className="truncate font-display text-[15px] font-extrabold tracking-[-0.01em]">
            Mission Winning
          </span>
        </Link>

        {variant === 'full' ? (
          <ul className="hidden flex-1 items-center justify-center gap-7 text-sm md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-[44px] items-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t(link.labelKey, { defaultValue: link.defaultValue })}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Link
            href="/"
            className="hidden flex-1 text-sm text-muted-foreground transition-colors hover:text-foreground md:inline"
          >
            {t('landingNavHome', { defaultValue: 'Home' })}
          </Link>
        )}

        <div className="ml-auto flex items-center gap-4">
          {/* A real anchor, not `onClick={router.push}`: these pages are `force-static`,
              so an onClick-only CTA does nothing until React hydrates and crawlers see no
              link at all. Quiet in chrome — the page's one red stays on the field. */}
          <Button asChild variant="ghost" className="tap-target min-h-[44px] text-sm font-semibold">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>

          <PublicNavMenu
            links={navLinks.map((l) => ({
              ...l,
              defaultValue: t(l.labelKey, { defaultValue: l.defaultValue }),
            }))}
            legalLinks={legalLinks.map((l) => ({
              ...l,
              defaultValue: t(l.labelKey, { defaultValue: l.defaultValue }),
            }))}
            ctaHref={ctaHref}
            ctaLabel={ctaLabel}
            menuLabel={t('navMenuLabel', { defaultValue: 'Menu' })}
            closeLabel={t('navMenuClose', { defaultValue: 'Close menu' })}
          />
        </div>
      </div>
    </nav>
  );
}
