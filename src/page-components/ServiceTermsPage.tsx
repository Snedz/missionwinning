'use client';
/**
 * Page: /service-terms — leftover service-specific terms.
 * Quiet Account / legal door. Never a rail.
 * Super Bundle, Coach AI, Android, human 1:1.
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FileStack } from 'lucide-react';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { infoEnFloor } from '@/i18n/infoEnFloor';

const SERVICE_SECTIONS = [
  { id: 'scope', key: 'infoServiceScope', bodyKey: 'infoServiceScopeBody' },
  { id: 'free-core', key: 'infoServiceFreeCore', bodyKey: 'infoServiceFreeCoreBody' },
  { id: 'super-bundle', key: 'infoServiceBundle', bodyKey: 'infoServiceBundleBody' },
  { id: 'coach', key: 'infoServiceCoach', bodyKey: 'infoServiceCoachBody' },
  { id: 'android', key: 'infoServiceAndroid', bodyKey: 'infoServiceAndroidBody' },
  { id: 'human-coach', key: 'infoServiceHumanCoach', bodyKey: 'infoServiceHumanCoachBody' },
  { id: 'regions', key: 'infoServiceRegions', bodyKey: 'infoServiceRegionsBody' },
  { id: 'order', key: 'infoServiceOrder', bodyKey: 'infoServiceOrderBody' },
] as const;

export function ServiceTermsPage() {
  const { t } = useTranslation();

  return (
    <InfoPageShell
      className="house-service-terms"
      icon={FileStack}
      eyebrow={t('infoLegalEyebrow', { defaultValue: 'Legal' })}
      title={t('infoServiceTermsTitle', { defaultValue: infoEnFloor('infoServiceTermsTitle') })}
      lastUpdated={t('infoLastUpdated', { defaultValue: 'Last updated: 13 August 2026' })}
      variant="sections"
      showLegalFooter
    >
      {/* Quiet leftover: lead + jump chips + sections. Legal copy unchanged. */}
      <section className="house-card space-y-3">
        <p className="text-sm text-muted-foreground">
          {t('infoServiceLead', { defaultValue: infoEnFloor('infoServiceLead') })}
        </p>
      </section>

      <nav
        className="house-service-terms-jump"
        aria-label={t('infoServiceTermsTitle', { defaultValue: infoEnFloor('infoServiceTermsTitle') })}
      >
        {SERVICE_SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="house-state">
            {t(s.key, { defaultValue: infoEnFloor(s.key) })}
          </a>
        ))}
      </nav>

      {SERVICE_SECTIONS.map((section) => (
        <section key={section.id} id={section.id} className="house-card space-y-3">
          <h2 className="font-semibold">{t(section.key, { defaultValue: infoEnFloor(section.key) })}</h2>
          <p className="text-sm text-muted-foreground">
            {t(section.bodyKey, { defaultValue: infoEnFloor(section.bodyKey) })}
          </p>
          {section.id === 'super-bundle' && (
            <p>
              <Link href="/refunds" className="text-sm underline underline-offset-2">
                {t('infoRefundsTitle', { defaultValue: infoEnFloor('infoRefundsTitle') })}
              </Link>
            </p>
          )}
          {section.id === 'regions' && (
            <p>
              <Link href="/regions" className="text-sm underline underline-offset-2">
                {t('infoRegionsTitle', { defaultValue: infoEnFloor('infoRegionsTitle') })}
              </Link>
            </p>
          )}
        </section>
      ))}

      <p className="text-xs text-muted-foreground pt-2">
        {t('infoServiceFoot', { defaultValue: infoEnFloor('infoServiceFoot') })}{' '}
        <Link href="/terms" className="underline underline-offset-2">
          {t('termsOfService', { defaultValue: 'Terms of Service' })}
        </Link>
        {' · '}
        <Link href="/usage" className="underline underline-offset-2">
          {t('infoUsageTitle', { defaultValue: infoEnFloor('infoUsageTitle') })}
        </Link>
        {' · '}
        <Link href="/privacy" className="underline underline-offset-2">
          {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
        </Link>
      </p>
    </InfoPageShell>
  );
}
