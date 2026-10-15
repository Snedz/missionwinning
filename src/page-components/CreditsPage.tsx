'use client';
/**
 * Page: /credits — licence credits. Quiet legal door. Never a rail.
 */

import { useTranslation } from 'react-i18next';
import { ScrollText } from 'lucide-react';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { infoEnFloor } from '@/i18n/infoEnFloor';

const CREDIT_SECTIONS = [
  { id: 'app', key: 'infoCreditsAppTitle', bodyKey: 'infoCreditsAppBody' },
  { id: 'exercises', key: 'infoCreditsExercisesTitle', bodyKey: 'infoCreditsExercisesBody' },
  { id: 'body', key: 'infoCreditsBodyTitle', bodyKey: 'infoCreditsBodyBody' },
] as const;

export function CreditsPage() {
  const { t } = useTranslation();

  return (
    <InfoPageShell
      className="house-credits"
      icon={ScrollText}
      eyebrow={t('infoLegalEyebrow', { defaultValue: 'Legal' })}
      title={t('infoCreditsTitle', { defaultValue: infoEnFloor('infoCreditsTitle') })}
      lastUpdated={t('infoLastUpdated', { defaultValue: 'Last updated: 13 August 2026' })}
      variant="sections"
      showLegalFooter
    >
      <section className="house-card space-y-3">
        <p className="text-sm text-muted-foreground">
          {t('infoCreditsIntro', { defaultValue: infoEnFloor('infoCreditsIntro') })}
        </p>
      </section>

      {CREDIT_SECTIONS.map((section) => (
        <section key={section.id} id={section.id} className="house-card space-y-3">
          <h2 className="font-semibold">{t(section.key, { defaultValue: infoEnFloor(section.key) })}</h2>
          <p className="text-sm text-muted-foreground">
            {t(section.bodyKey, { defaultValue: infoEnFloor(section.bodyKey) })}
          </p>
        </section>
      ))}
    </InfoPageShell>
  );
}
