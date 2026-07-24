'use client';
/**
 * Page: /vision — vision statement page
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useTranslation } from 'react-i18next';
import { Compass } from 'lucide-react';
import { InfoPageFooter } from '@/components/layout/InfoPageFooter';
import { InfoPageShell, InfoSection } from '@/components/layout/InfoPageShell';
import { isFreeBeta } from '@/lib/freeBeta';

const VISION_CORE_ITEMS = [
  'infoVisionCoreLi1',
  'infoVisionCoreLi2',
  'infoVisionCoreLi3',
  'infoVisionCoreLi4',
  'infoVisionCoreLi5',
] as const;

export function VisionPage() {
  const { t } = useTranslation();
  const freeBeta = isFreeBeta();

  return (
    <InfoPageShell
      icon={Compass}
      eyebrow={t('visionEyebrow', { defaultValue: 'Vision' })}
      title={t('infoVisionTitle', { defaultValue: 'Mission Winning Vision' })}
      subtitle={t('infoVisionSubtitle', {
        defaultValue: freeBeta
          ? 'Free offline logger + Mission Coach from your logs — health fundamentals without a paywall.'
          : 'Free offline logger + Mission Coach from your logs. Super Bundle adds depth — never gates the logger.',
      })}
      footer={<InfoPageFooter showLegal showToday showBundle={!freeBeta} />}
    >
      <p className="text-muted-foreground leading-relaxed">
        <strong className="text-foreground">
          {t('infoVisionLead', {
            defaultValue: freeBeta
              ? 'Train anywhere. Coach from what you actually logged.'
              : 'Train anywhere. Coach from what you actually logged.',
          })}
        </strong>
      </p>
      <p className="text-muted-foreground leading-relaxed">
        {t('infoVisionP1', {
          defaultValue:
            'Mission Winning is the entrance to the path — a clear, evidence-based way to build strength and resilience. Start with the free logger; Mission Coach shapes the week from your history.',
        })}
      </p>
      <p className="text-muted-foreground leading-relaxed">
        {t('infoVisionP2', {
          defaultValue: freeBeta
            ? 'One mission: make the fundamentals free. Fuel, Move, Mind, and Learn deepen the path when you are ready — they are not the pitch.'
            : 'One mission: free logger forever. Super Bundle funds Coach depth and the other pillars — never a gate on logging.',
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

      {!freeBeta && (
      <InfoSection title={t('infoVisionSuperBundle', { defaultValue: 'Super Bundle' })}>
        <p className="text-muted-foreground">
          {t('infoVisionSuperBundleBody', {
            defaultValue:
              'The flagship offering. One subscription unlocks premium depth across multiple pillars.',
          })}
        </p>
      </InfoSection>
      )}

      <p className="text-xs text-muted-foreground">
        {t('infoVisionFoot', {
          defaultValue:
            'Full details in vision.md in the project root. This page is a summary. The app exists to serve this vision.',
        })}
      </p>
    </InfoPageShell>
  );
}
