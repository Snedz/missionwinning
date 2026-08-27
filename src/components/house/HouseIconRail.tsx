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

export function HouseIconRail({ onOpenMore, moreOpen = false, floor = false }: Props) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const live = useActiveWorkoutPulse();
  const cls = floor ? 'house-floor' : 'house-rail';

  const items = [
    {
      href: HOUSE_RAIL_HREFS.home,
      label: t('navToday', { defaultValue: 'Today' }),
      icon: Home,
    },
    {
      href: HOUSE_RAIL_HREFS.train,
      label: t('navTrain', { defaultValue: 'Train' }),
      icon: Plus,
      plus: true,
    },
    {
      href: HOUSE_RAIL_HREFS.library,
      label: t('navLibrary', { defaultValue: 'Library' }),
      icon: BookOpen,
    },
  ];

  return (
    <nav aria-label={t('navToday', { defaultValue: 'Today' })} className={cls}>
      {!floor && (
        <div className="house-rail-top">
          <Link
            href={HOUSE_RAIL_HREFS.home}
            className="house-rail-mark"
            aria-label={t('navToday', { defaultValue: 'Today' })}
          >
            <BrandMonogram className="h-7 w-7 text-sm" />
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
              style={{ position: 'relative' }}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {href === HOUSE_RAIL_HREFS.train && live ? (
                <span className="house-rail-dot" aria-hidden />
              ) : null}
            </Link>
          );
        })}
        {floor ? (
          <Link
            href={HOUSE_RAIL_HREFS.account}
            aria-label={t('navAccount', { defaultValue: 'Account' })}
            aria-current={housePathActive(pathname, HOUSE_RAIL_HREFS.account) ? 'page' : undefined}
            className={`house-rail-btn${housePathActive(pathname, HOUSE_RAIL_HREFS.account) ? ' is-on' : ''}`}
          >
            <span className="house-rail-avatar" aria-hidden>
              M
            </span>
          </Link>
        ) : null}
        <button
          type="button"
          className={`house-rail-btn${moreOpen ? ' is-on' : ''}`}
          aria-label={t('navMore', { defaultValue: 'More' })}
          aria-expanded={moreOpen}
          onClick={onOpenMore}
        >
          <MoreVertical className="h-5 w-5" aria-hidden />
        </button>
      </div>
      {!floor && (
        <div className="house-rail-end">
          <Link
            href={HOUSE_RAIL_HREFS.account}
            aria-label={t('navAccount', { defaultValue: 'Account' })}
            aria-current={housePathActive(pathname, HOUSE_RAIL_HREFS.account) ? 'page' : undefined}
            className={`house-rail-btn${housePathActive(pathname, HOUSE_RAIL_HREFS.account) ? ' is-on' : ''}`}
          >
            <span className="house-rail-avatar" aria-hidden>
              M
            </span>
          </Link>
        </div>
      )}
    </nav>
  );
}
