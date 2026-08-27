'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const ROOM = [
  { href: '/account', labelKey: 'navAccount', label: 'Account' },
  { href: '/profile', labelKey: 'navYou', label: 'You' },
  { href: '/history', labelKey: 'navHistory', label: 'History' },
  { href: '/coach', labelKey: 'navCoach', label: 'Coach' },
] as const;

export function AccountSidecar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside className="house-sidecar is-open" aria-label={t('navAccount', { defaultValue: 'Account' })}>
      <h2 className="house-side-title">{t('navAccount', { defaultValue: 'Account' })}</h2>
      <nav className="house-side-nav">
        {ROOM.map((row) => {
          const on = pathname === row.href || pathname.startsWith(`${row.href}/`);
          return (
            <Link
              key={row.href}
              href={row.href}
              className={`house-side-link${on ? ' is-on' : ''}`}
            >
              {t(row.labelKey, { defaultValue: row.label })}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
