/*
 * Copy for sites/www /about. Build-time only.
 *
 * English is the same sentences the Next AboutPage already paints
 * (infoAbout* defaults). This surface does not invent claims, does not
 * carry a national-fitness track, and does not replace Next /about or the host.
 */
import { APP_PUBLIC_PRODUCT_VERSION } from '@/lib/buildInfo';

export const META = {
  title: 'About — Mission Winning',
  description:
    'Train anywhere. Mission Winning is a free offline logger plus Mission Coach from your logs. Operated by Mission Winning LLC, a Texas limited liability company.',
};

export const HERO = {
  eyebrow: APP_PUBLIC_PRODUCT_VERSION,
  lines: ['Train anywhere.', 'Win daily.'],
  body: 'The mission is advancement of civilization and propagation of consciousness to the stars. Today we serve it through L1 Health: Train plus Mission Coach.',
};

export const SECTIONS = [
  {
    index: '01',
    title: 'Our mission',
    body: [
      'Mission Winning is a free offline workout logger with adaptive Mission Coach plans from your logs — no wearable required. Logging stays free forever.',
      'Train anywhere with bodyweight or minimal gear first. Mission Coach builds the week from what you actually logged — not from a wearable. Educational tools only, not medical care.',
    ],
  },
  {
    index: '02',
    title: 'Exercise as medicine',
    body: [
      'Evidence supports structured exercise for mood and energy in research settings — but most advice stays “just go work out.” We turn that into a weekly plan you can follow on any phone. We do not diagnose or treat depression; this is educational fitness, not clinical care.',
    ],
  },
  {
    index: '03',
    title: 'Business structure',
    body: [
      `Operated by Mission Winning LLC, a Texas limited liability company. ${APP_PUBLIC_PRODUCT_VERSION} is an open alpha — full tools free while we grow with you. The logger stays free forever.`,
    ],
  },
  {
    index: '04',
    title: 'Important disclaimers',
    body: [
      'Educational only. Mission Winning provides practical training education and tools. We are not a federally recognized or accredited certifying agency. Completion grants a Mission Winning Certificate of Educational Achievement only.',
      'Always consult qualified medical professionals before starting new training or nutrition protocols. Results vary. This is not medical, legal, or licensing advice.',
    ],
  },
  {
    index: '05',
    title: 'Contact',
    body: [
      'support@missionwinning.com · hello@missionwinning.com for coaching inquiries.',
      '© Mission Winning. Global by design. Your training stays on your device.',
    ],
  },
] as const;
