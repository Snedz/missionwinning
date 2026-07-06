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
  { id: 'service', key: 'infoTermsService', bodyKey: 'infoTermsServiceBody' },
  { id: 'educational', key: 'infoTermsEducational', bodyKey: 'infoTermsEducationalBody' },
  { id: 'accounts', key: 'infoTermsAccounts', listKeys: ['infoTermsAccountsLi1', 'infoTermsAccountsLi2', 'infoTermsAccountsLi3'] },
  { id: 'premium', key: 'infoTermsPremium', bodyKey: 'infoTermsPremiumBody' },
  { id: 'liability', key: 'infoTermsLiability', bodyKey: 'infoTermsLiabilityBody' },
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
      title={t('infoTermsTitle', { defaultValue: 'Terms of Use' })}
      lastUpdated={t('infoLastUpdated', { defaultValue: 'Last updated: June 2026' })}
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
            <p className="text-muted-foreground">
              {t(section.bodyKey, { defaultValue: section.bodyKey })}
            </p>
          )}
        </InfoSection>
      ))}

      <p className="text-xs text-muted-foreground pt-2">
        {t('infoTermsFoot', { defaultValue: 'Mission Winning LLC · support@missionwinning.com · See also' })}{' '}
        <Link href="/privacy" className="text-emerald-400 hover:underline">
          {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
        </Link>
      </p>
    </InfoPageShell>
  );
}
