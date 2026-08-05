'use client';
/**
 * Page: /vision — public product direction (must track vision.md, not pitch-deck slop)
 * See: app/INDEX.md, vision.md, docs/YC_THESIS.md
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

const VISION_CORE_DEFAULTS: Record<(typeof VISION_CORE_ITEMS)[number], string> = {
  infoVisionCoreLi1: 'Workout tracking is free forever — no account required to start.',
  infoVisionCoreLi2: 'Exercise library focused on bodyweight and minimal gear.',
  infoVisionCoreLi3: 'Mission Coach weekly plans from your logs alone.',
  infoVisionCoreLi4: 'Offline-first PWA — installable, works without a store.',
  infoVisionCoreLi5: 'Fuel, Move, Mind, Track, and Learn deepen the path — they are not the pitch.',
};

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
          : 'Free offline logger + Mission Coach from your logs. Super Bundle deepens the other pillars — it never gates the logger.',
      })}
      footer={<InfoPageFooter showLegal showToday showBundle={!freeBeta} />}
    >
      <p className="text-muted-foreground leading-relaxed">
        <strong className="text-foreground">
          {t('infoVisionLead', {
            defaultValue: 'Train anywhere. Coach from what you actually logged.',
          })}
        </strong>
      </p>
      <p className="text-muted-foreground leading-relaxed">
        {t('infoVisionP1', {
          defaultValue:
            'Mission Winning is the entrance to the path: free forever workout logging (no account) plus Mission Coach — fatigue-aware weekly plans from your history alone, no wearable required.',
        })}
      </p>
      <p className="text-muted-foreground leading-relaxed">
        {t('infoVisionP2', {
          defaultValue: freeBeta
            ? 'One mission: make the fundamentals free. Fuel, Move, Mind, and Learn deepen the path when you are ready — they are not the pitch.'
            : 'Super Bundle adds Coach depth and the other pillars when you want them. It funds the mission — it never gates the free logger. Educational tools — not medical care.',
        })}
      </p>

      <InfoSection
        title={t('infoVisionCorePromise', {
          defaultValue: 'Core promise: free forever for the mission',
        })}
      >
        <p className="text-muted-foreground">
          {t('infoVisionCoreP1', {
            defaultValue:
              'The fundamentals that make people healthier should have no price of admission.',
          })}
        </p>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          {VISION_CORE_ITEMS.map((key) => (
            <li key={key}>{t(key, { defaultValue: VISION_CORE_DEFAULTS[key] })}</li>
          ))}
        </ul>
        <p className="text-muted-foreground italic">
          {t('infoVisionCoreQuote', {
            defaultValue:
              '"Those with no money should be able to utilize it to track workouts. The core mission should be available for everyone in the world."',
          })}
        </p>
      </InfoSection>

      <InfoSection title={t('infoVisionSuperApp', { defaultValue: 'Six pillars' })}>
        <p className="text-muted-foreground">
          {t('infoVisionSuperAppP1', {
            defaultValue:
              'One product, six pillars: free entry on each, premium depth where it earns its keep. We pitch Train + Mission Coach first — not an everything-app laundry list.',
          })}
        </p>
        <p className="text-muted-foreground">
          {t('infoVisionSuperAppP2', {
            defaultValue:
              'Train · Fuel · Move · Mind · Track · Learn. Different fronts, one goal: stay strong enough to show up.',
          })}
        </p>
      </InfoSection>

      {!freeBeta && (
        <InfoSection title={t('infoVisionSuperBundle', { defaultValue: 'Super Bundle' })}>
          <p className="text-muted-foreground">
            {t('infoVisionSuperBundleBody', {
              defaultValue:
                'One subscription for Coach depth and the other pillars when you want them. The free logger stays free — Super Bundle deepens, never gates.',
            })}
          </p>
        </InfoSection>
      )}

      <p className="text-xs text-muted-foreground">
        {t('infoVisionFoot', {
          defaultValue:
            'This page is a public summary of our product direction. The free logger is never gated.',
        })}
      </p>
    </InfoPageShell>
  );
}
