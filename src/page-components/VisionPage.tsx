'use client';
/**
 * Page: /vision — vision statement (editorial body; chrome comes from
 * PublicPageShell in app/vision/page.tsx)
 * See: app/INDEX.md, src/page-components/INDEX.md
 *
 * `.462` recut: the landing's poster close says "Read the full vision" and
 * landed on list-disc bullets and an untreated italic quote inside the app
 * shell. Same copy, landing idioms: numbered `card-section` rules, ruled rows
 * for the free-core list, a real pull-quote in the display face.
 */

import { useTranslation } from 'react-i18next';
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
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="text-lg font-semibold leading-relaxed text-foreground">
          {t('infoVisionLead', {
            defaultValue: 'Train anywhere. Coach from what you actually logged.',
          })}
        </p>
        <p className="text-base leading-relaxed text-muted-foreground">
          {t('infoVisionP1', {
            defaultValue:
              'Mission Winning is the entrance to the path — a clear, evidence-based way to build strength and resilience. Start with the free logger; Mission Coach shapes the week from your history.',
          })}
        </p>
        <p className="text-base leading-relaxed text-muted-foreground">
          {t('infoVisionP2', {
            defaultValue: freeBeta
              ? 'One mission: make the fundamentals free. Fuel, Move, Mind, and Learn deepen the path when you are ready — they are not the pitch.'
              : 'One mission: free logger forever. Super Bundle funds Coach depth and the other pillars — never a gate on logging.',
          })}
        </p>
      </section>

      <section className="card-section space-y-4 pt-6">
        <p className="section-index">01</p>
        <h2 className="font-display text-2xl font-extrabold tracking-[-0.015em] text-foreground">
          {t('infoVisionCorePromise', { defaultValue: 'Core promise: free forever for the mission' })}
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          {t('infoVisionCoreP1', {
            defaultValue:
              'The fundamentals that make the world healthier must be available to all, with no money barrier.',
          })}
        </p>
        <ul className="divide-y-2 divide-border border-y-2 border-border">
          {VISION_CORE_ITEMS.map((key) => (
            <li key={key} className="py-3 text-sm leading-relaxed text-muted-foreground">
              {t(key, { defaultValue: key })}
            </li>
          ))}
        </ul>
        <blockquote className="border-s-2 border-primary ps-4">
          <p className="font-display text-xl font-extrabold leading-snug text-foreground">
            {t('infoVisionCoreQuote', {
              defaultValue:
                '"Those with no money should be able to utilize it to track workouts. The core mission should be available for everyone in the world."',
            })}
          </p>
        </blockquote>
      </section>

      <section className="card-section space-y-4 pt-6">
        <p className="section-index">02</p>
        <h2 className="font-display text-2xl font-extrabold tracking-[-0.015em] text-foreground">
          {t('infoVisionSuperApp', { defaultValue: 'The super app structure' })}
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          {t('infoVisionSuperAppP1', {
            defaultValue:
              'Inspired by successful freemium + bundle models, Mission Winning is structured as modular pillars with free entry points and premium depth.',
          })}
        </p>
        <p className="text-base leading-relaxed text-muted-foreground">
          {t('infoVisionSuperAppP2', {
            defaultValue: 'The pillars: Train, Fuel, Move, Mind, Track, Learn.',
          })}
        </p>
      </section>

      {!freeBeta && (
        <section className="card-section space-y-4 pt-6">
          <p className="section-index">03</p>
          <h2 className="font-display text-2xl font-extrabold tracking-[-0.015em] text-foreground">
            {t('infoVisionSuperBundle', { defaultValue: 'Super Bundle' })}
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            {t('infoVisionSuperBundleBody', {
              defaultValue:
                'The flagship offering. One subscription unlocks premium depth across multiple pillars.',
            })}
          </p>
        </section>
      )}

      <p className="text-xs text-muted-foreground">
        {t('infoVisionFoot', {
          defaultValue:
            'Full details in vision.md in the project root. This page is a summary. The app exists to serve this vision.',
        })}
      </p>
    </div>
  );
}
