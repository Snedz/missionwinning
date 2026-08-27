'use client';

import { useTranslation } from 'react-i18next';

export function CatalogTabs() {
  const { t } = useTranslation();

  return (
    <div className="house-catalog-head">
      <h1 className="house-title">{t('navLibrary', { defaultValue: 'Library' })}</h1>
    </div>
  );
}
