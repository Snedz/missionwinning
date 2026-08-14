import type { Metadata } from 'next';

/** Static English page titles for app routes (localized generateMetadata deferred to i18n G2). */
export const ROUTE_TITLES = {
  home: 'Today',
  landing: 'Train Anywhere. Win Daily.',
  log: 'Today',
  active: 'Active Workout',
  nutrition: 'Nutrition',
  move: 'Move & Mobility',
  mind: 'Mind & Recovery',
  track: 'Track Activity',
  learn: 'Learn & Master',
  library: 'Exercise Library',
  builder: 'Workout Builder',
  benchmarks: 'Benchmarks',
  history: 'Workout History',
  leaderboard: 'Leaderboard',
  profile: 'Your Record',
  account: 'Account & Settings',
  bundle: 'Super Bundle',
  programs: 'Programs',
  feedback: 'Feedback',
  beta: 'Beta Start Guide',
  coaching: 'Coaching',
  coach: 'Mission Coach',
  calculators: 'Calculators',
  explore: 'Explore',
  assessments: 'Assessments',
  fitnessTest: 'Fitness Test',
  welcome: 'Welcome — I-Day',
  server: 'Messenger',
  offline: 'Offline',
  private: 'Private Beta',
} as const;

export type RouteTitleKey = keyof typeof ROUTE_TITLES;

export function routeMetadata(key: RouteTitleKey, description?: string): Metadata {
  const title = ROUTE_TITLES[key];
  return description ? { title, description } : { title };
}
