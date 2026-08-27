'use client';

/**
 * Signed-in product house. Replaces AppLayout / Sidebar / MobileNav / AppHeader
 * as first-paint chrome. Engines (journey sync, outbox drain) stay mounted.
 */

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { JourneyGuard } from '@/components/journey/JourneyGuard';
import { JourneySyncBoot } from '@/components/layout/JourneySyncBoot';
import { PageTransition } from '@/components/layout/PageTransition';
import { CONSENT_BANNER_HOST_ID, SCREEN_DOCK_HOST_ID } from '@/components/layout/ScreenDock';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useVisualViewportKeyboardOverlap } from '@/hooks/useVisualViewportKeyboardOverlap';
import { recordScreen } from '@/lib/screenTrail';
import { useWorkoutStore } from '@/store/workoutStore';
import { AccountSidecar } from './AccountSidecar';
import { HouseGuide } from './HouseGuide';
import { HouseIconRail } from './HouseIconRail';
import { HouseMore } from './HouseMore';
import { HousePaneProvider } from './HousePane';
import { HouseSecondRail } from './HouseSecondRail';
import {
  HOUSE_RAIL_HREFS,
  houseCanvasTitle,
  houseSecondDockForPath,
  isHouseAccountPath,
  isHouseCatalogPath,
  isHouseTrainPath,
} from './houseNav';
import { TrainSidecar } from './TrainSidecar';
import './house.css';

const CommissioningCeremony = dynamic(
  () =>
    import('@/components/journey/CommissioningCeremony').then((m) => ({
      default: m.CommissioningCeremony,
    })),
  { ssr: false }
);


export function HouseShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const [moreOpen, setMoreOpen] = useState(false);
  const openMore = useCallback(() => setMoreOpen(true), []);
  const closeMore = useCallback(() => setMoreOpen(false), []);
  const openHome = useCallback(() => {
    setMoreOpen(false);
    router.push(HOUSE_RAIL_HREFS.home);
  }, [router]);
  const openLibrary = useCallback(() => {
    setMoreOpen(false);
    router.push(HOUSE_RAIL_HREFS.library);
  }, [router]);
  const keyboardOverlap = useVisualViewportKeyboardOverlap();
  const train = isHouseTrainPath(pathname);
  const compose = train;
  const catalog = isHouseCatalogPath(pathname);
  const account = isHouseAccountPath(pathname);
  const dock = !compose ? houseSecondDockForPath(pathname) : null;
  const transferred = Boolean(dock);
  const canvasTitle = houseCanvasTitle(pathname);
  const liveName = useWorkoutStore((s) => s.activeWorkout?.workoutName);

  useEffect(() => {
    setMoreOpen(false);
    recordScreen(pathname);
  }, [pathname]);

  const padClass = [
    'house-canvas-pad',
    compose || train ? 'is-flush' : '',
    !compose && (catalog || account) ? 'is-wide' : '',
    transferred ? 'is-transferred' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <JourneyGuard>
      <TooltipProvider delayDuration={300}>
        <HousePaneProvider>
        <CommissioningCeremony />
        <JourneySyncBoot />
        <div
          className="mw-house flex h-screen flex-col overflow-hidden"
          style={keyboardOverlap > 0 ? { paddingBottom: keyboardOverlap } : undefined}
        >
          {compose ? (
            <div className="house-compose-bar">
              <button
                type="button"
                className="house-btn house-btn-ghost"
                aria-label={t('navToday', { defaultValue: 'Today' })}
                onClick={() => router.push('/log')}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              <span className="house-saved">
                {liveName ? `${liveName} · Saved` : 'Saved'}
              </span>
              <div className="house-compose-bar-end">
                <button type="button" className="house-btn" onClick={openMore}>
                  {t('navMore', { defaultValue: 'More' })}
                </button>
              </div>
            </div>
          ) : null}
          <div
            className={`house-frame${dock ? ' is-second' : ''}${compose ? ' is-compose' : ''}`}
            data-house-frame={dock ? 'second-left' : 'rail'}
            style={{ flex: 1, minHeight: 0 }}
          >
            {compose ? null : (
              <HouseIconRail
                onOpenMore={openMore}
                onOpenHome={openHome}
                onOpenLibrary={openLibrary}
                moreOpen={moreOpen}
              />
            )}
            {dock ? <HouseSecondRail dock={dock} /> : null}
            <div className={`house-stage${compose || train ? ' is-compose' : ''}`}>
              <main className="house-canvas">
                <div className={padClass} data-house-transferred={transferred ? '1' : undefined}>
                  {canvasTitle ? <h1 className="sr-only">{canvasTitle}</h1> : null}
                  <PageTransition>{children}</PageTransition>
                </div>
              </main>
              {train ? <TrainSidecar /> : null}
              {account ? <AccountSidecar /> : null}
            </div>
          </div>
          <div id={SCREEN_DOCK_HOST_ID} className="house-dock" />
          <div id={CONSENT_BANNER_HOST_ID} className="house-consent" />
          {compose ? null : (
            <HouseIconRail
              onOpenMore={openMore}
              onOpenHome={openHome}
              onOpenLibrary={openLibrary}
              moreOpen={moreOpen}
              floor
            />
          )}
          <HouseGuide />
          <HouseMore open={moreOpen} onClose={closeMore} />
        </div>
        </HousePaneProvider>
      </TooltipProvider>
    </JourneyGuard>
  );
}
