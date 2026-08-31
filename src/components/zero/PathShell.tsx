'use client';

/**
 * Signed-in chrome from zero. Commands, not a house.
 * Outbox drain stays mounted. House floor is unmounted.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { JourneyGuard } from '@/components/journey/JourneyGuard';
import { JourneySyncBoot } from '@/components/layout/JourneySyncBoot';
import { PageTransition } from '@/components/layout/PageTransition';
import { CONSENT_BANNER_HOST_ID, SCREEN_DOCK_HOST_ID } from '@/components/layout/ScreenDock';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useActiveWorkoutPulse } from '@/hooks/useActiveWorkoutPulse';
import { useIsCompact } from '@/hooks/useIsCompact';
import { useVisualViewportKeyboardOverlap } from '@/hooks/useVisualViewportKeyboardOverlap';
import { recordScreen } from '@/lib/screenTrail';
import { useWorkoutStore } from '@/store/workoutStore';
import '../house/house.css';
import './path.css';

type PathItem = { href: string; labelKey: string; label: string };

function pathItems(opts: { live: boolean; hasDiary: boolean }): PathItem[] {
  const items: PathItem[] = [{ href: '/log', labelKey: 'navToday', label: 'Today' }];
  if (opts.live) items.push({ href: '/active', labelKey: 'navTrain', label: 'Train' });
  items.push({ href: '/coach', labelKey: 'navCoachTab', label: 'Coach' });
  if (opts.hasDiary) items.push({ href: '/history', labelKey: 'navHistory', label: 'History' });
  return items;
}

function pathActive(pathname: string, href: string): boolean {
  if (href === '/log') return pathname === '/log' || pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isTrainPath(pathname: string): boolean {
  return pathname === '/active' || pathname.startsWith('/active/');
}

function PathWordNav({
  items,
  pathname,
  placement,
}: {
  items: PathItem[];
  pathname: string;
  placement: 'floor' | 'side';
}) {
  const { t } = useTranslation();
  return (
    <nav
      className={`path-nav path-nav-${placement}`}
      data-path-nav={placement}
      aria-label="Main"
    >
      {items.map((item) => {
        const on = pathActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`path-nav-link${on ? ' is-on' : ''}`}
            aria-current={on ? 'page' : undefined}
          >
            {t(item.labelKey, { defaultValue: item.label })}
          </Link>
        );
      })}
    </nav>
  );
}

export function PathShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const compact = useIsCompact();
  const live = useActiveWorkoutPulse();
  const hasDiary = useWorkoutStore((s) => s.workoutHistory.length > 0);
  const liveName = useWorkoutStore((s) => s.activeWorkout?.workoutName);
  const keyboardOverlap = useVisualViewportKeyboardOverlap();
  const train = isTrainPath(pathname);
  const items = pathItems({ live, hasDiary });
  const padClass = ['house-canvas-pad', train ? 'is-flush' : ''].filter(Boolean).join(' ');

  useEffect(() => {
    recordScreen(pathname);
  }, [pathname]);

  const canvas = (
    <div className="mw-house min-h-0 flex-1 overflow-y-auto">
      <main className="path-canvas">
        <div className={padClass}>
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  );

  return (
    <JourneyGuard>
      <TooltipProvider delayDuration={300}>
        <JourneySyncBoot />
        <div
          className="mw-path flex h-screen flex-col overflow-hidden"
          data-path-shell=""
          style={keyboardOverlap > 0 ? { paddingBottom: keyboardOverlap } : undefined}
        >
          {compact && train ? (
            <div className="path-live-bar">
              <Link href="/log" className="path-nav-link">
                {t('navToday', { defaultValue: 'Today' })}
              </Link>
              {liveName ? <span className="path-live-name">{liveName}</span> : null}
            </div>
          ) : null}

          {compact ? (
            canvas
          ) : (
            <div className="path-desktop">
              <PathWordNav items={items} pathname={pathname} placement="side" />
              {canvas}
            </div>
          )}

          <div id={SCREEN_DOCK_HOST_ID} className="path-dock" />
          <div id={CONSENT_BANNER_HOST_ID} className="path-consent" />
          {compact && !train ? (
            <PathWordNav items={items} pathname={pathname} placement="floor" />
          ) : null}
        </div>
      </TooltipProvider>
    </JourneyGuard>
  );
}
