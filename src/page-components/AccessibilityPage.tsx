'use client';
/**
 * Page: /accessibility — accessibility statement (EAA / WCAG)
 * See: app/INDEX.md, src/page-components/INDEX.md
 *
 * Honest by construction: the measures listed are the ones the gate actually
 * runs (axe sweep, focus-visibility loop, 44px thumb sweep, reduced-motion
 * gating), and the limitations name what is known-imperfect today.
 */

import { useTranslation } from 'react-i18next';
import { PersonStanding } from 'lucide-react';
import { InfoPageShell, InfoSection } from '@/components/layout/InfoPageShell';

export function AccessibilityPage() {
  const { t } = useTranslation();

  return (
    <InfoPageShell
      icon={PersonStanding}
      eyebrow={t('infoLegalEyebrow', { defaultValue: 'Legal' })}
      title={t('infoA11yTitle', { defaultValue: 'Accessibility statement' })}
      lastUpdated={`${t('infoLastUpdatedLabel', { defaultValue: 'Last updated:' })} 2026-08-04`}
      showLegalFooter
    >
      <InfoSection
        id="commitment"
        title={t('infoA11yCommitment', { defaultValue: 'Our commitment' })}
      >
        <p className="text-muted-foreground">
          {t('infoA11yCommitmentBody', {
            defaultValue:
              'Mission Winning aims to conform to WCAG 2.1 level AA across the app and the public site. Training should be usable one-handed, outdoors, on a small screen, by everyone — accessibility is the same discipline, applied consistently.',
          })}
        </p>
      </InfoSection>

      <InfoSection id="measures" title={t('infoA11yMeasures', { defaultValue: 'What we do' })}>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>
            {t('infoA11yMeasuresLi1', {
              defaultValue:
                'Automated axe accessibility checks run on ~30 routes — including open dialogs and sheets — in every release build; serious and critical findings block the release.',
            })}
          </li>
          <li>
            {t('infoA11yMeasuresLi2', {
              defaultValue:
                'Keyboard focus visibility is tested by walking the interface with the Tab key and asserting a visible 2px outline on every stop.',
            })}
          </li>
          <li>
            {t('infoA11yMeasuresLi3', {
              defaultValue:
                'Touch targets are measured against a 44px minimum on the core training screens.',
            })}
          </li>
          <li>
            {t('infoA11yMeasuresLi4', {
              defaultValue:
                'Motion respects prefers-reduced-motion, and color contrast is maintained by a token system checked at build time.',
            })}
          </li>
          <li>
            {t('infoA11yMeasuresLi5', {
              defaultValue:
                'Loading states announce themselves to assistive technology (aria-busy), and status information is never conveyed by color or opacity alone.',
            })}
          </li>
        </ul>
      </InfoSection>

      <InfoSection
        id="limitations"
        title={t('infoA11yLimitations', { defaultValue: 'Known limitations' })}
      >
        <p className="text-muted-foreground">
          {t('infoA11yLimitationsBody', {
            defaultValue:
              'Some chart visualizations carry simplified text alternatives rather than full data tables, and the downloadable guidebook magazine PDF is not yet fully tagged for screen readers. Both are on the improvement list; the in-app guide chapters are the accessible route to the same content.',
          })}
        </p>
      </InfoSection>

      <InfoSection id="feedback" title={t('infoA11yFeedback', { defaultValue: 'Feedback' })}>
        <p className="text-muted-foreground">
          {t('infoA11yFeedbackBody', {
            defaultValue:
              'If anything is hard to use with assistive technology, email support@missionwinning.com with the page and what happened — accessibility reports are treated as defects, not requests. EU users may also contact their national market surveillance authority under the European Accessibility Act.',
          })}
        </p>
      </InfoSection>
    </InfoPageShell>
  );
}
