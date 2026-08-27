'use client';

/**
 * Adjacent second bar — left column next to the icon rail.
 * Home rooms by default. A deeper step may replace this bar with a
 * titled back-chevron pane. Not HouseMore on the far right.
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BookOpen, CalendarDays, ChevronLeft, Clock, Layers, Map, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  HOUSE_LIBRARY_ROOMS,
  HOUSE_TODAY_ROOMS,
  houseRoomHref,
  isHouseCatalogPath,
  isHouseTodayFamilyPath,
  isHouseTodayPath,
} from './houseNav';
import { useHousePane } from './HousePane';

const TODAY_ICONS = {
  start: Play,
  week: CalendarDays,
  history: Clock,
  plan: Map,
} as const;

const LIBRARY_ICONS = {
  library: BookOpen,
  builder: Layers,
} as const;

export function HouseSecondRail() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { pane, openPane, closePane } = useHousePane();
  const [hash, setHash] = useState('');
  const catalog = isHouseCatalogPath(pathname);
  const todayFamily = isHouseTodayFamilyPath(pathname);

  useEffect(() => {
    const sync = () => setHash(window.location.hash.replace(/^#/, ''));
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [pathname]);

  if (!todayFamily && !catalog) return null;

  const weekPane = !catalog && pane === 'week';
  const title = weekPane
    ? t('houseWeekPaneTitle', { defaultValue: 'This week' })
    : catalog
      ? t('navLibrary', { defaultValue: 'Library' })
      : t('navToday', { defaultValue: 'Today' });
  const rooms = catalog ? HOUSE_LIBRARY_ROOMS : HOUSE_TODAY_ROOMS;

  return (
    <nav
      className={`house-second${weekPane ? ' is-pane' : ''}`}
      data-testid="house-second-rail"
      data-house-pane={weekPane ? 'week' : undefined}
      aria-label={title}
    >
      <div className="house-second-body" key={weekPane ? 'week' : catalog ? 'library' : 'today'}>
        {weekPane ? (
          <>
            <div className="house-second-pane-head">
              <button
                type="button"
                className="house-second-back"
                data-testid="house-second-back"
                aria-label={t('navToday', { defaultValue: 'Today' })}
                onClick={closePane}
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <div>
                <h2 className="house-second-pane-title">{title}</h2>
                <p className="house-second-pane-blurb">
                  {t('houseWeekPaneBlurb', { defaultValue: 'Coach writes the next session from your logs.' })}
                </p>
              </div>
            </div>
            <div className="house-second-nav">
              <Link href="/log#today-week" className="house-second-link">
                {t('houseWeekPaneToday', { defaultValue: 'Today on the canvas' })}
              </Link>
              <Link href="/coach" className="house-second-link">
                {t('houseWeekPanePlan', { defaultValue: 'Weekly plan' })}
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="house-second-kicker">{title}</p>
            <div className="house-second-nav">
              {rooms.map((row) => {
                const href = 'hash' in row ? houseRoomHref(row.href, row.hash) : row.href;
                const Icon =
                  row.id in TODAY_ICONS
                    ? TODAY_ICONS[row.id as keyof typeof TODAY_ICONS]
                    : LIBRARY_ICONS[row.id as keyof typeof LIBRARY_ICONS];
                const on = roomIsOn(pathname, hash, row);
                return (
                  <Link
                    key={row.id}
                    href={href}
                    className={`house-second-link${on ? ' is-on' : ''}`}
                    aria-current={on ? 'page' : undefined}
                    data-house-room={row.id}
                    onClick={() => {
                      if (row.id === 'week') openPane('week');
                    }}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {t(row.labelKey, { defaultValue: row.label })}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

function roomIsOn(
  pathname: string,
  hash: string,
  row: { href: string; id: string; hash?: string }
): boolean {
  if (row.href === '/log') {
    if (!isHouseTodayPath(pathname)) return false;
    if (row.hash === 'today-week') return hash === 'today-week';
    return hash !== 'today-week';
  }
  return pathname === row.href || pathname.startsWith(`${row.href}/`);
}
