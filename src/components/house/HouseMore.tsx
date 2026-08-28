'use client';

/**
 * Rest of the house — leftover rooms, not the Home second bar.
 * /server stays a quiet foot link, never a rail icon.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { HOUSE_MORE_QUIET, HOUSE_MORE_ROOMS } from './houseNav';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function HouseMore({ open, onClose }: Props) {
  const { t } = useTranslation();
  const pathname = usePathname();
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
          {HOUSE_MORE_ROOMS.map((row) => {
            const on = pathname === row.href || pathname.startsWith(`${row.href}/`);
            return (
              <Link
                key={row.href}
                href={row.href}
                className={`house-side-link${on ? ' is-on' : ''}`}
                onClick={onClose}
              >
                {t(row.labelKey, { defaultValue: row.label })}
              </Link>
            );
          })}
        </nav>
        <div className="house-more-quiet">
          {HOUSE_MORE_QUIET.map((row) => (
            <Link key={row.href} href={row.href} onClick={onClose}>
              {t(row.labelKey, { defaultValue: row.label })}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
