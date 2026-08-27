/*
 * Copy for sites/www /vision. Build-time only.
 *
 * English is the same sentences Next VisionPage already paints
 * (infoVision* defaults). Does not invent claims, does not replace
 * Next /vision or the host.
 */
import { APP_PUBLIC_PRODUCT_VERSION } from '@/lib/buildInfo';

export const META = {
  title: 'Vision — Mission Winning',
  description:
    'Train anywhere. Coach from what you actually logged. Free forever logger plus Mission Coach — no wearable required.',
};

export const HERO = {
  eyebrow: APP_PUBLIC_PRODUCT_VERSION,
  lines: ['Train anywhere.', 'Coach from the log.'],
  body: 'Mission Winning is the entrance to the path: free forever workout logging (no account) plus Mission Coach — weekly plans from your history alone, no wearable required.',
};

export const SECTIONS = [
  {
    index: '01',
    title: 'Core promise: free forever for the mission',
    body: [
      'The fundamentals that make people healthier should have no price of admission.',
      'Workout tracking is free forever — no account required to start.',
      'Exercise library focused on bodyweight and minimal gear.',
      'Mission Coach weekly plans from your logs alone.',
      'Offline-first PWA — installable, works without a store.',
      'Fuel, Move, Mind, Track, and Learn deepen the path — they are not the pitch.',
    ],
  },
  {
    index: '02',
    title: 'Six pillars',
    body: [
      'One product, six pillars: free entry on each. We pitch Train + Mission Coach first — not an everything-app laundry list.',
      'Train · Fuel · Move · Mind · Track · Learn. Different fronts, one goal: stay strong enough to show up.',
    ],
  },
  {
    index: '03',
    title: 'What this page is',
    body: [
      'This page is a public summary of our product direction. The free logger is never gated.',
    ],
  },
] as const;
