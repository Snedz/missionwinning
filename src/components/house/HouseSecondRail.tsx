'use client';

/**
 * Adjacent second bar — left column next to the icon rail.
 * Home rooms by default. A deeper step may replace this bar with a
 * titled back-chevron pane. Not HouseMore on the far right.
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, CalendarDays, ChevronLeft, Clock, Layers, Map, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { loadPlan } from '@/lib/coach/storage';
import { currentWeekStart, todayDayOffset } from '@/lib/coach/splitPlanner';
import {
  HOUSE_LIBRARY_ROOMS,
  HOUSE_TODAY_ROOMS,
  houseRoomHref,
  isHouseTodayPath,
  type HouseSecondDock,
} from './houseNav';
import { useHousePane } from './HousePane';
import { writeTodayComposeSession } from '@/lib/workout/writeTodayComposeSession';

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

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

type Props = {
  dock: HouseSecondDock;
};

export function HouseSecondRail({ dock }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { pane, openPane, closePane } = useHousePane();
  const [hash, setHash] = useState('');
  const catalog = dock === 'library';

  useEffect(() => {
    const sync = () => setHash(window.location.hash.replace(/^#/, ''));
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [pathname]);

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
      data-house-second-dock="left"
      data-house-pane={weekPane ? 'week' : undefined}
      aria-label={title}
    >
      <div className="house-second-body" key={weekPane ? 'week' : catalog ? 'library' : 'today'}>
        {weekPane ? (
          <HouseWeekPane title={title} onBack={closePane} />
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
                const weekClick = row.id === 'week';
                return (
                  <Link
                    key={row.id}
                    href={href}
                    className={`house-second-link${on ? ' is-on' : ''}`}
                    aria-current={on ? 'page' : undefined}
                    data-house-room={row.id}
                    onClick={(e) => {
                      if (row.id === 'start') {
                        e.preventDefault();
                        writeTodayComposeSession();
                        router.push('/active');
                        return;
                      }
                      if (weekClick) openPane('week');
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

function HouseWeekPane({ title, onBack }: { title: string; onBack: () => void }) {
  const { t } = useTranslation();
  const plan = loadPlan();
  const weekStart = currentWeekStart();
  const todayOff = todayDayOffset(weekStart);
  const weekDays = DAY_NAMES.map((name, offset) => {
    const session = plan?.sessions.find((s) => s.dayOffset === offset) ?? null;
    return { name, offset, session };
  });

  return (
    <>
      <div className="house-second-pane-head">
        <button
          type="button"
          className="house-second-back"
          data-testid="house-second-back"
          aria-label={t('navToday', { defaultValue: 'Today' })}
          onClick={onBack}
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
      <div className="house-second-week" data-testid="house-week-pane">
        {weekDays.map((day) => (
          <div
            key={day.name}
            className={`house-second-week-day${day.offset === todayOff ? ' is-today' : ''}${day.session ? ' is-set' : ''}`}
          >
            <span>{day.name}</span>
            <span>{day.session?.name ?? (day.offset === todayOff ? t('todayStartCta', { defaultValue: 'Start' }) : 'Rest')}</span>
          </div>
        ))}
      </div>
      <div className="house-second-nav">
        <Link href="/log" className="house-second-link">
          {t('houseWeekPaneToday', { defaultValue: 'Today on the canvas' })}
        </Link>
        <Link href="/coach" className="house-second-link" data-house-week-writer="generateWeek">
          {t('coachGenerateWeek', { defaultValue: 'Generate this week' })}
        </Link>
      </div>
    </>
  );
}

function roomIsOn(
  pathname: string,
  hash: string,
  row: { href: string; id: string; hash?: string }
): boolean {
  if (row.id === 'start') return false;
  if (row.href === '/log') {
    if (!isHouseTodayPath(pathname)) return false;
    if (row.hash === 'today-week') return hash === 'today-week';
    return hash !== 'today-week';
  }
  return pathname === row.href || pathname.startsWith(`${row.href}/`);
}
