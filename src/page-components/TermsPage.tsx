'use client';
/**
 * Page: /terms — terms of service
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Scale } from 'lucide-react';
import { InfoPageShell, InfoSection } from '@/components/layout/InfoPageShell';

const TERM_SECTIONS = [
  { id: 'agreement', key: 'infoTermsAgreement', bodyKey: 'infoTermsAgreementBody' },
  { id: 'eligibility', key: 'infoTermsEligibility', bodyKey: 'infoTermsEligibilityBody' },
  { id: 'service', key: 'infoTermsService', bodyKey: 'infoTermsServiceBody' },
  { id: 'educational', key: 'infoTermsEducational', bodyKey: 'infoTermsEducationalBody' },
  {
    id: 'accounts',
    key: 'infoTermsAccounts',
    listKeys: ['infoTermsAccountsLi1', 'infoTermsAccountsLi2', 'infoTermsAccountsLi3'],
  },
  { id: 'premium', key: 'infoTermsPremium', bodyKey: 'infoTermsPremiumBody' },
  { id: 'acceptable-use', key: 'infoTermsAcceptableUse', bodyKey: 'infoTermsAcceptableUseBody' },
  { id: 'user-content', key: 'infoTermsUserContent', bodyKey: 'infoTermsUserContentBody' },
  { id: 'indemnification', key: 'infoTermsIndemnification', bodyKey: 'infoTermsIndemnificationBody' },
  { id: 'dmca', key: 'infoTermsDmca', bodyKey: 'infoTermsDmcaBody' },
  { id: 'liability', key: 'infoTermsLiability', bodyKey: 'infoTermsLiabilityBody' },
  { id: 'governing-law', key: 'infoTermsGoverningLaw', bodyKey: 'infoTermsGoverningLawBody' },
  { id: 'disputes', key: 'infoTermsDisputes', bodyKey: 'infoTermsDisputesBody' },
  { id: 'eu-consumers', key: 'infoTermsEuConsumers', bodyKey: 'infoTermsEuConsumersBody' },
  { id: 'related', key: 'infoTermsRelated', bodyKey: 'infoTermsRelatedBody' },
  { id: 'changes', key: 'infoTermsChanges', bodyKey: 'infoTermsChangesBody' },
] as const;

export function TermsPage() {
  const { t } = useTranslation();

  const jumpLinks = TERM_SECTIONS.map((s) => ({
    id: s.id,
    label: t(s.key, { defaultValue: s.key }),
  }));

  return (
    <InfoPageShell
      icon={Scale}
      eyebrow={t('infoLegalEyebrow', { defaultValue: 'Legal' })}
      title={t('infoTermsTitle', { defaultValue: 'Terms of Service' })}
      lastUpdated={t('infoLastUpdated', { defaultValue: 'Last updated: August 2026' })}
      showLegalFooter
      jumpLinks={jumpLinks}
    >
      {TERM_SECTIONS.map((section) => (
        <InfoSection
          key={section.id}
          id={section.id}
          title={t(section.key, { defaultValue: section.key })}
        >
          {'listKeys' in section ? (
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              {section.listKeys.map((liKey) => (
                <li key={liKey}>{t(liKey, { defaultValue: liKey })}</li>
              ))}
            </ul>
          ) : (
            <>
              <p className="text-muted-foreground">
                {t(section.bodyKey, { defaultValue: section.bodyKey })}
              </p>
              {section.id === 'dmca' && (
                <p className="mt-2">
                  <Link href="/dmca" className="text-primary hover:underline text-sm">
                    {t('infoDmcaTitle', { defaultValue: 'DMCA / Copyright' })}
                  </Link>
                </p>
              )}
              {section.id === 'premium' && (
                <p className="mt-2">
                  <Link href="/refunds" className="text-primary hover:underline text-sm">
                    {t('infoRefundsTitle', { defaultValue: 'Refunds & cancellation' })}
                  </Link>
                  {' · '}
                  <Link href="/service-terms" className="text-primary hover:underline text-sm">
                    {t('infoServiceTermsTitle', { defaultValue: 'Service-Specific Terms' })}
                  </Link>
                </p>
              )}
              {section.id === 'acceptable-use' && (
                <p className="mt-2">
                  <Link href="/usage" className="text-primary hover:underline text-sm">
                    {t('infoUsageTitle', { defaultValue: 'Usage Policy' })}
                  </Link>
                </p>
              )}
              {section.id === 'eligibility' && (
                <p className="mt-2">
                  <Link href="/regions" className="text-primary hover:underline text-sm">
                    {t('infoRegionsTitle', { defaultValue: 'Supported Regions' })}
                  </Link>
                </p>
              )}
              {section.id === 'related' && (
                <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  <Link href="/usage" className="text-primary hover:underline">
                    {t('infoUsageTitle', { defaultValue: 'Usage Policy' })}
                  </Link>
                  <Link href="/regions" className="text-primary hover:underline">
                    {t('infoRegionsTitle', { defaultValue: 'Supported Regions' })}
                  </Link>
                  <Link href="/service-terms" className="text-primary hover:underline">
                    {t('infoServiceTermsTitle', { defaultValue: 'Service-Specific Terms' })}
                  </Link>
                  <Link href="/privacy" className="text-primary hover:underline">
                    {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
                  </Link>
                </p>
              )}
            </>
          )}
        </InfoSection>
      ))}

      <p className="text-xs text-muted-foreground pt-2">
        {t('infoTermsFoot', {
          defaultValue: 'Mission Winning LLC · support@missionwinning.com · See also',
        })}{' '}
        <Link href="/privacy" className="text-primary hover:underline">
          {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
        </Link>
        {' · '}
        <Link href="/usage" className="text-primary hover:underline">
          {t('infoUsageTitle', { defaultValue: 'Usage Policy' })}
        </Link>
        {' · '}
        <Link href="/regions" className="text-primary hover:underline">
          {t('infoRegionsTitle', { defaultValue: 'Supported Regions' })}
        </Link>
        {' · '}
        <Link href="/service-terms" className="text-primary hover:underline">
          {t('infoServiceTermsTitle', { defaultValue: 'Service-Specific Terms' })}
        </Link>
        {' · '}
        <Link href="/refunds" className="text-primary hover:underline">
          {t('infoRefundsTitle', { defaultValue: 'Refunds & cancellation' })}
        </Link>
        {' · '}
        <Link href="/dmca" className="text-primary hover:underline">
          {t('infoDmcaTitle', { defaultValue: 'DMCA / Copyright' })}
        </Link>
      </p>
    </InfoPageShell>
  );
}
