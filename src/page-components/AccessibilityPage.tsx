'use client';
/**
 * Page: /accessibility — leftover accessibility statement (EAA / WCAG).
 * Quiet Account / legal door. Never a rail.
 * See: app/INDEX.md, src/page-components/INDEX.md
 *
 * Honest by construction: the measures listed are the ones the gate actually
 * runs (axe sweep, focus-visibility loop, 44px thumb sweep, reduced-motion
 * gating), and the limitations name what is known-imperfect today.
 */

import { useTranslation } from 'react-i18next';
import { PersonStanding } from 'lucide-react';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { infoEnFloor } from '@/i18n/infoEnFloor';

const A11Y_SECTIONS = [
  { id: 'commitment', key: 'infoA11yCommitment', bodyKey: 'infoA11yCommitmentBody' },
  {
    id: 'measures',
    key: 'infoA11yMeasures',
    listKeys: [
      'infoA11yMeasuresLi1',
      'infoA11yMeasuresLi2',
      'infoA11yMeasuresLi3',
      'infoA11yMeasuresLi4',
      'infoA11yMeasuresLi5',
    ],
  },
  { id: 'limitations', key: 'infoA11yLimitations', bodyKey: 'infoA11yLimitationsBody' },
  { id: 'feedback', key: 'infoA11yFeedback', bodyKey: 'infoA11yFeedbackBody' },
] as const;

export function AccessibilityPage() {
  const { t } = useTranslation();

  return (
    <InfoPageShell
      className="house-a11y"
      icon={PersonStanding}
      eyebrow={t('infoLegalEyebrow', { defaultValue: 'Legal' })}
      title={t('infoA11yTitle', { defaultValue: infoEnFloor('infoA11yTitle') })}
      lastUpdated={`${t('infoLastUpdatedLabel', { defaultValue: 'Last updated:' })} 2026-08-04`}
      variant="sections"
    >
      {/* Quiet leftover: jump chips + sections. Legal copy unchanged. */}
      <nav className="house-a11y-jump" aria-label={t('infoA11yTitle', { defaultValue: infoEnFloor('infoA11yTitle') })}>
        {A11Y_SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="house-state">
            {t(s.key, { defaultValue: infoEnFloor(s.key) })}
          </a>
        ))}
      </nav>

      {A11Y_SECTIONS.map((section) => (
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
    </InfoPageShell>
  );
}
