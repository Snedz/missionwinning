/**
 * Map in-app guidebook practice CTAs to public-safe destinations + labels.
 * Anonymous /guide readers must not see "Open Fuel log" pointing at /welcome.
 */

export type PracticeCta = { href: string; label: string };

type PracticeRemap = { href: string; labelKey: string };

const PUBLIC_SAFE = new Set([
  '/welcome',
  '/beta',
  '/bundle',
  '/guide',
  '/exercises',
  '/paths',
  '/about',
  '/press',
  '/privacy',
  '/terms',
  '/dmca',
  '/refunds',
  '/coaching',
  '/feedback',
  '/vision',
]);

/** Routes that stay public with a clearer anonymous label. */
const PUBLIC_REMAP: Record<string, PracticeRemap> = {
  '/library': { href: '/exercises', labelKey: 'guidePublicBrowseExercises' },
  '/log': { href: '/welcome', labelKey: 'guidePublicStartFree' },
  '/active': { href: '/welcome', labelKey: 'guidePublicStartTraining' },
  '/nutrition': { href: '/welcome', labelKey: 'guidePublicStartFuel' },
  '/move': { href: '/welcome', labelKey: 'guidePublicStartMove' },
  '/mind': { href: '/welcome', labelKey: 'guidePublicStartMind' },
  '/track': { href: '/welcome', labelKey: 'guidePublicStartTrack' },
  '/builder': { href: '/welcome', labelKey: 'guidePublicStartBuilder' },
  '/assessments': { href: '/welcome', labelKey: 'guidePublicStartAssess' },
  '/benchmarks': { href: '/welcome', labelKey: 'guidePublicStartBenchmarks' },
  '/history': { href: '/welcome', labelKey: 'guidePublicStartHistory' },
  '/learn': { href: '/guide', labelKey: 'guidePublicAllChapters' },
  '/learn/guide': { href: '/guide', labelKey: 'guidePublicAllChapters' },
};

const DEFAULT_LABELS: Record<string, string> = {
  guidePublicBrowseExercises: 'Browse free exercises',
  guidePublicStartFree: 'Start free — Begin I-Day',
  guidePublicStartTraining: 'Start free — train in the app',
  guidePublicStartFuel: 'Start free — open Fuel in the app',
  guidePublicStartMove: 'Start free — Move flows in the app',
  guidePublicStartMind: 'Start free — Mind sessions in the app',
  guidePublicStartTrack: 'Start free — Track activities in the app',
  guidePublicStartBuilder: 'Start free — Builder in the app',
  guidePublicStartAssess: 'Start free — health screen in the app',
  guidePublicStartBenchmarks: 'Start free — benchmarks in the app',
  guidePublicStartHistory: 'Start free — history in the app',
  guidePublicAllChapters: '← All chapters',
};

type TranslateFn = (key: string, options?: { defaultValue?: string }) => string;

/**
 * Returns href + localized label safe for the public magazine reader.
 * Pass `t` from react-i18next when available.
 */
export function publicGuidePracticeCta(
  href: string,
  _inAppLabel: string,
  t?: TranslateFn
): PracticeCta {
  const translate = (key: string, fallback: string) =>
    t ? t(key, { defaultValue: fallback }) : fallback;

  if (
    PUBLIC_SAFE.has(href) ||
    href.startsWith('/exercises/') ||
    href.startsWith('/guide/') ||
    href.startsWith('/paths/')
  ) {
    if (href === '/welcome') {
      return {
        href,
        label: translate('guidePublicStartFree', DEFAULT_LABELS.guidePublicStartFree),
      };
    }
    if (href === '/guide' || href.startsWith('/guide/')) {
      return { href, label: _inAppLabel };
    }
    return { href, label: _inAppLabel };
  }

  const base = href.split('?')[0] ?? href;
  const remap = PUBLIC_REMAP[base];
  if (remap) {
    const fallback = DEFAULT_LABELS[remap.labelKey] ?? DEFAULT_LABELS.guidePublicStartFree;
    return {
      href: remap.href,
      label: translate(remap.labelKey, fallback),
    };
  }

  if (base.startsWith('/library')) {
    return {
      href: '/exercises',
      label: translate(
        'guidePublicBrowseExercises',
        DEFAULT_LABELS.guidePublicBrowseExercises
      ),
    };
  }

  return {
    href: '/welcome',
    label: translate('guidePublicStartFree', DEFAULT_LABELS.guidePublicStartFree),
  };
}
