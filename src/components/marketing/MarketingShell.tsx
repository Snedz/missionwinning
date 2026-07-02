'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Menu } from 'lucide-react';
import { MarketingLanguageSelect } from '@/components/marketing/MarketingLanguageSelect';

export type MarketingNavLink = { href: string; labelKey: string };

const LANDING_LINKS: MarketingNavLink[] = [
  { href: '#tools', labelKey: 'landingNavFreeCore' },
  { href: '#pillars', labelKey: 'landingNavPillars' },
  { href: '#bundle', labelKey: 'landingNavBundle' },
  { href: '#faq', labelKey: 'landingNavFaq' },
];

const BUNDLE_LINKS: MarketingNavLink[] = [
  { href: '/', labelKey: 'landingNavHome' },
  { href: '/#pillars', labelKey: 'landingNavPillars' },
  { href: '#faq', labelKey: 'landingNavFaq' },
];

function scrollToHash(href: string) {
  const hashIdx = href.indexOf('#');
  if (hashIdx === -1) return;
  const hash = href.slice(hashIdx);
  if (hash.length <= 1) return;
  document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
}

type MarketingShellProps = {
  children: ReactNode;
  variant?: 'landing' | 'bundle';
  stickyCta?: {
    primaryLabel: string;
    onPrimary: () => void;
    secondaryLabel?: string;
    onSecondary?: () => void;
  };
};

export function MarketingShell({
  children,
  variant = 'landing',
  stickyCta,
}: MarketingShellProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const links = variant === 'bundle' ? BUNDLE_LINKS : LANDING_LINKS;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goWelcome = useCallback(() => router.push('/welcome'), [router]);
  const goBundle = useCallback(() => router.push('/bundle'), [router]);

  const navAnchor = (link: MarketingNavLink, onNavigate?: () => void) => {
    const label = t(link.labelKey);
    const isSamePageHash = link.href.startsWith('#');

    if (isSamePageHash) {
      return (
        <a
          key={link.href}
          href={link.href}
          className="tap-target inline-flex items-center px-2 py-2 text-sm hover:text-emerald-400 transition-colors rounded-lg"
          onClick={(e) => {
            e.preventDefault();
            scrollToHash(link.href);
            onNavigate?.();
          }}
        >
          {label}
        </a>
      );
    }

    return (
      <Link
        key={link.href}
        href={link.href}
        className="tap-target inline-flex items-center px-2 py-2 text-sm hover:text-emerald-400 transition-colors rounded-lg"
        onClick={() => onNavigate?.()}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <nav className="border-b border-border/60 bg-background/95 backdrop-blur sticky top-0 z-50 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 tap-target rounded-lg shrink-0">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-primary-foreground">
              MW
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-semibold tracking-tight text-sm">MISSION WINNING</div>
              <div className="text-[10px] text-muted-foreground -mt-0.5">
                {variant === 'bundle'
                  ? t('marketingTaglineBundle', { defaultValue: 'Super Bundle' })
                  : t('marketingTagline', { defaultValue: 'Global health super-app' })}
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1 text-sm">
            {links.map((l) => navAnchor(l))}
            <MarketingLanguageSelect className="tap-target ml-1 rounded-lg border border-border/60 bg-background/80 px-2 py-1.5 text-xs" />
            <Button variant="outline" size="sm" className="tap-target ml-1" onClick={goWelcome}>
              {t('landingStartFree', { defaultValue: 'Start free' })}
            </Button>
            {variant !== 'bundle' && (
              <Button size="sm" variant="fitness" className="tap-target" onClick={goBundle}>
                {t('landingNavBundle', { defaultValue: 'Super Bundle' })}
              </Button>
            )}
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <MarketingLanguageSelect className="tap-target rounded-lg border border-border/60 bg-background/80 px-1.5 py-1.5 text-[10px] max-w-[52px]" />
            <Button size="sm" variant="fitness" className="tap-target h-11" onClick={goWelcome}>
              {t('landingStartFree', { defaultValue: 'Start free' })}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="tap-target shrink-0"
              aria-label="Open menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden max-h-[85vh]">
          <DialogHeader className="p-4 border-b border-border/60 space-y-0">
            <DialogTitle className="text-base text-left">{t('landingMenu', { defaultValue: 'Menu' })}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col p-4 gap-1">
            {links.map((l) => navAnchor(l, () => setMobileNavOpen(false)))}
            <Button
              variant="fitness"
              className="primary-action mt-4"
              onClick={() => {
                setMobileNavOpen(false);
                goWelcome();
              }}
            >
              {t('landingStartFreeLong', { defaultValue: 'Start free — 2 min setup' })}
            </Button>
            {variant !== 'bundle' && (
              <Button
                variant="outline"
                className="tap-target mt-2"
                onClick={() => {
                  setMobileNavOpen(false);
                  goBundle();
                }}
              >
                {t('marketingViewPricing', { defaultValue: 'View Super Bundle pricing' })}
              </Button>
            )}
            <div className="pt-3">
              <MarketingLanguageSelect className="tap-target w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">{children}</main>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground px-4 mt-8">
        © Mission Winning ·{' '}
        <Link href="/welcome" className="hover:text-emerald-400 tap-target inline-flex px-1">
          {t('marketingFooterStart', { defaultValue: 'Start free' })}
        </Link>{' '}
        ·{' '}
        <Link href="/bundle" className="hover:text-emerald-400 tap-target inline-flex px-1">
          {t('marketingFooterBundle', { defaultValue: 'Bundle' })}
        </Link>{' '}
        ·{' '}
        <Link href="/about" className="hover:text-emerald-400 tap-target inline-flex px-1">
          {t('marketingFooterAbout', { defaultValue: 'About' })}
        </Link>{' '}
        ·{' '}
        <Link href="/vision" className="hover:text-emerald-400 tap-target inline-flex px-1">
          {t('marketingFooterVision', { defaultValue: 'Vision' })}
        </Link>
      </footer>

      {stickyCta && showSticky && (
        <div
          className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-border/60 bg-background/95 backdrop-blur p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          role="region"
          aria-label="Quick actions"
        >
          <div className="flex gap-2 max-w-lg mx-auto">
            <Button
              variant="fitness"
              className="primary-action flex-1 min-h-[48px]"
              onClick={stickyCta.onPrimary}
            >
              {stickyCta.primaryLabel}
            </Button>
            {stickyCta.secondaryLabel && stickyCta.onSecondary && (
              <Button
                variant="outline"
                className="tap-target flex-1 min-h-[48px]"
                onClick={stickyCta.onSecondary}
              >
                {stickyCta.secondaryLabel}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
