'use client';
/**
 * Page: /service-terms — Service-Specific Terms (Super Bundle, Coach AI, Android, etc.)
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FileStack } from 'lucide-react';
import { InfoPageShell, InfoSection } from '@/components/layout/InfoPageShell';

const SECTIONS = [
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
  const jumpLinks = SECTIONS.map((s) => ({
    id: s.id,
    label: t(s.key, { defaultValue: s.key }),
  }));

  return (
    <InfoPageShell
      icon={FileStack}
      title={t('infoServiceTermsTitle', { defaultValue: 'Service-Specific Terms' })}
      lastUpdated={t('infoLastUpdated', { defaultValue: 'Last updated: August 2026' })}
      showLegalFooter
      jumpLinks={jumpLinks}
    >
      <p className="text-sm text-muted-foreground -mt-2 mb-4">
        {t('infoServiceLead', {
          defaultValue:
            'These terms supplement the general Terms of Service for particular Mission Winning products. If they conflict on a product-specific point, these terms control for that product.',
        })}
      </p>

      {SECTIONS.map((section) => (
        <InfoSection key={section.id} id={section.id} title={t(section.key, { defaultValue: section.key })}>
          <p className="text-muted-foreground">{t(section.bodyKey, { defaultValue: section.bodyKey })}</p>
          {section.id === 'super-bundle' && (
            <p className="mt-2">
              <Link href="/refunds" className="text-primary hover:underline text-sm">
                {t('infoRefundsTitle', { defaultValue: 'Refunds & cancellation' })} →
              </Link>
            </p>
          )}
          {section.id === 'regions' && (
            <p className="mt-2">
              <Link href="/regions" className="text-primary hover:underline text-sm">
                {t('infoRegionsTitle', { defaultValue: 'Supported Regions' })} →
              </Link>
            </p>
          )}
        </InfoSection>
      ))}

      <p className="text-xs text-muted-foreground pt-2">
        {t('infoServiceFoot', { defaultValue: 'Mission Winning LLC · support@missionwinning.com · See also' })}{' '}
        <Link href="/terms" className="text-primary hover:underline">
          {t('termsOfService', { defaultValue: 'Terms of Service' })}
        </Link>
        {' · '}
        <Link href="/usage" className="text-primary hover:underline">
          {t('infoUsageTitle', { defaultValue: 'Usage Policy' })}
        </Link>
        {' · '}
        <Link href="/privacy" className="text-primary hover:underline">
          {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
        </Link>
      </p>
    </InfoPageShell>
  );
}
