'use client';

import Link from 'next/link';
import { BookOpen, CalendarDays, Clock, Home, MoreHorizontal, Plus, User } from 'lucide-react';
import { createContext, useContext, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { BrandMonogram } from '@/components/brand/BrandMonogram';

const rooms = [
  ['/log', 'navToday', 'Today', Home],
  ['/active', 'navTrain', 'Train', Plus],
  ['/coach', 'navCoach', 'Weekly plan', CalendarDays],
  ['/history', 'navHistory', 'History', Clock],
  ['/library', 'navLibrary', 'Library', BookOpen],
  ['/account', 'navAccount', 'Account', User],
] as const;

export const HouseDesktopPreview = createContext(false);

const desktopQuery = '(min-width: 1024px)';
function subscribeDesktop(change: () => void) {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener('change', change);
  return () => query.removeEventListener('change', change);
}

export function useHouseDesktopPreview() {
  const preview = useContext(HouseDesktopPreview);
  const desktop = useSyncExternalStore(subscribeDesktop, () => window.matchMedia(desktopQuery).matches, () => false);
  return preview && desktop;
}

export function HouseDesktopTodayLinks({ hasWeekPlan, nextSession, lastWorkout }: {
  hasWeekPlan: boolean;
  nextSession?: string;
  lastWorkout?: string;
}) {
  const preview = useContext(HouseDesktopPreview);
  const { t } = useTranslation();
  if (!preview) return null;
  return (
    <div className="desktop-preview-today-links">
      <section className="house-card">
        <h2 className="house-kicker">{t('navCoach', { defaultValue: 'Weekly plan' })}</h2>
        <p className="house-lede">
          {nextSession || (hasWeekPlan
            ? t('coachNoSessionsLeftThisWeek', { defaultValue: 'No sessions left this week' })
            : t('coachGenerateEmptyTitle', { defaultValue: 'No plan this week' }))}
        </p>
        <Link className="house-btn" href="/coach">{t('coachPageTitle', { defaultValue: 'Mission Coach' })}</Link>
      </section>
      <section className="house-card">
        <h2 className="house-kicker">{t('navHistory', { defaultValue: 'History' })}</h2>
        {lastWorkout ? <p className="house-lede">{lastWorkout}</p> : null}
        <Link className="house-btn" href="/history">{t('navHistory', { defaultValue: 'History' })}</Link>
      </section>
    </div>
  );
}

export function HouseDesktopRail({ pathname, onOpenMore, moreOpen }: {
  pathname: string;
  onOpenMore?: () => void;
  moreOpen: boolean;
}) {
  const { t } = useTranslation();
  return (
    <aside className="desktop-preview-rail">
      <Link href="/log" className="desktop-preview-brand">
        <BrandMonogram className="h-8 w-8" />
        <span>Mission Winning</span>
      </Link>
      <nav aria-label="Mission Winning">
        {rooms.map(([href, key, defaultValue, Icon]) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            <span>{t(key, { defaultValue: defaultValue })}</span>
          </Link>
        ))}
        {onOpenMore ? (
          <button type="button" onClick={onOpenMore} aria-expanded={moreOpen} data-house-rail-open="more">
            <MoreHorizontal className="h-5 w-5 shrink-0" aria-hidden />
            <span>{t('navMore', { defaultValue: 'More' })}</span>
          </button>
        ) : null}
      </nav>
    </aside>
  );
}
