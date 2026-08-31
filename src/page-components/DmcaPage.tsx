'use client';
/**
 * Page: /dmca — leftover DMCA / copyright notice channel.
 * Quiet Account / legal door. Never a rail.
 * See: app/INDEX.md, src/page-components/INDEX.md, docs/LEGAL_SAFETY.md
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Copyright } from 'lucide-react';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { infoEnFloor } from '@/i18n/infoEnFloor';

const DMCA_SECTIONS = [
  { id: 'agent', key: 'infoDmcaAgent', bodyKey: 'infoDmcaAgentBody' },
  {
    id: 'notice',
    key: 'infoDmcaNotice',
    listKeys: [
      'infoDmcaNoticeLi1',
      'infoDmcaNoticeLi2',
      'infoDmcaNoticeLi3',
      'infoDmcaNoticeLi4',
      'infoDmcaNoticeLi5',
      'infoDmcaNoticeLi6',
    ],
  },
  { id: 'counter', key: 'infoDmcaCounter', bodyKey: 'infoDmcaCounterBody' },
] as const;

export function DmcaPage() {
  const { t } = useTranslation();

  return (
    <InfoPageShell
      className="house-dmca"
      icon={Copyright}
      eyebrow={t('infoLegalEyebrow', { defaultValue: 'Legal' })}
      title={t('infoDmcaTitle', { defaultValue: infoEnFloor('infoDmcaTitle') })}
      lastUpdated={t('infoLastUpdated', { defaultValue: 'Last updated: 13 August 2026' })}
      variant="sections"
    >
      {/* Quiet leftover: intro + jump chips + sections. Legal copy unchanged. */}
      <section className="house-card space-y-3">
        <p className="text-sm text-muted-foreground">
          {t('infoDmcaIntro', { defaultValue: infoEnFloor('infoDmcaIntro') })}
        </p>
      </section>

      <nav className="house-dmca-jump" aria-label={t('infoDmcaTitle', { defaultValue: infoEnFloor('infoDmcaTitle') })}>
        {DMCA_SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="house-state">
            {t(s.key, { defaultValue: infoEnFloor(s.key) })}
          </a>
        ))}
      </nav>

      {DMCA_SECTIONS.map((section) => (
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
        {t('infoDmcaFoot', { defaultValue: infoEnFloor('infoDmcaFoot') })}{' '}
        <Link href="/terms" className="underline underline-offset-2">
          {t('termsOfService', { defaultValue: 'Terms of Service' })}
        </Link>
      </p>
    </InfoPageShell>
  );
}
