'use client';
/**
 * Page: /vision — vision statement page
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useTranslation } from 'react-i18next';
import { Compass } from 'lucide-react';
import { InfoPageFooter } from '@/components/layout/InfoPageFooter';
import { InfoPageShell, InfoSection } from '@/components/layout/InfoPageShell';

const VISION_CORE_ITEMS = [
  'infoVisionCoreLi1',
  'infoVisionCoreLi2',
  'infoVisionCoreLi3',
  'infoVisionCoreLi4',
  'infoVisionCoreLi5',
] as const;

export function VisionPage() {
  const { t } = useTranslation();

  return (
    <InfoPageShell
      icon={Compass}
      eyebrow={t('visionEyebrow', { defaultValue: 'Vision' })}
      title={t('infoVisionTitle', { defaultValue: 'Mission Winning Vision' })}
      subtitle={t('infoVisionSubtitle', {
        defaultValue:
          'The guiding document for the free global everything app for health. Core mission free for all. Super Bundle for synergy.',
      })}
      footer={<InfoPageFooter showLegal showToday showBundle />}
    >
      <p className="text-muted-foreground">
        <strong className="text-foreground">
          {t('infoVisionLead', { defaultValue: 'The #1 Health "Everything App" for the World' })}
        </strong>
      </p>
      <p className="text-muted-foreground">
        {t('infoVisionP1', {
          defaultValue:
            'Mission Winning exists to be the entrance to the path — the clear, evidence-based guide to the right way to build lifelong health, strength, resilience, and well-being for every human on Earth.',
        })}
      </p>
      <p className="text-muted-foreground">
        {t('infoVisionP2', {
          defaultValue:
            'We are building the everything app for health. One app. One mission. Accessible to everyone, everywhere.',
        })}
      </p>

      <InfoSection title={t('infoVisionCorePromise', { defaultValue: 'Core promise: free forever for the mission' })}>
        <p className="text-muted-foreground">
          {t('infoVisionCoreP1', {
            defaultValue:
              'The fundamentals that make the world healthier must be available to all, with no money barrier.',
          })}
        </p>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          {VISION_CORE_ITEMS.map((key) => (
            <li key={key}>{t(key, { defaultValue: key })}</li>
          ))}
        </ul>
        <p className="text-muted-foreground italic">
          {t('infoVisionCoreQuote', {
            defaultValue:
              '"Those with no money should be able to utilize it to track workouts. The core mission should be available for everyone in the world."',
          })}
        </p>
      </InfoSection>

      <InfoSection title={t('infoVisionSuperApp', { defaultValue: 'The super app structure' })}>
        <p className="text-muted-foreground">
          {t('infoVisionSuperAppP1', {
            defaultValue:
              'Inspired by successful freemium + bundle models, Mission Winning is structured as modular pillars with free entry points and premium depth.',
          })}
        </p>
        <p className="text-muted-foreground">
          {t('infoVisionSuperAppP2', {
            defaultValue:
              'The pillars: Train, Fuel, Move, Mind, Track, Learn.',
          })}
        </p>
      </InfoSection>

      <InfoSection title={t('infoVisionSuperBundle', { defaultValue: 'Super Bundle' })}>
        <p className="text-muted-foreground">
          {t('infoVisionSuperBundleBody', {
            defaultValue:
              'The flagship offering. One subscription unlocks premium depth across multiple pillars.',
          })}
        </p>
      </InfoSection>

      <p className="text-xs text-muted-foreground">
        {t('infoVisionFoot', {
          defaultValue:
            'Full details in vision.md in the project root. This page is a summary. The app exists to serve this vision.',
        })}
      </p>
    </InfoPageShell>
  );
}
