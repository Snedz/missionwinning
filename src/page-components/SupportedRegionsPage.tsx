'use client';
/**
 * Page: /regions — leftover supported-regions policy.
 * Quiet Account / legal door. Never a rail.
 * Europe, Canada, Ukraine, OIC not supported.
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Globe2 } from 'lucide-react';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { infoEnFloor } from '@/i18n/infoEnFloor';
import {
  EUROPE_UNSUPPORTED_ISO2,
  EXTRA_UNSUPPORTED_ISO2,
  OIC_UNSUPPORTED_ISO2,
  REGION_POLICY,
} from '@/lib/legal/supportedRegions';

const REGION_SECTIONS = [
  { id: 'summary', key: 'infoRegionsSummary', bodyKey: 'infoRegionsSummaryBody' },
  { id: 'supported', key: 'infoRegionsSupported', bodyKey: 'infoRegionsSupportedBody' },
  { id: 'not-supported', key: 'infoRegionsNotSupported', bodyKey: 'infoRegionsNotSupportedBody' },
  { id: 'what-counts', key: 'infoRegionsWhatCounts', bodyKey: 'infoRegionsWhatCountsBody' },
  { id: 'oss', key: 'infoRegionsOss', bodyKey: 'infoRegionsOssBody' },
  { id: 'enforcement', key: 'infoRegionsEnforcement', bodyKey: 'infoRegionsEnforcementBody' },
] as const;

function sortedCodes(list: readonly string[]): string {
  return [...list]
    .filter((c) => c !== 'UK')
    .sort()
    .join(', ');
}

export function SupportedRegionsPage() {
  const { t } = useTranslation();
  const europeCodes = sortedCodes(EUROPE_UNSUPPORTED_ISO2);
  const extraCodes = sortedCodes(EXTRA_UNSUPPORTED_ISO2);
  const oicCodes = sortedCodes(OIC_UNSUPPORTED_ISO2);

  return (
    <InfoPageShell
      className="house-regions"
      icon={Globe2}
      eyebrow={t('infoLegalEyebrow', { defaultValue: 'Legal' })}
      title={t('infoRegionsTitle', { defaultValue: infoEnFloor('infoRegionsTitle') })}
      lastUpdated={t('infoLastUpdated', { defaultValue: 'Last updated: 13 August 2026' })}
      variant="sections"
      showLegalFooter
    >
      {/* Quiet leftover: posture + jump chips + sections. Legal copy unchanged. */}
      <section className="house-card space-y-3">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{REGION_POLICY.marketPosture} platform.</strong>{' '}
          {REGION_POLICY.summary}
        </p>
      </section>

      <nav
        className="house-regions-jump"
        aria-label={t('infoRegionsTitle', { defaultValue: infoEnFloor('infoRegionsTitle') })}
      >
        {REGION_SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="house-state">
            {t(s.key, { defaultValue: infoEnFloor(s.key) })}
          </a>
        ))}
      </nav>

      {REGION_SECTIONS.map((section) => (
        <section key={section.id} id={section.id} className="house-card space-y-3">
          <h2 className="font-semibold">{t(section.key, { defaultValue: infoEnFloor(section.key) })}</h2>
          <p className="text-sm text-muted-foreground">
            {t(section.bodyKey, { defaultValue: infoEnFloor(section.bodyKey) })}
          </p>
          {section.id === 'not-supported' && (
            <div className="mt-3 space-y-3 text-xs text-muted-foreground font-mono break-words">
              <p>
                <span className="font-sans font-semibold text-foreground not-italic">
                  {t('infoRegionsIsoEuropeLabel', { defaultValue: infoEnFloor('infoRegionsIsoEuropeLabel') })}
                </span>{' '}
                {europeCodes}
              </p>
              <p>
                <span className="font-sans font-semibold text-foreground not-italic">
                  {t('infoRegionsIsoExtraLabel', { defaultValue: infoEnFloor('infoRegionsIsoExtraLabel') })}
                </span>{' '}
                {extraCodes}
              </p>
              <p>
                <span className="font-sans font-semibold text-foreground not-italic">
                  {t('infoRegionsIsoOicLabel', { defaultValue: infoEnFloor('infoRegionsIsoOicLabel') })}
                </span>{' '}
                {oicCodes}
              </p>
            </div>
          )}
        </section>
      ))}

      <p className="text-xs text-muted-foreground pt-2">
        {t('infoRegionsFoot', { defaultValue: infoEnFloor('infoRegionsFoot') })}{' '}
        <Link href="/terms" className="underline underline-offset-2">
          {t('termsOfService', { defaultValue: 'Terms of Service' })}
        </Link>
        {' · '}
        <Link href="/privacy" className="underline underline-offset-2">
          {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
        </Link>
        {' · '}
        <Link href="/service-terms" className="underline underline-offset-2">
          {t('infoServiceTermsTitle', { defaultValue: infoEnFloor('infoServiceTermsTitle') })}
        </Link>
      </p>
    </InfoPageShell>
  );
}
