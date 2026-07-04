'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function OfflineContent() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="content-card w-full max-w-md p-8 text-center">
        <p className="eyebrow mb-4">{t('offlineEyebrow', { defaultValue: 'No connection' })}</p>
        <h1 className="font-display mb-3 text-3xl font-semibold uppercase leading-none">
          {t('offlineTitle', { defaultValue: 'Offline — but not off mission.' })}
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          {t('offlineBody', {
            defaultValue:
              "This page isn't cached yet, but everything you've already used keeps working — your workouts live on this device and sync when you're back online.",
          })}
        </p>
        <Link href="/log" className="primary-action">
          {t('offlineCta', { defaultValue: 'Open Today' })}
        </Link>
      </div>
    </div>
  );
}
