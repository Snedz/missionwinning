'use client';
/**
 * Page: /regions — Supported Regions (Europe not supported)
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Globe2 } from 'lucide-react';
import { InfoPageShell, InfoSection } from '@/components/layout/InfoPageShell';
import { EUROPE_UNSUPPORTED_ISO2, REGION_POLICY } from '@/lib/legal/supportedRegions';

const SECTIONS = [
  { id: 'summary', key: 'infoRegionsSummary', bodyKey: 'infoRegionsSummaryBody' },
  { id: 'supported', key: 'infoRegionsSupported', bodyKey: 'infoRegionsSupportedBody' },
  { id: 'not-supported', key: 'infoRegionsNotSupported', bodyKey: 'infoRegionsNotSupportedBody' },
  { id: 'what-counts', key: 'infoRegionsWhatCounts', bodyKey: 'infoRegionsWhatCountsBody' },
  { id: 'oss', key: 'infoRegionsOss', bodyKey: 'infoRegionsOssBody' },
  { id: 'enforcement', key: 'infoRegionsEnforcement', bodyKey: 'infoRegionsEnforcementBody' },
] as const;

export function SupportedRegionsPage() {
  const { t } = useTranslation();
  const jumpLinks = SECTIONS.map((s) => ({
    id: s.id,
    label: t(s.key, { defaultValue: s.key }),
  }));

  const codes = [...EUROPE_UNSUPPORTED_ISO2]
    .filter((c) => c !== 'UK')
    .sort()
    .join(', ');

  return (
    <InfoPageShell
      icon={Globe2}
      eyebrow={t('infoLegalEyebrow', { defaultValue: 'Legal' })}
      title={t('infoRegionsTitle', { defaultValue: 'Supported Regions' })}
      lastUpdated={t('infoLastUpdated', { defaultValue: 'Last updated: August 2026' })}
      showLegalFooter
      jumpLinks={jumpLinks}
    >
      <p className="text-sm text-muted-foreground -mt-2 mb-4 border-2 border-border bg-muted/40 p-3">
        <strong className="text-foreground">{REGION_POLICY.primaryMarket} primary.</strong>{' '}
        {REGION_POLICY.summary}
      </p>

      {SECTIONS.map((section) => (
        <InfoSection key={section.id} id={section.id} title={t(section.key, { defaultValue: section.key })}>
          <p className="text-muted-foreground">{t(section.bodyKey, { defaultValue: section.bodyKey })}</p>
          {section.id === 'not-supported' && (
            <p className="mt-3 text-xs text-muted-foreground font-mono break-words">
              {t('infoRegionsIsoListLabel', {
                defaultValue: 'Reference ISO country codes (non-exhaustive aliases included in product logic):',
              })}{' '}
              {codes}
            </p>
          )}
        </InfoSection>
      ))}

      <p className="text-xs text-muted-foreground pt-2">
        {t('infoRegionsFoot', {
          defaultValue: 'Questions about eligibility: support@missionwinning.com · See also',
        })}{' '}
        <Link href="/terms" className="text-primary hover:underline">
          {t('termsOfService', { defaultValue: 'Terms of Service' })}
        </Link>
        {' · '}
        <Link href="/privacy" className="text-primary hover:underline">
          {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
        </Link>
        {' · '}
        <Link href="/service-terms" className="text-primary hover:underline">
          {t('infoServiceTermsTitle', { defaultValue: 'Service-Specific Terms' })}
        </Link>
      </p>
    </InfoPageShell>
  );
}
