'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EXTENDED_NAV_SECTIONS, ALL_NAV, STATIC_PAGE_TITLES } from '@/lib/navConfig';
import { HeaderAuthChip } from '@/components/layout/HeaderAuthChip';

export function AppHeader() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const pageTitle = (() => {
    const normalized = pathname === '/' ? '/log' : pathname;
    const staticTitle =
      STATIC_PAGE_TITLES[normalized] ??
      (normalized.startsWith('/learn/guide/')
        ? STATIC_PAGE_TITLES['/learn/guide']
        : undefined);
    if (staticTitle) {
      return staticTitle.labelKey
        ? t(staticTitle.labelKey, { defaultValue: staticTitle.label })
        : staticTitle.label;
    }
    const match = ALL_NAV.find((n) => normalized === n.href || normalized.startsWith(n.href + '/'));
    if (match) return t(match.labelKey, { defaultValue: match.label });
    return t('appName', { defaultValue: 'Mission Winning' });
  })();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [open]);

  return (
    <header ref={headerRef} className="glass-nav shrink-0 z-50 border-b border-border/50">
      <div className="flex items-center gap-2 px-4 min-h-[56px]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="true"
          className="flex flex-1 min-w-0 items-center gap-3 text-start hover:bg-white/[0.02] transition-colors rounded-lg -ms-1 ps-1 py-1"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 shadow-md shadow-emerald-950/30">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="font-semibold tracking-tight truncate">Mission Winning</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                open && 'rotate-180 text-emerald-400'
              )}
            />
          </div>
        </button>
        <HeaderAuthChip />
        <span className="text-sm text-muted-foreground shrink-0 hidden sm:inline max-w-[120px] truncate">
          {pageTitle}
        </span>
      </div>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out border-t border-border/40',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 py-4 bg-card/90 backdrop-blur-xl max-h-[min(70vh,520px)] overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-4 sm:hidden">{pageTitle}</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
              {EXTENDED_NAV_SECTIONS.map((section) => (
                <div key={section.id}>
                  <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2 px-1">
                    {t(section.titleKey, { defaultValue: section.title })}
                  </h2>
                  <ul className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = pathname === item.href;
                      const military = item.military;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={close}
                            className={cn(
                              'flex items-center gap-2.5 rounded-xl px-3 py-2.5 min-h-[44px] text-sm transition-colors',
                              active
                                ? 'bg-emerald-600/15 text-emerald-400'
                                : 'text-foreground/90 hover:bg-muted/60',
                              military && !active && 'border border-amber-800/20'
                            )}
                          >
                            <Icon className={cn('h-4 w-4 shrink-0', military && 'text-amber-600/80')} />
                            <span className="font-medium truncate">
                              {t(item.labelKey, { defaultValue: item.label })}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-border/40 text-xs text-muted-foreground max-w-5xl mx-auto">
              <Link href="/vision" onClick={close} className="hover:text-emerald-400">
                {t('navOurMission', { defaultValue: 'Our mission' })}
              </Link>
              <Link href="/beta" onClick={close} className="hover:text-emerald-400">
                {t('navBetaGuide', { defaultValue: 'Beta guide' })}
              </Link>
              <Link href="/about" onClick={close} className="hover:text-emerald-400">
                {t('about', { defaultValue: 'About' })}
              </Link>
              <Link href="/terms" onClick={close} className="hover:text-emerald-400">
                {t('termsOfService', { defaultValue: 'Terms' })}
              </Link>
              <Link href="/privacy" onClick={close} className="hover:text-emerald-400">
                {t('privacyPolicy', { defaultValue: 'Privacy' })}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
