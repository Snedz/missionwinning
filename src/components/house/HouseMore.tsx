'use client';

/**
 * Rest of the house — not the old WEDGE / Pillars / Toolkit sheet.
 * /server stays a quiet foot link, never a rail icon.
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

const ROOMS = [
  { href: '/nutrition', labelKey: 'navFuel', label: 'Fuel' },
  { href: '/profile', labelKey: 'navYou', label: 'You' },
  { href: '/account', labelKey: 'navAccount', label: 'Account' },
] as const;

const QUIET = [
  { href: '/move', labelKey: 'navMove', label: 'Move' },
  { href: '/mind', labelKey: 'navMind', label: 'Mind' },
  { href: '/track', labelKey: 'navTrack', label: 'Track' },
  { href: '/learn', labelKey: 'navLearn', label: 'Learn' },
  { href: '/feedback', labelKey: 'navFeedback', label: 'Feedback' },
] as const;

const LATER = [{ href: '/server', labelKey: 'navGarage', label: 'Garage' }] as const;

type Props = {
  open: boolean;
  onClose: () => void;
};

export function HouseMore({ open, onClose }: Props) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="house-more" role="dialog" aria-modal="true" aria-label={t('navMore', { defaultValue: 'More' })}>
      <button type="button" className="house-more-scrim" aria-label={t('navMore', { defaultValue: 'More' })} onClick={onClose} />
      <div className="house-more-panel">
        <div className="house-row">
          <h2 className="house-side-title" style={{ margin: 0 }}>
            {t('navMore', { defaultValue: 'More' })}
          </h2>
          <button type="button" className="house-btn house-btn-ghost" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <nav className="house-side-nav" style={{ marginTop: 16 }}>
          {ROOMS.map((row) => (
            <Link key={row.href} href={row.href} className="house-side-link" onClick={onClose}>
              {t(row.labelKey, { defaultValue: row.label })}
            </Link>
          ))}
        </nav>
        <div className="house-more-quiet">
          {QUIET.map((row) => (
            <Link key={row.href} href={row.href} onClick={onClose}>
              {t(row.labelKey, { defaultValue: row.label })}
            </Link>
          ))}
          {LATER.map((row) => (
            <span key={row.href} className="house-more-locked">
              {t(row.labelKey, { defaultValue: row.label })}
              <span className="house-lock">
                <span className="house-lock-tip" role="tooltip">
                  {t('houseGarageLock', { defaultValue: 'Garage is later — Train and Today come first.' })}
                </span>
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
