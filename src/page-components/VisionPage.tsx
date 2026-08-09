'use client';
/**
 * Page: /vision — public product direction (must track vision.md, not
 * pitch-deck slop). Editorial body; chrome comes from PublicPageShell in
 * app/vision/page.tsx.
 * See: app/INDEX.md, vision.md, docs/YC_THESIS.md
 *
 * Recut from `list-disc` bullets and an untreated italic quote onto the
 * landing's idioms — numbered `card-section` rules, ruled rows, a real
 * pull-quote in the display face. Every string is the key it already was.
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
    <div className="space-y-10">
      <section className="space-y-4">
        {/* Field manual: lead in display face, body quiet. */}
        <p className="display-section max-w-[22ch] text-balance text-foreground">
          {t('infoVisionLead', {
            defaultValue: 'Train anywhere. Coach from what you actually logged.',
          })}
        </p>
        <p className="text-base leading-relaxed text-muted-foreground">
          {t('infoVisionP1', {
            defaultValue:
              'Mission Winning is the entrance to the path: free forever workout logging (no account) plus Mission Coach — fatigue-aware weekly plans from your history alone, no wearable required.',
          })}
        </p>
        <p className="text-base leading-relaxed text-muted-foreground">
          {t('infoVisionP2', {
            defaultValue: freeBeta
              ? 'One mission: make the fundamentals free. Fuel, Move, Mind, and Learn deepen the path when you are ready — they are not the pitch.'
              : 'Super Bundle adds Coach depth and the other pillars when you want them. It funds the mission — it never gates the free logger. Educational tools — not medical care.',
          })}
        </p>
      </section>

      <section className="card-section space-y-4 pt-6">
        <p className="section-index">01</p>
        <h2 className="display-section max-w-[24ch] text-balance text-foreground">
          {t('infoVisionCorePromise', {
            defaultValue: 'Core promise: free forever for the mission',
          })}
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          {t('infoVisionCoreP1', {
            defaultValue:
              'The fundamentals that make people healthier should have no price of admission.',
          })}
        </p>
        {/* Ruled rows, not list-disc — the system separates with 2px rules. */}
        <ul className="divide-y-2 divide-border border-y-2 border-border">
          {VISION_CORE_ITEMS.map((key) => (
            <li key={key} className="py-3 text-sm leading-relaxed text-muted-foreground">
              {t(key, { defaultValue: VISION_CORE_DEFAULTS[key] })}
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
        <h2 className="display-section max-w-[24ch] text-balance text-foreground">
          {t('infoVisionSuperApp', { defaultValue: 'Six pillars' })}
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          {t('infoVisionSuperAppP1', {
            defaultValue:
              'One product, six pillars: free entry on each, premium depth where it earns its keep. We pitch Train + Mission Coach first — not an everything-app laundry list.',
          })}
        </p>
        <p className="text-base leading-relaxed text-muted-foreground">
          {t('infoVisionSuperAppP2', {
            defaultValue:
              'Train · Fuel · Move · Mind · Track · Learn. Different fronts, one goal: stay strong enough to show up.',
          })}
        </p>
      </section>

      {!freeBeta && (
        <section className="card-section space-y-4 pt-6">
          <p className="section-index">03</p>
          <h2 className="display-section max-w-[24ch] text-balance text-foreground">
            {t('infoVisionSuperBundle', { defaultValue: 'Super Bundle' })}
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            {t('infoVisionSuperBundleBody', {
              defaultValue:
                'One subscription for Coach depth and the other pillars when you want them. The free logger stays free — Super Bundle deepens, never gates.',
            })}
          </p>
        </section>
      )}

      <p className="text-xs text-muted-foreground">
        {t('infoVisionFoot', {
          defaultValue:
            'This page is a public summary of our product direction. The free logger is never gated.',
        })}
      </p>
    </div>
  );
}
