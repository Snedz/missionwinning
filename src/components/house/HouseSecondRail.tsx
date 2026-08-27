'use client';

/**
 * Adjacent second bar — left column next to the icon rail.
 * Not HouseMore on the far right. Not a following feed.
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BookOpen, CalendarDays, Clock, Layers, Map, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  HOUSE_LIBRARY_ROOMS,
  HOUSE_TODAY_ROOMS,
  houseRoomHref,
  isHouseCatalogPath,
  isHouseTodayFamilyPath,
  isHouseTodayPath,
} from './houseNav';

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

  const title = catalog
    ? t('navLibrary', { defaultValue: 'Library' })
    : t('navToday', { defaultValue: 'Today' });
  const rooms = catalog ? HOUSE_LIBRARY_ROOMS : HOUSE_TODAY_ROOMS;

  return (
    <nav className="house-second" data-testid="house-second-rail" aria-label={title}>
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
            >
              <Icon className="h-4 w-4" aria-hidden />
              {t(row.labelKey, { defaultValue: row.label })}
            </Link>
          );
        })}
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
