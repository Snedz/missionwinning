'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Menu } from 'lucide-react';

export type MarketingNavLink = { href: string; label: string };

const LANDING_LINKS: MarketingNavLink[] = [
  { href: '/#tools', label: 'Free core' },
  { href: '/#pillars', label: 'Pillars' },
  { href: '/#bundle', label: 'Super Bundle' },
];

const BUNDLE_LINKS: MarketingNavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/#pillars', label: 'Pillars' },
  { href: '#faq', label: 'FAQ' },
];

function scrollToHash(href: string) {
  if (!href.startsWith('#')) return;
  document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
}

export function MarketingShell({
  children,
  variant = 'landing',
  stickyCta,
}: {
  children: ReactNode;
  variant?: 'landing' | 'bundle';
  stickyCta?: { primaryLabel: string; onPrimary: () => void; secondaryLabel?: string; onSecondary?: () => void };
}) {
  const router = useRouter();
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
    const isHash = link.href.startsWith('#');
    const isCrossPageHash = link.href.includes('#') && !link.href.startsWith('#');

    if (isHash) {
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
          {link.label}
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
        {link.label}
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
                {variant === 'bundle' ? 'Super Bundle' : 'Global health super-app'}
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1 text-sm">
            {links.map((l) => navAnchor(l))}
            <Button variant="outline" size="sm" className="tap-target ml-2" onClick={goWelcome}>
              Start free
            </Button>
            {variant !== 'bundle' && (
              <Button size="sm" variant="fitness" className="tap-target" onClick={goBundle}>
                Super Bundle
              </Button>
            )}
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <Button size="sm" variant="fitness" className="tap-target h-11" onClick={goWelcome}>
              Start free
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
            <DialogTitle className="text-base text-left">Menu</DialogTitle>
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
              Start free — 2 min setup
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
                View Super Bundle pricing
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">{children}</main>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground px-4 mt-8">
        © Mission Winning ·{' '}
        <Link href="/welcome" className="hover:text-emerald-400 tap-target inline-flex px-1">
          Start free
        </Link>{' '}
        ·{' '}
        <Link href="/bundle" className="hover:text-emerald-400 tap-target inline-flex px-1">
          Bundle
        </Link>{' '}
        ·{' '}
        <Link href="/about" className="hover:text-emerald-400 tap-target inline-flex px-1">
          About
        </Link>{' '}
        ·{' '}
        <Link href="/vision" className="hover:text-emerald-400 tap-target inline-flex px-1">
          Vision
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
