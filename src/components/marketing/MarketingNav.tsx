'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BrandMonogram } from '@/components/brand/BrandMonogram';
import { PublicNavMenu } from '@/components/public/PublicNavMenu';
import { footerGroups, primaryNavLinks } from '@/components/marketing/footerLinks';
import { PublicStatusBar } from '@/components/public/PublicStatusBar';

type MarketingNavProps = {
  /** full = site links + primary CTA; compact = logo + primary CTA only */
  variant?: 'full' | 'compact';
  className?: string;
};

export function MarketingNav({ variant = 'full', className }: MarketingNavProps) {
  const { t } = useTranslation();
  const navLinks = primaryNavLinks();
  const legalLinks =
    footerGroups().find((g) => g.titleKey === 'footerGroupLegal')?.links ?? [];

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
          defaultValue:
            'Free beta — full platform free for testers while we grow with you',
        })}
      />
      <div className="relative z-[1] mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:h-16">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <BrandMonogram className="h-8 w-8 text-sm sm:h-9 sm:w-9" />
          <span className="truncate font-display text-lg font-extrabold tracking-[-0.01em] sm:text-xl">
            Mission Winning
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {/* Real wayfinding from md up. This used to be one `/#coach` anchor during the
              free beta, which meant the ~250-page library had no route from the chrome at
              any width. Below md it moves into PublicNavMenu. */}
          {variant === 'full' ? (
            <ul className="hidden items-center gap-6 text-sm md:flex">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(link.labelKey, { defaultValue: link.defaultValue })}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Link
              href="/"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline"
            >
              {t('landingNavHome', { defaultValue: 'Home' })}
            </Link>
          )}

          {/* A real anchor, not `onClick={router.push}`: these pages are `force-static`,
              so an onClick-only CTA does nothing until React hydrates and crawlers see no
              link at all. Visible at every width — the primary conversion action must not
              move a tap deeper on the viewport most visitors arrive on. */}
          <Button asChild variant="ghost" className="tap-target min-h-[44px] text-sm font-medium">
            <Link href="/welcome">{t('landingNavStart', { defaultValue: 'Start free' })}</Link>
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
            ctaHref="/welcome"
            ctaLabel={t('landingNavStart', { defaultValue: 'Start free' })}
            menuLabel={t('navMenuLabel', { defaultValue: 'Menu' })}
            closeLabel={t('navMenuClose', { defaultValue: 'Close menu' })}
          />
        </div>
      </div>
    </nav>
  );
}
