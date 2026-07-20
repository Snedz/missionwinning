'use client';
/**
 * Page: /privacy — privacy policy
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import { InfoPageShell, InfoSection } from '@/components/layout/InfoPageShell';

const PRIVACY_SECTIONS = [
  { id: 'overview', key: 'infoPrivacyOverview', bodyKey: 'infoPrivacyOverviewBody' },
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
      lastUpdated={t('infoLastUpdated', { defaultValue: 'Last updated: July 2026' })}
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
            <p className="text-muted-foreground">
              {t(section.bodyKey, { defaultValue: section.bodyKey })}
            </p>
          )}
        </InfoSection>
      ))}

      <p className="text-xs text-muted-foreground pt-2">
        {t('infoPrivacyFoot', { defaultValue: 'Questions: support@missionwinning.com' })}
      </p>
    </InfoPageShell>
  );
}
