'use client';
/**
 * Page: /usage — Acceptable Use / Usage Policy
 * See: docs/legal/ACCEPTABLE_USE.md (markdown source; this page is live consumer copy)
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';
import { InfoPageShell, InfoSection } from '@/components/layout/InfoPageShell';
import { infoEnFloor } from '@/i18n/infoEnFloor';

const SECTIONS = [
  { id: 'purpose', key: 'infoUsagePurpose', bodyKey: 'infoUsagePurposeBody' },
  { id: 'permitted', key: 'infoUsagePermitted', bodyKey: 'infoUsagePermittedBody' },
  {
    id: 'prohibited',
    key: 'infoUsageProhibited',
    listKeys: [
      'infoUsageProhibitedLi1',
      'infoUsageProhibitedLi2',
      'infoUsageProhibitedLi3',
      'infoUsageProhibitedLi4',
      'infoUsageProhibitedLi5',
      'infoUsageProhibitedLi6',
      'infoUsageProhibitedLi7',
    ],
  },
  { id: 'youth', key: 'infoUsageYouth', bodyKey: 'infoUsageYouthBody' },
  { id: 'self-host', key: 'infoUsageSelfHost', bodyKey: 'infoUsageSelfHostBody' },
  { id: 'enforcement', key: 'infoUsageEnforcement', bodyKey: 'infoUsageEnforcementBody' },
  { id: 'report', key: 'infoUsageReport', bodyKey: 'infoUsageReportBody' },
] as const;

export function UsagePolicyPage() {
  const { t } = useTranslation();
  const jumpLinks = SECTIONS.map((s) => ({
    id: s.id,
    label: t(s.key, { defaultValue: infoEnFloor(s.key) }),
  }));

  return (
    <InfoPageShell
      icon={ShieldAlert}
      eyebrow={t('infoLegalEyebrow', { defaultValue: 'Legal' })}
      title={t('infoUsageTitle', { defaultValue: 'Usage Policy' })}
      lastUpdated={t('infoLastUpdated', { defaultValue: 'Last updated: August 2026' })}
      showLegalFooter
      jumpLinks={jumpLinks}
    >
      <p className="text-sm text-muted-foreground -mt-2 mb-4">
        {t('infoUsageLead', {
          defaultValue:
            'This Usage Policy (Acceptable Use) applies with the Terms of Service. Hosted service availability is limited by Supported Regions.',
        })}{' '}
        <Link href="/terms" className="text-primary hover:underline">
          {t('termsOfService', { defaultValue: 'Terms of Service' })}
        </Link>
        {' · '}
        <Link href="/regions" className="text-primary hover:underline">
          {t('infoRegionsTitle', { defaultValue: 'Supported Regions' })}
        </Link>
      </p>

      {SECTIONS.map((section) => (
        <InfoSection key={section.id} id={section.id} title={t(section.key, { defaultValue: infoEnFloor(section.key) })}>
          {'listKeys' in section ? (
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              {section.listKeys.map((liKey) => (
                <li key={liKey}>{t(liKey, { defaultValue: infoEnFloor(liKey) })}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">{t(section.bodyKey, { defaultValue: infoEnFloor(section.bodyKey) })}</p>
          )}
        </InfoSection>
      ))}

      <p className="text-xs text-muted-foreground pt-2">
        {t('infoUsageFoot', {
          defaultValue: 'Report abuse: support@missionwinning.com (subject: AUP abuse) · See also',
        })}{' '}
        <Link href="/privacy" className="text-primary hover:underline">
          {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
        </Link>
      </p>
    </InfoPageShell>
  );
}
