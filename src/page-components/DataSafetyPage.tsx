'use client';
/**
 * Page: /data-safety — the store-listing summary of what the app does with data.
 * This is the URL Google Play can link for the data-safety question; the Privacy
 * Policy stays the binding document. Plain language, no forms, no trackers.
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { infoEnFloor } from '@/i18n/infoEnFloor';

const DATA_SAFETY_DATE = 'October 14, 2026';

const DATA_SAFETY_SECTIONS = [
  { id: 'local-first', key: 'infoDataSafetyLocalTitle', bodyKey: 'infoDataSafetyLocalBody' },
  { id: 'coach', key: 'infoDataSafetyCoachTitle', bodyKey: 'infoDataSafetyCoachBody' },
  { id: 'sync', key: 'infoDataSafetySyncTitle', bodyKey: 'infoDataSafetySyncBody' },
  { id: 'health', key: 'infoDataSafetyHealthTitle', bodyKey: 'infoDataSafetyHealthBody' },
  {
    id: 'not-collected',
    key: 'infoDataSafetyNotTitle',
    listKeys: [
      'infoDataSafetyNotLi1',
      'infoDataSafetyNotLi2',
      'infoDataSafetyNotLi3',
      'infoDataSafetyNotLi4',
    ],
  },
  { id: 'purchases', key: 'infoDataSafetyPurchasesTitle', bodyKey: 'infoDataSafetyPurchasesBody' },
  { id: 'security', key: 'infoDataSafetySecurityTitle', bodyKey: 'infoDataSafetySecurityBody' },
  { id: 'requests', key: 'infoDataSafetyContactTitle', bodyKey: 'infoDataSafetyContactBody' },
] as const;

export function DataSafetyPage() {
  const { t } = useTranslation();

  return (
    <InfoPageShell
      icon={ShieldCheck}
      eyebrow={t('infoLegalEyebrow', { defaultValue: 'Legal' })}
      title={t('infoDataSafetyTitle', { defaultValue: infoEnFloor('infoDataSafetyTitle') })}
      subtitle={t('infoDataSafetySubtitle', { defaultValue: infoEnFloor('infoDataSafetySubtitle') })}
      lastUpdated={`${t('infoLastUpdatedLabel', { defaultValue: 'Last updated:' })} ${DATA_SAFETY_DATE}`}
      variant="sections"
      showLegalFooter
    >
      <nav className="flex flex-wrap gap-2 text-xs" aria-label={t('infoDataSafetyTitle', { defaultValue: 'App data safety' })}>
        {DATA_SAFETY_SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="house-state">
            {t(s.key, { defaultValue: infoEnFloor(s.key) })}
          </a>
        ))}
      </nav>

      {DATA_SAFETY_SECTIONS.map((section) => (
        <section key={section.id} id={section.id} className="house-card space-y-3">
          <h2 className="font-semibold">{t(section.key, { defaultValue: infoEnFloor(section.key) })}</h2>
          {'listKeys' in section ? (
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              {section.listKeys.map((liKey) => (
                <li key={liKey}>{t(liKey, { defaultValue: infoEnFloor(liKey) })}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t(section.bodyKey, { defaultValue: infoEnFloor(section.bodyKey) })}
            </p>
          )}
          {section.id === 'requests' && (
            <p className="text-xs text-muted-foreground">
              <a href="/privacy" className="underline underline-offset-2">
                {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
              </a>
              {' · '}
              <a href="/terms" className="underline underline-offset-2">
                {t('termsOfService', { defaultValue: 'Terms of Service' })}
              </a>
            </p>
          )}
        </section>
      ))}

      <p className="text-xs text-muted-foreground pt-2">
        {t('infoDataSafetyFoot', { defaultValue: infoEnFloor('infoDataSafetyFoot') })}
      </p>
    </InfoPageShell>
  );
}
