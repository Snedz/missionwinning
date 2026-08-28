'use client';
/**
 * Page: /usage — leftover acceptable-use / usage policy.
 * Quiet Account / legal door. Never a rail.
 * See: docs/legal/ACCEPTABLE_USE.md (markdown source; this page is live consumer copy)
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { infoEnFloor } from '@/i18n/infoEnFloor';

const USAGE_SECTIONS = [
  { id: 'purpose', key: 'infoUsagePurpose', bodyKey: 'infoUsagePurposeBody' },
  { id: 'permitted', key: 'infoUsagePermitted', bodyKey: 'infoUsagePermittedBody' },
  {
    id: 'prohibited',
    key: 'infoUsageProhibited',
    listKeys: [
      'infoUsageProhibitedLi1',
      'infoUsageProhibitedLi2',
      'infoUsageProhibitedLi3',
      'infoUsageProhibitedLi4',
      'infoUsageProhibitedLi5',
      'infoUsageProhibitedLi6',
      'infoUsageProhibitedLi7',
    ],
  },
  { id: 'youth', key: 'infoUsageYouth', bodyKey: 'infoUsageYouthBody' },
  { id: 'self-host', key: 'infoUsageSelfHost', bodyKey: 'infoUsageSelfHostBody' },
  { id: 'enforcement', key: 'infoUsageEnforcement', bodyKey: 'infoUsageEnforcementBody' },
  { id: 'report', key: 'infoUsageReport', bodyKey: 'infoUsageReportBody' },
] as const;

export function UsagePolicyPage() {
  const { t } = useTranslation();

  return (
    <InfoPageShell
      className="house-usage"
      icon={ShieldAlert}
      eyebrow={t('infoLegalEyebrow', { defaultValue: 'Legal' })}
      title={t('infoUsageTitle', { defaultValue: infoEnFloor('infoUsageTitle') })}
      lastUpdated={t('infoLastUpdated', { defaultValue: 'Last updated: 13 August 2026' })}
      variant="sections"
      showLegalFooter
    >
      {/* Quiet leftover: lead + jump chips + sections. Legal copy unchanged. */}
      <section className="house-card space-y-3">
        <p className="text-sm text-muted-foreground">
          {t('infoUsageLead', { defaultValue: infoEnFloor('infoUsageLead') })}{' '}
          <Link href="/terms" className="underline underline-offset-2">
            {t('termsOfService', { defaultValue: 'Terms of Service' })}
          </Link>
          {' · '}
          <Link href="/regions" className="underline underline-offset-2">
            {t('infoRegionsTitle', { defaultValue: infoEnFloor('infoRegionsTitle') })}
          </Link>
        </p>
      </section>

      <nav className="house-usage-jump" aria-label={t('infoUsageTitle', { defaultValue: infoEnFloor('infoUsageTitle') })}>
        {USAGE_SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="house-state">
            {t(s.key, { defaultValue: infoEnFloor(s.key) })}
          </a>
        ))}
      </nav>

      {USAGE_SECTIONS.map((section) => (
        <section key={section.id} id={section.id} className="house-card space-y-3">
          <h2 className="font-semibold">{t(section.key, { defaultValue: infoEnFloor(section.key) })}</h2>
          {'listKeys' in section ? (
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              {section.listKeys.map((li) => (
                <li key={li}>{t(li, { defaultValue: infoEnFloor(li) })}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t(section.bodyKey, { defaultValue: infoEnFloor(section.bodyKey) })}
            </p>
          )}
        </section>
      ))}

      <p className="text-xs text-muted-foreground pt-2">
        {t('infoUsageFoot', { defaultValue: infoEnFloor('infoUsageFoot') })}{' '}
        <Link href="/privacy" className="underline underline-offset-2">
          {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
        </Link>
      </p>
    </InfoPageShell>
  );
}
