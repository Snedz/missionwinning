'use client';
/**
 * Page: /terms — leftover terms of service.
 * Quiet Account / legal door. Never a rail.
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Scale } from 'lucide-react';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { infoEnFloor } from '@/i18n/infoEnFloor';

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
  {
    id: 'sanctions',
    key: 'infoTermsSanctions',
    bodyKey: 'infoTermsSanctionsBody',
  },
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

  return (
    <InfoPageShell
      className="house-terms"
      icon={Scale}
      eyebrow={t('infoLegalEyebrow', { defaultValue: 'Legal' })}
      title={t('infoTermsTitle', { defaultValue: 'Terms of Service' })}
      lastUpdated={t('infoLastUpdated', { defaultValue: 'Last updated: 13 August 2026' })}
      variant="sections"
      showLegalFooter
    >
      {/* Quiet leftover: jump chips + sections. Legal copy unchanged. */}
      <nav className="house-terms-jump" aria-label={t('infoTermsTitle', { defaultValue: 'Terms of Service' })}>
        {TERM_SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="house-state">
            {t(s.key, { defaultValue: infoEnFloor(s.key) })}
          </a>
        ))}
      </nav>

      {TERM_SECTIONS.map((section) => (
        <section key={section.id} id={section.id} className="house-card space-y-3">
          <h2 className="font-semibold">{t(section.key, { defaultValue: infoEnFloor(section.key) })}</h2>
          {'listKeys' in section ? (
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              {section.listKeys.map((liKey) => (
                <li key={liKey}>{t(liKey, { defaultValue: infoEnFloor(liKey) })}</li>
              ))}
            </ul>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {t(section.bodyKey, { defaultValue: infoEnFloor(section.bodyKey) })}
              </p>
              {section.id === 'dmca' && (
                <p className="mt-2">
                  <Link href="/dmca" className="text-sm underline underline-offset-2">
                    {t('infoDmcaTitle', { defaultValue: 'DMCA / Copyright' })}
                  </Link>
                </p>
              )}
              {section.id === 'premium' && (
                <p className="mt-2">
                  <Link href="/refunds" className="text-sm underline underline-offset-2">
                    {t('infoRefundsTitle', { defaultValue: 'Refunds & cancellation' })}
                  </Link>
                  {' · '}
                  <Link href="/service-terms" className="text-sm underline underline-offset-2">
                    {t('infoServiceTermsTitle', { defaultValue: 'Service-Specific Terms' })}
                  </Link>
                </p>
              )}
              {section.id === 'acceptable-use' && (
                <p className="mt-2">
                  <Link href="/usage" className="text-sm underline underline-offset-2">
                    {t('infoUsageTitle', { defaultValue: 'Usage Policy' })}
                  </Link>
                </p>
              )}
              {section.id === 'eligibility' && (
                <p className="mt-2">
                  <Link href="/regions" className="text-sm underline underline-offset-2">
                    {t('infoRegionsTitle', { defaultValue: 'Supported Regions' })}
                  </Link>
                </p>
              )}
              {section.id === 'related' && (
                <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  <Link href="/usage" className="underline underline-offset-2">
                    {t('infoUsageTitle', { defaultValue: 'Usage Policy' })}
                  </Link>
                  <Link href="/regions" className="underline underline-offset-2">
                    {t('infoRegionsTitle', { defaultValue: 'Supported Regions' })}
                  </Link>
                  <Link href="/service-terms" className="underline underline-offset-2">
                    {t('infoServiceTermsTitle', { defaultValue: 'Service-Specific Terms' })}
                  </Link>
                  <Link href="/privacy" className="underline underline-offset-2">
                    {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
                  </Link>
                </p>
              )}
            </>
          )}
        </section>
      ))}

      <p className="text-xs text-muted-foreground pt-2">
        {t('infoTermsFoot', {
          defaultValue: 'Mission Winning LLC · support@missionwinning.com · See also',
        })}{' '}
        <Link href="/privacy" className="underline underline-offset-2">
          {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
        </Link>
        {' · '}
        <Link href="/usage" className="underline underline-offset-2">
          {t('infoUsageTitle', { defaultValue: 'Usage Policy' })}
        </Link>
        {' · '}
        <Link href="/regions" className="underline underline-offset-2">
          {t('infoRegionsTitle', { defaultValue: 'Supported Regions' })}
        </Link>
        {' · '}
        <Link href="/service-terms" className="underline underline-offset-2">
          {t('infoServiceTermsTitle', { defaultValue: 'Service-Specific Terms' })}
        </Link>
        {' · '}
        <Link href="/refunds" className="underline underline-offset-2">
          {t('infoRefundsTitle', { defaultValue: 'Refunds & cancellation' })}
        </Link>
        {' · '}
        <Link href="/dmca" className="underline underline-offset-2">
          {t('infoDmcaTitle', { defaultValue: 'DMCA / Copyright' })}
        </Link>
      </p>
    </InfoPageShell>
  );
}
