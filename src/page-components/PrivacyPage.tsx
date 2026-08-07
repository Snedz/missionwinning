'use client';
/**
 * Page: /privacy — privacy policy
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import { InfoPageShell, InfoSection } from '@/components/layout/InfoPageShell';

const PRIVACY_SECTIONS = [
  { id: 'overview', key: 'infoPrivacyOverview', bodyKey: 'infoPrivacyOverviewBody' },
  { id: 'regions', key: 'infoPrivacyRegions', bodyKey: 'infoPrivacyRegionsBody' },
  { id: 'local-first', key: 'infoPrivacyLocalFirst', bodyKey: 'infoPrivacyLocalFirstBody' },
  {
    id: 'collect',
    key: 'infoPrivacyCollect',
    listKeys: [
      'infoPrivacyCollectLi1',
      'infoPrivacyCollectLi2',
      'infoPrivacyCollectLi3',
      'infoPrivacyCollectLi4',
      'infoPrivacyCollectLi5',
      'infoPrivacyCollectLi6',
    ],
  },
  {
    id: 'use',
    key: 'infoPrivacyUse',
    listKeys: ['infoPrivacyUseLi1', 'infoPrivacyUseLi2', 'infoPrivacyUseLi3', 'infoPrivacyUseLi4'],
  },
  { id: 'ai-coach', key: 'infoPrivacyAiCoach', bodyKey: 'infoPrivacyAiCoachBody' },
  { id: 'third-parties', key: 'infoPrivacyThirdParties', bodyKey: 'infoPrivacyThirdPartiesBody' },
  { id: 'subprocessors', key: 'infoPrivacySubprocessors', bodyKey: 'infoPrivacySubprocessorsBody' },
  {
    id: 'choices',
    key: 'infoPrivacyChoices',
    listKeys: [
      'infoPrivacyChoicesLi1',
      'infoPrivacyChoicesLi2',
      'infoPrivacyChoicesLi3',
      'infoPrivacyChoicesLi4',
    ],
  },
  { id: 'deletion', key: 'infoPrivacyDeletion', bodyKey: 'infoPrivacyDeletionBody' },
  { id: 'california', key: 'infoPrivacyCalifornia', bodyKey: 'infoPrivacyCaliforniaBody' },
  { id: 'not-medical', key: 'infoPrivacyNotMedical', bodyKey: 'infoPrivacyNotMedicalBody' },
] as const;

export function PrivacyPage() {
  const { t } = useTranslation();

  const jumpLinks = PRIVACY_SECTIONS.map((s) => ({
    id: s.id,
    label: t(s.key, { defaultValue: s.key }),
  }));

  return (
    <InfoPageShell
      icon={Shield}
      title={t('infoPrivacyTitle', { defaultValue: 'Privacy Policy' })}
      lastUpdated={t('infoLastUpdated', { defaultValue: 'Last updated: August 2026' })}
      showLegalFooter
      jumpLinks={jumpLinks}
    >
      {PRIVACY_SECTIONS.map((section) => (
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
              {section.id === 'regions' && (
                <p className="mt-2">
                  <Link href="/regions" className="text-primary hover:underline text-sm">
                    {t('infoRegionsTitle', { defaultValue: 'Supported Regions' })}
                  </Link>
                </p>
              )}
            </>
          )}
        </InfoSection>
      ))}

      <p className="text-xs text-muted-foreground pt-2">
        {t('infoPrivacyFoot', { defaultValue: 'Questions: support@missionwinning.com' })}{' '}
        <Link href="/terms" className="text-primary hover:underline">
          {t('termsOfService', { defaultValue: 'Terms of Service' })}
        </Link>
        {' · '}
        <Link href="/regions" className="text-primary hover:underline">
          {t('infoRegionsTitle', { defaultValue: 'Supported Regions' })}
        </Link>
      </p>
    </InfoPageShell>
  );
}
