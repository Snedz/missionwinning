'use client';
/**
 * Page: /dmca — DMCA / copyright notice channel
 * See: app/INDEX.md, src/page-components/INDEX.md, docs/LEGAL_SAFETY.md
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Copyright } from 'lucide-react';
import { InfoPageShell, InfoSection } from '@/components/layout/InfoPageShell';

const DMCA_NOTICE_LIS = [
  'infoDmcaNoticeLi1',
  'infoDmcaNoticeLi2',
  'infoDmcaNoticeLi3',
  'infoDmcaNoticeLi4',
  'infoDmcaNoticeLi5',
  'infoDmcaNoticeLi6',
] as const;

export function DmcaPage() {
  const { t } = useTranslation();

  const jumpLinks = [
    { id: 'agent', label: t('infoDmcaAgent', { defaultValue: 'Designated agent' }) },
    { id: 'notice', label: t('infoDmcaNotice', { defaultValue: 'What your notice must include' }) },
    { id: 'counter', label: t('infoDmcaCounter', { defaultValue: 'Counter-notice' }) },
  ];

  return (
    <InfoPageShell
      icon={Copyright}
      eyebrow={t('infoLegalEyebrow', { defaultValue: 'Legal' })}
      title={t('infoDmcaTitle', { defaultValue: 'DMCA / Copyright' })}
      lastUpdated={t('infoLastUpdated', { defaultValue: 'Last updated: July 2026' })}
      showLegalFooter
      jumpLinks={jumpLinks}
    >
      <p className="text-muted-foreground">
        {t('infoDmcaIntro', {
          defaultValue:
            'Mission Winning respects intellectual property. If you believe material on our service infringes your copyright, send a notice that complies with 17 U.S.C. §512 to our designated agent.',
        })}
      </p>

      <InfoSection id="agent" title={t('infoDmcaAgent', { defaultValue: 'Designated agent' })}>
        <p className="text-muted-foreground">
          {t('infoDmcaAgentBody', {
            defaultValue:
              'Agent (interim until copyright.gov listing is published): Mission Winning LLC, Attn: DMCA Agent, support@missionwinning.com. Postal address: to be published on this page after the Copyright Office designation is filed. Subject line: DMCA Notice.',
          })}
        </p>
      </InfoSection>

      <InfoSection
        id="notice"
        title={t('infoDmcaNotice', { defaultValue: 'What your notice must include' })}
      >
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          {DMCA_NOTICE_LIS.map((liKey) => (
            <li key={liKey}>{t(liKey, { defaultValue: liKey })}</li>
          ))}
        </ul>
      </InfoSection>

      <InfoSection id="counter" title={t('infoDmcaCounter', { defaultValue: 'Counter-notice' })}>
        <p className="text-muted-foreground">
          {t('infoDmcaCounterBody', {
            defaultValue:
              'If your material was removed and you believe it was a mistake or misidentification, you may send a counter-notice to the same agent with the elements required by 17 U.S.C. §512(g). We may restore material consistent with the statute.',
          })}
        </p>
      </InfoSection>

      <p className="text-xs text-muted-foreground pt-2">
        {t('infoDmcaFoot', {
          defaultValue:
            'This page is an operational notice channel, not legal advice. Registering a designated agent with the U.S. Copyright Office is required for safe-harbor protection.',
        })}{' '}
        <Link href="/terms" className="text-primary hover:underline">
          {t('termsOfService', { defaultValue: 'Terms of Service' })}
        </Link>
      </p>
    </InfoPageShell>
  );
}
