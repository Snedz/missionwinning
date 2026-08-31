'use client';
/**
 * Page: /privacy — leftover privacy policy.
 * Quiet Account / legal door. Never a rail.
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { infoEnFloor } from '@/i18n/infoEnFloor';
import { PRIVACY_DISPLAY_DATE } from '@/lib/privacyConsent';

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
      'infoPrivacyCollectLi7',
      'infoPrivacyCollectLi8',
      'infoPrivacyCollectLi9',
    ],
  },
  {
    id: 'lawful-bases',
    key: 'infoPrivacyLawfulBases',
    listKeys: [
      'infoPrivacyLawfulBasesLi1',
      'infoPrivacyLawfulBasesLi2',
      'infoPrivacyLawfulBasesLi3',
      'infoPrivacyLawfulBasesLi4',
    ],
  },
  { id: 'health-data', key: 'infoPrivacyHealthData', bodyKey: 'infoPrivacyHealthDataBody' },
  {
    id: 'use',
    key: 'infoPrivacyUse',
    listKeys: ['infoPrivacyUseLi1', 'infoPrivacyUseLi2', 'infoPrivacyUseLi3', 'infoPrivacyUseLi4'],
  },
  { id: 'ai-coach', key: 'infoPrivacyAiCoach', bodyKey: 'infoPrivacyAiCoachBody' },
  {
    id: 'retention',
    key: 'infoPrivacyRetention',
    listKeys: [
      'infoPrivacyRetentionLi1',
      'infoPrivacyRetentionLi2',
      'infoPrivacyRetentionLi3',
      'infoPrivacyRetentionLi4',
    ],
  },
  { id: 'third-parties', key: 'infoPrivacyThirdParties', bodyKey: 'infoPrivacyThirdPartiesBody' },
  { id: 'subprocessors', key: 'infoPrivacySubprocessors', bodyKey: 'infoPrivacySubprocessorsBody' },
  {
    id: 'intl-transfers',
    key: 'infoPrivacyIntlTransfers',
    bodyKey: 'infoPrivacyIntlTransfersBody',
  },
  {
    id: 'rights',
    key: 'infoPrivacyRights',
    listKeys: [
      'infoPrivacyRightsLi1',
      'infoPrivacyRightsLi2',
      'infoPrivacyRightsLi3',
      'infoPrivacyRightsLi4',
      'infoPrivacyRightsLi5',
      'infoPrivacyRightsLi6',
      'infoPrivacyRightsLi7',
    ],
  },
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
  { id: 'cookies', key: 'infoPrivacyCookiesRef', bodyKey: 'infoPrivacyCookiesRefBody' },
  { id: 'children', key: 'infoPrivacyChildren', bodyKey: 'infoPrivacyChildrenBody' },
  { id: 'security-breach', key: 'infoPrivacySecurity', bodyKey: 'infoPrivacySecurityBody' },
  { id: 'deletion', key: 'infoPrivacyDeletion', bodyKey: 'infoPrivacyDeletionBody' },
  { id: 'california', key: 'infoPrivacyCalifornia', bodyKey: 'infoPrivacyCaliforniaBody' },
  { id: 'changes', key: 'infoPrivacyChanges', bodyKey: 'infoPrivacyChangesBody' },
  { id: 'not-medical', key: 'infoPrivacyNotMedical', bodyKey: 'infoPrivacyNotMedicalBody' },
] as const;

export function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <InfoPageShell
      className="house-privacy"
      icon={Shield}
      eyebrow={t('infoLegalEyebrow', { defaultValue: 'Legal' })}
      title={t('infoPrivacyTitle', { defaultValue: 'Privacy Policy' })}
      lastUpdated={`${t('infoLastUpdatedLabel', { defaultValue: 'Last updated:' })} ${PRIVACY_DISPLAY_DATE}`}
      variant="sections"
    >
      {/* Quiet leftover: jump chips + sections. Legal copy unchanged. */}
      <nav className="house-privacy-jump" aria-label={t('infoPrivacyTitle', { defaultValue: 'Privacy Policy' })}>
        {PRIVACY_SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="house-state">
            {t(s.key, { defaultValue: infoEnFloor(s.key) })}
          </a>
        ))}
      </nav>

      {PRIVACY_SECTIONS.map((section) => (
        <section key={section.id} id={section.id} className="house-card space-y-3">
          <h2 className="font-semibold">{t(section.key, { defaultValue: infoEnFloor(section.key) })}</h2>
          {'listKeys' in section ? (
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              {section.listKeys.map((liKey) => (
                <li key={liKey}>{t(liKey, { defaultValue: infoEnFloor(liKey) })}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t(section.bodyKey, { defaultValue: infoEnFloor(section.bodyKey) })}
              {section.id === 'regions' && (
                <span className="mt-2 block">
                  <a href="/regions" className="underline underline-offset-2">
                    {t('infoPrivacyRegionsLink', { defaultValue: 'Where we offer the service' })}
                  </a>
                </span>
              )}
            </p>
          )}
        </section>
      ))}

      <p className="text-xs text-muted-foreground pt-2">
        {t('infoPrivacyFoot', { defaultValue: 'Questions: support@missionwinning.com' })}
      </p>
    </InfoPageShell>
  );
}
