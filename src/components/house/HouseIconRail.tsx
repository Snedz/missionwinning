'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Home, MoreVertical, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BrandMonogram } from '@/components/brand/BrandMonogram';
import { useActiveWorkoutPulse } from '@/hooks/useActiveWorkoutPulse';
import { HOUSE_RAIL_HREFS, housePathActive } from './houseNav';

type Props = {
  onOpenMore: () => void;
  moreOpen?: boolean;
  floor?: boolean;
};

function RailTip({ label, floor }: { label: string; floor?: boolean }) {
  return (
    <span className={`house-rail-tip${floor ? ' is-floor' : ''}`} role="tooltip">
      {label}
    </span>
  );
}

export function HouseIconRail({ onOpenMore, moreOpen = false, floor = false }: Props) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const live = useActiveWorkoutPulse();
  const cls = floor ? 'house-floor' : 'house-rail';
  const todayLabel = t('navToday', { defaultValue: 'Today' });
  const trainLabel = t('navTrain', { defaultValue: 'Train' });
  const libraryLabel = t('navLibrary', { defaultValue: 'Library' });
  const youLabel = t('navYou', { defaultValue: 'You' });
  const moreLabel = t('navMore', { defaultValue: 'More' });

  const items = [
    {
      href: HOUSE_RAIL_HREFS.home,
      label: todayLabel,
      icon: Home,
    },
    {
      href: HOUSE_RAIL_HREFS.train,
      label: trainLabel,
      icon: Plus,
      plus: true,
    },
    {
      href: HOUSE_RAIL_HREFS.library,
      label: libraryLabel,
      icon: BookOpen,
    },
  ];
  const accountOn = housePathActive(pathname, HOUSE_RAIL_HREFS.account);

  return (
    <nav aria-label={todayLabel} className={cls}>
      {!floor && (
        <div className="house-rail-top">
          <Link
            href={HOUSE_RAIL_HREFS.home}
            className="house-rail-mark"
            aria-label={todayLabel}
          >
            <BrandMonogram className="h-7 w-7 text-sm" />
            <RailTip label={todayLabel} />
          </Link>
        </div>
      )}
      <div className={floor ? undefined : 'house-rail-mid'} style={floor ? { display: 'contents' } : undefined}>
        {items.map(({ href, label, icon: Icon, plus }) => {
          const on = housePathActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={on ? 'page' : undefined}
              className={`house-rail-btn${plus ? ' house-rail-plus' : ''}${on ? ' is-on' : ''}`}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {href === HOUSE_RAIL_HREFS.train && live ? (
                <span className="house-rail-dot" aria-hidden />
              ) : null}
              <RailTip label={label} floor={floor} />
            </Link>
          );
        })}
        <Link
          href={HOUSE_RAIL_HREFS.account}
          aria-label={youLabel}
          aria-current={accountOn ? 'page' : undefined}
          className={`house-rail-btn${accountOn ? ' is-on' : ''}`}
        >
          <span className="house-rail-avatar" aria-hidden>
            M
          </span>
          <RailTip label={youLabel} floor={floor} />
        </Link>
        <button
          type="button"
          className={`house-rail-btn${moreOpen ? ' is-on' : ''}`}
          aria-label={moreLabel}
          aria-expanded={moreOpen}
          onClick={onOpenMore}
        >
          <MoreVertical className="h-5 w-5" aria-hidden />
          <RailTip label={moreLabel} floor={floor} />
        </button>
      </div>
      {!floor && <div className="house-rail-end" />}
    </nav>
  );
}
