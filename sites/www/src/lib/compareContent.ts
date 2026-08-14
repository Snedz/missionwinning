/*
 * Copy for sites/www /compare. Build-time only.
 *
 * Index only. The three stories live on Next at /guide/mission-winning-vs-*.
 * This page does not copy those URLs onto Astro and does not invent a fourth.
 */
export const META = {
  title: 'Compare — Mission Winning',
  description:
    'How Mission Winning differs from Strong, Hevy, and Fitbod. The stories stay on the app. This page is the index.',
};

export const HERO = {
  eyebrow: 'Compare',
  lines: ['A diary that plans.', 'Not a feed.'],
  body: 'Three honest comparisons live on the Next app. This page only points at them. We do not invent a fourth competitor.',
};

export const STORIES = [
  {
    path: '/guide/mission-winning-vs-hevy',
    title: 'Mission Winning vs Hevy',
    subtitle: 'Free social logger versus an offline diary that plans from your sets',
  },
  {
    path: '/guide/mission-winning-vs-strong',
    title: 'Mission Winning vs Strong',
    subtitle: 'Gym logger craft versus a free offline diary that plans from logs',
  },
  {
    path: '/guide/mission-winning-vs-fitbod',
    title: 'Mission Winning vs Fitbod',
    subtitle: 'Paid day-of AI versus a free logger whose Coach reads your diary',
  },
] as const;
