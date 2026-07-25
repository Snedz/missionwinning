'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

// Modernist offline fallback (Error Pages.dc.html): the outage is the feature
// frame — "You're offline. The log isn't." A live waiting-to-sync count needs an
// outbox read from the service-worker fallback context; deferred to the Phase 3
// app-screen pass.
export function OfflineContent() {
  const { t } = useTranslation();

  const keepsWorking = [
    t('offlineKeeps1', { defaultValue: 'Logging sets on Train' }),
    t('offlineKeeps2', { defaultValue: 'Today and your history' }),
    t('offlineKeeps3', { defaultValue: "This week's Coach plan" }),
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-md">
        <p className="eyebrow-live mb-4">{t('offlineEyebrow', { defaultValue: 'No connection' })}</p>
        <h1 className="display-section mb-3">
          {t('offlineTitle', { defaultValue: "You're offline. The log isn't." })}
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          {t('offlineBody', {
            defaultValue:
              "This page isn't cached yet, but everything you've already used keeps working — your workouts live on this device and sync when you're back online.",
          })}
        </p>
        <div className="mb-6 border-2 border-border p-4">
          <p className="eyebrow mb-3">
            {t('offlineKeepsTitle', { defaultValue: 'Still works right now' })}
          </p>
          <ul className="space-y-1.5 text-sm">
            {keepsWorking.map((item) => (
              <li key={item} className="flex items-baseline gap-2">
                <span aria-hidden className="text-primary">
                  ·
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Link href="/log" className="primary-action">
          {t('offlineCta', { defaultValue: 'Open Today' })}
        </Link>
      </div>
    </div>
  );
}
