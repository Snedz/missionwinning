'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export function CatalogTabs() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const libraryOn = pathname === '/library' || pathname.startsWith('/library/');
  const builderOn = pathname === '/builder' || pathname.startsWith('/builder/');

  return (
    <div className="house-tabs" role="tablist" aria-label={t('navLibrary', { defaultValue: 'Library' })}>
      <Link
        href="/library"
        role="tab"
        aria-selected={libraryOn}
        className={`house-tab${libraryOn ? ' is-on' : ''}`}
      >
        {t('navLibrary', { defaultValue: 'Library' })}
      </Link>
      <Link
        href="/builder"
        role="tab"
        aria-selected={builderOn}
        className={`house-tab${builderOn ? ' is-on' : ''}`}
      >
        {t('navBuilder', { defaultValue: 'Builder' })}
      </Link>
    </div>
  );
}
